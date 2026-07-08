# Kaya Docs

Kaya Docs is a Docker-hosted MDX documentation app for Kaya. It uses Next.js, React, TypeScript and a local `content/` directory so documentation can be edited through Git or through the protected in-app editor.

The visual style is based on the existing `kaya-website` project: dark Kaya surfaces, orange accents, matching logo assets, compact navigation, card treatment and typography.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

On first run, open `/setup` to create the first administrator. Kaya Docs automatically creates and stores its authentication key in the local `data/` directory.


## Install From GitHub

Use the default one-command install after cloning the repo:

```bash
git clone https://github.com/antybubbs/kaya-docs.git
cd kaya-docs
docker compose up -d
```

Use a release tag for stable installs once tags are published:

```bash
git clone https://github.com/antybubbs/kaya-docs.git
cd kaya-docs
git fetch --tags
LATEST_TAG=$(git tag --sort=-v:refname | head -n 1)
test -n "$LATEST_TAG" || { echo "No release tags are published yet. Install from a branch instead."; exit 1; }
git checkout "$LATEST_TAG"
KAYA_DOCS_VERSION="$LATEST_TAG" docker compose up -d
```

Use a branch for development or unreleased docs work:

```bash
git clone --branch main --single-branch https://github.com/antybubbs/kaya-docs.git
cd kaya-docs
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build
```

For the current developer documentation branch, replace `main` with `dev-docs0.0.1`.

## Run With Docker

The default Compose file is designed for a pull-and-run install:

```bash
docker compose up -d
```

It pulls:

```text
ghcr.io/antybubbs/kaya-docs:latest
```

The site listens on port `3000` by default. Override the image tag or port with environment variables:

```bash
KAYA_DOCS_VERSION=v0.1.0 KAYA_DOCS_PORT=8080 docker compose up -d
```

For branch or local development builds, use the build override:

```bash
git checkout dev-docs0.0.1
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build
```

The Compose file bind-mounts:

```yaml
volumes:
  - ./content:/app/content
  - ./data:/app/data
```

That keeps docs editable from the repo and preserves users/auth state across container rebuilds.

## Content Structure

Docs live under `content/` as MDX files:

```text
content/
  getting-started/
  user-guide/
  administration/
  developer/
  troubleshooting/
```

Each page uses frontmatter:

```mdx
---
title: "Installation"
description: "Install Kaya using Docker Compose"
order: 1
version: "current"
---
```

The sidebar is generated from folders, file paths and `order`.

## Add A Page

Create a new `.mdx` file under `content/`, add frontmatter, then write the page body in MDX. Reusable components include:

- `Callout`
- `Steps`
- `Screenshot`
- `FeatureCard`
- `RelatedPages`

Example:

```mdx
<Callout type="info" title="Good to know">
Kaya can be installed using Docker Compose.
</Callout>
```

## Edit Existing Docs

You can edit files directly in Git, or visit `/admin` and sign in as an editor/admin. On a new install, visit `/setup` first to create the administrator. The first version writes documentation changes to the local `content/` directory. A future Git adapter can commit those file changes back to the repository.

## Roles

- Viewer: can read public docs without logging in.
- Editor: can create and edit docs.
- Admin: can create, edit and delete docs.

Admins can add users and assign roles from `/admin`. User records and the generated auth key are stored in `data/`, which should be kept private and backed up.

## Search

`/api/search` builds a local search index from page title, description, section and MDX body text. Search runs entirely in the app; no external service is required.

## Versioned Docs

Pages include a `version` frontmatter field. The current app reads and preserves it; a future version selector can group content by this field or by versioned folders such as `content/v1/`.

## Project Layout

```text
app/          Next.js routes and API handlers
components/   Shared UI, editor and MDX components
content/      MDX documentation pages
lib/          Docs loading, auth and utility code
public/       Kaya brand assets
styles/       Global Kaya-themed CSS
```

## Production Notes

- Create a strong first administrator password during setup.
- Keep `content/` on persistent storage.
- Keep `data/` on persistent private storage.
- Put the app behind HTTPS when exposing it beyond a trusted network.
- Review filesystem permissions so the container can write to the mounted content directory.
