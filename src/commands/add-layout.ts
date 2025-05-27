import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

interface AddLayoutOptions {
  // Future options can be added here
}

export async function addLayout(layoutName: string, options: AddLayoutOptions = {}) {
  console.log(chalk.cyan.bold(`\n🎯 Adding layout: ${layoutName}\n`));

  // Detect framework
  const framework = await detectFramework();
  if (!framework) {
    console.error(chalk.red('Could not detect framework. Make sure you are in a MosaicJS project directory.'));
    return;
  }

  const spinner = ora('Creating layout...').start();

  try {
    // Create layout component
    await createLayoutComponent(layoutName, framework);

    spinner.succeed(chalk.green(`Layout "${layoutName}" created successfully!`));

    console.log(chalk.yellow('\nFiles created:'));
    console.log(chalk.cyan(`  src/client/layouts/${layoutName}.${framework === 'react' ? 'tsx' : 'vue'}`));

    console.log(chalk.yellow('\nUsage:'));
    if (framework === 'react') {
      console.log(chalk.cyan(`  // In your page component:`));
      console.log(chalk.cyan(`  import ${layoutName} from '../layouts/${layoutName}';`));
      console.log(chalk.cyan(`  MyPage.layout = (page) => <${layoutName}>{page}</${layoutName}>;`));
    } else {
      console.log(chalk.cyan(`  // In your page component:`));
      console.log(chalk.cyan(`  import ${layoutName} from '../layouts/${layoutName}.vue';`));
      console.log(chalk.cyan(`  defineOptions({ layout: ${layoutName} });`));
    }

  } catch (error) {
    spinner.fail(chalk.red('Failed to create layout'));
    throw error;
  }
}

async function detectFramework(): Promise<'react' | 'vue' | null> {
  try {
    const packageJson = await fs.readJson('package.json');
    
    if (packageJson.dependencies?.['@mosaicjs/react']) {
      return 'react';
    } else if (packageJson.dependencies?.['@mosaicjs/vue']) {
      return 'vue';
    }
    
    return null;
  } catch {
    return null;
  }
}

async function createLayoutComponent(layoutName: string, framework: 'react' | 'vue') {
  const layoutsDir = 'src/client/layouts';
  await fs.ensureDir(layoutsDir);

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

    await fs.writeFile(path.join(layoutsDir, `${layoutName}.tsx`), component);
  } else {
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

    await fs.writeFile(path.join(layoutsDir, `${layoutName}.vue`), component);
  }
} 