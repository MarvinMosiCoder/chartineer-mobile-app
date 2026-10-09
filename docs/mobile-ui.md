# Mobile screens, shared styles, and Poppins

The mobile app uses Expo SDK 55 and Expo Router.

```text
src/
  app/
    _layout.tsx
    login.tsx
    (tabs)/
      _layout.tsx
      index.tsx
  styles/
    global.ts
  lib/
    auth.ts
```

## Routes and tabs

| File | Responsibility |
| --- | --- |
| `src/app/_layout.tsx` | Loads fonts and defines the root Stack |
| `src/app/(tabs)/_layout.tsx` | Defines tabs and tab label styling |
| `src/app/(tabs)/index.tsx` | Home, session restoration, login icon, and logout |
| `src/app/login.tsx` | Login form, Submit request, loading state, and errors |
| `src/lib/auth.ts` | API requests and native session storage; not a route |

The root Stack contains `(tabs)` and `login`. The group contains Home and a Tabs layout for bottom navigation. Login is opened through the home-page icon or Sign in button. See [Expo Router tabs](https://docs.expo.dev/router/advanced/tabs/).

Home uses a `Link` imported from `expo-router` with `href="/login"` and `asChild` around a Pressable. The stack supplies the back button after navigation.

After login, `router.replace("/")` opens `src/app/(tabs)/index.tsx`. Route groups do not add their name to the URL. Keep Home in that group; a separate starter `src/app/index.tsx` duplicates the Home URL. If TypeScript rejects `/` despite the correct files, see [Refresh generated route types](troubleshooting.md#home-route-is-rejected-by-typescript).

To add a tab, create its screen in `src/app/(tabs)/`, then add a `Tabs.Screen` whose `name` matches the filename without its extension. Keep reusable components, hooks, utilities, and styles outside `src/app/`, where files are treated as routes.

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

Submit calls `signIn(email, password)`, shows a spinner while waiting, and disables editing and further submissions during the request. On success, the helper saves the session token in SecureStore and the screen returns to Home. Errors remain visible on the form.

Home calls `getCurrentUser()` when it becomes focused. It shows the account email and a Log out button for a valid session, Sign in for no session, and Retry when the account request fails. `signOut()` revokes the session in the API before clearing the device token.

Forgot password is currently absent from the rendered form; its styles remain. Password-reset endpoints and email delivery have not been implemented. Follow the [login guide](login.md) for the complete flow and tests.

The current Retry callback intentionally depends on its retry counter to run again when the user taps Retry. ESLint reports that dependency as unnecessary because the callback body does not read the counter; see [Known login cleanup](troubleshooting.md#known-login-cleanup).

## Native configuration

Native settings belong in `app.json` and config plugins. This project has no hand-maintained `ios/` or `android/` directories. Adding native modules beyond Expo Go's bundled modules requires a development build. See [Expo application configuration](https://docs.expo.dev/workflow/configuration/).
