# @mosaicjs/cli

**Beautiful CLI for MosaicJS** - Scaffold framework-agnostic SSR applications with ease.

## 🚀 Quick Start

```bash
# Create a new React project
npx @mosaicjs/cli create my-app --framework react

# Create a new Vue project  
npx @mosaicjs/cli create my-vue-app --framework vue

# Interactive mode
npx @mosaicjs/cli create
```

## 📦 Installation

```bash
# Global installation (recommended)
npm install -g @mosaicjs/cli

# Use directly with npx
npx @mosaicjs/cli create my-app
```

## 🛠️ Commands

### `create` - Create New Project

Create a new MosaicJS project with your preferred framework.

```bash
mosaicjs create [project-name] [options]
```

**Arguments:**
- `project-name` - Name of the project (optional, will prompt if not provided)

**Options:**
- `-f, --framework <framework>` - Framework to use: `react`, `vue`, `svelte` (default: `react`)
- `-t, --template <template>` - Template to use: `basic`, `dashboard`, `blog` (default: `basic`)
- `--skip-install` - Skip npm install

**Examples:**
```bash
# Interactive mode
mosaicjs create

# React project with basic template
mosaicjs create my-app --framework react

# Vue project with dashboard template
mosaicjs create my-dashboard --framework vue --template dashboard

# Skip dependency installation
mosaicjs create my-app --skip-install
```

### `add:page` - Add New Page

Add a new page component to your existing project.

```bash
mosaicjs add:page <page-name> [options]
```

**Arguments:**
- `page-name` - Name of the page component (e.g., `About`, `Dashboard`, `UserProfile`)

**Options:**
- `-l, --layout <layout>` - Layout component to use for this page
- `-r, --route <route>` - Custom route path (defaults to kebab-case of page name)

**Examples:**
```bash
# Basic page
mosaicjs add:page About

# Page with custom route
mosaicjs add:page UserProfile --route /users/profile

# Page with layout
mosaicjs add:page Dashboard --layout DashboardLayout
```

### `add:layout` - Add New Layout

Add a new layout component to your project.

```bash
mosaicjs add:layout <layout-name>
```

**Arguments:**
- `layout-name` - Name of the layout component (e.g., `Dashboard`, `Auth`, `Blog`)

**Examples:**
```bash
# Basic layout
mosaicjs add:layout DashboardLayout

# Auth layout
mosaicjs add:layout AuthLayout
```

### `info` - Project Information

Display information about MosaicJS and supported frameworks.

```bash
mosaicjs info
```

## 🎨 Framework Support

### React 18+
- Full SSR support with React 18
- TypeScript out of the box
- Vite for fast development
- Modern React patterns (hooks, suspense, etc.)

### Vue 3+
- Vue 3 Composition API
- TypeScript support
- Vite integration
- SSR with `@vue/server-renderer`

### Svelte (Coming Soon)
- SvelteKit-style development
- TypeScript support
- Vite integration

## 📁 Generated Project Structure

```
my-app/
├── src/
│   ├── client/           # Frontend code
│   │   ├── pages/        # Page components
│   │   ├── layouts/      # Layout components
│   │   ├── App.tsx       # Main app component
│   │   ├── entry-client.tsx  # Client entry point
│   │   └── entry-server.tsx  # Server entry point
│   └── nodes/            # Backend nodes
│       └── mosaic.ts     # MosaicJS node
├── workflows/            # Workflow definitions
│   └── json/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Part of the [MosaicJS](https://mosaicjs.dev) ecosystem** 🎯 