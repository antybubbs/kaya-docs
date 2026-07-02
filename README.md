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

## Run With Docker

```bash
docker compose up -d
```

The site listens on port `3000` by default. The Compose file bind-mounts:

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
