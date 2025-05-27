"use strict";
/**
 *  Add Command - Add beautiful pre-built tiles to your Mosaic project
 * Tiles are reusable components, pages, or layouts that enhance your app
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCommand = addCommand;
const ora_1 = __importDefault(require("ora"));
const picocolors_1 = __importDefault(require("picocolors"));
const inquirer_1 = __importDefault(require("inquirer"));
const execa_1 = require("execa");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
// 🎨 Available tiles registry
const AVAILABLE_TILES = {
    'landing-page': {
        name: 'Beautiful Landing Page',
        description: '🎨 Stunning landing page with gradients and animations',
        category: 'page',
        dependencies: ['lucide-react'],
        files: {
            'src/client/pages/Landing.tsx': `// Beautiful landing page component`,
            'src/client/components/Hero.tsx': `// Hero section component`,
        }
    },
    'dashboard': {
        name: 'Analytics Dashboard',
        description: '📊 Modern dashboard with charts and metrics',
        category: 'page',
        dependencies: ['recharts', 'lucide-react'],
        files: {
            'src/client/pages/Dashboard.tsx': `// Dashboard component`,
            'src/client/components/MetricCard.tsx': `// Metric card component`,
        }
    },
    'auth-forms': {
        name: 'Authentication Forms',
        description: '🔐 Login and signup forms with validation',
        category: 'component',
        dependencies: ['react-hook-form', 'zod'],
        files: {
            'src/client/components/LoginForm.tsx': `// Login form component`,
            'src/client/components/SignupForm.tsx': `// Signup form component`,
        }
    },
    'navigation': {
        name: 'Navigation Components',
        description: '🧭 Header, sidebar, and navigation components',
        category: 'layout',
        dependencies: ['lucide-react'],
        files: {
            'src/client/layouts/AppLayout.tsx': `// App layout component`,
            'src/client/components/Sidebar.tsx': `// Sidebar component`,
        }
    }
};
async function addCommand(tileName, options) {
    const spinner = (0, ora_1.default)();
    try {
        console.log(picocolors_1.default.cyan(`\n ✨ Adding tile: ${picocolors_1.default.bold(tileName)}\n`));
        // 🎯 Check if tile exists
        const tile = AVAILABLE_TILES[tileName];
        if (!tile) {
            console.log(picocolors_1.default.red(`❌ Tile "${tileName}" not found!\n`));
            console.log(picocolors_1.default.yellow(`Available tiles:`));
            Object.entries(AVAILABLE_TILES).forEach(([key, value]) => {
                console.log(`  🎨 ${picocolors_1.default.cyan(key)} - ${value.description}`);
            });
            return;
        }
        // 🏗️ Check if we're in a Mosaic project
        if (!fs_extra_1.default.existsSync('package.json')) {
            console.log(picocolors_1.default.red(`❌ No package.json found. Please run this command in your project root.`));
            return;
        }
        const packageJson = await fs_extra_1.default.readJson('package.json');
        const hasMosaic = packageJson.dependencies?.['@mosaic/core'] ||
            packageJson.devDependencies?.['@mosaic/core'];
        if (!hasMosaic) {
            console.log(picocolors_1.default.red(`❌ This doesn't appear to be a Mosaic project.`));
            console.log(picocolors_1.default.yellow(`�� Run ${picocolors_1.default.cyan('npx mosaicjs@latest init')} first to initialize Mosaic.`));
            return;
        }
        console.log(picocolors_1.default.green(`🎯 Found Mosaic project! Adding tile: ${tile.name}`));
        console.log(picocolors_1.default.dim(`   ${tile.description}\n`));
        // 🤔 Confirm installation
        const { confirm } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Add "${tile.name}" to your project?`,
                default: true
            }
        ]);
        if (!confirm) {
            console.log(picocolors_1.default.yellow(` Operation cancelled.`));
            return;
        }
        // 📦 Install dependencies if needed
        if (tile.dependencies.length > 0) {
            spinner.start(` Installing dependencies...`);
            try {
                await (0, execa_1.execa)('npm', ['install', ...tile.dependencies]);
                spinner.succeed(`📦 Dependencies installed!`);
            }
            catch (error) {
                spinner.fail(`❌ Failed to install dependencies`);
                console.error(picocolors_1.default.red(`Error: ${error}`));
                return;
            }
        }
        // 📝 Create files
        spinner.start(`🎨 Creating tile files...`);
        for (const [filePath, content] of Object.entries(tile.files)) {
            const fullPath = path_1.default.resolve(filePath);
            const dir = path_1.default.dirname(fullPath);
            // Create directory if it doesn't exist
            await fs_extra_1.default.ensureDir(dir);
            // Check if file already exists
            if (await fs_extra_1.default.pathExists(fullPath)) {
                const { overwrite } = await inquirer_1.default.prompt([
                    {
                        type: 'confirm',
                        name: 'overwrite',
                        message: `File ${filePath} already exists. Overwrite?`,
                        default: false
                    }
                ]);
                if (!overwrite) {
                    console.log(picocolors_1.default.yellow(`⏭️  Skipped ${filePath}`));
                    continue;
                }
            }
            // Write file content (in real implementation, this would fetch actual templates)
            await fs_extra_1.default.writeFile(fullPath, `${content}\n// Added by Mosaic CLI - ${tile.name}\n`);
            console.log(picocolors_1.default.green(`✅ Created ${filePath}`));
        }
        spinner.succeed(` ✨ Tile "${tileName}" added successfully!`);
        // 🎯 Next steps
        console.log(picocolors_1.default.cyan(`\n🎉 Next steps:`));
        console.log(`  🔧 Customize the components to match your design`);
        console.log(`  🎨 Update styles and colors as needed`);
        console.log(`  🚀 Start your dev server: ${picocolors_1.default.cyan('npm run dev')}`);
        console.log(`\n Happy building with Mosaic! ✨\n`);
    }
    catch (error) {
        spinner.fail(`❌ Failed to add tile`);
        console.error(picocolors_1.default.red(`Error: ${error}`));
        process.exit(1);
    }
}
//# sourceMappingURL=add.js.map