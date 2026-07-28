---
sidebar_position: 2
---

# API reference

Complete TypeScript surface exported from `react-native-nitro-google-signin`. For flows and examples, see [Usage](/docs/guide/usage) and [Quick start](/docs/getting-started/quick-start).

## Package exports

| Export | Kind | Description |
| ------ | ---- | ----------- |
| `GoogleOneTapSignIn` | object | Main API (Universal / One Tap sign-in) |
| `GoogleSignInButton` | component | Native branded sign-in button (HybridView) |
| `GoogleSignInButtonHost` | component | Low-level Nitro host (same tree as `GoogleSignInButton`) |
| `useGoogleSignInFromButton` | hook | Sign-in cascade for custom UI |
| `GOOGLE_SIGN_IN_BUTTON_HEIGHT` | const | `48` — recommended button height (pt/dp) |
| `OneTapResponseTypes` | const | String literals for `OneTapResponseType` |
| `statusCodes` | const | Error code string constants |
| `GoogleSignInError` | class | Thrown native/JS errors with `code` |
| `isSuccessResponse` | function | Type guard |
| `isNoSavedCredentialFoundResponse` | function | Type guard |
| `isCancelledResponse` | function | Type guard |
| `isErrorWithCode` | function | `GoogleSignInError` type guard |
| `NitroGoogleSignin` | object | **Deprecated** alias of `GoogleOneTapSignIn` |
| `OneTapConfigureParams` | type | `configure()` options |
| `OneTapResponse` | type | Sign-in method return value |
| `OneTapResponseType` | type | `'success' \| 'noSavedCredentialFound' \| 'cancelled'` |
| `OneTapSuccessData` | type | Success payload (`user`, `idToken`, `serverAuthCode`) |
| `OneTapUser` | type | Profile fields on success |
| `OneTapAuthorizationResult` | type | `requestScopes()` result |
| `GetTokensResponse` | type | `getTokens()` result |
| `OneTapSignInParams` | type | Placeholder (empty) for API parity |
| `OneTapCreateAccountParams` | type | Placeholder (empty) for API parity |
| `OneTapExplicitSignInParams` | type | Placeholder (empty) for API parity |
| `StatusCode` | type | Union of `statusCodes` values |
| `GoogleSignInButtonProps` | type | Button component props |
| `GoogleSignInButtonColorScheme` | type | `'light' \| 'dark'` |
| `GoogleSignInButtonNativeSize` | type | `'standard' \| 'wide' \| 'icon'` |
| `GoogleSignInButtonContentAlignment` | type | `'center' \| 'leading' \| 'trailing'` |
| `GoogleSignInButtonSignInBehavior` | type | `'credentialManager' \| 'buttonFlow' \| 'none'` |
| `GoogleSignInButtonViewProps` | type | Low-level HybridView props |
| `GoogleSignInButtonViewMethods` | type | Low-level HybridView methods |
| `GoogleSignInButtonRef` | type | `hybridRef` callback type |

