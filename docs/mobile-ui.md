# Mobile screens, tabs, and themes

The app uses Expo SDK 55 and Expo Router. This guide reflects the source as of October 12, 2026.

```text
src/
  app/
    _layout.tsx
    login.tsx
    signup.tsx
    (tabs)/
      _layout.tsx
      index.tsx
      markets.tsx
      workspace.tsx
      assets.tsx
      dashboard.tsx
  providers/
    auth-provider.tsx
  styles/
    global.ts
    login-theme.ts
  lib/
    auth.ts
```

## Routes and tabs

| File | Responsibility |
| --- | --- |
| `src/app/_layout.tsx` | Loads fonts, wraps AuthProvider, holds the splash through startup, and defines root Stack guards |
| `src/app/(tabs)/_layout.tsx` | Defines tab appearance and the signed-in Dashboard guard |
| `src/app/(tabs)/index.tsx` | `/`: public Home, sample markets, search, and account links |
| `src/app/login.tsx` | `/login`: email/password login, available while signed out |
| `src/app/signup.tsx` | `/signup`: signup UI, available while signed out |
| `src/app/(tabs)/markets.tsx` | `/markets`: public placeholder |
| `src/app/(tabs)/workspace.tsx` | `/workspace`: public placeholder; currently displays `Markets` |
| `src/app/(tabs)/assets.tsx` | `/assets`: visible tab; redirects signed-out visitors to `/login` |
| `src/app/(tabs)/dashboard.tsx` | `/dashboard`: signed-in account and logout |
| `src/providers/auth-provider.tsx` | Shared account state, startup/resume checks, sign-in, and sign-out |
| `src/lib/auth.ts` | Native token storage and API requests |

The root Stack starts at `(tabs)`, and the tabs start at `index`. The root registers `(tabs)` publicly and places login/signup inside `Stack.Protected guard={!user}`. Dashboard is inside `Tabs.Protected guard={!!user}`. Assets stays visible to everyone and uses `<Redirect href="/login" />` without a signed-in account.

