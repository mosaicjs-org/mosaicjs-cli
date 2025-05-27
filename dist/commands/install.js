"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installMosaic = installMosaic;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const execa_1 = require("execa");
async function installMosaic(options = { framework: 'react', template: 'basic' }) {
    const currentDir = process.cwd();
    console.log(chalk_1.default.cyan.bold('\n🎯 Installing MosaicJS into existing Nanoservice-ts project\n'));
    // Check if this is a Nanoservice-ts project
    const packageJsonPath = path_1.default.join(currentDir, 'package.json');
    if (!await fs_extra_1.default.pathExists(packageJsonPath)) {
        console.error(chalk_1.default.red('❌ No package.json found. Please run this command in a Node.js project directory.'));
        process.exit(1);
    }
    const packageJson = await fs_extra_1.default.readJson(packageJsonPath);
    // Check for Nanoservice-ts dependencies
    const hasNanoservice = packageJson.dependencies?.['@nanoservice-ts/runner'] ||
        packageJson.dependencies?.['@nanoservice-ts/shared'] ||
        packageJson.devDependencies?.['@nanoservice-ts/runner'] ||
        packageJson.devDependencies?.['@nanoservice-ts/shared'];
    if (!hasNanoservice && !options.force) {
        const { proceed } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'proceed',
                message: 'This doesn\'t appear to be a Nanoservice-ts project. Continue anyway?',
                default: false
            }
        ]);
        if (!proceed) {
            console.log(chalk_1.default.yellow('Installation cancelled.'));
            process.exit(0);
        }
    }
    // Check if MosaicJS is already installed
    const hasMosaic = packageJson.dependencies?.[`@mosaicjs/${options.framework}`] ||
        packageJson.dependencies?.['@mosaicjs/core'];
    if (hasMosaic && !options.force) {
        const { overwrite } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: 'MosaicJS appears to be already installed. Overwrite existing files?',
                default: false
            }
        ]);
        if (!overwrite) {
            console.log(chalk_1.default.yellow('Installation cancelled.'));
            process.exit(0);
        }
    }
    // Prompt for missing options
    if (!options.framework) {
        const { framework } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'framework',
                message: 'Which framework would you like to use?',
                choices: [
                    { name: 'React', value: 'react' },
                    { name: 'Vue', value: 'vue' },
                    { name: 'Svelte (coming soon)', value: 'svelte', disabled: true }
                ],
                default: 'react'
            }
        ]);
        options.framework = framework;
    }
    if (!options.template) {
        const { template } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'template',
                message: 'Which template would you like to use?',
                choices: [
                    { name: 'Basic - Simple pages and layouts', value: 'basic' },
                    { name: 'Dashboard - Admin dashboard with charts', value: 'dashboard' },
                    { name: 'Blog - Blog with posts and categories', value: 'blog' }
                ],
                default: 'basic'
            }
        ]);
        options.template = template;
    }
    try {
        // Update package.json with MosaicJS dependencies
        await updatePackageJson(currentDir, options);
        // Create MosaicJS directory structure
        await createMosaicStructure(currentDir, options);
        // Create MosaicJS node
        await createMosaicNode(currentDir, options);
        // Generate framework-specific files
        if (options.framework === 'react') {
            await generateReactFiles(currentDir, options.template);
        }
        else if (options.framework === 'vue') {
            await generateVueFiles(currentDir, options.template);
        }
        // Create workflows
        await createWorkflows(currentDir, options);
        // Create configuration files
        await createConfigFiles(currentDir, options);
        // Install dependencies
        if (!options.skipInstall) {
            const spinner = (0, ora_1.default)('Installing dependencies...').start();
            try {
                await (0, execa_1.execa)('npm', ['install'], { cwd: currentDir });
                spinner.succeed('Dependencies installed successfully!');
            }
            catch (error) {
                spinner.fail('Failed to install dependencies');
                console.log(chalk_1.default.yellow('Please run "npm install" manually.'));
            }
        }
        // Success message
        console.log(chalk_1.default.green.bold('\n✅ MosaicJS installed successfully!\n'));
        console.log(chalk_1.default.cyan('Next steps:'));
        console.log('1. Start the development server:');
        console.log(chalk_1.default.gray('   npm run dev\n'));
        console.log('2. Open your browser to:');
        console.log(chalk_1.default.gray('   http://localhost:4000\n'));
        console.log('3. Add new pages:');
        console.log(chalk_1.default.gray('   npx @mosaicjs/cli add:page MyPage\n'));
        console.log('4. Add new layouts:');
        console.log(chalk_1.default.gray('   npx @mosaicjs/cli add:layout MyLayout\n'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Installation failed:'), error);
        process.exit(1);
    }
}
async function updatePackageJson(projectPath, options) {
    const packageJsonPath = path_1.default.join(projectPath, 'package.json');
    const packageJson = await fs_extra_1.default.readJson(packageJsonPath);
    // Add MosaicJS dependencies
    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.devDependencies = packageJson.devDependencies || {};
    // Core MosaicJS dependencies
    packageJson.dependencies[`@mosaicjs/${options.framework}`] = '^1.0.0';
    // Framework-specific dependencies
    if (options.framework === 'react') {
        packageJson.dependencies.react = packageJson.dependencies.react || '^18.2.0';
        packageJson.dependencies['react-dom'] = packageJson.dependencies['react-dom'] || '^18.2.0';
        packageJson.devDependencies['@types/react'] = packageJson.devDependencies['@types/react'] || '^18.2.0';
        packageJson.devDependencies['@types/react-dom'] = packageJson.devDependencies['@types/react-dom'] || '^18.2.0';
        packageJson.devDependencies['@vitejs/plugin-react'] = packageJson.devDependencies['@vitejs/plugin-react'] || '^4.2.0';
    }
    else if (options.framework === 'vue') {
        packageJson.dependencies.vue = packageJson.dependencies.vue || '^3.3.0';
        packageJson.dependencies['@vue/server-renderer'] = packageJson.dependencies['@vue/server-renderer'] || '^3.3.0';
        packageJson.devDependencies['@vitejs/plugin-vue'] = packageJson.devDependencies['@vitejs/plugin-vue'] || '^4.2.0';
    }
    // Build tools
    packageJson.dependencies.vite = packageJson.dependencies.vite || '^5.0.0';
    packageJson.devDependencies.typescript = packageJson.devDependencies.typescript || '^5.0.0';
    packageJson.devDependencies['@types/node'] = packageJson.devDependencies['@types/node'] || '^20.0.0';
    packageJson.devDependencies.tailwindcss = packageJson.devDependencies.tailwindcss || '^3.3.0';
    packageJson.devDependencies.autoprefixer = packageJson.devDependencies.autoprefixer || '^10.4.0';
    packageJson.devDependencies.postcss = packageJson.devDependencies.postcss || '^8.4.0';
    // Set module type for ES modules
    packageJson.type = 'module';
    // Add/update scripts
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts['dev:client'] = 'vite';
    packageJson.scripts['build:client'] = 'vite build';
    packageJson.scripts['build:server'] = packageJson.scripts.build || 'tsc';
    packageJson.scripts.build = 'npm run build:server && npm run build:client';
    // Update dev script to include client
    if (packageJson.scripts.dev && !packageJson.scripts.dev.includes('dev:client')) {
        packageJson.scripts.dev = `${packageJson.scripts.dev} & npm run dev:client`;
    }
    else if (!packageJson.scripts.dev) {
        packageJson.scripts.dev = 'npm run dev:server & npm run dev:client';
        packageJson.scripts['dev:server'] = 'ts-node src/index.ts';
    }
    await fs_extra_1.default.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}
async function createMosaicStructure(projectPath, options) {
    const dirs = [
        'src/client',
        'src/client/components',
        'src/client/layouts',
        'src/client/pages',
        'src/nodes/mosaic',
        'public',
        'workflows/json'
    ];
    for (const dir of dirs) {
        await fs_extra_1.default.ensureDir(path_1.default.join(projectPath, dir));
    }
}
async function createMosaicNode(projectPath, options) {
    const mosaicNode = `import { type INanoServiceResponse, NanoService, NanoServiceResponse } from "@nanoservice-ts/runner";
import { type Context, GlobalError } from "@nanoservice-ts/shared";

interface MosaicNodeInputs {
  component: string;
  props?: Record<string, any>;
  assetsVersion?: string;
}

export default class MosaicNode extends NanoService<MosaicNodeInputs> {
  constructor() {
    super();
    this.inputSchema = {
      type: "object",
      properties: {
        component: {
          type: "string",
          description: "Name of the component to render"
        },
        props: {
          type: "object",
          description: "Props to pass to the component"
        },
        assetsVersion: {
          type: "string",
          description: "Version string for cache busting"
        }
      },
      required: ["component"]
    };
  }

  async handle(ctx: Context, inputs: MosaicNodeInputs): Promise<INanoServiceResponse> {
    const response = new NanoServiceResponse();

    try {
      // Check if this is a MosaicJS navigation request
      const isMosaicRequest = ctx.request.headers['x-mosaic-request'] === 'true';
      
      if (isMosaicRequest) {
        // Return JSON for client-side navigation
        const data = {
          component: inputs.component,
          props: {
            ...inputs.props,
            // Add shared props here (auth, flash messages, etc.)
            auth: { user: ctx.request.user || null },
            flash: ctx.request.session?.flash || {}
          }
        };
        
        ctx.response.setHeader('Content-Type', 'application/json');
        response.setSuccess(data);
      } else {
        // Return HTML for initial page load
        const isDev = process.env.NODE_ENV !== 'production';
        const html = \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MosaicJS App</title>
  \${isDev ? '' : '<link rel="stylesheet" href="/dist/client/assets/index.css">'}
</head>
<body>
  <div id="app"></div>
  <script>
    window.__MOSAIC_DATA__ = \${JSON.stringify({
      component: inputs.component,
      props: {
        ...inputs.props,
        auth: { user: ctx.request.user || null },
        flash: ctx.request.session?.flash || {}
      }
    })};
  </script>
  \${isDev 
    ? '<script type="module" src="http://localhost:3000/src/client/entry-client.tsx"></script>'
    : '<script type="module" src="/dist/client/assets/index.js"></script>'
  }
</body>
</html>\`;
        
        ctx.response.setHeader('Content-Type', 'text/html; charset=UTF-8');
        response.setSuccess(html);
      }

    } catch (error: any) {
      const nodeError = new GlobalError(\`MosaicJS rendering failed: \${error.message}\`);
      nodeError.setCode(500);
      response.setError(nodeError);
    }

    return response;
  }
}`;
    await fs_extra_1.default.writeFile(path_1.default.join(projectPath, 'src/nodes/mosaic/MosaicNode.ts'), mosaicNode);
    // Update the nodes index file if it exists
    const nodesIndexPath = path_1.default.join(projectPath, 'src/Nodes.ts');
    if (await fs_extra_1.default.pathExists(nodesIndexPath)) {
        const nodesContent = await fs_extra_1.default.readFile(nodesIndexPath, 'utf-8');
        // Add import
        const importLine = 'import MosaicNode from "./nodes/mosaic/MosaicNode";';
        const hasImport = nodesContent.includes(importLine);
        if (!hasImport) {
            // Add import after existing imports
            const lines = nodesContent.split('\n');
            let lastImportIndex = -1;
            for (let i = lines.length - 1; i >= 0; i--) {
                if (lines[i].startsWith('import')) {
                    lastImportIndex = i;
                    break;
                }
            }
            lines.splice(lastImportIndex + 1, 0, importLine);
            // Add to nodes object
            const nodesObjectMatch = nodesContent.match(/const nodes: \{[^}]*\} = \{([^}]*)\}/s);
            if (nodesObjectMatch) {
                const updatedContent = lines.join('\n').replace(/const nodes: \{[^}]*\} = \{([^}]*)\}/s, (match, content) => {
                    if (!content.includes('"mosaic-render"')) {
                        const trimmedContent = content.trim();
                        const separator = trimmedContent && !trimmedContent.endsWith(',') ? ',' : '';
                        return match.replace(content, `${content}${separator}\n\t"mosaic-render": new MosaicNode()`);
                    }
                    return match;
                });
                await fs_extra_1.default.writeFile(nodesIndexPath, updatedContent);
            }
        }
    }
}
async function generateReactFiles(projectPath, template) {
    // Client entry point
    const entryClient = `import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Get initial data from server
const initialData = (window as any).__MOSAIC_DATA__ || {};

const container = document.getElementById('app')!;

if (container.hasChildNodes()) {
  // Hydrate for SSR
  hydrateRoot(container, <App initialData={initialData} />);
} else {
  // Client-side only
  const root = createRoot(container);
  root.render(<App initialData={initialData} />);
}`;
    await fs_extra_1.default.writeFile(path_1.default.join(projectPath, 'src/client/entry-client.tsx'), entryClient);
    // App component
    const appComponent = `import React, { useState, useEffect } from 'react';

interface AppProps {
  initialData: {
    component: string;
    props: Record<string, any>;
  };
}

// Component resolver
const resolveComponent = (name: string) => {
  const components: Record<string, React.ComponentType<any>> = {};
  
  // Import all page components
  const pageModules = import.meta.glob('./pages/**/*.tsx', { eager: true });
  
  for (const [path, module] of Object.entries(pageModules)) {
    const componentName = path.replace('./pages/', '').replace('.tsx', '');
    components[componentName] = (module as any).default;
  }
  
  return components[name];
};

export default function App({ initialData }: AppProps) {
  const [pageData, setPageData] = useState(initialData);
  
  useEffect(() => {
    // Handle navigation clicks
    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (!link || link.target === '_blank' || link.href.startsWith('http')) {
        return;
      }
      
      e.preventDefault();
      
      try {
        const response = await fetch(link.href, {
          headers: {
            'X-Mosaic-Request': 'true'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setPageData(data);
          window.history.pushState({}, '', link.href);
        }
      } catch (error) {
        console.error('Navigation failed:', error);
        window.location.href = link.href;
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  const Component = resolveComponent(pageData.component);
  
  if (!Component) {
    return <div>Component "{pageData.component}" not found</div>;
  }
  
  const page = <Component {...pageData.props} />;
  
  // Check if component has a layout
  const layout = (Component as any).layout;
  if (layout) {
    return layout(page);
  }
  
  return page;
}`;
    await fs_extra_1.default.writeFile(path_1.default.join(projectPath, 'src/client/App.tsx'), appComponent);
    // Generate pages based on template
    if (template === 'basic') {
        await generateBasicPages(projectPath);
    }
    else if (template === 'dashboard') {
        await generateDashboardPages(projectPath);
    }
    // Generate layouts
    await generateLayouts(projectPath, template);
    // Generate components
    await generateComponents(projectPath);
}
async function generateVueFiles(projectPath, template) {
    // Vue implementation would go here
    console.log(chalk_1.default.yellow('Vue support coming soon!'));
}
async function generateBasicPages(projectPath) {
    const homePage = `import React from 'react';
import Link from '../components/Link';
import DefaultLayout from '../layouts/DefaultLayout';

interface HomeProps {
  message?: string;
}

const Home: React.FC<HomeProps> = ({ message }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">MosaicJS</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Beautiful applications from tiny, colorful pieces. 
            Server-side rendering meets modern development.
          </p>
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8 max-w-md mx-auto">
              {message}
            </div>
          )}
          <div className="space-x-4">
            <Link 
              href="/about" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Learn More
            </Link>
            <Link 
              href="/contact" 
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

Home.layout = (page: React.ReactNode) => <DefaultLayout>{page}</DefaultLayout>;

export default Home;`;
    await fs_extra_1.default.writeFile(path_1.default.join(projectPath, 'src/client/pages/Home.tsx'), homePage);
    const aboutPage = `import React from 'react';
import Link from '../components/Link';
import DefaultLayout from '../layouts/DefaultLayout';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About MosaicJS</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-6">
              MosaicJS brings the power of modern frontend frameworks to Nanoservice-ts, 
              providing server-side rendering with client-side navigation.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 my-12">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 Fast Development</h3>
                <p className="text-gray-600">
                  Hot reload, TypeScript support, and modern tooling for rapid development.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">⚡ Server-Side Rendering</h3>
                <p className="text-gray-600">
                  SEO-friendly pages with fast initial loads and smooth client-side navigation.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🎯 Framework Agnostic</h3>
                <p className="text-gray-600">
                  Works with React, Vue, and more. Choose your preferred frontend framework.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🔧 Zero Configuration</h3>
                <p className="text-gray-600">
                  Sensible defaults with the flexibility to customize when needed.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <Link 
                href="/" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

About.layout = (page: React.ReactNode) => <DefaultLayout>{page}</DefaultLayout>;

export default About;`;
    await fs_extra_1.default.writeFile(path_1.default.join(projectPath, 'src/client/pages/About.tsx'), aboutPage);
}
async function generateDashboardPages(projectPath) {
    // Dashboard pages would be generated here
    await generateBasicPages(projectPath);
    const dashboardPage = `import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

interface DashboardProps {
  user?: { name: string; email: string };
  stats?: { users: number; revenue: number; orders: number; growth: number };
}

const Dashboard: React.FC<DashboardProps> = ({ user, stats }) => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your business today.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {stats?.users?.toLocaleString() || '0'}
          </p>
          <p className="text-sm text-green-600 mt-1">+12% from last month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            $\{stats?.revenue?.toLocaleString() || '0'}
          </p>
          <p className="text-sm text-green-600 mt-1">+8% from last month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Orders</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {stats?.orders?.toLocaleString() || '0'}
          </p>
          <p className="text-sm text-green-600 mt-1">+15% from last month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Growth</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {stats?.growth || '0'}%
          </p>
          <p className="text-sm text-green-600 mt-1">+3% from last month</p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">New user registered</span>
              <span className="text-sm text-gray-400 ml-auto">2 min ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Order completed</span>
              <span className="text-sm text-gray-400 ml-auto">5 min ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Payment received</span>
              <span className="text-sm text-gray-400 ml-auto">10 min ago</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition duration-200">
              📊 View Analytics
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition duration-200">
              👥 Manage Users
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition duration-200">
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

Dashboard.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default Dashboard;`;
    await fs_extra_1.default.writeFile(path_1.default.join(projectPath, 'src/client/pages/Dashboard.tsx'), dashboardPage);
}
async function generateLayouts(projectPath, template) {
    const defaultLayout = `import React from 'react';
import Link from '../components/Link';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              MosaicJS
            </Link>
            <div className="space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                About
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </div>
          </nav>
        </div>
      </header>
      
      <main>
        {children}
      </main>
      
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-gray-600">
            Built with ❤️ using MosaicJS - Beautiful applications from tiny, colorful pieces
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DefaultLayout;`;
    await fs_extra_1.default.writeFile(path_1.default.join(projectPath, 'src/client/layouts/DefaultLayout.tsx'), defaultLayout);
    if (template === 'dashboard') {
        const dashboardLayout = `import React from 'react';
    import Link from '../components/Link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        </div>
        <nav className="mt-6">
          <Link 
            href="/dashboard" 
            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
          >
            📊 Overview
          </Link>
          <Link 
            href="/dashboard/analytics" 
            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
          >
            📈 Analytics
          </Link>
          <Link 
            href="/dashboard/users" 
            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
          >
            👥 Users
          </Link>
          <Link 
            href="/dashboard/settings" 
            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
          >
            ⚙️ Settings
          </Link>
          <div className="border-t mt-6 pt-6">
            <Link 
              href="/" 
              className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
            >
              🏠 Back to Site
            </Link>
          </div>
        </nav>
      </aside>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-gray-900">
                  🔔
                </button>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  U
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;`;
        await fs_extra_1.default.writeFile(path_1.default.join(projectPath, 'src/client/layouts/DashboardLayout.tsx'), dashboardLayout);
    }
}
async function generateComponents(projectPath) {
    // Create a simple Link component
    const linkComponent = `import React from 'react';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
}

const Link: React.FC<LinkProps> = ({ href, children, className, target }) => {
  return (
    <a href={href} className={className} target={target}>
      {children}
    </a>
  );
};

export default Link;`;
    await fs_extra_1.default.writeFile(path_1.default.join(projectPath, 'src/client/components/Link.tsx'), linkComponent);
}
async function createWorkflows(projectPath, options) {
    // Home page workflow
    const homeWorkflow = {
        name: "home",
        trigger: {
            http: {
                method: "GET",
                path: "/",
                accept: "text/html"
            }
        },
        steps: [
            {
                name: "render",
                node: "mosaic-render",
                type: "module"
            }
        ],
        nodes: {
            render: {
                inputs: {
                    component: "Home",
                    props: {
                        message: "Welcome to your new MosaicJS application!"
                    }
                }
            }
        }
    };
    await fs_extra_1.default.writeJson(path_1.default.join(projectPath, 'workflows/json/home.json'), homeWorkflow, { spaces: 2 });
    // About page workflow
    const aboutWorkflow = {
        name: "about",
        trigger: {
            http: {
                method: "GET",
                path: "/about",
                accept: "text/html"
            }
        },
        steps: [
            {
                name: "render",
                node: "mosaic-render",
                type: "module"
            }
        ],
        nodes: {
            render: {
                inputs: {
                    component: "About"
                }
            }
        }
    };
    await fs_extra_1.default.writeJson(path_1.default.join(projectPath, 'workflows/json/about.json'), aboutWorkflow, { spaces: 2 });
    if (options.template === 'dashboard') {
        // Dashboard workflow
        const dashboardWorkflow = {
            name: "dashboard",
            trigger: {
                http: {
                    method: "GET",
                    path: "/dashboard",
                    accept: "text/html"
                }
            },
            steps: [
                {
                    name: "fetch-data",
                    node: "fetch-dashboard-data",
                    type: "module"
                },
                {
                    name: "render",
                    node: "mosaic-render",
                    type: "module"
                }
            ],
            nodes: {
                "fetch-data": {
                    inputs: {}
                },
                render: {
                    inputs: {
                        component: "Dashboard"
                    }
                }
            }
        };
        await fs_extra_1.default.writeJson(path_1.default.join(projectPath, 'workflows/json/dashboard.json'), dashboardWorkflow, { spaces: 2 });
    }
}
async function createConfigFiles(projectPath, options) {
    // Vite config
    const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/client',
    rollupOptions: {
      input: 'src/client/entry-client.tsx'
    }
  },
  server: {
    port: 3000
  }
});`;
    await fs_extra_1.default.writeFile(path_1.default.join(projectPath, 'vite.config.ts'), viteConfig);
    // TypeScript config for client
    const tsConfig = {
        compilerOptions: {
            target: "ES2020",
            lib: ["ES2020", "DOM", "DOM.Iterable"],
            module: "ESNext",
            skipLibCheck: true,
            moduleResolution: "bundler",
            allowImportingTsExtensions: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: "react-jsx",
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true
        },
        include: ["src/client/**/*"],
        references: [{ path: "./tsconfig.node.json" }]
    };
    await fs_extra_1.default.writeJson(path_1.default.join(projectPath, 'tsconfig.client.json'), tsConfig, { spaces: 2 });
    // Update main tsconfig to exclude client files
    const mainTsConfigPath = path_1.default.join(projectPath, 'tsconfig.json');
    if (await fs_extra_1.default.pathExists(mainTsConfigPath)) {
        const mainTsConfig = await fs_extra_1.default.readJson(mainTsConfigPath);
        mainTsConfig.exclude = mainTsConfig.exclude || [];
        if (!mainTsConfig.exclude.includes('src/client/**/*')) {
            mainTsConfig.exclude.push('src/client/**/*');
        }
        await fs_extra_1.default.writeJson(mainTsConfigPath, mainTsConfig, { spaces: 2 });
    }
    // Tailwind config
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/client/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
    await fs_extra_1.default.writeFile(path_1.default.join(projectPath, 'tailwind.config.js'), tailwindConfig);
    // PostCSS config
    const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
    await fs_extra_1.default.writeFile(path_1.default.join(projectPath, 'postcss.config.js'), postcssConfig);
    // CSS file
    const cssFile = `@tailwind base;
@tailwind components;
@tailwind utilities;`;
    await fs_extra_1.default.ensureDir(path_1.default.join(projectPath, 'src/client/styles'));
    await fs_extra_1.default.writeFile(path_1.default.join(projectPath, 'src/client/styles/globals.css'), cssFile);
}
//# sourceMappingURL=install.js.map