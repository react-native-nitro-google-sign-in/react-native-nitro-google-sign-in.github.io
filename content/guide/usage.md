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

## Backend verification

This library returns Google-issued `idToken` and `serverAuthCode` values to JavaScript. **Your backend must verify every token** — never trust the client alone.

| Check | Action |
| ----- | ------ |
| **Signature** | Verify RS256 with Google JWKS (`https://www.googleapis.com/oauth2/v3/certs`). |
| **`aud`** | Must equal your **Web OAuth client ID**. |
| **`iss`** | Must be `accounts.google.com` or `https://accounts.google.com`. |
| **`exp`** | Reject expired tokens. |
| **`nonce`** | If you set `configure({ nonce })`, verify the JWT `nonce` claim matches your server-issued value. |
| **`hd`** | If you use `hostedDomain`, validate the JWT `hd` claim on the server. |
| **`serverAuthCode`** | Exchange only on your backend with the client secret; never log full codes in analytics or UI. |

Full checklist: [SECURITY.md](https://github.com/react-native-nitro-google-sign-in/google-signin/blob/main/SECURITY.md) in the repository.

:::tip iOS silent `signIn()` and `serverAuthCode`
With `offlineAccess: true`, iOS **silent** `signIn()` / restore returns `serverAuthCode: null`. Use `createAccount()` or `presentExplicitSignIn()` for the initial offline grant that returns a code.
:::

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

:::warning `offlineAccess: true` required for `serverAuthCode`
To receive a `serverAuthCode` — from sign-in (`response.data.serverAuthCode`) or from `requestScopes()` — you **must** pass `offlineAccess: true` in `configure()`. The default is `false`; without it, `serverAuthCode` is always `null` even when scopes are granted.
:::

| Approach | API | When to use |
| -------- | --- | ----------- |
| **At first sign-in** | `configure({ scopes, offlineAccess })` | You know required scopes before the user signs in. Consent may appear during sign-in. |
| **Later** | `requestScopes(scopes)` | User is already signed in; request extra access when they use a feature (e.g. “Connect calendar”). |

### Option A — scopes at configure time

Pass `scopes` in `configure()`. **`offlineAccess: true` is required** when your backend needs a `serverAuthCode` to exchange for refresh tokens:

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

Configure with **`offlineAccess: true`** (required for `serverAuthCode`), sign in, then call `requestScopes()` when needed. The user may see a consent screen:

```ts
import {
  GoogleOneTapSignIn,
  isSuccessResponse,
} from 'react-native-nitro-google-signin'

const CALENDAR_READONLY = 'https://www.googleapis.com/auth/calendar.readonly'

GoogleOneTapSignIn.configure({
  webClientId: 'autoDetect',
  offlineAccess: true,
})

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

:::tip `serverAuthCode` from `requestScopes()`
`offlineAccess: true` in `configure()` is **required** before calling `requestScopes()` if your backend needs an authorization code. Without offline access, scope consent may succeed but `serverAuthCode` will always be `null`.
:::

:::tip Combine both
You can pass baseline scopes in `configure({ scopes })` and call `requestScopes()` later for **additional** scopes the user opts into.
:::

See also [`requestScopes()` in the API reference](/docs/guide/api-reference#requestscopesscopes-string-promiseonetapauthorizationresult). Example apps: [bare `example/App.tsx`](https://github.com/react-native-nitro-google-sign-in/google-signin/blob/main/example/App.tsx) · [Expo `example-expo/App.tsx`](https://github.com/react-native-nitro-google-sign-in/google-signin/blob/main/example-expo/App.tsx).

## Access tokens (`getTokens`)

Use `getTokens()` when you need the current user's **ID token and OAuth access token** after sign-in — for example when migrating from `@react-native-google-signin/google-signin`:

```ts
import {
  GoogleOneTapSignIn,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from 'react-native-nitro-google-signin'

const signInAndFetchTokens = async () => {
  const response = await GoogleOneTapSignIn.signIn()

  if (!isSuccessResponse(response)) return

  try {
    const { idToken, accessToken } = await GoogleOneTapSignIn.getTokens()
    // Prefer verifying idToken on your backend, or exchange serverAuthCode
    console.log(idToken.slice(0, 16), accessToken.slice(0, 16))
  } catch (e) {
    if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_REQUIRED) {
      // User session expired — run sign-in again
    }
  }
}
```

| Platform | Behavior |
| -------- | -------- |
| **Android** | Returns the ID token cached from the last Credential Manager sign-in plus a fresh access token from `AuthorizationClient`. May show a consent UI if scopes were not yet authorized. |
| **iOS** | Uses the AppAuth session behind `GIDSignIn`. Refreshes tokens from Google when expired or after `clearCachedAccessToken()`. |

:::tip Backend auth
Google recommends verifying the **`idToken`** on your server or exchanging a **`serverAuthCode`** (with `offlineAccess: true`) for refresh tokens. Client-side access tokens are mainly for calling Google APIs from the device.
:::

### Invalid access token (`clearCachedAccessToken`)

If a Google API returns **401** or otherwise indicates the access token is stale, clear the local cache and fetch again:

```ts
try {
  await callGoogleApi(accessToken)
} catch (e) {
  if (isInvalidTokenError(e)) {
    await GoogleOneTapSignIn.clearCachedAccessToken(accessToken)
    const { accessToken: freshToken } = await GoogleOneTapSignIn.getTokens()
    await callGoogleApi(freshToken)
  }
}
```

| Platform | `clearCachedAccessToken` | Next `getTokens()` |
| -------- | ------------------------ | ------------------- |
| **Android** | Removes the token from `AuthorizationClient`'s local cache | Fetches a new access token from Google |
| **iOS** | Marks the AppAuth session with `setNeedsTokenRefresh()` | Performs a network refresh and returns new tokens |

On **iOS**, calling `getTokens()` twice in a row **without** clearing first may return the same access token while it is still valid — that is expected. Call `clearCachedAccessToken()` first when you know the token is invalid.

See [`getTokens()`](/docs/guide/api-reference#gettokens-promisegettokensresponse) and [`clearCachedAccessToken()`](/docs/guide/api-reference#clearcachedaccesstokenaccesstokenstring-string-promisevoid) in the API reference.

## Sign out and revoke

```ts
await GoogleOneTapSignIn.signOut()

await GoogleOneTapSignIn.revokeAccess(userEmailOrId)
```

| Platform | `revokeAccess` |
| -------- | -------------- |
| **Android** | Resolves the account by email or `OneTapUser.id`. |
| **iOS** | Revokes only the **current** signed-in session. Throws if `userEmailOrId` does not match the active user — call `signIn()` first when revoking a specific stored account. |

:::warning Google Workspace (`hostedDomain`)
Client-side domain filtering is a convenience only. **Always validate the JWT `hd` claim on your backend.** On Android, `GoogleSignInButton` with `signInBehavior="buttonFlow"` validates `hd` after sign-in; Credential Manager flows filter at request time.
:::

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
