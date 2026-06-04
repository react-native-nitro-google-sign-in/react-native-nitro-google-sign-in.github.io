---
sidebar_position: 5
---

# List on skills.sh

[skills.sh](https://skills.sh) is the public directory for [Agent Skills](https://agentskills.io). Listing makes your skill searchable, shows install counts on the leaderboard, and provides a canonical page:

`https://skills.sh/react-native-nitro-google-signin/google-signin/react-native-nitro-google-signin`

## Prerequisites

1. **`skills/` on GitHub `main`** — push `skills/react-native-nitro-google-signin/`, `skills.sh.json`, and `AGENTS.md`.
2. **Valid `SKILL.md`** — `name` must match the folder (`react-native-nitro-google-signin`); include `description` in frontmatter.
3. **Public repo** with MIT license.

## Verify install (after push)

```bash
npx skills add react-native-nitro-google-sign-in/google-signin --list
```

You should see `react-native-nitro-google-signin` in the output. Then test a real install:

```bash
npx skills add react-native-nitro-google-sign-in/google-signin -g -y
```

## Request indexing

skills.sh does **not** auto-index every new repo immediately. Maintainers add entries when you open an issue on the Skills CLI repo.

1. Confirm the [install check](#verify-install-after-push) passes against `main`.
2. Open a new issue: [vercel-labs/skills — New issue](https://github.com/vercel-labs/skills/issues/new)
3. Use the template in [`.github/SKILLS_SH_INDEX_REQUEST.md`](https://github.com/react-native-nitro-google-sign-in/google-signin/blob/main/.github/SKILLS_SH_INDEX_REQUEST.md) (title + body).

Typical title: `Listing: Request indexing for react-native-nitro-google-signin/google-signin`

## After approval

- Skill page: `https://skills.sh/react-native-nitro-google-signin/google-signin/react-native-nitro-google-signin`
- Repo page: `https://skills.sh/react-native-nitro-google-signin/google-signin`
- Leaderboard ranking uses anonymous install telemetry from `npx skills add` ([FAQ](https://skills.sh/docs/faq))

## `skills.sh.json`

This repo includes [`skills.sh.json`](https://github.com/react-native-nitro-google-sign-in/google-signin/blob/main/skills.sh.json) so the skills.sh **repository page** can group the skill under **React Native** once indexed. See [Customize repo pages](https://skills.sh/docs/customize).
