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

## iOS URL scheme / redirect errors

- Add `REVERSED_CLIENT_ID` as a URL scheme in Info.plist
- Expo: include `GoogleService-Info.plist` or `iosUrlScheme` in the plugin
- Re-run prebuild after changing plist

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

Platform differences for `signOut()`, `revokeAccess()`, and scope requests are documented in [Usage](/docs/guide/usage) and the [API reference](/docs/guide/api-reference).

## Still stuck?

Open an issue with platform, RN version, Expo vs bare, and whether you use `autoDetect` or an explicit `webClientId`:

[GitHub Issues](https://github.com/react-native-nitro-google-sign-in/google-signin/issues)
