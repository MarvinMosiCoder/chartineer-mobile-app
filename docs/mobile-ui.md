# Mobile screens, shared styles, and Poppins

The mobile app uses Expo SDK 55 and Expo Router.

```text
src/
  app/
    _layout.tsx
    index.tsx
    (tabs)/
      _layout.tsx
      dashboard.tsx
  styles/
    global.ts
  lib/
    auth.ts
```

## Routes and tabs

| File | Responsibility |
| --- | --- |
| `src/app/_layout.tsx` | Loads fonts, holds the splash screen, and defines the root Stack |
| `src/app/(tabs)/_layout.tsx` | Defines tabs and tab label styling |
| `src/app/index.tsx` | Default route `/`: login form, Submit request, loading state, and errors |
| `src/app/(tabs)/dashboard.tsx` | `/dashboard`: account loading, Retry, sign-in links, and logout |
| `src/lib/auth.ts` | API requests and native session storage; not a route |

The root Stack contains `index` and `(tabs)`, both with their headers hidden. Opening the app at `/` displays login directly. Successful login opens the dashboard inside the tabs group; logout returns to login.

```text
Native splash while fonts load -> Login (/) -> Dashboard (/dashboard)
                                      ^            |
                                      |--- logout -|
```

`router.replace("/dashboard")` replaces login after sign-in. After `signOut()` succeeds, `router.replace("/")` replaces the dashboard with login. The dashboard's sign-in links use `href="/"` with `asChild` around a Pressable. See [Expo Router navigation](https://docs.expo.dev/router/basics/navigation/).

