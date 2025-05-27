"use strict";
/**
 *  Doctor Command - Health check for your Mosaic installation
 * Diagnoses common issues and provides helpful solutions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorCommand = doctorCommand;
const ora_1 = __importDefault(require("ora"));
const picocolors_1 = __importDefault(require("picocolors"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const execa_1 = require("execa");
async function doctorCommand() {
    console.log(picocolors_1.default.cyan(`\n 🩺 Mosaic Health Check\n`));
    const checks = [];
    const spinner = (0, ora_1.default)('Running health checks...').start();
    try {
        // 🏗️ Check if we're in a project directory
        if (!fs_extra_1.default.existsSync('package.json')) {
            checks.push({
                name: 'Project Structure',
                status: 'fail',
                message: 'No package.json found',
                solution: 'Run this command in your project root directory'
            });
        }
        else {
            checks.push({
                name: 'Project Structure',
                status: 'pass',
                message: 'package.json found'
            });
        }
        // 📦 Check Mosaic core dependency
        if (fs_extra_1.default.existsSync('package.json')) {
            const packageJson = await fs_extra_1.default.readJson('package.json');
            const hasMosaicCore = packageJson.dependencies?.['@mosaic/core'] ||
                packageJson.devDependencies?.['@mosaic/core'];
            if (hasMosaicCore) {
                checks.push({
                    name: 'Mosaic Core',
                    status: 'pass',
                    message: `@mosaic/core ${hasMosaicCore} installed`
                });
            }
            else {
                checks.push({
                    name: 'Mosaic Core',
                    status: 'fail',
                    message: '@mosaic/core not found',
                    solution: 'Run: npm install @mosaic/core'
                });
            }
            // 🎨 Check for Mosaic CLI
            const hasMosaicCLI = packageJson.dependencies?.['mosaicjs'] ||
                packageJson.devDependencies?.['mosaicjs'];
            if (hasMosaicCLI) {
                checks.push({
                    name: 'Mosaic CLI',
                    status: 'pass',
                    message: `mosaicjs ${hasMosaicCLI} installed`
                });
            }
            else {
                checks.push({
                    name: 'Mosaic CLI',
                    status: 'warn',
                    message: 'mosaicjs not installed locally',
                    solution: 'Consider: npm install -D mosaicjs (or use npx mosaicjs@latest)'
                });
            }
            // 🔧 Check for React dependencies
            const hasReact = packageJson.dependencies?.['react'] ||
                packageJson.devDependencies?.['react'];
            const hasReactDOM = packageJson.dependencies?.['react-dom'] ||
                packageJson.devDependencies?.['react-dom'];
            if (hasReact && hasReactDOM) {
                checks.push({
                    name: 'React Dependencies',
                    status: 'pass',
                    message: `React ${hasReact} and ReactDOM ${hasReactDOM} installed`
                });
            }
            else {
                checks.push({
                    name: 'React Dependencies',
                    status: 'fail',
                    message: 'React or ReactDOM missing',
                    solution: 'Run: npm install react react-dom'
                });
            }
            // 🎨 Check for TypeScript
            const hasTypeScript = packageJson.dependencies?.['typescript'] ||
                packageJson.devDependencies?.['typescript'];
            if (hasTypeScript) {
                checks.push({
                    name: 'TypeScript',
                    status: 'pass',
                    message: `TypeScript ${hasTypeScript} installed`
                });
            }
            else {
                checks.push({
                    name: 'TypeScript',
                    status: 'warn',
                    message: 'TypeScript not found',
                    solution: 'Consider installing: npm install -D typescript @types/react @types/react-dom'
                });
            }
            // 🎨 Check for Tailwind CSS
            const hasTailwind = packageJson.dependencies?.['tailwindcss'] ||
                packageJson.devDependencies?.['tailwindcss'];
            if (hasTailwind) {
                checks.push({
                    name: 'Tailwind CSS',
                    status: 'pass',
                    message: `Tailwind CSS ${hasTailwind} installed`
                });
            }
            else {
                checks.push({
                    name: 'Tailwind CSS',
                    status: 'warn',
                    message: 'Tailwind CSS not found',
                    solution: 'Consider installing: npm install -D tailwindcss'
                });
            }
        }
        // 📁 Check directory structure
        const requiredDirs = [
            'src/client',
            'src/client/pages',
            'src/client/components',
            'src/client/layouts'
        ];
        let directoriesExist = 0;
        for (const dir of requiredDirs) {
            if (fs_extra_1.default.existsSync(dir)) {
                directoriesExist++;
            }
        }
        if (directoriesExist === requiredDirs.length) {
            checks.push({
                name: 'Directory Structure',
                status: 'pass',
                message: 'All required directories exist'
            });
        }
        else if (directoriesExist > 0) {
            checks.push({
                name: 'Directory Structure',
                status: 'warn',
                message: `${directoriesExist}/${requiredDirs.length} directories exist`,
                solution: 'Run: mosaic init to create missing directories'
            });
        }
        else {
            checks.push({
                name: 'Directory Structure',
                status: 'fail',
                message: 'Mosaic directories not found',
                solution: 'Run: mosaic init to set up project structure'
            });
        }
        // 🔧 Check for Vite configuration
        const viteConfigExists = fs_extra_1.default.existsSync('vite.config.ts') || fs_extra_1.default.existsSync('vite.config.js');
        if (viteConfigExists) {
            checks.push({
                name: 'Vite Configuration',
                status: 'pass',
                message: 'Vite config file found'
            });
        }
        else {
            checks.push({
                name: 'Vite Configuration',
                status: 'warn',
                message: 'No Vite config found',
                solution: 'Consider creating vite.config.ts for optimal builds'
            });
        }
        // 🔧 Check Node.js version
        try {
            const { stdout } = await (0, execa_1.execa)('node', ['--version']);
            const nodeVersion = stdout.trim();
            const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
            if (majorVersion >= 18) {
                checks.push({
                    name: 'Node.js Version',
                    status: 'pass',
                    message: `Node.js ${nodeVersion} (compatible)`
                });
            }
            else {
                checks.push({
                    name: 'Node.js Version',
                    status: 'warn',
                    message: `Node.js ${nodeVersion} (recommend v18+)`,
                    solution: 'Consider upgrading to Node.js 18 or later'
                });
            }
        }
        catch (error) {
            checks.push({
                name: 'Node.js Version',
                status: 'fail',
                message: 'Could not detect Node.js version',
                solution: 'Ensure Node.js is properly installed'
            });
        }
        spinner.stop();
        // 📊 Display results
        console.log(picocolors_1.default.cyan('🔍 Health Check Results:\n'));
        let passCount = 0;
        let warnCount = 0;
        let failCount = 0;
        checks.forEach(check => {
            const icon = check.status === 'pass' ? '✅' :
                check.status === 'warn' ? '⚠️' : '❌';
            const color = check.status === 'pass' ? picocolors_1.default.green :
                check.status === 'warn' ? picocolors_1.default.yellow : picocolors_1.default.red;
            console.log(`${icon} ${picocolors_1.default.bold(check.name)}: ${color(check.message)}`);
            if (check.solution) {
                console.log(`   💡 ${picocolors_1.default.dim(check.solution)}`);
            }
            console.log('');
            if (check.status === 'pass')
                passCount++;
            else if (check.status === 'warn')
                warnCount++;
            else
                failCount++;
        });
        // 📈 Summary
        console.log(picocolors_1.default.cyan('📈 Summary:'));
        console.log(`   ${picocolors_1.default.green(`✅ ${passCount} checks passed`)}`);
        if (warnCount > 0)
            console.log(`   ${picocolors_1.default.yellow(`⚠️  ${warnCount} warnings`)}`);
        if (failCount > 0)
            console.log(`   ${picocolors_1.default.red(`❌ ${failCount} issues found`)}`);
        // 🎯 Overall status
        if (failCount === 0 && warnCount === 0) {
            console.log(picocolors_1.default.green(`\n🎉 Your Mosaic installation looks great! ✨`));
        }
        else if (failCount === 0) {
            console.log(picocolors_1.default.yellow(`\n Your Mosaic installation is mostly healthy! Consider addressing the warnings above.`));
        }
        else {
            console.log(picocolors_1.default.red(`\n🚨 Issues found with your Mosaic installation. Please address the errors above.`));
            console.log(picocolors_1.default.cyan(`💡 Run ${picocolors_1.default.bold('mosaic init')} to fix common setup issues.`));
        }
        console.log('');
    }
    catch (error) {
        spinner.fail('Health check failed');
        console.error(picocolors_1.default.red(`Error: ${error}`));
        process.exit(1);
    }
}
//# sourceMappingURL=doctor.js.map