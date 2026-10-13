# Mobile screens, tabs, and themes

The app uses Expo SDK 55, Expo Router, and NativeWind 4. This guide reflects the source as of October 13, 2026.

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
      profile.tsx
  providers/
    auth-provider.tsx
  styles/
    global.ts
    global.css
    login-theme.ts
  lib/
    auth.ts
```

## Routes and tabs

| File | Responsibility |
| --- | --- |
| `src/app/_layout.tsx` | Loads fonts, wraps AuthProvider, holds the splash through startup, and defines root Stack guards |
| `src/app/(tabs)/_layout.tsx` | Defines five tabs, safe-area spacing, and the custom center Home button |
| `src/app/(tabs)/index.tsx` | `/`: public Home, sample markets, search, and account links |
| `src/app/login.tsx` | `/login`: email/password login, available while signed out |
| `src/app/signup.tsx` | `/signup`: signup UI, available while signed out |
| `src/app/(tabs)/markets.tsx` | `/markets`: public placeholder |
| `src/app/(tabs)/workspace.tsx` | `/workspace`: public placeholder; currently displays `Markets` |
| `src/app/(tabs)/assets.tsx` | `/assets`: visible tab; redirects signed-out visitors to `/login` |
| `src/app/(tabs)/profile.tsx` | `/profile`: account email and logout; redirects signed-out visitors to `/login` |
| `src/providers/auth-provider.tsx` | Shared account state, startup/resume checks, sign-in, and sign-out |
| `src/lib/auth.ts` | Native token storage and API requests |

The root Stack starts at `(tabs)`, and the tabs start at `index`. The root registers `(tabs)` publicly and places login/signup inside `Stack.Protected guard={!user}`. All five tabs remain visible. Assets and Profile each use `<Redirect href="/login" />` without a signed-in account. The tabs layout retains an empty `Tabs.Protected guard={!!user}` block; it currently contains no screens.

Route groups do not add their name to the URL: `(tabs)/index.tsx` owns `/`. There is no `src/app/index.tsx` in the current structure. Keep login/signup outside `(tabs)`; files added inside that folder can become tabs even without an explicit `Tabs.Screen` entry. Keep components, hooks, providers, and utilities outside `src/app/`. See [Router notation](https://docs.expo.dev/router/basics/notation/) and [JavaScript tabs](https://docs.expo.dev/router/advanced/tabs/).

Home's avatar and primary action link to `/login` while signed out and still link to `/dashboard` while signed in. The Dashboard file has been deleted, so those signed-in links need to target `/profile` and have their labels updated. Use the Profile tab for account details and logout. Home's secondary action links to `/signup`, but still has an old search accessibility label and search-focus handler. See [remaining cleanup](troubleshooting.md#known-login-cleanup).

Signup's Back to home uses `<Link href="/" replace asChild>`. Its Log in link uses `/login` with `replace`. Login's Back to home still uses `<Link href="/" dismissTo asChild>` in the current source. `dismissTo` is a stack operation; the earlier `POP_TO` warning arose when signup was inside the tabs navigator. See [navigation troubleshooting](troubleshooting.md#pop_to-warning-or-signup-appears-in-tabs) and the [SDK 55 Link reference](https://docs.expo.dev/versions/v55.0.0/sdk/router/link/).

Login/logout rely on provider state, root guards, and screen redirects rather than explicit navigation calls. Signing in removes login/signup from available routes and normally returns to Home; Profile can then render the account. See [Login and saved sessions](login.md).

## Tab appearance and spacing

The order is Markets, Workspace, Home, Assets, Profile. Shared options hide headers and the bar while the keyboard is open. Active icons/labels are `#FFFFFF`; inactive ones are `#8E9098`. Scenes and the bar container use black.

| Setting | Current value |
| --- | --- |
| Bar height | 96 |
| Bar top/bottom padding | 3 / `insets.bottom` from `useSafeAreaInsets()` |
| Side item top padding | 32 |
| Icon container | 24 by 24 |
| Side icon size | 18 |
| Side labels | Below icons, Poppins Regular, size 11 |
| Background panel | Starts 32 below the bar top; `#15171C` with a 1-pixel `#25262B` top border |

