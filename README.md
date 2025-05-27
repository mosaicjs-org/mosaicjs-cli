# @mosaicjs/cli

CLI tool for MosaicJS - Framework-agnostic SSR for Nanoservice-ts

## Installation

```bash
npm install -g @mosaicjs/cli
```

## Commands

### Install MosaicJS into existing project

Install MosaicJS into an existing Nanoservice-ts project:

```bash
# Install with React (default)
mosaicjs install

# Install with specific framework and template
mosaicjs install --framework react --template dashboard

# Force installation even if not a Nanoservice-ts project
mosaicjs install --force
```

**Options:**
- `-f, --framework <framework>` - Framework to use (react, vue, svelte) [default: react]
- `-t, --template <template>` - Template to use (basic, dashboard, blog) [default: basic]
- `--skip-install` - Skip npm install
- `--force` - Force installation even if not a Nanoservice-ts project

### Create new project

Create a new MosaicJS project from scratch:

```bash
# Create with prompts
mosaicjs create my-app

# Create with specific options
mosaicjs create my-app --framework react --template dashboard
```

### Add components

Add new pages and layouts to your project:

```bash
# Add a new page
mosaicjs add:page Dashboard --layout DashboardLayout

# Add a new layout
mosaicjs add:layout AuthLayout
```

## What gets installed

When you run `mosaicjs install`, the CLI will:

1. **Update package.json** with MosaicJS dependencies
2. **Create directory structure**:
   ```
   src/
   ├── client/
   │   ├── components/
   │   ├── layouts/
   │   ├── pages/
   │   └── styles/
   ├── nodes/
   │   └── mosaic/
   └── workflows/
       └── json/
   ```

3. **Generate framework files**:
   - Client entry point (`src/client/entry-client.tsx`)
   - App component (`src/client/App.tsx`)
   - Sample pages (Home, About, Dashboard)
   - Layouts (Default, Dashboard)
   - Components (Link)

4. **Create MosaicJS node** (`src/nodes/mosaic/MosaicNode.ts`)
5. **Generate workflows** for each page
6. **Setup build configuration**:
   - Vite config
   - TypeScript config
   - Tailwind CSS
   - PostCSS

## Templates

### Basic Template
- Simple home and about pages
- Default layout with navigation
- Clean, minimal design

### Dashboard Template
- Admin dashboard with stats
- Sidebar navigation
- Dashboard-specific layout
- Sample data visualization

### Blog Template (Coming Soon)
- Blog listing and post pages
- Blog-specific layouts
- Content management features

## Framework Support

- ✅ **React** - Full support with TypeScript
- 🚧 **Vue** - Coming soon
- 🚧 **Svelte** - Coming soon

## Requirements

- Node.js 18+
- Existing Nanoservice-ts project (for install command)
- NPM or Yarn

## Examples

### Install into existing Nanoservice-ts project

```bash
cd my-nanoservice-project
mosaicjs install --framework react --template dashboard
npm run dev
```

### Create new project

```bash
mosaicjs create my-new-app --framework react
cd my-new-app
npm run dev
```

## Development Scripts

After installation, your package.json will include:

```json
{
  "scripts": {
    "dev": "npm run dev:server & npm run dev:client",
    "dev:server": "ts-node src/index.ts",
    "dev:client": "vite",
    "build": "npm run build:server && npm run build:client",
    "build:server": "tsc",
    "build:client": "vite build"
  }
}
```

## License

MIT

---

**Part of the [MosaicJS](https://mosaicjs.dev) ecosystem** 🎯 