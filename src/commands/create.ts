import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';

interface CreateOptions {
  framework: 'react' | 'vue' | 'svelte';
  template: 'basic' | 'dashboard' | 'blog';
  skipInstall?: boolean;
}

// 🎨 Component templates
const TEMPLATES = {
  page: {
    basic: (name: string) => `import React from 'react';
import type { MosaicPageComponent } from '@mosaic/core';

interface ${name}Props {
  // Add your props here
}

const ${name}: MosaicPageComponent<${name}Props> = (props) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
           ${name}
        </h1>
        <p className="text-lg text-gray-600">
          Beautiful ${name} component created with Mosaic! ✨
        </p>
      </div>
    </div>
  );
};

export default ${name};`,
    
    dashboard: (name: string) => `import React from 'react';
import type { MosaicPageComponent } from '@mosaic/core';

interface ${name}Props {
  user?: { name: string; email: string };
  stats?: { users: number; revenue: number };
}

const ${name}: MosaicPageComponent<${name}Props> = ({ user, stats }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your ${name.toLowerCase()}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats?.users || 0}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              $\{stats?.revenue || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${name};`
  },
  
  component: {
    basic: (name: string) => `import React from 'react';

interface ${name}Props {
  children?: React.ReactNode;
  className?: string;
}

const ${name}: React.FC<${name}Props> = ({ children, className }) => {
  return (
    <div className={\`bg-white rounded-lg shadow-sm border \${className || ''}\`}>
      <div className="p-6">
        {children || (
          <p className="text-gray-600">
             ${name} component - customize me! ✨
          </p>
        )}
      </div>
    </div>
  );
};

export default ${name};`,
    
    card: (name: string) => `import React from 'react';

interface ${name}Props {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const ${name}: React.FC<${name}Props> = ({ 
  title, 
  description, 
  children, 
  className 
}) => {
  return (
    <div className={\`bg-white rounded-lg shadow-lg border border-gray-200 \${className || ''}\`}>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-gray-600 mb-4">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

export default ${name};`
  },
  
  layout: {
    basic: (name: string) => `import React from 'react';

interface ${name}Props {
  children: React.ReactNode;
}

const ${name}: React.FC<${name}Props> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
             ${name}
          </h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-gray-600">
            Built with  Mosaic - Beautiful applications from tiny, colorful pieces
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ${name};`,
    
    dashboard: (name: string) => `import React from 'react';
import Link from '@mosaic/core/client';

interface ${name}Props {
  children: React.ReactNode;
}

const ${name}: React.FC<${name}Props> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900"> ${name}</h2>
        </div>
        <nav className="mt-6">
          <Link 
            href="/dashboard" 
            className="block px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            📊 Dashboard
          </Link>
          <Link 
            href="/users" 
            className="block px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            👥 Users
          </Link>
          <Link 
            href="/settings" 
            className="block px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            ⚙️ Settings
          </Link>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ${name};`
  }
};

