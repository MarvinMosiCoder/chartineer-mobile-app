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

The current login file still lists only bottom, left, and right edges; adding top is a remaining layout adjustment for the hidden header. See [Expo safe areas](https://docs.expo.dev/develop/user-interface/safe-areas/).

To add a tab, create its screen in `src/app/(tabs)/`, then add a `Tabs.Screen` whose `name` matches the filename without its extension. Keep reusable components, hooks, utilities, and styles outside `src/app/`, where files are treated as routes.

## Logo before the login screen

The opening logo belongs to the native splash screen. `expo-splash-screen` is already installed. The current `app.json` uses a blue `#208AEF` background and configures `assets/images/splash-icon.png` at width 76 for Android. A custom Chartineer logo has not been added yet.

To configure your logo:

1. Save a PNG logo, preferably with a transparent background, as `assets/images/chartineer-logo.png`.
2. Replace only the existing `expo-splash-screen` entry in `expo.plugins` with:

   ```json
   [
     "expo-splash-screen",
     {
       "backgroundColor": "#208AEF",
       "image": "./assets/images/chartineer-logo.png",
       "imageWidth": 160,
       "resizeMode": "contain"
     }
   ]
   ```

   Keep the `expo-router` and `expo-secure-store` plugin entries. This example sets a shared image for Android and iOS instead of an Android-only image override.

3. Keep the root layout's `preventAutoHideAsync()` and font-loading effect. It already hides the splash after fonts load; no timed delay is needed.
4. Build and install a new native app for configuration changes. Check the final splash in a release build: Expo Go displays the app icon, and development builds do not reproduce every splash property. Restarting Metro alone does not apply native splash changes. See the [SDK 55 splash reference](https://docs.expo.dev/versions/v55.0.0/sdk/splash-screen/).

The splash asset and the `Chartineer` text above the login fields are separate. This configuration changes the opening splash, while the form keeps its existing text logo.

## Shared styles

`src/styles/global.ts` exports `colors`, `spacing`, `fonts`, and `globalStyles`. The `@/` alias points to `src/` through the root TypeScript configuration.

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

## Login status

The layout includes a Chartineer text logo, email and password fields, Submit, and an error message. SafeAreaView and a keyboard-aware scroll layout handle screen insets and keyboard space. The fields use local React state; the password field has `secureTextEntry`.

Submit calls `signIn(email, password)`, shows a spinner while waiting, and disables editing and further submissions during the request. On success, the helper saves the session token in SecureStore and opens `/dashboard`. Errors remain visible on the form.

The dashboard calls `getCurrentUser()` when it becomes focused. It shows the account email and a Log out button for a valid session, Sign in for no session, and Retry when the account request fails. `signOut()` revokes the session in the API before clearing the device token, then navigation returns to `/`.

Forgot password is currently absent from the rendered form; its styles remain. Password-reset endpoints and email delivery have not been implemented. Follow the [login guide](login.md) for the complete flow and tests.

The Retry callback intentionally depends on its counter to run again when the user taps Retry. A comment and a lint suppression limited to the dependency line now explain that behavior. Keep `[retry]` for this implementation; see [Why the Retry dependency is intentional](troubleshooting.md#why-the-retry-dependency-is-intentional).

## Native configuration

Native settings belong in `app.json` and config plugins. This project has no hand-maintained `ios/` or `android/` directories. Adding native modules beyond Expo Go's bundled modules requires a development build. See [Expo application configuration](https://docs.expo.dev/workflow/configuration/).
