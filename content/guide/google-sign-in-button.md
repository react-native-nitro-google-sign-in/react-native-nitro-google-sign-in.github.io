---
sidebar_position: 3
---

# Google Sign-In button

Native branded button exposed as a Nitro HybridView:

- **iOS:** `GIDSignInButton`
- **Android:** in-process button using Play services branding assets (localized strings + official drawables). Does **not** embed the Dynamite-backed `com.google.android.gms.common.SignInButton`, which can lay out correctly but paint blank on some Android / Play services versions.

Full prop and type listings: **[API reference — GoogleSignInButton](/docs/guide/api-reference#googlesigninbutton)**.

## Basic usage

```tsx
import {
  GoogleSignInButton,
  GOOGLE_SIGN_IN_BUTTON_HEIGHT,
} from 'react-native-nitro-google-signin'

<GoogleSignInButton
  colorScheme="light"
  size="standard"
  signInBehavior="credentialManager"
  onSignInSuccess={(data) => console.log(data.user.email, data.idToken)}
  onSignInError={(e) => console.error(e)}
/>
```

The component applies an intrinsic width/height from `size` (230×48 / 312×48 / 48×48). Override with `style` when needed (for example stretch to full width):

```tsx
<GoogleSignInButton
  size="wide"
  style={{ width: '100%', height: GOOGLE_SIGN_IN_BUTTON_HEIGHT }}
  ...
/>
```

Call `GoogleOneTapSignIn.configure()` before the button can sign in (same as programmatic API).

## `signInBehavior`

| Value | Behavior |
| ----- | -------- |
| `credentialManager` (default) | `checkPlayServices` → `signIn` → `createAccount` if no saved credential (Credential Manager sheet on Android) |
| `buttonFlow` | `checkPlayServices` → `presentExplicitSignIn` (explicit account dialog on Android) |
| `none` | Only your `onPress` handler — no built-in sign-in |

## Props (summary)

| Category | Props |
| -------- | ----- |
| Appearance | `colorScheme` (`'light' \| 'dark'`), `size` (`'standard' \| 'wide' \| 'icon'`), `contentAlignment`, `disabled` |
| Sign-in | `signInBehavior`, `onSignInSuccess`, `onSignInError`, `onPress`, `loading` |
| Layout / a11y | `style`, `testID`, `accessibilityLabel`, `accessibilityRole`, `accessibilityState`, `collapsable`, `nativeID` |
| Advanced | `hybridRef` |

## Hook

`useGoogleSignInFromButton` exposes the same cascade for a custom `Pressable`:

```tsx
const { loading, onPress } = useGoogleSignInFromButton({
  behavior: 'credentialManager',
  onSuccess: (data) => { /* OneTapSuccessData */ },
  onError: (e) => { /* unknown */ },
})

<Pressable onPress={onPress} disabled={loading}>
  <Text>Sign in</Text>
</Pressable>
```

See [API reference — useGoogleSignInFromButton](/docs/guide/api-reference#usegooglesigninfrombutton).

## Constants

**`GOOGLE_SIGN_IN_BUTTON_HEIGHT`** = `48` (pt/dp per Google branding).

**`GOOGLE_SIGN_IN_BUTTON_WIDTH`** — `{ standard: 230, wide: 312, icon: 48 }` (dp). Applied as the default `style` unless you override it.

**`getGoogleSignInButtonIntrinsicStyle(size)`** — returns `{ width, height }` for the given `size`.

## Low-level export

**`GoogleSignInButtonHost`** — Nitro host component if you build a custom wrapper; most apps use **`GoogleSignInButton`** only.
