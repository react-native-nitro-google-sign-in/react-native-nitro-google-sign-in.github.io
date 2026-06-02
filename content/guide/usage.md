---
sidebar_position: 1
---

# Usage

## Configure

`configure()` must run before any other method (typically in app startup or a root `useEffect`).

```ts
GoogleOneTapSignIn.configure({
  webClientId: 'autoDetect', // or explicit Web client ID
  iosClientId: undefined, // optional
  offlineAccess: false,
  hostedDomain: null,
  nonce: null, // SHA-256 hex; auto-generated if omitted
  scopes: null, // OAuth scope URLs
  autoSelectOnSignIn: false,
})
```

## Recommended sign-in flow

Same cascade as the [Usage guide](/docs/guide/usage) and [Quick Start](/docs/getting-started/quick-start):

1. `checkPlayServices()` (Android)
2. `signIn()` — silent / restore
3. `createAccount()` — if no saved credential
4. `presentExplicitSignIn()` — explicit UI

Use helpers to branch on response type:

```ts
import {
  isSuccessResponse,
  isNoSavedCredentialFoundResponse,
  isCancelledResponse,
  isErrorWithCode,
  statusCodes,
} from 'react-native-nitro-google-signin'
```

## OAuth scopes (more access)

Request Google API permissions beyond basic profile / ID token. Always use **full scope URLs** (for example `https://www.googleapis.com/auth/calendar.readonly`), not short names.

| Approach | API | When to use |
| -------- | --- | ----------- |
| **At first sign-in** | `configure({ scopes, offlineAccess })` | You know required scopes before the user signs in. Consent may appear during sign-in. |
| **Later** | `requestScopes(scopes)` | User is already signed in; request extra access when they use a feature (e.g. “Connect calendar”). |

### Option A — scopes at configure time

Pass `scopes` in `configure()`. Set `offlineAccess: true` when your backend needs a `serverAuthCode` to exchange for refresh tokens:

```ts
import {
  GoogleOneTapSignIn,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from 'react-native-nitro-google-signin'

const CALENDAR_READONLY = 'https://www.googleapis.com/auth/calendar.readonly'

GoogleOneTapSignIn.configure({
  webClientId: 'autoDetect',
  scopes: [CALENDAR_READONLY],
  offlineAccess: true,
})

const signInWithScopesUpFront = async () => {
  await GoogleOneTapSignIn.checkPlayServices()
  let response = await GoogleOneTapSignIn.signIn()

  if (isNoSavedCredentialFoundResponse(response)) {
    response = await GoogleOneTapSignIn.createAccount()
  }

  if (isSuccessResponse(response)) {
    const { user, idToken, serverAuthCode } = response.data
    // idToken — verify on your backend
    // serverAuthCode — exchange on backend when offlineAccess is true
    console.log(user.email, idToken, serverAuthCode)
  }
}
```

### Option B — scopes after sign-in (`requestScopes`)

Configure without extra scopes, sign in, then call `requestScopes()` when needed. The user may see a consent screen:

```ts
import {
  GoogleOneTapSignIn,
  isSuccessResponse,
} from 'react-native-nitro-google-signin'

const CALENDAR_READONLY = 'https://www.googleapis.com/auth/calendar.readonly'

GoogleOneTapSignIn.configure({ webClientId: 'autoDetect' })

const signInThenRequestScopesLater = async () => {
  await GoogleOneTapSignIn.checkPlayServices()
  const response = await GoogleOneTapSignIn.signIn()

  if (!isSuccessResponse(response)) return

  const { user, idToken } = response.data
  // Signed in with basic access — calendar not requested yet
  console.log(user.email, idToken)
}

const enableCalendarAccess = async () => {
  const { serverAuthCode } = await GoogleOneTapSignIn.requestScopes([
    CALENDAR_READONLY,
  ])

  if (serverAuthCode) {
    // Send to your backend to store refresh tokens
    await fetch('https://your-api.example/auth/google/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverAuthCode }),
    })
  }
}
```

:::info Requires prior sign-in
`requestScopes()` only works after a successful sign-in (`configure()` + active session). Call it from a button handler or feature gate, not before the user has signed in.
:::

:::tip Combine both
You can pass baseline scopes in `configure({ scopes })` and call `requestScopes()` later for **additional** scopes the user opts into.
:::

See also [`requestScopes()` in the API reference](/docs/guide/api-reference#requestscopesscopes-string-promiseonetapauthorizationresult). Example apps: [bare `example/App.tsx`](https://github.com/react-native-nitro-google-signin/google-signin/blob/main/example/App.tsx) · [Expo `example-expo/App.tsx`](https://github.com/react-native-nitro-google-signin/google-signin/blob/main/example-expo/App.tsx).

## Sign out and revoke

```ts
await GoogleOneTapSignIn.signOut()

// iOS: disconnect app for user; Android CredMan: limited revoke support
await GoogleOneTapSignIn.revokeAccess(userEmailOrId)
```

## Errors

Thrown errors are `GoogleSignInError` with a `code` from `statusCodes`:

| Code | Meaning |
| ---- | ------- |
| `ONE_TAP_START_FAILED` | Flow could not start |
| `PLAY_SERVICES_NOT_AVAILABLE` | Android Play Services issue |
| `IN_PROGRESS` | Another sign-in in progress |
| `SIGN_IN_REQUIRED` | User must sign in |
| `SIGN_IN_CANCELLED` | User cancelled |

```ts
try {
  await GoogleOneTapSignIn.signIn()
} catch (e) {
  if (isErrorWithCode(e) && e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    // handle
  }
}
```

Cancelled **responses** (not throws) use `isCancelledResponse(response)`.

## Native sign-in button

See [Google Sign-In button](/docs/guide/google-sign-in-button).
