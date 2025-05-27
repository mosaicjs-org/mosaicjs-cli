"use strict";
/**
 * Mosaic Init Command
 *  Transform your Nanoservice-ts project into a beautiful Mosaic application
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = initCommand;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const picocolors_1 = __importDefault(require("picocolors"));
const ora_1 = __importDefault(require("ora"));
const execa_1 = require("execa");
const inquirer_1 = __importDefault(require("inquirer"));
/**
 * Initialize Mosaic in an existing Nanoservice-ts project
 */
async function initCommand(options) {
    console.log(picocolors_1.default.cyan('\n Welcome to Mosaic!'));
    console.log(picocolors_1.default.dim('Transforming your Nanoservice-ts project into a beautiful SPA...\n'));
    // Step 1: Validate project structure
    const spinner = (0, ora_1.default)('🔍 Checking project structure...').start();
    try {
        await validateProject();
        spinner.succeed('✅ Valid Nanoservice-ts project detected');
    }
    catch (error) {
        spinner.fail(`❌ ${error.message}`);
        process.exit(1);
    }
    // Step 2: Confirm installation
    if (!options.force) {
        const { confirm } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: '🎨 Ready to add beautiful Mosaic to your project?',
                default: true
            }
        ]);
        if (!confirm) {
            console.log(picocolors_1.default.yellow('👋 Installation cancelled. Come back when you\'re ready for beauty!'));
            process.exit(0);
        }
    }
    // Step 3: Install dependencies
    await installDependencies();
    // Step 4: Create project structure
    await createProjectStructure(options);
    // Step 5: Configure build tools
    await configureBuildTools(options);
    // Step 6: Create example pages
    await createExamplePages(options);
    // Step 7: Create essential nodes
    await createEssentialNodes();
    // Step 8: Update workflows
    await updateWorkflows();
    // Success message
    console.log(picocolors_1.default.green('\n🎉 Mosaic has been successfully installed!'));
    console.log(picocolors_1.default.cyan('\n🚀 Next steps:'));
    console.log(picocolors_1.default.dim('  1. npm run dev          # Start development server'));
    console.log(picocolors_1.default.dim('  2. mosaic add home-tile  # Add beautiful components'));
    console.log(picocolors_1.default.dim('  3. mosaic doctor         # Check project health'));
    console.log(picocolors_1.default.cyan('\n✨ Build something beautiful! ✨\n'));
}
/**
 * Validate that this is a Nanoservice-ts project
 */
async function validateProject() {
    const packageJsonPath = path_1.default.join(process.cwd(), 'package.json');
    if (!await fs_extra_1.default.pathExists(packageJsonPath)) {
        throw new Error('No package.json found. Please run this command in a Node.js project.');
    }
    const packageJson = await fs_extra_1.default.readJson(packageJsonPath);
    // Check for Nanoservice-ts dependencies
    const hasNanoservice = packageJson.dependencies?.['@nanoservice-ts/runner'] ||
        packageJson.dependencies?.['nanoservice-ts'] ||
        packageJson.devDependencies?.['@nanoservice-ts/runner'] ||
        packageJson.devDependencies?.['nanoservice-ts'];
    if (!hasNanoservice) {
        throw new Error('This doesn\'t appear to be a Nanoservice-ts project. Please install Nanoservice-ts first.');
    }
    // Check for workflows directory
    const workflowsPath = path_1.default.join(process.cwd(), 'workflows');
    if (!await fs_extra_1.default.pathExists(workflowsPath)) {
        throw new Error('No workflows directory found. Please ensure this is a valid Nanoservice-ts project.');
    }
}
/**
 * Install Mosaic dependencies
 */