export async function createProject(projectName: string | undefined, options: CreateOptions = { framework: 'react', template: 'basic' }) {
  console.log(chalk.cyan.bold('\n🎯 Welcome to MosaicJS!\n'));
  
  // Get project name if not provided
  if (!projectName) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        default: 'my-mosaic-app',
        validate: (input: string) => {
          if (!input.trim()) return 'Project name is required';
          if (!/^[a-z0-9-_]+$/i.test(input)) return 'Project name can only contain letters, numbers, hyphens, and underscores';
          return true;
        }
      }
    ]);
    projectName = answers.projectName;
  }

  // Get framework if not provided
  if (!options.framework) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Which framework would you like to use?',
        choices: [
          { name: 'React 18+ (Recommended)', value: 'react' },
          { name: 'Vue 3+', value: 'vue' },
          { name: 'Svelte (Coming Soon)', value: 'svelte', disabled: true }
        ],
        default: 'react'
      }
    ]);
    options.framework = answers.framework;
  }

  // Get template if not provided
  if (!options.template) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: 'Which template would you like to use?',
        choices: [
          { name: 'Basic - Simple starter template', value: 'basic' },
          { name: 'Dashboard - Admin dashboard template', value: 'dashboard' },
          { name: 'Blog - Blog/CMS template', value: 'blog' }
        ],
        default: 'basic'
      }
    ]);
    options.template = answers.template;
  }

  // Ensure projectName is defined at this point
  if (!projectName) {
    throw new Error('Project name is required');
  }

  const projectPath = path.resolve(process.cwd(), projectName);

  // Check if directory already exists
  if (await fs.pathExists(projectPath)) {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Directory "${projectName}" already exists. Overwrite?`,
        default: false
      }
    ]);

    if (!answers.overwrite) {
      console.log(chalk.yellow('Project creation cancelled.'));
      return;
    }

    await fs.remove(projectPath);
  }

  const spinner = ora('Creating project...').start();

  try {
    // Create project directory
    await fs.ensureDir(projectPath);

    // Generate project files
    await generateProjectFiles(projectPath, projectName, options);

    spinner.succeed(chalk.green('Project created successfully!'));

    // Install dependencies
    if (!options.skipInstall) {
      const installSpinner = ora('Installing dependencies...').start();
      
      try {
        await execa('npm', ['install'], { cwd: projectPath });
        installSpinner.succeed(chalk.green('Dependencies installed successfully!'));
      } catch (error) {
        installSpinner.fail(chalk.red('Failed to install dependencies'));
        console.log(chalk.yellow('You can install them manually by running:'));
        console.log(chalk.cyan(`  cd ${projectName}`));
        console.log(chalk.cyan('  npm install'));
      }
    }

    // Success message
    console.log(chalk.green.bold('\n🎉 Project created successfully!\n'));
    console.log(chalk.yellow('Next steps:'));
    console.log(chalk.cyan(`  cd ${projectName}`));
    if (options.skipInstall) {
      console.log(chalk.cyan('  npm install'));
    }
    console.log(chalk.cyan('  npm run dev'));
    console.log('');
    console.log(chalk.yellow('Documentation:'));
    console.log(chalk.cyan('  https://mosaicjs.dev'));
    console.log('');

  } catch (error) {
    spinner.fail(chalk.red('Failed to create project'));
    throw error;
  }
}

async function generateProjectFiles(projectPath: string, projectName: string, options: CreateOptions) {
  // Create package.json
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: `MosaicJS ${options.framework} application`,
    scripts: {
      dev: "npm run dev:server & npm run dev:client",
      "dev:server": "ts-node src/index.ts",
      "dev:client": "vite",
      build: "npm run build:server && npm run build:client",
      "build:server": "tsc",
      "build:client": "vite build",
      start: "node dist/index.js"
    },
    dependencies: {
      [`@mosaicjs/${options.framework}`]: "^1.0.0",
      "@nanoservice-ts/runner": "^0.1.0",
      "@nanoservice-ts/shared": "^0.0.9",
      ...(options.framework === 'react' && {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      }),
      ...(options.framework === 'vue' && {
        "vue": "^3.3.0",
        "@vue/server-renderer": "^3.3.0"
      }),
      "vite": "^5.0.0"
    },
    devDependencies: {
      "typescript": "^5.0.0",
      "@types/node": "^20.0.0",
      ...(options.framework === 'react' && {
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@vitejs/plugin-react": "^4.2.0"
      }),
      ...(options.framework === 'vue' && {
        "@vitejs/plugin-vue": "^4.2.0"
      }),
      "ts-node": "^10.9.0"
    }
  };

  await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

  // Create TypeScript config
  const tsConfig = {
    compilerOptions: {
      target: "ES2020",
      module: "commonjs",
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      outDir: "./dist",
      rootDir: "./src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      declaration: true,
      sourceMap: true,
      moduleResolution: "node",
      allowSyntheticDefaultImports: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      ...(options.framework === 'react' && {
        jsx: "react-jsx"
      }),
      ...(options.framework === 'vue' && {
        jsx: "preserve"
      })
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist"]
  };

  await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsConfig, { spaces: 2 });

  // Create Vite config
  const viteConfig = options.framework === 'react' 
    ? `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        client: 'src/client/entry-client.tsx',
        server: 'src/client/entry-server.tsx'
      },
      output: {
        dir: 'dist',
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'server' 
            ? 'server/[name].js' 
            : 'client/[name]-[hash].js';
        }
      }
    }
  },
  ssr: {
    noExternal: ['@mosaicjs/react']
  }
});`
    : `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        client: 'src/client/entry-client.ts',
        server: 'src/client/entry-server.ts'
      },
      output: {
        dir: 'dist',
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'server' 
            ? 'server/[name].js' 
            : 'client/[name]-[hash].js';
        }
      }
    }
  },
  ssr: {
    noExternal: ['@mosaicjs/vue']
  }
});`;

  await fs.writeFile(path.join(projectPath, 'vite.config.ts'), viteConfig);

  // Create directory structure
  await fs.ensureDir(path.join(projectPath, 'src/nodes'));
  await fs.ensureDir(path.join(projectPath, 'src/client/pages'));
  await fs.ensureDir(path.join(projectPath, 'src/client/layouts'));
  await fs.ensureDir(path.join(projectPath, 'workflows/json'));

  // Generate framework-specific files
  if (options.framework === 'react') {
    await generateReactFiles(projectPath, options.template);
  } else if (options.framework === 'vue') {
    await generateVueFiles(projectPath, options.template);
  }

  // Create README
  const readme = `# ${projectName}

