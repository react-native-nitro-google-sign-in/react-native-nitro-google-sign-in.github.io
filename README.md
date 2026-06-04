# Documentation site

Docusaurus docs for **react-native-nitro-google-signin**, managed with **Bun**.

| Path | Purpose |
| ---- | ------- |
| `content/` | Markdown documentation pages |
| `static/` | Images, favicon, videos (served as `/img/...`, `/video/...`) |
| `scripts/sync-media.mjs` | Copies demo videos from the package repo `assets/` before build |
| `src/` | Homepage and theme |

## Commands

```bash
bun install
bun run start    # dev server
node scripts/sync-media.mjs   # optional: refresh videos from package assets/
bun run build    # production build
bun run serve    # preview build
```

From the **package monorepo** (submodule at `docs/`):

```bash
node docs/scripts/sync-media.mjs
cd docs && bun run build
```

## Deploy (GitHub Pages)

Pushes to `main` in **this repo** run [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Demo videos are pulled from [`google-signin` `assets/`](https://github.com/react-native-nitro-google-sign-in/google-signin/tree/main/assets) during CI.

### One-time GitHub setup (required)

1. **This repo** → **Settings** → **Pages**
2. **Build and deployment** → **Source:** **GitHub Actions**
3. Push to `main` or run **Deploy documentation** under **Actions**

Live site (org Pages):

**https://react-native-nitro-google-sign-in.github.io/**

### If deploy fails

| Error | Fix |
| ----- | --- |
| `Get Pages site failed` / `Not Found` on deploy | Enable **Pages** with source **GitHub Actions** on **this** repo |
| `Resource not accessible` | **Settings → Actions → General** → workflow permissions **Read and write** |
| Missing video files in CI | Ensure `google-signin` repo `assets/` exists on `main` |

## Agent skill

```bash
npx skills add react-native-nitro-google-sign-in/google-signin -g -y
```
