"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLayout = addLayout;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
async function addLayout(layoutName, options = {}) {
    console.log(chalk_1.default.cyan.bold(`\n🎯 Adding layout: ${layoutName}\n`));
    // Detect framework
    const framework = await detectFramework();
    if (!framework) {
        console.error(chalk_1.default.red('Could not detect framework. Make sure you are in a MosaicJS project directory.'));
        return;
    }
    const spinner = (0, ora_1.default)('Creating layout...').start();
    try {
        // Create layout component
        await createLayoutComponent(layoutName, framework);
        spinner.succeed(chalk_1.default.green(`Layout "${layoutName}" created successfully!`));
        console.log(chalk_1.default.yellow('\nFiles created:'));
        console.log(chalk_1.default.cyan(`  src/client/layouts/${layoutName}.${framework === 'react' ? 'tsx' : 'vue'}`));
        console.log(chalk_1.default.yellow('\nUsage:'));
        if (framework === 'react') {
            console.log(chalk_1.default.cyan(`  // In your page component:`));
            console.log(chalk_1.default.cyan(`  import ${layoutName} from '../layouts/${layoutName}';`));
            console.log(chalk_1.default.cyan(`  MyPage.layout = (page) => <${layoutName}>{page}</${layoutName}>;`));
        }
        else {
            console.log(chalk_1.default.cyan(`  // In your page component:`));
            console.log(chalk_1.default.cyan(`  import ${layoutName} from '../layouts/${layoutName}.vue';`));
            console.log(chalk_1.default.cyan(`  defineOptions({ layout: ${layoutName} });`));
        }
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Failed to create layout'));
        throw error;
    }
}
async function detectFramework() {
    try {
        const packageJson = await fs_extra_1.default.readJson('package.json');
        if (packageJson.dependencies?.['@mosaicjs/react']) {
            return 'react';
        }
        else if (packageJson.dependencies?.['@mosaicjs/vue']) {
            return 'vue';
        }
        return null;
    }
    catch {
        return null;
    }
}
async function createLayoutComponent(layoutName, framework) {
    const layoutsDir = 'src/client/layouts';
    await fs_extra_1.default.ensureDir(layoutsDir);
    if (framework === 'react') {
        const component = `import React from 'react';
import { Link } from '@mosaicjs/react/client';

interface ${layoutName}Props {
  children: React.ReactNode;
}

const ${layoutName}: React.FC<${layoutName}Props> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem'
      }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', textDecoration: 'none' }}>
            ${layoutName}
          </Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>Home</Link>
            <Link href="/about" style={{ textDecoration: 'none' }}>About</Link>
          </div>
        </nav>
      </header>
      
      {/* Main Content */}
      <main>
        {children}
      </main>
      
      {/* Footer */}
      <footer style={{ 
        backgroundColor: '#f9fafb', 
        borderTop: '1px solid #e5e7eb',
        padding: '2rem',
        textAlign: 'center',
        marginTop: 'auto'
      }}>
        <p style={{ color: '#6b7280' }}>
          Built with MosaicJS
        </p>
      </footer>
    </div>
  );
};

export default ${layoutName};`;
        await fs_extra_1.default.writeFile(path_1.default.join(layoutsDir, `${layoutName}.tsx`), component);
    }
    else {
        const component = `<template>
  <div style="min-height: 100vh; font-family: system-ui">
    <!-- Header -->
    <header style="background-color: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 2rem">
      <nav style="display: flex; align-items: center; gap: 2rem">
        <Link href="/" style="font-size: 1.25rem; font-weight: bold; text-decoration: none">
          ${layoutName}
        </Link>
        <div style="display: flex; gap: 1rem">
          <Link href="/" style="text-decoration: none">Home</Link>
          <Link href="/about" style="text-decoration: none">About</Link>
        </div>
      </nav>
    </header>
    
    <!-- Main Content -->
    <main>
      <slot />
    </main>
    
    <!-- Footer -->
    <footer style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 2rem; text-align: center; margin-top: auto">
      <p style="color: #6b7280">
        Built with MosaicJS
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Link } from '@mosaicjs/vue/client';
</script>`;
        await fs_extra_1.default.writeFile(path_1.default.join(layoutsDir, `${layoutName}.vue`), component);
    }
}
//# sourceMappingURL=add-layout.js.map