Home overrides item top padding to 0 and supplies a custom `tabBarButton` using `PlatformPressable` with the navigator's props. It renders a 64-by-64 green `#159575` circle, a 6-pixel black border, and a white home icon at size 26. It replaces the default icon/label children, so it has no visible Home label; `tabBarAccessibilityLabel` is `Home`. Markets uses bar-chart icons, Workspace grid icons, Assets wallet icons, and Profile person icons. Side tabs use filled icons when focused; Home stays green and white.

The bar height is fixed at 96; bottom inset padding is applied within that height. Check side labels, the raised button, and bottom safe-area clipping on Android and iOS devices with different insets. See [JavaScript tab options](https://docs.expo.dev/router/advanced/tabs/).

To add a tab, create its file in `(tabs)` and register a matching `Tabs.Screen` name without the extension. Add a guard or screen redirect if it requires authentication; backend data still needs its own authentication check.

## Home and placeholder content

Home has a black background, category cards, and hardcoded BTC, ETH, and SOL prices. Search filters local rows by symbol, name, or USDT. These are sample values, not live quotes; category cards are display-only.

Markets and Workspace contain headings on black backgrounds. Assets shows its heading after authentication. Profile retains a light welcome card, account email, and blue logout button; it does not use login/signup palettes. Home still logs `user` to the console.

## NativeWind styling and configuration

The project uses NativeWind `4.2.7` with Tailwind CSS `3.4.17`. Screens now use `className` for component styles and `contentContainerClassName` for ScrollView content. Navigation options still use style objects where required.

| File | Responsibility |
| --- | --- |
| `babel.config.js` | Uses `babel-preset-expo` with `jsxImportSource: "nativewind"`, plus the `nativewind/babel` preset |
| `metro.config.js` | Wraps Expo's default Metro config in `withNativeWind` with input `./src/styles/global.css` |
| `tailwind.config.js` | Scans `./src/**/*.{js,jsx,ts,tsx}`, uses `nativewind/preset`, and maps Poppins font utilities |
| `src/styles/global.css` | Contains the Tailwind base, components, and utilities directives |
| `src/app/_layout.tsx` | Imports the global CSS once at the root |
| `nativewind-env.d.ts` | References `nativewind/types` for utility props |
| `tsconfig.json` | Includes the NativeWind declaration alongside Expo types and asset aliases |
| `app.json` | Sets `web.bundler` to `metro`; keeps static web output |

Use complete class strings for conditional styles, as with Home's `badgeClassName` and signup's disabled opacity. Keep utility-bearing files within the configured content paths. Restore these files together when copying or merging the app. Stop Metro and run `npx expo start --clear` after configuration changes. This configuration follows the [NativeWind installation guide](https://www.nativewind.dev/docs/getting-started/installation); see also [Expo's Tailwind guide](https://docs.expo.dev/guides/tailwind/).

## Light and dark login/signup

`src/styles/login-theme.ts` supplies both authentication screens with background, surface, text, muted text, border, primary, button text, accent, and error tokens.

| Token | Light | Dark |
| --- | --- | --- |
| Background | `#F8FAFC` | `#0B0D10` |
| Text | `#0F172A` | `#F2F0EA` |
| Primary / accent | `#0F7058` | `#57CCA7` |
| Button text | `#FFFFFF` | `#071B14` |

Both screens call React Native's `useColorScheme()` and select dark only for `"dark"`; other results use light. Backgrounds, text, borders, and buttons now use NativeWind utilities with `dark:` variants. Palette values still supply icon colors, placeholders, selection colors, and login's spinner. The wordmark uses matching light/dark utilities for Chart and the green ineer suffix.

`app.json` sets `userInterfaceStyle` to `automatic`, and `expo-system-ui` is installed. There is no in-app theme toggle. Change Android's system dark theme to test login/signup; public tabs stay black in either mode. See [Expo color themes](https://docs.expo.dev/develop/user-interface/color-themes/).

Focus callbacks use the named `setStatusBarStyle` import from `expo-status-bar`: authentication screens select light icons in dark mode and dark icons in light mode. Home, Markets, Workspace, and signed-in Assets select light icons. Cleanup resets the style to `"dark"`. Use the [SDK 55 named function](https://docs.expo.dev/versions/v55.0.0/sdk/status-bar/), not `StatusBar.setStatusBarStyle`.

## Signup and agreement checkbox

Signup includes the wordmark, Google/Apple buttons, email field, Sign up, policy links, and Log in. Google uses a remote colored logo; Apple uses an Ionicons logo in a black/white button.

`acceptedPolicies` starts false. The checkbox announces its role and checked state. Provider buttons use `disabled={!acceptedPolicies}`, announce their disabled state, and add `opacity-[0.45]` while disabled. The social handler also checks acceptance. Unchecking disables both buttons again. Opening policy links is not required to toggle the checkbox; checking does not prove that pages were read.

Email signup currently validates only email and is not gated by the agreement. All signup methods show a not-available notice; no registration request or provider authentication is connected. Agreement is component state, not a backend record.

`TERMS_URL` and `PRIVACY_URL` are `null`. Their links currently show an unpublished notice. Replace those constants with published HTTPS URLs to enable `Linking.openURL`. Keep review links available while signup buttons are disabled. See [SDK 55 Linking](https://docs.expo.dev/versions/v55.0.0/sdk/linking/).

## Login icons and password visibility

Login uses `mail-outline`, `lock-closed-outline`, and `eye-outline` / `eye-off-outline`. Icons and TextInput share a View with `flex-row items-center` utilities; the input uses `flex-1 min-w-0`. The eye button has width 48 and minimum height 48.

The eye toggles `showPassword`; the input uses `secureTextEntry={!showPassword}`. Fields, eye, Back to home, Submit, and social login buttons are disabled while submitting. Submit checks empty fields, calls provider `signIn`, shows a spinner, clears the password on success, and displays errors. A ref prevents duplicate submissions. Forgot password is absent.

Login now includes email/password labels and a Google/Apple row below an `Or continue with` divider. Those provider buttons show availability notices and do not authenticate. The `Sign up` text beside the back arrow is currently plain Text with no navigation handler.

Login/signup use SafeAreaView on all four edges, KeyboardAvoidingView, and a ScrollView with a centered form capped at width 420. Most tab screens reserve the top and side safe areas while navigation handles the bottom bar.

## Shared styles and Poppins

`src/styles/global.ts` exports `colors`, `spacing`, `fonts`, and `globalClasses`. `globalClasses` contains reusable utility strings for screens, inputs, labels, buttons, and links; the root Retry button uses these strings. Its current `colors.primary` is `#159575`; login/signup use matching utilities and separate theme tokens. Profile retains hardcoded blue styling.

| Alias | Loaded family | Tailwind utility |
| --- | --- | --- |
| `fonts.regular` | `Poppins_400Regular` | `font-poppins` |
| `fonts.semibold` | `Poppins_600SemiBold` | `font-poppins-semibold` |
| `fonts.bold` | `Poppins_700Bold` | `font-poppins-bold` |
| `fonts.extraBold` | `Poppins_800ExtraBold` | No custom utility configured |

The root loads all four families with `useFonts`. Apply the appropriate Poppins utility to Text/TextInput, or use `fonts` in a style object where needed. Several Profile and provider-button texts currently use generic weight utilities instead of Poppins aliases. Tab labels use Regular, size 11. See [SDK 55 fonts](https://docs.expo.dev/versions/v55.0.0/sdk/font/).

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
  className="h-[120px] w-[120px] self-center"
  resizeMode="contain"
/>
```

`tsconfig.json` maps `@/*` to `./src/*` and `@/assets/*` to `./assets/*`. Keep the specific asset mapping and restart Expo after changing aliases. Signup currently uses a wordmark without this system-logo Image.

## Native configuration

Use `app.json` and config plugins for native settings. Do not hand-create native directories. Modules outside Expo Go require a development build. Check the installed Expo major and matching docs before changing APIs.