Route groups do not add their name to the URL. Keep login at `src/app/index.tsx` and the tab screen at `src/app/(tabs)/dashboard.tsx`; adding another `(tabs)/index.tsx` would create a second `/` route. See [Router notation](https://docs.expo.dev/router/basics/notation/). If TypeScript remembers old filenames, see [Refresh generated route types](troubleshooting.md#login-or-dashboard-route-is-rejected-by-typescript).

The tab screen is registered as `name="dashboard"`, but its current title is still `Home` and the component is still named `HomeScreen`. These labels do not change its `/dashboard` route. Rename the title to `Dashboard` and the component to `DashboardScreen` when updating its welcome content.

The login screen does not check a saved session on startup, and the dashboard has no navigation guard. A normal launch at `/` shows login again; the dashboard checks the saved token whenever it becomes focused. Automatically skipping login for an existing session requires a separate startup check.

## Moving an older checkout to login first

The current checkout already uses these routes. For an older checkout:

1. Rename `src/app/login.tsx` to `src/app/index.tsx`, and `src/app/(tabs)/index.tsx` to `src/app/(tabs)/dashboard.tsx`.
2. Keep the font-loading code in the root layout and register these screens:

   ```tsx
   <Stack.Screen name="index" options={{ headerShown: false }} />
   <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
   ```

3. Use `router.replace("/dashboard")` after successful login.
4. Change the tab screen's `name` to `dashboard`; set its title to `Dashboard` if desired.
5. Import `router` from `expo-router` in the dashboard and use `router.replace("/")` after successful logout. Change old login links to `href="/"`.
6. Remove `useHeaderHeight`, its import, and the old keyboard offset from login because its header is hidden. Include the top edge in its SafeAreaView:

   ```tsx
   edges={["top", "bottom", "left", "right"]}
   ```

The current login file already includes all four edges and no longer uses a header-height offset. See [Expo safe areas](https://docs.expo.dev/develop/user-interface/safe-areas/).

To add a tab, create its screen in `src/app/(tabs)/`, then add a `Tabs.Screen` whose `name` matches the filename without its extension. Keep reusable components, hooks, utilities, and styles outside `src/app/`, where files are treated as routes.

## Logo before the login screen

The opening logo belongs to the native splash screen. `expo-splash-screen` is installed, and the custom image is now present at [assets/images/system-logo/system-logo.png](../assets/images/system-logo/system-logo.png).

The current entry in `app.json` is:

```json
[
  "expo-splash-screen",
  {
    "backgroundColor": "#208AEF",
    "android": {
      "image": "./assets/images/system-logo/system-logo.png",
      "imageWidth": 76
    }
  }
]
```

The custom image is configured for Android. To use it on iOS too, configure `image` and `imageWidth` at the shared plugin level or add an `ios` entry. The current shared background is blue, independently of the green login theme.

Keep the `expo-router` and `expo-secure-store` entries in `expo.plugins`. The root layout's `preventAutoHideAsync()` and font-loading effect already hold the splash until fonts are ready, then hide it; no timed delay is needed.

After changing the image or plugin settings, build and install a new native app. Check the final splash in a release build: Expo Go displays the app icon, and development builds do not reproduce every splash property. Restarting Metro alone does not apply native splash changes. See the [SDK 55 splash reference](https://docs.expo.dev/versions/v55.0.0/sdk/splash-screen/).

The splash and login form use the same asset in separate places. Android's native splash is configured in `app.json`; the form renders an Image above the `Chartineer` text.

## Login logo and asset aliases

The form's logo uses React Native's `Image` imported from `react-native`:

```tsx
<Image
  source={require("@/assets/images/system-logo/system-logo.png")}
  style={styles.logoImage}
  resizeMode="contain"
/>
```

`logoImage` sets width and height to 120 with `alignSelf: "center"`. The Chartineer text remains directly below it. The image uses the same PNG as the Android splash.

The root `tsconfig.json` now includes both aliases under `compilerOptions.paths`:

```json
{
  "@/*": ["./src/*"],
  "@/assets/*": ["./assets/*"]
}
```

The more specific `@/assets/*` mapping resolves files in the root assets directory. Keep it when rebuilding the login screen from the complete example. Restart Expo CLI after changing path aliases. See [Expo TypeScript path aliases](https://docs.expo.dev/guides/typescript/#path-aliases-optional).

## Shared styles

`src/styles/global.ts` exports `colors`, `spacing`, `fonts`, and `globalStyles`. The general `@/*` alias points to `src/`; the more specific `@/assets/*` alias points to the root assets directory.

`colors.primary` is now green (`#0F7058`). The login logo text, Submit button, and active tab tint use this shared color. The dashboard's existing screen styles still contain hardcoded blue values, and the native splash keeps its own blue background in `app.json`.

```tsx
import { colors, fonts, globalStyles } from "@/styles/global";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  ...globalStyles,
  title: {
    fontFamily: fonts.bold,
    fontSize: 30,
    color: colors.text,
  },
});
```

Apply the style to its component, for example `<Text style={styles.title}>Chartineer</Text>`. Imported global styles are objects; they do not automatically style every Text or TextInput.

## Poppins

The font package is already installed. For a new project, install from its root:

```powershell
npx expo install @expo-google-fonts/poppins expo-font expo-splash-screen
```

The current root layout imports four variants, loads them with `useFonts`, and keeps the splash screen visible until loading finishes. Runtime loading works with Expo Go. See the [SDK 55 font reference](https://docs.expo.dev/versions/v55.0.0/sdk/font/).

| Shared alias | Loaded family |
| --- | --- |
| `fonts.regular` | `Poppins_400Regular` |
| `fonts.semibold` | `Poppins_600SemiBold` |
| `fonts.bold` | `Poppins_700Bold` |
| `fonts.extraBold` | `Poppins_800ExtraBold` |

Use the desired alias as `fontFamily` on each text style. When replacing a numeric `fontWeight`, select the corresponding loaded family and remove the old numeric weight. Navigator titles and labels use `fontWeight: "normal"` with an explicit Poppins variant to override their default weight.

The tabs layout applies Poppins to every tab label through `Tabs` -> `screenOptions`:

```tsx
tabBarLabelStyle: {
  fontFamily: fonts.semibold,
  fontWeight: "normal",
  fontSize: 12,
},
```

Screen content needs its own Text and TextInput styles too.

## Login icons and password visibility

`src/app/index.tsx` uses the installed `@expo/vector-icons/Ionicons` package. No extra icon dependency is needed for this screen.

| Control | Icon | Behavior |
| --- | --- | --- |
| Email field | `mail-outline` | Decorative icon beside the email input |
| Password field | `lock-closed-outline` | Decorative icon beside the password input |
| Password visibility button | `eye-outline` / `eye-off-outline` | Shows or hides the password |

Each field is wrapped in `View style={styles.inputRow}`. That row sets the border, background, horizontal layout, and spacing. The TextInput uses `styles.inputText` with `flex: 1` to fill the available width. The password row also contains the eye Pressable with a 48-by-48 minimum touch area. The former `globalStyles.input` style is still available for other fields, but this login form uses the row/text styles.

Password visibility starts as `false`. The eye button calls `setShowPassword((value) => !value)`, while the input uses `secureTextEntry={!showPassword}`. Its icon and accessibility label describe the available action: Show password or Hide password. The decorative icons use `accessible={false}`. See the [React Native 0.83 TextInput reference](https://reactnative.dev/docs/0.83/textinput#securetextentry).

The eye button and Submit are separate Pressables. The eye changes visibility; Submit calls `handleLogin`. Both fields and the eye button are disabled while submitting. For the complete file, including both controls, errors, imports, state, and styles, use [Step 8 of the login guide](login.md#8-connect-the-existing-login-screen).

## Login status

The layout includes a 120-by-120 system logo image, Chartineer text, icon-bearing email/password fields, a visibility button, Submit, and an error message. SafeAreaView includes top, bottom, left, and right edges. KeyboardAvoidingView and ScrollView handle keyboard space; the form stays centered with a maximum width of 420.

Submit's `onPress={handleLogin}` checks empty fields, calls `signIn(email, password)`, shows a spinner while waiting, and prevents duplicate requests. On success, the helper saves the session token in SecureStore, the screen clears the password and resets visibility, then opens `/dashboard`. `errorMessage` is rendered above Submit for validation and API failures.

The dashboard calls `getCurrentUser()` when it becomes focused. It shows the account email and a Log out button for a valid session, Sign in for no session, and Retry when the account request fails. `signOut()` revokes the session in the API before clearing the device token, then navigation returns to `/`.

Forgot password and its old local styles are absent from the current screen. Password-reset endpoints and email delivery have not been implemented. Follow the [login guide](login.md) for the complete flow and tests.

The Retry callback intentionally depends on its counter to run again when the user taps Retry. A comment and a lint suppression limited to the dependency line now explain that behavior. Keep `[retry]` for this implementation; see [Why the Retry dependency is intentional](troubleshooting.md#why-the-retry-dependency-is-intentional).

## Native configuration

Native settings belong in `app.json` and config plugins. This project has no hand-maintained `ios/` or `android/` directories. Adding native modules beyond Expo Go's bundled modules requires a development build. See [Expo application configuration](https://docs.expo.dev/workflow/configuration/).