async function installDependencies() {
    const spinner = (0, ora_1.default)('📦 Installing Mosaic dependencies...').start();
    try {
        // Install core dependencies
        await (0, execa_1.execa)('npm', ['install',
            'react',
            'react-dom',
            'lucide-react',
            '@radix-ui/react-slot',
            'class-variance-authority',
            'tailwind-merge',
            'tailwindcss-animate'
        ], {
            stdio: 'pipe'
        });
        // Install dev dependencies
        await (0, execa_1.execa)('npm', ['install', '-D',
            '@types/react',
            '@types/react-dom',
            'vite',
            '@vitejs/plugin-react',
            'tailwindcss',
            'postcss',
            'autoprefixer',
            'typescript'
        ], {
            stdio: 'pipe'
        });
        spinner.succeed('✅ Dependencies installed successfully');
    }
    catch (error) {
        spinner.fail('❌ Failed to install dependencies');
        throw error;
    }
}
/**
 * Create the Mosaic project structure
 */
async function createProjectStructure(options) {
    const spinner = (0, ora_1.default)('🏗️  Creating project structure...').start();
    try {
        // Create client directory structure
        await fs_extra_1.default.ensureDir('src/client');
        await fs_extra_1.default.ensureDir('src/client/components');
        await fs_extra_1.default.ensureDir('src/client/components/ui');
        await fs_extra_1.default.ensureDir('src/client/pages');
        await fs_extra_1.default.ensureDir('src/client/layouts');
        await fs_extra_1.default.ensureDir('src/client/styles');
        await fs_extra_1.default.ensureDir('src/client/lib');
        // Create nodes directory structure
        await fs_extra_1.default.ensureDir('src/nodes');
        await fs_extra_1.default.ensureDir('src/nodes/nano-adapter');
        await fs_extra_1.default.ensureDir('src/nodes/fetch-dashboard-data');
        await fs_extra_1.default.ensureDir('src/nodes/set-status');
        spinner.succeed('✅ Project structure created');
    }
    catch (error) {
        spinner.fail('❌ Failed to create project structure');
        throw error;
    }
}
/**
 * Configure build tools (Vite, TypeScript, Tailwind)
 */
async function configureBuildTools(options) {
    const spinner = (0, ora_1.default)('⚙️  Configuring build tools...').start();
    try {
        // Create Vite config
        const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist/client',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 3000,
  },
});`;
        await fs_extra_1.default.writeFile('vite.config.ts', viteConfig);
        // Create Tailwind config
        const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mosaic: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}`;
        await fs_extra_1.default.writeFile('tailwind.config.js', tailwindConfig);
        // Create PostCSS config
        const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
        await fs_extra_1.default.writeFile('postcss.config.js', postcssConfig);
        // Update package.json scripts
        const packageJsonPath = path_1.default.join(process.cwd(), 'package.json');
        const packageJson = await fs_extra_1.default.readJson(packageJsonPath);
        packageJson.scripts = {
            ...packageJson.scripts,
            'dev': 'ts-node src/index.ts',
            'dev:vite': 'vite',
            'start': 'node dist/index.js',
            'reload': 'node -r ts-node/register --env-file=.env.local ./src/index.ts',
            'build': 'tsc',
            'build:client': 'vite build',
            'build:ssr': 'vite build --ssr src/client/entry-server.tsx --outDir dist/server',
            'build:all': 'npm run build && npm run build:client && npm run build:ssr',
            'test': 'jest'
        };
        await fs_extra_1.default.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        spinner.succeed('✅ Build tools configured');
    }
    catch (error) {
        spinner.fail('❌ Failed to configure build tools');
        throw error;
    }
}
/**
 * Create example pages and components
 */
