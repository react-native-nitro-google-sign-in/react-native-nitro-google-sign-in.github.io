---
sidebar_position: 4
---

# Troubleshooting

## `webClientId is "autoDetect" but default_web_client_id was not found` (Android)

- Add `google-services.json` to `android/app/`
- Apply **Google Services Gradle plugin** ([Android setup](/docs/setup/android))
- Ensure JSON `package_name` matches your `applicationId`
- On Expo: set `expo.android.googleServicesFile` and re-run `prebuild --clean`

## Android `default_web_client_id was not found`

You use `webClientId: 'autoDetect'` but Gradle did not generate the string resource:

1. Add `google-services.json` under `android/app/` with matching `package_name`.
2. Add [Google Services Gradle plugin](/docs/setup/android#2-update-gradle-files) (root `classpath` + app `apply plugin`).
3. Rebuild the app (not just reload Metro).

Or pass an explicit Web client ID instead of `'autoDetect'`.

## iOS sign-in stuck after browser / OAuth redirect

Interactive sign-in opens a browser or account sheet, then should return to your app. If it hangs:

1. Confirm **URL scheme** = `REVERSED_CLIENT_ID` from plist ([iOS setup](/docs/setup/ios#url-scheme-required)).
2. On **bare React Native**, add `GIDSignIn.sharedInstance.handle(url)` in `AppDelegate` ([details](/docs/setup/ios#appdelegate-handle-oauth-redirect-urls)).
3. If you use **Facebook or other `openURL` handlers**, chain them with `||` before/after Google's handler.

## iOS URL scheme / redirect errors (App crash on button tap)

If the app crashes immediately upon tapping the Google Sign-In button with a stack trace in `HybridNitroGoogleSignin.signIn` or an `NSInvalidArgumentException` stating `Your app is missing support for the following URL schemes: com.googleusercontent.apps.XXXX`, the custom URL scheme is missing:

- **Required for both Simulators and Real Devices**: This is a mandatory step for all environments because iOS needs the custom scheme to route the browser redirect back into your app.
- Add the `REVERSED_CLIENT_ID` (e.g. `com.googleusercontent.apps.XXXX`) as a URL scheme in `Info.plist` (under `CFBundleURLTypes`) or in Xcode -> Targets -> Info -> URL Types.
- Expo: include `GoogleService-Info.plist` or `iosUrlScheme` in the plugin configuration.
- Re-run prebuild (`npx expo prebuild --clean`) and compile the app again after changing the URL schemes.

## iOS `pod install` fails — AppCheckCore / RecaptchaInterop (Expo 56+)

`pod install` or `expo prebuild` may fail with:

```text
The Swift pod `AppCheckCore` depends upon `GoogleUtilities` and `RecaptchaInterop`,
which do not define modules. To opt into those targets generating module maps...
```

This happens when CocoaPods resolves **AppCheckCore 11.3.0** (pulled in by Google Sign-In) under Expo’s default **static** pod setup.

### Why not `NitroGoogleSignin.podspec`?

CocoaPods **does not** let a podspec enable `:modular_headers => true` on dependencies — that option exists only in the app **Podfile** (or via a config plugin that edits it).

We also cannot add `AppCheckCore` as a direct `s.dependency` in the podspec: `NitroGoogleSignin` is a **Swift** pod, and CocoaPods then reports that `AppCheckCore` does not define modules (same class of error). Capping `GoogleSignIn` in the podspec helps but is not enough on a fresh `pod install` — `GoogleSignIn` 9.1.x can still resolve `AppCheckCore` 11.3.0.

So the library handles this in two places:

| App type | Who patches the Podfile |
| -------- | ------------------------ |
| **Expo** | `react-native-nitro-google-signin` config plugin (automatic on `expo prebuild`) |
| **Bare RN** | You add the pods below to `ios/Podfile` |

### Expo (dev client)

The config plugin patches `ios/Podfile` during prebuild. Ensure the plugin is listed in `app.config.js`, upgrade `react-native-nitro-google-signin`, then regenerate native projects:

```bash
npx expo prebuild --clean
```

No manual Podfile edits are needed for Expo.

### Bare React Native

Add the following **inside your app `target` block** in `ios/Podfile`, **before** `use_native_modules!`:

```ruby
# react-native-nitro-google-signin: AppCheckCore 11.3.0 + static CocoaPods needs modular headers.
pod 'AppCheckCore', '< 11.3.0', :modular_headers => true
pod 'GoogleUtilities', :modular_headers => true
pod 'RecaptchaInterop', :modular_headers => true
```

Then reinstall pods from your app root:

```bash
bundle exec pod install --project-directory="ios"
```

See also [Expo setup](/docs/setup/expo) and [iOS setup](/docs/setup/ios).

## Release builds / R8 / ProGuard {#release-builds-r8-proguard}

Sign-in works in **debug** but crashes or no-ops in **release** after enabling `minifyEnabled true`:

1. **Consumer rules** — `react-native-nitro-google-signin` ships `consumer-rules.pro` with the AAR. Upgrade the package instead of copying keeps manually ([Android setup — ProGuard / R8](/docs/setup/android#proguard-r8)).
2. **Do not** add blanket `-keep class androidx.** { *; }` for Credential Manager — `androidx.credentials` and `credentials-play-services-auth` already embed the rules they need.
3. **Peer** — install and rebuild with `react-native-nitro-modules` (Nitro JNI).
4. **Verify** — reproduce on `assembleRelease` or your store build, then inspect logcat for `ClassNotFoundException` / missing `HybridNitroGoogleSignin`.

## `DEVELOPER_ERROR` / sign-in fails immediately (Android)

- Wrong **SHA-1** (or missing **SHA-256** in Firebase) on the Android OAuth client
- Package name mismatch
- **Android** OAuth client ID passed to `configure()` instead of the **Web** client ID — Credential Manager `setServerClientId` must use the Web client (`*.apps.googleusercontent.com`)
- Web client ID from a different Google Cloud project than the Android client

See [Android — Credential Manager checklist](/docs/setup/android#credential-manager-and-gms).

## `type: 'cancelled'` after picking a Google account (Android production) {#cancelled-after-account-pick}

Credential Manager often reports OAuth misconfiguration as **user cancellation**, not `DEVELOPER_ERROR`.

**Symptom:** Account picker / Sign in with Google UI appears → user selects an account → JS receives `type: 'cancelled'` (not a thrown error). Works in **debug**, fails on **release / Play Store** builds.

**Cause:** Google validates the app’s signing certificate against the **Android** OAuth client. Debug builds use the debug keystore SHA-1; Play builds use the **Play App Signing** certificate (different from your upload keystore). If that SHA-1 is missing, Play services closes the flow with `RESULT_CANCELED`, which this library maps to `type: 'cancelled'`.

**Fix:**

1. Open [Play Console → App integrity → App signing](https://play.google.com/console) and copy the **App signing key certificate** SHA-1 (and SHA-256 if you use Firebase).
2. Also register your **upload key** SHA-1 if you test local `assembleRelease` / sideloaded release APKs.
3. Add those fingerprints to the **Android** OAuth client (same package name as `applicationId`) in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and/or Firebase Project settings.
4. Confirm `configure({ webClientId })` uses the **Web** client ID from the **same** Google Cloud project — never the Android client ID.
5. Rebuild and reinstall the production/release binary (Metro reload is not enough). Changes to OAuth clients can take a few minutes to propagate.

Logcat will include a `GoogleSignInController` warning when Credential Manager returns cancellation, pointing at SHA-1 checks.

See [Android SHA-1](/docs/setup/google-cloud#android-sha-1) and [DEVELOPER_ERROR](#developer_error--sign-in-fails-immediately-android).

## Nitro / TurboModule not found

- Rebuild native app after installing the package
- Expo: create a new dev client (`expo prebuild --clean` + `expo run:ios|android`)
- Confirm `react-native-nitro-modules` is installed

## Expo config plugin errors

**Missing `iosUrlScheme`:**

Configure either Firebase files or manual scheme:

```json
["react-native-nitro-google-signin", { "iosUrlScheme": "com.googleusercontent.apps...." }]
```

## Play Services (Android)

Call `checkPlayServices()` and use an emulator image **with Google Play**.

## Platform-specific behavior

Platform differences for `signOut()`, `revokeAccess()`, `hostedDomain`, and scope requests are documented in [Usage](/docs/guide/usage) and the [API reference](/docs/guide/api-reference).

## Google Workspace: `hostedDomain` rejected on button flow (Android)

When `hostedDomain` is configured and you use `presentExplicitSignIn()` or `GoogleSignInButton` with `signInBehavior="buttonFlow"`, sign-in **fails** if the signed-in account's JWT `hd` claim does not match the configured domain (for example a consumer `@gmail.com` account when you require `corp.example.com`).

Credential Manager flows (`signIn`, `createAccount`, `signInBehavior="credentialManager"`) apply the domain filter during the request.

**Always validate `hd` on your backend** — client-side checks are not sufficient on their own.

## iOS: `revokeAccess` throws "does not match the current signed-in user"

On iOS, `revokeAccess(emailOrUniqueId)` only disconnects the **active** session. If you pass an email or id that is not the currently signed-in user, the call throws.

Call `signIn()` (or ensure the target account is the current user) before `revokeAccess()`, or use `signOut()` for a local session clear.

## iOS: Missing `serverAuthCode` on silent `signIn()` with `offlineAccess: true`

Even when `offlineAccess: true` is set, iOS **silent** `signIn()` and `restorePreviousSignIn()` return `serverAuthCode: null`. This is expected — Google only issues a server auth code during an interactive authorization flow.

Use `createAccount()` or `presentExplicitSignIn()` for the initial offline grant.

## iOS: Missing `serverAuthCode` when scopes are already granted

On iOS, when calling `requestScopes()` or `signIn()` with scopes that the user has already approved in the past, the native iOS SDK returns a local error `scopesAlreadyGranted` (`-8`) and does not contact Google's authorization servers. As a result, no new one-time `serverAuthCode` is issued.

### How to resolve:
- **Force re-authorization via `presentExplicitSignIn()`**: Configure the library without the specific scopes (or with only basic scopes) and call `presentExplicitSignIn()`. This forces the account chooser browser sheet to display. Since Google OAuth supports incremental/cumulative consent, when your backend exchanges this fresh `serverAuthCode` for a refresh token, Google will issue a token containing all scopes the user has previously authorized.
- **Or call `signOut()` first**: Calling `signOut()` resets the SDK's local keychain state, forcing the next sign-in flow to contact Google's servers and request a fresh `serverAuthCode`.

## `getTokens()` returns the same access token on iOS

On iOS, `getTokens()` returns the current in-memory access token while it is still valid. Google only issues a new access token when the current one is expired or marked for refresh.

**Expected:** Two consecutive `getTokens()` calls without clearing may return the **same** access token string.

**To force a refresh** (for example after a Google API returns 401):

1. Call `clearCachedAccessToken(accessToken)` with the token that failed.
2. Call `getTokens()` again — iOS performs a network refresh via AppAuth.

On Android, `clearCachedAccessToken()` removes the token from `AuthorizationClient`'s local cache; the next `getTokens()` requests a new one from Google.

See [Usage — Access tokens](/docs/guide/usage#access-tokens-gettokens).

## Still stuck?

Open an issue with platform, RN version, Expo vs bare, and whether you use `autoDetect` or an explicit `webClientId`:

[GitHub Issues](https://github.com/react-native-nitro-google-sign-in/google-signin/issues)
