"use strict";
/**
 *  List Command - Show available tiles and components
 * Browse the beautiful collection of pre-built Mosaic components
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCommand = listCommand;
const picocolors_1 = __importDefault(require("picocolors"));
// 🎨 Available tiles registry (same as in add command)
const AVAILABLE_TILES = {
    'landing-page': {
        name: 'Beautiful Landing Page',
        description: '🎨 Stunning landing page with gradients and animations',
        category: 'page',
        dependencies: ['lucide-react'],
        version: '1.0.0',
        author: 'Mosaic Team'
    },
    'dashboard': {
        name: 'Analytics Dashboard',
        description: '📊 Modern dashboard with charts and metrics',
        category: 'page',
        dependencies: ['recharts', 'lucide-react'],
        version: '1.0.0',
        author: 'Mosaic Team'
    },
    'auth-forms': {
        name: 'Authentication Forms',
        description: '🔐 Login and signup forms with validation',
        category: 'component',
        dependencies: ['react-hook-form', 'zod'],
        version: '1.0.0',
        author: 'Mosaic Team'
    },
    'navigation': {
        name: 'Navigation Components',
        description: '🧭 Header, sidebar, and navigation components',
        category: 'layout',
        dependencies: ['lucide-react'],
        version: '1.0.0',
        author: 'Mosaic Team'
    },
    'hero-section': {
        name: 'Hero Section',
        description: '🚀 Eye-catching hero sections with call-to-action',
        category: 'component',
        dependencies: ['lucide-react'],
        version: '1.0.0',
        author: 'Mosaic Team'
    },
    'pricing-table': {
        name: 'Pricing Table',
        description: '💰 Beautiful pricing tables with feature comparisons',
        category: 'component',
        dependencies: ['lucide-react'],
        version: '1.0.0',
        author: 'Mosaic Team'
    },
    'contact-form': {
        name: 'Contact Form',
        description: '📧 Responsive contact forms with validation',
        category: 'component',
        dependencies: ['react-hook-form'],
        version: '1.0.0',
        author: 'Mosaic Team'
    },
    'blog-layout': {
        name: 'Blog Layout',
        description: '📝 Clean blog layout with sidebar and navigation',
        category: 'layout',
        dependencies: ['lucide-react'],
        version: '1.0.0',
        author: 'Mosaic Team'
    }
};
const CATEGORIES = {
    page: { icon: '📄', name: 'Pages', description: 'Complete page templates' },
    component: { icon: '🧩', name: 'Components', description: 'Reusable UI components' },
    layout: { icon: '🏗️', name: 'Layouts', description: 'Page layout templates' }
};
async function listCommand(options) {
    console.log(picocolors_1.default.cyan(`\n ✨ Available Mosaic Tiles\n`));
    const { category } = options;
    // 🎯 Filter by category if specified
    const filteredTiles = category
        ? Object.entries(AVAILABLE_TILES).filter(([_, tile]) => tile.category === category)
        : Object.entries(AVAILABLE_TILES);
    if (filteredTiles.length === 0) {
        console.log(picocolors_1.default.red(`❌ No tiles found for category "${category}"`));
        console.log(picocolors_1.default.yellow(`Available categories: ${Object.keys(CATEGORIES).join(', ')}`));
        return;
    }
    // 📊 Group by category
    const groupedTiles = filteredTiles.reduce((acc, [key, tile]) => {
        if (!acc[tile.category]) {
            acc[tile.category] = [];
        }
        acc[tile.category].push({ key, ...tile });
        return acc;
    }, {});
    // 🎨 Display tiles by category
    Object.entries(groupedTiles).forEach(([cat, tiles]) => {
        const categoryInfo = CATEGORIES[cat];
        console.log(picocolors_1.default.bold(`${categoryInfo.icon} ${categoryInfo.name}`));
        console.log(picocolors_1.default.dim(`   ${categoryInfo.description}\n`));
        tiles.forEach(tile => {
            console.log(`   🎨 ${picocolors_1.default.cyan(picocolors_1.default.bold(tile.key))}`);
            console.log(`      ${tile.name}`);
            console.log(`      ${picocolors_1.default.dim(tile.description)}`);
            if (tile.dependencies.length > 0) {
                console.log(`      ${picocolors_1.default.yellow('Dependencies:')} ${tile.dependencies.join(', ')}`);
            }
            console.log(`      ${picocolors_1.default.green('Version:')} ${tile.version} | ${picocolors_1.default.blue('Author:')} ${tile.author}`);
            console.log('');
        });
    });
    // 📋 Usage instructions
    console.log(picocolors_1.default.cyan('🚀 Usage:'));
    console.log(`   Add a tile: ${picocolors_1.default.bold('mosaic add <tile-name>')}`);
    console.log(`   Example: ${picocolors_1.default.bold('mosaic add landing-page')}`);
    console.log('');
    // 🎯 Category filter info
    if (!category) {
        console.log(picocolors_1.default.cyan('🔍 Filter by category:'));
        Object.entries(CATEGORIES).forEach(([key, cat]) => {
            console.log(`   ${cat.icon} ${picocolors_1.default.bold(`mosaic list -c ${key}`)} - ${cat.description}`);
        });
        console.log('');
    }
    // 📈 Statistics
    const totalTiles = Object.keys(AVAILABLE_TILES).length;
    const pageCount = Object.values(AVAILABLE_TILES).filter(t => t.category === 'page').length;
    const componentCount = Object.values(AVAILABLE_TILES).filter(t => t.category === 'component').length;
    const layoutCount = Object.values(AVAILABLE_TILES).filter(t => t.category === 'layout').length;
    console.log(picocolors_1.default.cyan('📊 Statistics:'));
    console.log(`   ${picocolors_1.default.green(`Total tiles: ${totalTiles}`)}`);
    console.log(`   📄 Pages: ${pageCount} | 🧩 Components: ${componentCount} | 🏗️ Layouts: ${layoutCount}`);
    console.log('');
    console.log(picocolors_1.default.dim(' More tiles coming soon! Happy building with Mosaic! ✨'));
    console.log('');
}
//# sourceMappingURL=list.js.map