async function createExamplePages(options) {
    const spinner = (0, ora_1.default)('🎨 Creating beautiful example pages...').start();
    try {
        // Create the main App component (based on our actual App.tsx)
        const appComponent = `import React, { Suspense, lazy, createElement } from 'react';
import './styles/globals.css';
import CoreLayout from './layouts/CoreLayout';
import ProgressBar from './components/ProgressBar';

// Loading component for suspense
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Dynamic component resolver
const resolvePageComponent = async (componentName: string) => {
  const componentMap: Record<string, () => Promise<any>> = {
    Home: () => import('./pages/Home'),
    Dashboard: () => import('./pages/Dashboard'),
    Error: () => import('./pages/Error'),
    NotFound: () => import('./pages/Error').then(module => ({ default: module.NotFound })),
  };

  try {
    const componentLoader = componentMap[componentName];
    if (!componentLoader) {
      console.warn(\`Component \${componentName} not found, falling back to NotFound component\`);
      const NotFoundModule = await componentMap.NotFound();
      return NotFoundModule.default;
    }
    
    const module = await componentLoader();
    return module.default;
  } catch (error) {
    console.error(\`Failed to load component \${componentName}:\`, error);
    const NotFoundModule = await componentMap.NotFound();
    return NotFoundModule.default;
  }
};

interface AppProps {
  component: string;
  props: Record<string, any>;
  url: string;
  version: string;
}

// Page component wrapper that handles layout resolution
const PageRenderer: React.FC<{ componentName: string; props: Record<string, any> }> = ({ 
  componentName, 
  props 
}) => {
  const [PageComponent, setPageComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        setLoading(true);
        const Component = await resolvePageComponent(componentName);
        
        if (isMounted) {
          setPageComponent(() => Component);
          setLoading(false);
        }
      } catch (error) {
        console.error(\`Failed to load component \${componentName}:\`, error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, [componentName]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!PageComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Component Not Found</h1>
          <p className="text-gray-600">Component "{componentName}" could not be loaded.</p>
        </div>
      </div>
    );
  }

  // Create the page element
  const pageElement = createElement(PageComponent, props);

  // Check if the component has a layout property
  const layout = (PageComponent as any).layout;

  // Check if this is an error component that should be standalone (no layout)
  const isErrorComponent = ['NotFound', 'ServerError', 'Forbidden', 'Error'].includes(componentName);

  if (layout && typeof layout === 'function' && !isErrorComponent) {
    // Apply the component's custom layout
    return layout(pageElement);
  } else if (!isErrorComponent) {
    // Apply default layout if no custom layout is specified and it's not an error component
    return <CoreLayout>{pageElement}</CoreLayout>;
  } else {
    // Return error components without any layout for standalone experience
    return pageElement;
  }
};

const App: React.FC<AppProps> = ({ component: componentName, props = {}, url, version }) => {
  console.log(\`Rendering App with component: \${componentName}\`, { props, url, version });

  return (
    <ErrorBoundary>
      <ProgressBar />
      <PageRenderer componentName={componentName} props={props} />
    </ErrorBoundary>
  );
};

export default App;`;
        await fs_extra_1.default.writeFile('src/client/App.tsx', appComponent);
        // Create entry-client.tsx (based on our actual entry-client.tsx)
        const entryClient = `import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Determine if we're in development mode with Vite
const isDev = typeof window !== 'undefined' && window.location.port === '3000';

/**
 * Get component name from path
 */
const getComponentNameFromPath = (path: string): string => {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  
  if (!cleanPath) {
    return 'Home';
  }
  
  const segments = cleanPath.split("/").filter(Boolean);
  
  if (segments.length === 1) {
    return toPascalCase(segments[0]);
  }
  
  if (segments.length === 2 && segments[0] === 'dashboard') {
    const subpage = segments[1];
    return \`Dashboard\${toPascalCase(subpage)}\`;
  }
  
  if (segments[0] === 'error') {
    return 'Error';
  }
  
  return segments.map(segment => toPascalCase(segment)).join('');
};

/**
 * Convert a string to PascalCase
 */
const toPascalCase = (str: string): string => {
  return str
    .split(/[-_\\s]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
};

// Get the page data from the data-page attribute
const appElement = document.getElementById('app');
if (!appElement) {
  throw new Error('Root element with id "app" not found');
}

const knownComponents = ['Home', 'Dashboard', 'Error', 'NotFound'];
const currentComponentName = getComponentNameFromPath(window.location.pathname);

// Default page data for development mode
const defaultPageData = knownComponents.includes(currentComponentName) ? {
  component: currentComponentName,
  props: {
    title: \`\${currentComponentName} Page (Dev Mode)\`,
  },
  url: window.location.pathname || '/',
  version: '1.0.0-dev',
} : {
  component: 'NotFound',
  props: {
    title: 'Page Not Found',
    statusCode: 404,
    message: 'The page you are looking for doesn\\'t exist or has been moved.'
  },
  url: window.location.pathname || '/',
  version: '1.0.0-dev',
};

// Parse the page data
const pageData = appElement.hasAttribute('data-page')
  ? JSON.parse(appElement.getAttribute('data-page') || '{}')
  : defaultPageData;

console.log('Initial page data:', pageData);

// Reference to the current app instance
let currentRoot: any = null;

// Bootstrap the application
function initializeApp() {
  if (appElement && appElement.hasChildNodes() && appElement.hasAttribute('data-page')) {
    console.log('Hydrating server-rendered content');
    currentRoot = hydrateRoot(appElement, <App {...pageData} />);
  } else if (appElement) {
    console.log('Creating new React root');
    const root = createRoot(appElement);
    root.render(<App {...pageData} />);
    currentRoot = root;
  }
}

// Initialize
initializeApp();

// Handle navigation events
document.addEventListener('nano-adapter:navigate', ((event: CustomEvent) => {
  console.log('Navigation event received:', event.detail);
  const newPageData = event.detail;
  
  if (appElement && currentRoot) {
    console.log('Rendering new page component:', newPageData.component);
    currentRoot.render(<App key={\`page-\${Date.now()}\`} {...newPageData} />);
  } else {
    console.error('Cannot render new page - missing appElement or currentRoot');
  }
}) as EventListener);

// Handle browser back/forward navigation
window.addEventListener('popstate', (event) => {
  console.log('Popstate event triggered', { state: event.state, url: window.location.pathname });
  
  const url = window.location.pathname + window.location.search;

  if (isDev) {
    const componentName = getComponentNameFromPath(url);
    console.log(\`Derived component name for \${url}: \${componentName}\`);
    
    const mockPageData = knownComponents.includes(componentName) ? {
      component: componentName,
      props: {
        title: \`\${componentName} Page (Dev Mode)\`
      },
      url: url,
      version: '1.0.0-dev'
    } : {
      component: 'NotFound',
      props: {
        title: 'Page Not Found',
        statusCode: 404,
        message: 'The page you are looking for doesn\\'t exist or has been moved.'
      },
      url: url,
      version: '1.0.0-dev'
    };
    
    appElement?.setAttribute('data-page', JSON.stringify(mockPageData));
    currentRoot?.render(<App key={\`page-\${Date.now()}\`} {...mockPageData} />);
    return;
  }
  
  // Make a request to get the page data for the current URL
  fetch(url, {
    headers: {
      'X-Nano-Adapter': 'true',
      'X-Nano-Adapter-Version': pageData.version || '1.0.0',
    },
  })
    .then(response => response.json())
    .then(newPageData => {
      appElement?.setAttribute('data-page', JSON.stringify(newPageData));
      currentRoot?.render(<App key={\`page-\${Date.now()}\`} {...newPageData} />);
    })
    .catch(error => {
      console.error('Failed to fetch page data:', error);
    });
});`;
        await fs_extra_1.default.writeFile('src/client/entry-client.tsx', entryClient);
        // Create entry-server.tsx
        const entryServer = `import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export function render(pageData: any) {
  return renderToString(<App {...pageData} />);
}`;
        await fs_extra_1.default.writeFile('src/client/entry-server.tsx', entryServer);
        // Create basic Home page
        const homePage = `import React from 'react';
import CoreLayout from '../layouts/CoreLayout';

interface HomeProps {
  title?: string;
}

const Home: React.FC<HomeProps> = ({ title = 'Welcome to Mosaic' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Build beautiful single-page applications with server-side routing and React components.
          </p>
          <div className="space-x-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Attach layout
Home.layout = (page: React.ReactNode) => <CoreLayout>{page}</CoreLayout>;

export default Home;`;
        await fs_extra_1.default.writeFile('src/client/pages/Home.tsx', homePage);
        // Create basic Dashboard page
        const dashboardPage = `import React from 'react';
import CoreLayout from '../layouts/CoreLayout';

interface DashboardProps {
  title?: string;
  userData?: any;
  stats?: any;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  title = 'Dashboard',
  userData = { name: 'User' },
  stats = { users: 0, revenue: 0 }
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome back, {userData.name}!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Users</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.users}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-green-600">$\{stats.revenue}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
            <p className="text-lg text-gray-600">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Attach layout
Dashboard.layout = (page: React.ReactNode) => <CoreLayout>{page}</CoreLayout>;

export default Dashboard;`;
        await fs_extra_1.default.writeFile('src/client/pages/Dashboard.tsx', dashboardPage);
        // Create Error page
        const errorPage = `import React from 'react';

interface ErrorProps {
  statusCode?: number;
  message?: string;
  title?: string;
}

const Error: React.FC<ErrorProps> = ({ 
  statusCode = 500, 
  message = 'An error occurred',
  title = 'Error'
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">😵</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{statusCode}</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
        >
          Go Back
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

// NotFound component
export const NotFound: React.FC = () => (
  <Error 
    statusCode={404} 
    title="Page Not Found"
    message="The page you are looking for doesn't exist or has been moved."
  />
);

// ServerError component
export const ServerError: React.FC = () => (
  <Error 
    statusCode={500} 
    title="Server Error"
    message="Something went wrong on our end. Please try again later."
  />
);

// Forbidden component
export const Forbidden: React.FC = () => (
  <Error 
    statusCode={403} 
    title="Access Forbidden"
    message="You don't have permission to access this resource."
  />
);

export default Error;`;
        await fs_extra_1.default.writeFile('src/client/pages/Error.tsx', errorPage);
        // Create CoreLayout
        const coreLayout = `import React from 'react';

interface CoreLayoutProps {
  children: React.ReactNode;
}

const CoreLayout: React.FC<CoreLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Mosaic</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
            </div>
          </nav>
        </div>
      </header>
      
      <main>{children}</main>
      
      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Mosaic. Built with love.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CoreLayout;`;
        await fs_extra_1.default.writeFile('src/client/layouts/CoreLayout.tsx', coreLayout);
        // Create ProgressBar component
        const progressBar = `import React, { useState, useEffect } from 'react';

const ProgressBar: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleNavigationStart = () => {
      setIsLoading(true);
      setProgress(0);
    };

    const handleNavigationEnd = () => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    };

    // Listen for navigation events
    document.addEventListener('nano-adapter:navigate-start', handleNavigationStart);
    document.addEventListener('nano-adapter:navigate', handleNavigationEnd);

    return () => {
      document.removeEventListener('nano-adapter:navigate-start', handleNavigationStart);
      document.removeEventListener('nano-adapter:navigate', handleNavigationEnd);
    };
  }, []);

  useEffect(() => {
    if (isLoading && progress < 90) {
      const timer = setTimeout(() => {
        setProgress(prev => prev + Math.random() * 30);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, progress]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div 
        className="h-1 bg-blue-600 transition-all duration-200 ease-out"
        style={{ width: \`\${Math.min(progress, 100)}%\` }}
      />
    </div>
  );
};

export default ProgressBar;`;
        await fs_extra_1.default.writeFile('src/client/components/ProgressBar.tsx', progressBar);
        // Create global styles
        const globalStyles = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: system-ui, sans-serif;
  }
  
  body {
    @apply antialiased;
  }
}

