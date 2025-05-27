#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const create_1 = require("./commands/create");
const add_page_1 = require("./commands/add-page");
const add_layout_1 = require("./commands/add-layout");
const install_1 = require("./commands/install");
const program = new commander_1.Command();
program
    .name('mosaicjs')
    .description('CLI tool for MosaicJS - Framework-agnostic SSR for Nanoservice-ts')
    .version('1.0.0');
// Install MosaicJS into existing project command
program
    .command('install')
    .alias('init')
    .description('Install MosaicJS into an existing Nanoservice-ts project')
    .option('-f, --framework <framework>', 'Framework to use (react, vue, svelte)', 'react')
    .option('-t, --template <template>', 'Template to use (basic, dashboard, blog)', 'basic')
    .option('--skip-install', 'Skip npm install')
    .option('--force', 'Force installation even if not a Nanoservice-ts project')
    .action(async (options) => {
    try {
        await (0, install_1.installMosaic)(options);
    }
    catch (error) {
        console.error(chalk_1.default.red('Error installing MosaicJS:'), error);
        process.exit(1);
    }
});
// Create new project command
program
    .command('create')
    .alias('new')
    .description('Create a new MosaicJS project')
    .argument('[project-name]', 'Name of the project')
    .option('-f, --framework <framework>', 'Framework to use (react, vue, svelte)', 'react')
    .option('-t, --template <template>', 'Template to use (basic, dashboard, blog)', 'basic')
    .option('--skip-install', 'Skip npm install')
    .action(async (projectName, options) => {
    try {
        await (0, create_1.createProject)(projectName, options);
    }
    catch (error) {
        console.error(chalk_1.default.red('Error creating project:'), error);
        process.exit(1);
    }
});
// Add page command
program
    .command('add:page')
    .alias('page')
    .description('Add a new page component')
    .argument('<page-name>', 'Name of the page (e.g., About, Dashboard, UserProfile)')
    .option('-l, --layout <layout>', 'Layout to use for this page')
    .option('-r, --route <route>', 'Custom route path (defaults to kebab-case of page name)')
    .action(async (pageName, options) => {
    try {
        await (0, add_page_1.addPage)(pageName, options);
    }
    catch (error) {
        console.error(chalk_1.default.red('Error adding page:'), error);
        process.exit(1);
    }
});
// Add layout command
program
    .command('add:layout')
    .alias('layout')
    .description('Add a new layout component')
    .argument('<layout-name>', 'Name of the layout (e.g., Dashboard, Auth, Blog)')
    .action(async (layoutName, options) => {
    try {
        await (0, add_layout_1.addLayout)(layoutName, options);
    }
    catch (error) {
        console.error(chalk_1.default.red('Error adding layout:'), error);
        process.exit(1);
    }
});
// Info command
program
    .command('info')
    .description('Display project information and framework details')
    .action(() => {
    console.log(chalk_1.default.cyan.bold('\n🎯 MosaicJS Project Information\n'));
    console.log(chalk_1.default.yellow('Framework Support:'));
    console.log('  • React 18+ with @mosaicjs/react');
    console.log('  • Vue 3+ with @mosaicjs/vue');
    console.log('  • Svelte (coming soon) with @mosaicjs/svelte');
    console.log('  • Custom frameworks with @mosaicjs/core\n');
    console.log(chalk_1.default.yellow('Key Features:'));
    console.log('  • Server-side rendering (SSR)');
    console.log('  • Client-side navigation (SPA)');
    console.log('  • Framework-agnostic workflows');
    console.log('  • Zero configuration setup');
    console.log('  • Inertia.js-style development\n');
    console.log(chalk_1.default.yellow('Documentation:'));
    console.log('  • Website: https://mosaicjs.dev');
    console.log('  • GitHub: https://github.com/deskree-inc/mosaicjs');
    console.log('  • Examples: https://github.com/deskree-inc/mosaicjs/tree/main/examples\n');
});
// Help command enhancement
program.on('--help', () => {
    console.log('');
    console.log(chalk_1.default.cyan.bold('Examples:'));
    console.log('  $ npx @mosaicjs/cli install --framework react');
    console.log('  $ npx @mosaicjs/cli create my-app --framework react');
    console.log('  $ npx @mosaicjs/cli create my-vue-app --framework vue');
    console.log('  $ npx @mosaicjs/cli add:page Dashboard --layout DashboardLayout');
    console.log('  $ npx @mosaicjs/cli add:layout AuthLayout');
    console.log('');
    console.log(chalk_1.default.yellow('For more information, visit https://mosaicjs.dev'));
});
// Error handling
program.exitOverride();
try {
    program.parse();
}
catch (error) {
    if (error.code === 'commander.help' || error.code === 'commander.helpDisplayed') {
        process.exit(0);
    }
    console.error(chalk_1.default.red('CLI Error:'), error.message);
    process.exit(1);
}
// Global error handler
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk_1.default.red('🚨 Unhandled promise rejection:'), reason);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map