`UseGoogleSignInFromButtonOptions` is used by `useGoogleSignInFromButton` but not re-exported from the package root — see [useGoogleSignInFromButton](#usegooglesigninfrombutton).

---

## `GoogleOneTapSignIn`

Singleton-style object backed by the Nitro hybrid `NitroGoogleSignin`. Call **`configure()` once** before any other method.

### `configure(params: OneTapConfigureParams): void`

| Parameter | Type | Required | Default | Description |
| --------- | ---- | -------- | ------- | ----------- |
| `webClientId` | `string` | yes | — | Web OAuth 2.0 client ID (`*.apps.googleusercontent.com`), or `'autoDetect'` to read from native config ([Android](/docs/setup/android) `default_web_client_id`, iOS `WEB_CLIENT_ID` in plist). |
| `iosClientId` | `string \| null` | no | plist `CLIENT_ID` | iOS OAuth client ID for `GIDConfiguration.clientID`. **iOS:** required via this field or `GoogleService-Info.plist` `CLIENT_ID`. Ignored on Android. |
| `offlineAccess` | `boolean` | no | `false` | **Required for `serverAuthCode`.** When `true`, native authorization requests offline access so sign-in and `requestScopes()` can return a server auth code for your backend. When `false` (default), `serverAuthCode` is **always `null`**. |
| `hostedDomain` | `string \| null` | no | — | Restrict sign-in to a Google Workspace domain (e.g. `example.com`). **Android:** Credential Manager flows (`signIn`, `createAccount`) filter at request time; `presentExplicitSignIn` / `buttonFlow` validates the JWT `hd` claim after sign-in. **iOS:** `GIDConfiguration.hostedDomain`. **Always validate `hd` on your backend** — do not rely on client-side filtering alone. |
| `nonce` | `string \| null` | no | auto SHA-256 hex | Nonce embedded in the ID token. If omitted, native code generates a random SHA-256 hex nonce per request. |
| `scopes` | `string[] \| null` | no | `[]` | OAuth scope URLs requested with sign-in / authorization (e.g. `https://www.googleapis.com/auth/drive.file`). |
| `autoSelectOnSignIn` | `boolean` | no | `false` | **Android:** when `true`, `signIn()` may auto-select if exactly one authorized account exists. When `false`, shows account UI when possible. |

**Throws / errors**

| Condition | Result |
| --------- | ------ |
| `webClientId: 'autoDetect'` without generated Android resource or iOS `WEB_CLIENT_ID` | `Error` / not configured (add config files or pass explicit Web ID) |
| **iOS** missing `iosClientId` and no plist `CLIENT_ID` | Configure fails — add [GoogleService-Info.plist](/docs/setup/ios) or pass `iosClientId` |
| Any sign-in method before `configure()` | `GoogleSignInError` / not configured |

---

### `checkPlayServices(showErrorResolutionDialog?: boolean): Promise<void>`

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `showErrorResolutionDialog` | `boolean` | `true` | **Android:** if Play Services are missing/outdated and the error is user-resolvable, show Google’s resolution dialog. |

| Platform | Behavior |
| -------- | -------- |
| **Android** | Resolves if Play Services available; throws `GoogleSignInError` with `PLAY_SERVICES_NOT_AVAILABLE` otherwise. |
| **iOS** | Resolves immediately (no-op). |

---

### `signIn(): Promise<OneTapResponse>`

Attempts a low-friction sign-in without forcing the full account picker when possible.

| Platform | Native behavior |
| -------- | ----------------- |
| **Android** | Credential Manager with **authorized accounts only** (`filterByAuthorizedAccounts: true`). Respects `autoSelectOnSignIn`. When `offlineAccess: true`, may follow with `AuthorizationClient` to attach a `serverAuthCode`. |
| **iOS** | If `GIDSignIn.sharedInstance.currentUser` exists → success; else `restorePreviousSignIn()`. **Silent restore returns `serverAuthCode: null`** even when `offlineAccess: true` — use `createAccount()` or `presentExplicitSignIn()` for the initial offline grant. |

Returns [`OneTapResponse`](#onetapresponse) (never throws for user cancel — use `type: 'cancelled'`).

---

### `createAccount(): Promise<OneTapResponse>`

Interactive flow that can show **all** Google accounts on the device (including accounts not yet authorized for your app).

| Platform | Native behavior |
| -------- | ----------------- |
| **Android** | Credential Manager, `filterByAuthorizedAccounts: false`. |
| **iOS** | Interactive `signIn(withPresenting:)`. |

---

### `presentExplicitSignIn(): Promise<OneTapResponse>`

Explicit **Sign in with Google** UI.

| Platform | Native behavior |
| -------- | ----------------- |
| **Android** | `GetSignInWithGoogleOption` — account dialog (all accounts, add account). When `hostedDomain` is configured, validates the JWT `hd` claim after sign-in. |
| **iOS** | Same interactive sign-in as `createAccount()`. |

Use when you want the traditional button-style account chooser on Android instead of the Credential Manager bottom sheet.

---

### `requestScopes(scopes: string[]): Promise<OneTapAuthorizationResult>`

Request **additional** OAuth scopes after the user is signed in. User may see a consent UI.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `scopes` | `string[]` | Full scope URLs to request (not short names). |

| Field (result) | Type | Description |
| -------------- | ---- | ----------- |
| `accessToken` | `string \| null` | OAuth 2.0 access token for calling Google APIs from the device. Returned when consent succeeds, even if `offlineAccess` is `false`. |
| `serverAuthCode` | `string \| null` | OAuth 2.0 server auth code for your backend. **Non-null only when `configure({ offlineAccess: true })` was called before sign-in.** Otherwise always `null`, even if scope consent succeeds. |

Requires prior successful sign-in (`configure()` + active session). Use `accessToken` for on-device Google API calls (Drive, Calendar, etc.). Set **`offlineAccess: true`** only when your backend needs a `serverAuthCode`.

Works after sign-in via the imperative API (`signIn` / `createAccount` / `presentExplicitSignIn`) or hooks such as `useGoogleSignInFromButton`.

---

### `getTokens(): Promise<GetTokensResponse>`

Returns the current user's ID and OAuth access tokens after sign-in. Useful when migrating from `@react-native-google-signin/google-signin` or when you need to refresh tokens without re-running the account picker.

| Field (result) | Type | Description |
| -------------- | ---- | ----------- |
| `idToken` | `string` | OpenID Connect ID token (JWT). |
| `accessToken` | `string` | OAuth 2.0 access token for Google APIs. |

| Platform | Native behavior |
| -------- | ----------------- |
| **Android** | Combines the cached ID token from the last Credential Manager sign-in with a fresh access token from `AuthorizationClient.authorize()`. May show a consent UI if scopes were not yet authorized. |
| **iOS** | Reads tokens from the AppAuth session via `performAction(freshTokens:)`. Refreshes from Google when tokens are expired or after `clearCachedAccessToken()`. |

**Throws:** `GoogleSignInError` with `SIGN_IN_REQUIRED` when no user is signed in.

Prefer verifying `idToken` or exchanging `serverAuthCode` on your backend over sending raw access tokens from the client.

:::info Migration from `@react-native-google-signin/google-signin`
`GoogleOneTapSignIn.getTokens()` and `clearCachedAccessToken()` mirror the legacy API shape. On iOS, `clearCachedAccessToken()` is **not** a no-op — it marks the session for refresh so the next `getTokens()` can obtain new tokens after a 401.
:::

---

### `clearCachedAccessToken(accessTokenString: string): Promise<void>`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `accessTokenString` | `string` | Access token to remove from the local cache. |

| Platform | Behavior |
| -------- | -------- |
| **Android** | Calls `AuthorizationClient.clearToken()` — use when Google indicates the access token is invalid before retrying authorization. |
| **iOS** | Calls `OIDAuthState.setNeedsTokenRefresh()` on the user's AppAuth session. The **next** `getTokens()` performs a network refresh. Validates that `accessTokenString` matches the current access token when non-empty. |

---

### `signOut(): Promise<void>`

Clears the Google Sign-In session in the native SDK.

| Platform | Notes |
| -------- | ----- |
| **iOS** | `GIDSignIn.sharedInstance.signOut()`. |
| **Android** | Calls `CredentialManager.clearCredentialState()` to clear the user's credential state and disable automatic sign-in semantics until the next successful interactive sign-in. |

---

### `revokeAccess(emailOrUniqueId: string): Promise<void>`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `emailOrUniqueId` | `string` | User email or stable Google account id (`OneTapUser.id`). |

| Platform | Behavior |
| -------- | -------- |
| **Android** | Resolves the account from `emailOrUniqueId` and revokes via `AuthorizationClient.revokeAccess()`. |
| **iOS** | Revokes only the **current signed-in session** via `GIDSignIn.disconnect()`. Throws if `emailOrUniqueId` does not match the active user's id or email. Call `signIn()` first when revoking a specific stored account. |

---

## Types

### `OneTapConfigureParams`

```ts
interface OneTapConfigureParams {
  webClientId: string
  iosClientId?: string | null
  offlineAccess?: boolean
  hostedDomain?: string | null
  nonce?: string | null
  scopes?: string[] | null
  autoSelectOnSignIn?: boolean
}
```

See [`configure()`](#configureparams-onetapconfigureparams-void) for field details.

---

### `OneTapResponseType`

```ts
type OneTapResponseType =
  | 'success'
  | 'noSavedCredentialFound'
  | 'cancelled'
```

| Value | Meaning |
| ----- | ------- |
| `'success'` | User signed in; `data` is [`OneTapSuccessData`](#onetapsuccessdata). |
| `'noSavedCredentialFound'` | No saved credential / no previous sign-in to restore — run `createAccount()` or `presentExplicitSignIn()` next. |
| `'cancelled'` | User dismissed UI (not an thrown error). On **Android**, Credential Manager also returns this when OAuth is misconfigured (missing release / Play App Signing SHA-1) — see [troubleshooting](/docs/guide/troubleshooting#cancelled-after-account-pick). |

---

### `OneTapResponseTypes`

Const object mirroring `OneTapResponseType` for comparisons without string literals:

```ts
const OneTapResponseTypes = {
  success: 'success',
  noSavedCredentialFound: 'noSavedCredentialFound',
  cancelled: 'cancelled',
} as const
```

Example: `response.type === OneTapResponseTypes.success`

---

### `OneTapResponse`

```ts
interface OneTapResponse {
  type: OneTapResponseType
  data: OneTapSuccessData | null
}
```

| `type` | `data` |
| ------ | ------ |
| `'success'` | Non-null `OneTapSuccessData` |
| `'noSavedCredentialFound'` | `null` |
| `'cancelled'` | `null` |

---

### `OneTapSuccessData`

```ts
interface OneTapSuccessData {
  user: OneTapUser
  idToken: string
  serverAuthCode: string | null
}
```

| Field | Type | Description |
| ----- | ---- | ----------- |
| `user` | `OneTapUser` | Profile fields from Google ID token / credential. |
| `idToken` | `string` | OpenID Connect ID token (JWT). Verify on your backend with Google’s keys. |
| `serverAuthCode` | `string \| null` | OAuth 2.0 server auth code for your backend. **Non-null only when `configure({ offlineAccess: true })` was used** before sign-in or `requestScopes()`. Otherwise always `null`. Exchange on your backend for refresh tokens. |

---

### `OneTapUser`

```ts
interface OneTapUser {
  id: string
  email: string | null
  name: string | null
  givenName: string | null
  familyName: string | null
  photo: string | null
}
```

| Field | Type | Description |
| ----- | ---- | ----------- |
| `id` | `string` | Stable Google account id (JWT `sub` / `uniqueId`). Prefer over email for primary keys. |
| `email` | `string \| null` | Email address when available. |
| `name` | `string \| null` | Full display name. |
| `givenName` | `string \| null` | First name. |
| `familyName` | `string \| null` | Last name. |
| `photo` | `string \| null` | Profile picture URL. |

---

### `OneTapAuthorizationResult`

```ts
interface OneTapAuthorizationResult {
  accessToken: string | null
  serverAuthCode: string | null
}
```

Returned only from [`requestScopes()`](#requestscopesscopes-string-promiseonetapauthorizationresult).

| Field | Type | Description |
| ----- | ---- | ----------- |
| `accessToken` | `string \| null` | OAuth 2.0 access token for the granted scopes (on-device Google API calls). Present when consent succeeds, regardless of `offlineAccess`. |
| `serverAuthCode` | `string \| null` | OAuth 2.0 server auth code for the granted scopes. **Requires `configure({ offlineAccess: true })` before `requestScopes()`.** Without offline access, consent may succeed but this is always `null`. |

---

### `GetTokensResponse`

```ts
interface GetTokensResponse {
  idToken: string
  accessToken: string
}
```

Returned only from [`getTokens()`](#gettokens-promisegettokensresponse).

| Field | Type | Description |
| ----- | ---- | ----------- |
| `idToken` | `string` | OpenID Connect ID token (JWT). |
| `accessToken` | `string` | OAuth 2.0 access token for Google APIs. |

---

### Placeholder param types

Reserved for API parity with the Universal One Tap surface (currently no fields):

```ts
type OneTapSignInParams = Record<string, never>
type OneTapCreateAccountParams = Record<string, never>
type OneTapExplicitSignInParams = Record<string, never>
```

Sign-in methods take no arguments: `signIn()`, `createAccount()`, `presentExplicitSignIn()`.

---

## Response helpers

| Function | Signature | Narrows to |
| -------- | ----------- | ---------- |
| `isSuccessResponse` | `(response: OneTapResponse) => boolean` | `type === 'success'` and `data != null` |
| `isNoSavedCredentialFoundResponse` | `(response: OneTapResponse) => boolean` | `type === 'noSavedCredentialFound'` |
| `isCancelledResponse` | `(response: OneTapResponse) => boolean` | `type === 'cancelled'` |

```ts
const response = await GoogleOneTapSignIn.signIn()

if (isSuccessResponse(response)) {
  const { user, idToken, serverAuthCode } = response.data
}

if (isNoSavedCredentialFoundResponse(response)) {
  const next = await GoogleOneTapSignIn.createAccount()
}

if (isCancelledResponse(response)) {
  // user dismissed UI
}
```

**Responses vs throws:** `cancelled` and `noSavedCredentialFound` are normal **`OneTapResponse`** values. **`GoogleSignInError`** is thrown for Play Services, misconfiguration, in-progress state, etc.

---

## Errors

### `GoogleSignInError`

```ts
class GoogleSignInError extends Error {
  name: 'GoogleSignInError'
  code: StatusCode
  userInfo?: Record<string, string>
}
```

| Property | Description |
| -------- | ----------- |
| `code` | One of `StatusCode` / [`statusCodes`](#statuscodes). |
| `message` | Human-readable message from native layer. |
| `userInfo` | Optional key–value metadata (e.g. Play Services `status` on Android). |

### `statusCodes`

```ts
const statusCodes = {
  ONE_TAP_START_FAILED: 'ONE_TAP_START_FAILED',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  IN_PROGRESS: 'IN_PROGRESS',
  SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  DEVELOPER_ERROR: 'DEVELOPER_ERROR',
} as const

type StatusCode = (typeof statusCodes)[keyof typeof statusCodes]
```

| Code | When |
| ---- | ---- |
| `ONE_TAP_START_FAILED` | Credential Manager / Google Sign-In request failed (not user cancel). |
| `PLAY_SERVICES_NOT_AVAILABLE` | **Android** — Play Services missing or outdated (`checkPlayServices` or sign-in). |
| `IN_PROGRESS` | No `Activity` / view controller, or sign-in called before `configure()`. |
| `SIGN_IN_REQUIRED` | User must sign in first (`getTokens()` when no active session). |
| `SIGN_IN_CANCELLED` | Reserved / parity — prefer `isCancelledResponse()` on responses. Also thrown from Android authorization UI cancel. |
| `DEVELOPER_ERROR` | **Android** — OAuth misconfiguration surfaced by Credential Manager / AuthorizationClient (wrong SHA-1, package, or client ID). Note: many SHA-1 issues still appear as `type: 'cancelled'` — see [troubleshooting](/docs/guide/troubleshooting#cancelled-after-account-pick). |

### `isErrorWithCode(error: unknown): error is GoogleSignInError`

```ts
try {
  await GoogleOneTapSignIn.checkPlayServices()
} catch (e) {
  if (isErrorWithCode(e) && e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    // ...
  }
}
```

---

## `GoogleSignInButton`

Native `GIDSignInButton` (iOS) / `SignInButton` (Android) as a Nitro **HybridView**. See [Google Sign-In button](/docs/guide/google-sign-in-button).

### `GoogleSignInButtonProps`

Combines native view props, React Native `ViewProps` subset, and sign-in callbacks.

#### Sign-in & callbacks

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `signInBehavior` | `GoogleSignInButtonSignInBehavior` | `'credentialManager'` | Built-in flow on press (see below). |
| `onSignInSuccess` | `(data: OneTapSuccessData) => void` | — | Called when built-in sign-in succeeds. |
| `onSignInError` | `(error: unknown) => void` | — | Called on thrown errors during built-in sign-in. |
| `onPress` | `() => void \| Promise<void>` | — | Runs before native sign-in when built-in behavior is active; with `signInBehavior="none"`, only this handler runs. |
| `loading` | `boolean` | hook `loading` | When `true`, disables the button (merged with internal loading state). |
| `hybridRef` | `(ref: GoogleSignInButtonRef) => void` | — | Nitro hybrid view ref callback. |

Built-in sign-in is enabled when `signInBehavior !== 'none'` **or** `onSignInSuccess` / `onSignInError` is set.

#### Native appearance (`GoogleSignInButtonViewProps`)

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `colorScheme` | `'light' \| 'dark'` | required | Button style per Google branding. |
| `size` | `'standard' \| 'wide' \| 'icon'` | required | Button layout variant. |
| `disabled` | `boolean` | `false` | Disables press (also set when `loading`). |
| `contentAlignment` | `'center' \| 'leading' \| 'trailing'` | `'center'` | Positions the SDK button inside a wider parent. |

#### React Native layout / a11y

From `ViewProps`: `style`, `testID`, `accessibilityLabel`, `accessibilityRole`, `accessibilityState`, `collapsable`, `nativeID`.

Recommended `style.height`: use [`GOOGLE_SIGN_IN_BUTTON_HEIGHT`](#constants) (`48`).

---

### `GoogleSignInButtonSignInBehavior`

```ts
type GoogleSignInButtonSignInBehavior =
  | 'credentialManager'
  | 'buttonFlow'
  | 'none'
```

| Value | Flow |
| ----- | ---- |
| `'credentialManager'` | `checkPlayServices()` → `signIn()` → if `noSavedCredentialFound`, `createAccount()`. Credential Manager **bottom sheet** on Android. |
| `'buttonFlow'` | `checkPlayServices()` → `presentExplicitSignIn()`. Android **account dialog** (all accounts). |
| `'none'` | No automatic sign-in; only `onPress` (unless you set success/error handlers without changing behavior — prefer explicit `'none'`). |

---

### `GoogleSignInButtonColorScheme`

```ts
type GoogleSignInButtonColorScheme = 'light' | 'dark'
```

---

### `GoogleSignInButtonNativeSize`

```ts
type GoogleSignInButtonNativeSize = 'standard' | 'wide' | 'icon'
```

| Value | Typical use |
| ----- | ------------- |
| `'standard'` | Default text button |
| `'wide'` | Wider label layout |
| `'icon'` | Icon-only |

---

### `GoogleSignInButtonContentAlignment`

```ts
type GoogleSignInButtonContentAlignment = 'center' | 'leading' | 'trailing'
```

Aligns the native button within the HybridView bounds when the parent is wider than the intrinsic button width.

---

### `GoogleSignInButtonViewProps` / `GoogleSignInButtonViewMethods`

Low-level Nitro view contract (used by `GoogleSignInButtonHost`):

```ts
interface GoogleSignInButtonViewProps extends HybridViewProps {
  colorScheme: GoogleSignInButtonColorScheme
  size: GoogleSignInButtonNativeSize
  disabled: boolean
  contentAlignment?: GoogleSignInButtonContentAlignment
  onPress: () => void
}

interface GoogleSignInButtonViewMethods extends HybridViewMethods {}
```

---

### `GoogleSignInButtonRef`

Nitro hybrid ref type for `hybridRef` — methods match `GoogleSignInButtonViewMethods` (currently empty; reserved for future native commands).

---

## `useGoogleSignInFromButton`

```ts
function useGoogleSignInFromButton(
  options?: UseGoogleSignInFromButtonOptions
): { loading: boolean; onPress: () => Promise<void> }
```

### `UseGoogleSignInFromButtonOptions`

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `behavior` | `GoogleSignInButtonSignInBehavior` | `'credentialManager'` | Same semantics as `GoogleSignInButton` `signInBehavior`. |
| `onSuccess` | `(data: OneTapSuccessData) => void` | — | Success callback. |
| `onError` | `(error: unknown) => void` | — | Error callback (error is also rethrown). |
| `onPress` | `() => void \| Promise<void>` | — | Runs at start of press (analytics, etc.). |

### Return value

| Field | Type | Description |
| ----- | ---- | ----------- |
| `loading` | `boolean` | `true` while sign-in promise is in flight. |
| `onPress` | `() => Promise<void>` | Wire to `Pressable` / custom button. |

Does **not** call `presentExplicitSignIn` unless `behavior === 'buttonFlow'`. Does **not** invoke `onSuccess` for `noSavedCredentialFound` or `cancelled` (only success).

---

## Constants

| Name | Value | Description |
| ---- | ----- | ----------- |
| `GOOGLE_SIGN_IN_BUTTON_HEIGHT` | `48` | Google branding minimum height (pt/dp). |

---

## Platform summary

| API | Android | iOS |
| --- | ------- | --- |
| `checkPlayServices` | Validates Play Services | No-op |
| `signIn` | Credential Manager (authorized accounts); may attach `serverAuthCode` when `offlineAccess: true` | Current user or restore; **silent path: `serverAuthCode: null`** |
| `createAccount` | All accounts (CredMan sheet) | Interactive sign-in |
| `presentExplicitSignIn` | `GetSignInWithGoogleOption` dialog; validates JWT `hd` when `hostedDomain` set | Interactive sign-in |
| `getTokens` | Cached ID token + `AuthorizationClient` access token | AppAuth `performAction(freshTokens:)` |
| `clearCachedAccessToken` | Clears local access token cache | Marks session for forced refresh |
| `signOut` | Disables auto sign-in semantics | `GIDSignIn.signOut()` |
| `revokeAccess` | Revokes by email or user id | Current session only; throws if id mismatch |
| `hostedDomain` | CredMan filters at request; button flow validates JWT `hd` post sign-in | `GIDConfiguration.hostedDomain` |
| `configure` + `autoDetect` | Needs `google-services.json` + Gradle | Needs plist `WEB_CLIENT_ID` + `CLIENT_ID` |
| `iosClientId` | Ignored | Required via param or plist |

---

## Deprecated

```ts
/** @deprecated Use GoogleOneTapSignIn instead */
const NitroGoogleSignin = GoogleOneTapSignIn
```

---

## Related

- [Usage](/docs/guide/usage) — recommended flows and error handling
- [Google Sign-In button](/docs/guide/google-sign-in-button) — UI examples
- [Troubleshooting](/docs/guide/troubleshooting)
