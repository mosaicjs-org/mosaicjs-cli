"use strict";
/**
 *  Update Command - Update Mosaic dependencies to latest versions
 * Keeps your Mosaic installation fresh and up-to-date
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommand = updateCommand;
const ora_1 = __importDefault(require("ora"));
const picocolors_1 = __importDefault(require("picocolors"));
const inquirer_1 = __importDefault(require("inquirer"));
const execa_1 = require("execa");
const fs_extra_1 = __importDefault(require("fs-extra"));
const semver_1 = __importDefault(require("semver"));
// 🎨 Mosaic packages to update
const MOSAIC_PACKAGES = [
    '@mosaic/core',
    'mosaicjs'
];
// 🔧 Related packages that might need updating
const RELATED_PACKAGES = [
    'react',
    'react-dom',
    '@types/react',
    '@types/react-dom',
    'typescript',
    'vite',
    'tailwindcss'
];
async function updateCommand(options) {
    const spinner = (0, ora_1.default)();
    try {
        console.log(picocolors_1.default.cyan(`\n 🔄 Updating Mosaic Dependencies\n`));
        // 🏗️ Check if we're in a project directory
        if (!fs_extra_1.default.existsSync('package.json')) {
            console.log(picocolors_1.default.red(`❌ No package.json found. Please run this command in your project root.`));
            return;
        }
        const packageJson = await fs_extra_1.default.readJson('package.json');
        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        // 🔍 Find installed Mosaic packages
        const installedMosaicPackages = MOSAIC_PACKAGES.filter(pkg => allDeps[pkg]);
        if (installedMosaicPackages.length === 0) {
            console.log(picocolors_1.default.red(`❌ No Mosaic packages found in this project.`));
            console.log(picocolors_1.default.yellow(`💡 Run ${picocolors_1.default.cyan('mosaic init')} to set up Mosaic first.`));
            return;
        }
        console.log(picocolors_1.default.green(`🎯 Found ${installedMosaicPackages.length} Mosaic package(s) to update:`));
        installedMosaicPackages.forEach(pkg => {
            console.log(`   📦 ${pkg} (current: ${allDeps[pkg]})`);
        });
        console.log('');
        // 🤔 Ask what to update
        const { updateChoices } = await inquirer_1.default.prompt([
            {
                type: 'checkbox',
                name: 'updateChoices',
                message: 'What would you like to update?',
                choices: [
                    {
                        name: ' Mosaic packages (recommended)',
                        value: 'mosaic',
                        checked: true
                    },
                    {
                        name: '🔧 Related packages (React, TypeScript, Vite, etc.)',
                        value: 'related',
                        checked: false
                    }
                ]
            }
        ]);
        if (updateChoices.length === 0) {
            console.log(picocolors_1.default.yellow(` No packages selected for update.`));
            return;
        }
        let packagesToUpdate = [];
        // 📦 Add Mosaic packages
        if (updateChoices.includes('mosaic')) {
            packagesToUpdate.push(...installedMosaicPackages);
        }
        // 🔧 Add related packages
        if (updateChoices.includes('related')) {
            const installedRelatedPackages = RELATED_PACKAGES.filter(pkg => allDeps[pkg]);
            packagesToUpdate.push(...installedRelatedPackages);
        }
        console.log(picocolors_1.default.cyan(`\n🔍 Checking for updates...`));
        // 🔍 Check for available updates
        const updates = [];
        for (const pkg of packagesToUpdate) {
            spinner.start(`Checking ${pkg}...`);
            try {
                const versionFlag = options.prerelease ? '--tag=next' : '--tag=latest';
                const { stdout } = await (0, execa_1.execa)('npm', ['view', pkg, 'version', versionFlag]);
                const latestVersion = stdout.trim();
                const currentVersion = allDeps[pkg].replace(/^[\^~]/, ''); // Remove ^ or ~
                if (semver_1.default.gt(latestVersion, currentVersion)) {
                    updates.push({
                        package: pkg,
                        current: currentVersion,
                        latest: latestVersion
                    });
                }
                spinner.stop();
            }
            catch (error) {
                spinner.fail(`Failed to check ${pkg}`);
                console.log(picocolors_1.default.yellow(`⚠️  Could not check updates for ${pkg}`));
            }
        }
        if (updates.length === 0) {
            console.log(picocolors_1.default.green(`\n🎉 All packages are up to date! ✨`));
            return;
        }
        // 📋 Show available updates
        console.log(picocolors_1.default.cyan(`\n📋 Available updates:\n`));
        updates.forEach(update => {
            console.log(`   📦 ${picocolors_1.default.bold(update.package)}`);
            console.log(`      ${picocolors_1.default.red(update.current)} → ${picocolors_1.default.green(update.latest)}`);
            console.log('');
        });
        // 🤔 Confirm updates
        const { confirmUpdate } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'confirmUpdate',
                message: `Update ${updates.length} package(s)?`,
                default: true
            }
        ]);
        if (!confirmUpdate) {
            console.log(picocolors_1.default.yellow(` Update cancelled.`));
            return;
        }
        // 🚀 Perform updates
        spinner.start(` Updating packages...`);
        try {
            const updateCommands = updates.map(update => `${update.package}@${update.latest}`);
            await (0, execa_1.execa)('npm', ['install', ...updateCommands]);
            spinner.succeed(`🎉 Successfully updated ${updates.length} package(s)!`);
            // 📋 Show what was updated
            console.log(picocolors_1.default.green(`\n✅ Updated packages:`));
            updates.forEach(update => {
                console.log(`   📦 ${update.package}: ${picocolors_1.default.red(update.current)} → ${picocolors_1.default.green(update.latest)}`);
            });
            // 🎯 Post-update recommendations
            console.log(picocolors_1.default.cyan(`\n🎉 Next steps:`));
            console.log(`  🔧 Test your application to ensure everything works`);
            console.log(`  📚 Check changelogs for breaking changes`);
            console.log(`  🚀 Run your dev server: ${picocolors_1.default.cyan('npm run dev')}`);
            // 🩺 Suggest health check
            console.log(`  🩺 Run health check: ${picocolors_1.default.cyan('mosaic doctor')}`);
            console.log(`\n Happy building with the latest Mosaic! ✨\n`);
        }
        catch (error) {
            spinner.fail(`❌ Failed to update packages`);
            console.error(picocolors_1.default.red(`Error: ${error}`));
            console.log(picocolors_1.default.yellow(`\n💡 Try updating packages manually:`));
            updates.forEach(update => {
                console.log(`   npm install ${update.package}@${update.latest}`);
            });
            process.exit(1);
        }
    }
    catch (error) {
        spinner.fail(`❌ Update failed`);
        console.error(picocolors_1.default.red(`Error: ${error}`));
        process.exit(1);
    }
}
//# sourceMappingURL=update.js.map