Route groups do not add their name to the URL: `(tabs)/index.tsx` owns `/`. There is no `src/app/index.tsx` in the current structure. Keep login/signup outside `(tabs)`; files added inside that folder can become tabs even without an explicit `Tabs.Screen` entry. Keep components, hooks, providers, and utilities outside `src/app/`. See [Router notation](https://docs.expo.dev/router/basics/notation/) and [JavaScript tabs](https://docs.expo.dev/router/advanced/tabs/).

Home's avatar and primary action link to `/login` while signed out and `/dashboard` while signed in. Its secondary action links to `/signup`, but still has an old search accessibility label and search-focus handler. See [remaining cleanup](troubleshooting.md#known-login-cleanup).

Signup's Back to home uses `<Link href="/" replace asChild>`. Its Log in link uses `/login` with `replace`. Login's Back to home still uses `<Link href="/" dismissTo asChild>` in the current source. `dismissTo` is a stack operation; the earlier `POP_TO` warning arose when signup was inside the tabs navigator. See [navigation troubleshooting](troubleshooting.md#pop_to-warning-or-signup-appears-in-tabs) and the [SDK 55 Link reference](https://docs.expo.dev/versions/v55.0.0/sdk/router/link/).

Login/logout rely on provider state and guards rather than explicit navigation calls. Signing in removes login/signup from available routes and normally returns to Home; Dashboard becomes available. See [Login and saved sessions](login.md).

## Tab appearance and spacing

Current shared options in `src/app/(tabs)/_layout.tsx` include:

```tsx
screenOptions={{
  headerShown: false,
  tabBarHideOnKeyboard: true,
  tabBarActiveTintColor: "#FFFFFF",
  tabBarInactiveTintColor: "#8E9098",
  tabBarStyle: {
    backgroundColor: "#000000",
    borderTopColor: "#25262B",
    paddingTop: 5,
  },
  tabBarLabelStyle: {
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  sceneStyle: {
    backgroundColor: "#000000",
  },
}}
```

Each tab's Ionicons renderer sets `size={18}`. Home uses home icons, Markets bar-chart icons, Workspace/Dashboard grid icons, and Assets wallet icons. Focused tabs use the filled variant.

`paddingTop` adds space inside the bar above its contents. `marginTop` would add space outside the bar between it and screen content; it is not currently set. Content spacing belongs in each screen's own styles. No explicit bar height is set. Check icon/label clipping and the system bottom inset on both platforms when increasing padding. See [React Navigation tab styling](https://reactnavigation.org/docs/bottom-tab-navigator/#tabbarstyle).

To add a tab, create its file in `(tabs)` and register a matching `Tabs.Screen` name without the extension. Add a guard or screen redirect if it requires authentication; backend data still needs its own authentication check.

## Home and placeholder content

Home has a black background, category cards, and hardcoded BTC, ETH, and SOL prices. Search filters local rows by symbol, name, or USDT. These are sample values, not live quotes; category cards are display-only.

Markets and Workspace contain headings on black backgrounds. Assets shows its heading after authentication. Dashboard retains a light welcome card, account email, and blue logout button; it does not use login/signup palettes.

## Light and dark login/signup

`src/styles/login-theme.ts` supplies both authentication screens with background, surface, text, muted text, border, primary, button text, accent, and error tokens.

| Token | Light | Dark |
| --- | --- | --- |
| Background | `#F8FAFC` | `#0B0D10` |
| Text | `#0F172A` | `#F2F0EA` |
| Primary / accent | `#0F7058` | `#57CCA7` |
| Button text | `#FFFFFF` | `#071B14` |

Both screens call `useColorScheme()` and select dark only for `"dark"`; other results use light. Styles are created once per palette. Chart uses `theme.text`, and ineer uses `theme.accent`. Inputs, placeholders, icons, buttons, and errors use palette tokens.

`app.json` sets `userInterfaceStyle` to `automatic`, and `expo-system-ui` is installed. There is no in-app theme toggle. Change Android's system dark theme to test login/signup; public tabs stay black in either mode. See [Expo color themes](https://docs.expo.dev/develop/user-interface/color-themes/).

Focus callbacks use the named `setStatusBarStyle` import from `expo-status-bar`: authentication screens select light icons in dark mode and dark icons in light mode. Home, Markets, Workspace, and signed-in Assets select light icons. Cleanup resets the style to `"dark"`. Use the [SDK 55 named function](https://docs.expo.dev/versions/v55.0.0/sdk/status-bar/), not `StatusBar.setStatusBarStyle`.

## Signup and agreement checkbox

Signup includes the wordmark, Google/Apple buttons, email field, Sign up, policy links, and Log in. Google uses a remote colored logo; Apple uses an Ionicons logo in a black/white button.

`acceptedPolicies` starts false. The checkbox announces its role and checked state. Provider buttons use `disabled={!acceptedPolicies}`, announce their disabled state, and fade with `styles.disabled`. The social handler also checks acceptance. Unchecking disables both buttons again. Opening policy links is not required to toggle the checkbox; checking does not prove that pages were read.

Email signup currently validates only email and is not gated by the agreement. All signup methods show a not-available notice; no registration request or provider authentication is connected. Agreement is component state, not a backend record.

`TERMS_URL` and `PRIVACY_URL` are `null`. Their links currently show an unpublished notice. Replace those constants with published HTTPS URLs to enable `Linking.openURL`. Keep review links available while signup buttons are disabled. See [SDK 55 Linking](https://docs.expo.dev/versions/v55.0.0/sdk/linking/).

## Login icons and password visibility

Login uses `mail-outline`, `lock-closed-outline`, and `eye-outline` / `eye-off-outline`. Icons and TextInput share an `inputRow`; the input uses `inputText`, and the eye button has a 48-by-48 touch area.

The eye toggles `showPassword`; the input uses `secureTextEntry={!showPassword}`. Fields, eye, Back to home, and Submit are disabled while submitting. Submit checks empty fields, calls provider `signIn`, shows a spinner, clears the password on success, and displays errors. A ref prevents duplicate submissions. Forgot password is absent.

Login/signup use SafeAreaView on all four edges, KeyboardAvoidingView, and a ScrollView with a centered form capped at width 420. Most tab screens reserve the top and side safe areas while navigation handles the bottom bar.

## Shared styles and Poppins

`src/styles/global.ts` exports `colors`, `spacing`, `fonts`, and `globalStyles`. Its current `colors.primary` is `#159575`; login/signup use separate theme tokens. Dashboard retains hardcoded blue styling.

| Alias | Loaded family |
| --- | --- |
| `fonts.regular` | `Poppins_400Regular` |
| `fonts.semibold` | `Poppins_600SemiBold` |
| `fonts.bold` | `Poppins_700Bold` |
| `fonts.extraBold` | `Poppins_800ExtraBold` |

The root loads all four families with `useFonts`. Apply `fontFamily` to each Text/TextInput; it does not inherit from surrounding Views. Tab labels use Regular, size 11. See [SDK 55 fonts](https://docs.expo.dev/versions/v55.0.0/sdk/font/).

## Logo before the login screen

The native splash is independent of login UI. Its `app.json` plugin entry is:

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

The custom image is Android-only. Startup holds the splash while fonts and the initial session check load, then renders navigation or session-error Retry. Keep the `expo-router` and `expo-secure-store` plugins.

Native splash changes need a new native build. Verify final appearance in a release build because Expo Go/development builds have preview limitations. See [SDK 55 splash screen](https://docs.expo.dev/versions/v55.0.0/sdk/splash-screen/).

## Login logo and asset aliases

Login separately renders the same image at 120 by 120 above the wordmark:

```tsx
<Image
  source={require("@/assets/images/system-logo/system-logo.png")}
  style={styles.logoImage}
  resizeMode="contain"
/>
```

`tsconfig.json` maps `@/*` to `./src/*` and `@/assets/*` to `./assets/*`. Keep the specific asset mapping and restart Expo after changing aliases. Signup currently uses a wordmark without this system-logo Image.

## Native configuration

Use `app.json` and config plugins for native settings. Do not hand-create native directories. Modules outside Expo Go require a development build. Check the installed Expo major and matching docs before changing APIs.