@layer components {
  .mosaic-gradient {
    @apply bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600;
  }
  
  .mosaic-text-gradient {
    @apply bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent;
  }
}`;
        await fs_extra_1.default.writeFile('src/client/styles/globals.css', globalStyles);
        // Create index.html
        const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mosaic App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/client/entry-client.tsx"></script>
  </body>
</html>`;
        await fs_extra_1.default.writeFile('index.html', indexHtml);
        spinner.succeed('✅ Example pages and components created');
    }
    catch (error) {
        spinner.fail('❌ Failed to create example pages');
        throw error;
    }
}
/**
 * Create essential nodes for Mosaic
 */
async function createEssentialNodes() {
    const spinner = (0, ora_1.default)('🔧 Creating essential nodes...').start();
    try {
        // Ensure nodes directory exists
        await fs_extra_1.default.ensureDir('src/nodes');
        // Create MapperNode
        const mapperNodeCode = `import {
	type INanoServiceResponse,
	type JsonLikeObject,
	NanoService,
	NanoServiceResponse,
} from "@nanoservice-ts/runner";
import { type Context, GlobalError } from "@nanoservice-ts/shared";

type InputType = {
	model: object;
};

export default class MapperNode extends NanoService<InputType> {
	constructor() {
		super();
		this.inputSchema = {
			$schema: "http://json-schema.org/draft-04/schema#",
			type: "object",
			properties: {
				model: { type: "object" },
			},
			required: ["model"],
		};
	}

	async handle(ctx: Context, inputs: InputType): Promise<INanoServiceResponse> {
		const response: NanoServiceResponse = new NanoServiceResponse();

		try {
			response.setSuccess(inputs.model as JsonLikeObject);
		} catch (error: unknown) {
			const nodeError = new GlobalError((error as Error).message);
			nodeError.setCode(500);
			response.setError(nodeError);
		}

		return response;
	}
}`;
        await fs_extra_1.default.writeFile('src/nodes/MapperNode.ts', mapperNodeCode);
        // Create route-guard node if it doesn't exist
        const routeGuardPath = 'src/nodes/route-guard';
        if (!await fs_extra_1.default.pathExists(routeGuardPath)) {
            await fs_extra_1.default.ensureDir(routeGuardPath);
            const routeGuardCode = `import {
	type INanoServiceResponse,
	NanoService,
	NanoServiceResponse,
} from "@nanoservice-ts/runner";
import { type Context, GlobalError } from "@nanoservice-ts/shared";

type InputType = {
	allowedPaths: string[];
};

export default class RouteGuardNode extends NanoService<InputType> {
	constructor() {
		super();
		this.inputSchema = {
			$schema: "http://json-schema.org/draft-04/schema#",
			type: "object",
			properties: {
				allowedPaths: {
					type: "array",
					items: { type: "string" }
				},
			},
			required: ["allowedPaths"],
		};
	}

	async handle(ctx: Context, inputs: InputType): Promise<INanoServiceResponse> {
		const response: NanoServiceResponse = new NanoServiceResponse();

		try {
			const requestPath = ctx.request.path;
			const { allowedPaths } = inputs;

			// Check if the path is allowed
			const isAllowed = allowedPaths.some(allowedPath => {
				if (allowedPath === '/*') return true;
				if (allowedPath === requestPath) return true;
				if (allowedPath.endsWith('/*')) {
					const basePath = allowedPath.slice(0, -2);
					return requestPath.startsWith(basePath);
				}
				return false;
			});

			if (!isAllowed) {
				const error = new GlobalError(\`Path "\${requestPath}" is not allowed\`);
				error.setCode(404);
				response.setError(error);
				return response;
			}

			response.setSuccess({ allowed: true, path: requestPath });
		} catch (error: unknown) {
			const nodeError = new GlobalError((error as Error).message);
			nodeError.setCode(500);
			response.setError(nodeError);
		}

		return response;
	}
}`;
            await fs_extra_1.default.writeFile('src/nodes/route-guard/index.ts', routeGuardCode);
        }
        // Update Nodes.ts to include the new nodes
        const nodesPath = 'src/Nodes.ts';
        if (await fs_extra_1.default.pathExists(nodesPath)) {
            let nodesContent = await fs_extra_1.default.readFile(nodesPath, 'utf-8');
            // Add imports if they don't exist
            if (!nodesContent.includes('import MapperNode from "./nodes/MapperNode"')) {
                nodesContent = nodesContent.replace('import type { NodeBase } from "@nanoservice-ts/shared";', 'import type { NodeBase } from "@nanoservice-ts/shared";\nimport MapperNode from "./nodes/MapperNode";');
            }
            if (!nodesContent.includes('import RouteGuardNode from "./nodes/route-guard"')) {
                nodesContent = nodesContent.replace('import MapperNode from "./nodes/MapperNode";', 'import MapperNode from "./nodes/MapperNode";\nimport RouteGuardNode from "./nodes/route-guard";');
            }
            // Add nodes to the export object if they don't exist
            if (!nodesContent.includes('"mapper": new MapperNode()')) {
                nodesContent = nodesContent.replace('const nodes: {\n\t[key: string]: NodeBase;\n} = {', 'const nodes: {\n\t[key: string]: NodeBase;\n} = {\n\t"mapper": new MapperNode(),');
            }
            if (!nodesContent.includes('"route-guard": new RouteGuardNode()')) {
                nodesContent = nodesContent.replace('\t"mapper": new MapperNode(),', '\t"mapper": new MapperNode(),\n\t"route-guard": new RouteGuardNode(),');
            }
            await fs_extra_1.default.writeFile(nodesPath, nodesContent);
        }
        spinner.succeed('✅ Essential nodes created');
    }
    catch (error) {
        spinner.fail('❌ Failed to create essential nodes');
        throw error;
    }
}
/**
 * Update workflows to use Mosaic
 */