A MosaicJS application built with ${options.framework.charAt(0).toUpperCase() + options.framework.slice(1)}.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server

## Documentation

- [MosaicJS Documentation](https://mosaicjs.dev)
- [${options.framework.charAt(0).toUpperCase() + options.framework.slice(1)} Package](https://mosaicjs.dev/packages/${options.framework})

## Project Structure

\`\`\`
src/
  client/           # Frontend code
    pages/          # Page components
    layouts/        # Layout components
    entry-client.*  # Client entry point
    entry-server.*  # Server entry point
  nodes/            # Backend nodes
workflows/          # Workflow definitions
\`\`\`
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), readme);
}

async function generateReactFiles(projectPath: string, template: string) {
  // Create Mosaic node
  const mosaicNode = `import { ReactMosaicNode } from '@mosaicjs/react';

export default class MosaicNode extends ReactMosaicNode {
  constructor() {
    super({
      assetsVersion: process.env.ASSETS_VERSION || "1.0.0"
    });
  }
}`;

  await fs.writeFile(path.join(projectPath, 'src/nodes/mosaic.ts'), mosaicNode);

  // Create React App component
  const appComponent = `import React, { useState, useEffect } from 'react';
import { ProgressBar } from '@mosaicjs/react/client';

interface AppProps {
  component: string;
  props: any;
  url: string;
  version: string;
}

const App: React.FC<AppProps> = ({ component: initialComponent, props: initialProps, url, version }) => {
  const [pageData, setPageData] = useState({ component: initialComponent, props: initialProps, url, version });

  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      setPageData(event.detail);
    };

    document.addEventListener('mosaic:navigate', handleNavigation as EventListener);
    
    return () => {
      document.removeEventListener('mosaic:navigate', handleNavigation as EventListener);
    };
  }, []);

  // Dynamic component loading
  const Component = React.lazy(() => import(\`./pages/\${pageData.component}\`));

  return (
    <>
      <ProgressBar />
      <React.Suspense fallback={<div>Loading...</div>}>
        <Component {...pageData.props} />
      </React.Suspense>
    </>
  );
};

export default App;`;

  await fs.writeFile(path.join(projectPath, 'src/client/App.tsx'), appComponent);

  // Create entry files
  const entryClient = `import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('app')!;
const pageData = JSON.parse(container.getAttribute('data-page') || '{}');

if (container.innerHTML) {
  // Hydrate SSR content
  hydrateRoot(container, <App {...pageData} />);
} else {
  // Client-side only
  const root = createRoot(container);
  root.render(<App {...pageData} />);
}`;

  await fs.writeFile(path.join(projectPath, 'src/client/entry-client.tsx'), entryClient);

  const entryServer = `import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export async function render(url: string, pageData: any) {
  const html = renderToString(<App {...pageData} />);
  return { html };
}

export async function hasComponent(componentName: string) {
  try {
    await import(\`./pages/\${componentName}\`);
    return true;
  } catch {
    return false;
  }
}`;

  await fs.writeFile(path.join(projectPath, 'src/client/entry-server.tsx'), entryServer);

  // Create Home page
  const homePage = `import React from 'react';
import { Link } from '@mosaicjs/react/client';

interface HomeProps {
  auth: { user: any };
  message?: string;
}

const Home: React.FC<HomeProps> = ({ auth, message = "Welcome to MosaicJS!" }) => {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🎯 MosaicJS with React</h1>
      <p>{message}</p>
      
      {auth.user ? (
        <div>
          <p>Hello, {auth.user.name}!</p>
          <Link href="/dashboard">Go to Dashboard</Link>
        </div>
      ) : (
        <div>
          <p>You are not logged in.</p>
          <Link href="/login">Login</Link>
        </div>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Navigation</h2>
        <ul>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Home;`;

  await fs.writeFile(path.join(projectPath, 'src/client/pages/Home.tsx'), homePage);

  // Create About page
  const aboutPage = `import React from 'react';
import { Link } from '@mosaicjs/react/client';

const About: React.FC = () => {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>About</h1>
      <p>This is a MosaicJS application built with React.</p>
      
      <h2>Features</h2>
      <ul>
        <li>Server-side rendering (SSR)</li>
        <li>Client-side navigation</li>
        <li>Framework-agnostic workflows</li>
        <li>Zero configuration</li>
      </ul>
      
      <Link href="/">← Back to Home</Link>
    </div>
  );
};

export default About;`;

  await fs.writeFile(path.join(projectPath, 'src/client/pages/About.tsx'), aboutPage);
}

async function generateVueFiles(projectPath: string, template: string) {
  // Create Mosaic node
  const mosaicNode = `import { VueMosaicNode } from '@mosaicjs/vue';

export default class MosaicNode extends VueMosaicNode {
  constructor() {
    super({
      assetsVersion: process.env.ASSETS_VERSION || "1.0.0"
    });
  }
}`;

  await fs.writeFile(path.join(projectPath, 'src/nodes/mosaic.ts'), mosaicNode);

  // Create Vue App component
  const appComponent = `<template>
  <div>
    <ProgressBar />
    <Suspense>
      <component :is="currentComponent" v-bind="pageProps" />
      <template #fallback>
        <div>Loading...</div>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { ProgressBar } from '@mosaicjs/vue/client';

interface AppProps {
  component: string;
  props: any;
  url: string;
  version: string;
}

const props = defineProps<AppProps>();

const pageData = ref(props);

// Dynamic component loading
const currentComponent = computed(() => {
  return defineAsyncComponent(() => import(\`./pages/\${pageData.value.component}.vue\`));
});

const pageProps = computed(() => pageData.value.props);

onMounted(() => {
  const handleNavigation = (event: CustomEvent) => {
    pageData.value = event.detail;
  };

  document.addEventListener('mosaic:navigate', handleNavigation as EventListener);
  
  return () => {
    document.removeEventListener('mosaic:navigate', handleNavigation as EventListener);
  };
});
</script>`;

  await fs.writeFile(path.join(projectPath, 'src/client/App.vue'), appComponent);

  // Create entry files
  const entryClient = `import { createApp } from 'vue';
import App from './App.vue';

const container = document.getElementById('app')!;
const pageData = JSON.parse(container.getAttribute('data-page') || '{}');

const app = createApp(App, pageData);

if (container.innerHTML) {
  // Hydrate SSR content
  app.mount(container, true);
} else {
  // Client-side only
  app.mount(container);
}`;

  await fs.writeFile(path.join(projectPath, 'src/client/entry-client.ts'), entryClient);

  const entryServer = `import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import App from './App.vue';

export async function render(url: string, pageData: any) {
  const app = createSSRApp(App, pageData);
  const html = await renderToString(app);
  return { html };
}

export async function hasComponent(componentName: string) {
  try {
    await import(\`./pages/\${componentName}.vue\`);
    return true;
  } catch {
    return false;
  }
}`;

  await fs.writeFile(path.join(projectPath, 'src/client/entry-server.ts'), entryServer);

  // Create Home page
  const homePage = `<template>
  <div style="padding: 2rem; font-family: system-ui">
    <h1>🎯 MosaicJS with Vue</h1>
    <p>{{ message }}</p>
    
    <div v-if="auth.user">
      <p>Hello, {{ auth.user.name }}!</p>
      <Link href="/dashboard">Go to Dashboard</Link>
    </div>
    <div v-else>
      <p>You are not logged in.</p>
      <Link href="/login">Login</Link>
    </div>
    
    <div style="margin-top: 2rem">
      <h2>Navigation</h2>
      <ul>
        <li><Link href="/about">About</Link></li>
        <li><Link href="/contact">Contact</Link></li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Link } from '@mosaicjs/vue/client';

interface HomeProps {
  auth: { user: any };
  message?: string;
}

withDefaults(defineProps<HomeProps>(), {
  message: "Welcome to MosaicJS!"
});
</script>`;

  await fs.writeFile(path.join(projectPath, 'src/client/pages/Home.vue'), homePage);

  // Create About page
  const aboutPage = `<template>
  <div style="padding: 2rem; font-family: system-ui">
    <h1>About</h1>
    <p>This is a MosaicJS application built with Vue.</p>
    
    <h2>Features</h2>
    <ul>
      <li>Server-side rendering (SSR)</li>
      <li>Client-side navigation</li>
      <li>Framework-agnostic workflows</li>
      <li>Zero configuration</li>
    </ul>
    
    <Link href="/">← Back to Home</Link>
  </div>
</template>

<script setup lang="ts">
import { Link } from '@mosaicjs/vue/client';
</script>`;

  await fs.writeFile(path.join(projectPath, 'src/client/pages/About.vue'), aboutPage);
} 