async function updateWorkflows() {
    const spinner = (0, ora_1.default)('🔄 Creating essential workflows...').start();
    try {
        // Ensure workflows/json directory exists
        await fs_extra_1.default.ensureDir('workflows/json');
        // Create home workflow
        const homeWorkflow = {
            name: 'home',
            description: 'Home page rendered with NanoAdapter',
            version: '1.0.0',
            trigger: {
                http: {
                    method: 'GET',
                    path: '/',
                    accept: 'text/html'
                }
            },
            steps: [
                {
                    name: 'render',
                    node: 'nano-adapter',
                    type: 'local'
                }
            ],
            nodes: {
                render: {
                    inputs: {
                        component: 'Home',
                        assetsVersion: '1.0.0'
                    }
                }
            }
        };
        await fs_extra_1.default.writeJson('workflows/json/home.json', homeWorkflow, { spaces: 2 });
        // Create universal router workflow
        const universalRouterWorkflow = {
            name: 'universal-router',
            description: 'Universal router that handles all paths and automatically derives component names',
            version: '1.0.0',
            trigger: {
                http: {
                    method: 'GET',
                    path: '/*',
                    accept: 'text/html'
                }
            },
            steps: [
                {
                    name: 'route-guard',
                    node: 'route-guard',
                    type: 'local'
                },
                {
                    name: 'fetch-page-data',
                    node: 'fetch-dashboard-data',
                    type: 'local'
                },
                {
                    name: 'render',
                    node: 'nano-adapter',
                    type: 'local'
                }
            ],
            nodes: {
                'route-guard': {
                    inputs: {
                        allowedPaths: [
                            '/',
                            '/about',
                            '/contact',
                            '/dashboard',
                            '/dashboard/analytics',
                            '/dashboard/settings',
                            '/dashboard/help'
                        ]
                    }
                },
                'fetch-page-data': {
                    inputs: {
                        userId: '${ctx.request.query.userId || \'default\'}',
                        path: '${ctx.request.path}'
                    }
                },
                render: {
                    inputs: {
                        assetsVersion: '1.0.0'
                    }
                }
            }
        };
        await fs_extra_1.default.writeJson('workflows/json/universal-router.json', universalRouterWorkflow, { spaces: 2 });
        // Create dashboard workflow
        const dashboardWorkflow = {
            name: 'dashboard',
            description: 'Dashboard page with data fetching',
            version: '1.0.0',
            trigger: {
                http: {
                    method: 'GET',
                    path: '/dashboard',
                    accept: 'text/html'
                }
            },
            steps: [
                {
                    name: 'fetch-data',
                    node: 'fetch-dashboard-data',
                    type: 'local'
                },
                {
                    name: 'render',
                    node: 'nano-adapter',
                    type: 'local'
                }
            ],
            nodes: {
                'fetch-data': {
                    inputs: {
                        userId: '${ctx.request.query.userId || \'default\'}',
                        path: '${ctx.request.path}'
                    }
                },
                render: {
                    inputs: {
                        component: 'Dashboard',
                        assetsVersion: '1.0.0'
                    }
                }
            }
        };
        await fs_extra_1.default.writeJson('workflows/json/dashboard.json', dashboardWorkflow, { spaces: 2 });
        spinner.succeed('✅ Essential workflows created');
    }
    catch (error) {
        spinner.fail('❌ Failed to create workflows');
        throw error;
    }
}
//# sourceMappingURL=init.js.map