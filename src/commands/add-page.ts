import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

interface AddPageOptions {
  layout?: string;
  route?: string;
}

export async function addPage(pageName: string, options: AddPageOptions = {}) {
  console.log(chalk.cyan.bold(`\n🎯 Adding page: ${pageName}\n`));

  // Detect framework
  const framework = await detectFramework();
  if (!framework) {
    console.error(chalk.red('Could not detect framework. Make sure you are in a MosaicJS project directory.'));
    return;
  }

  const spinner = ora('Creating page...').start();

  try {
    // Generate route if not provided
    const route = options.route || `/${toKebabCase(pageName)}`;

    // Create page component
    await createPageComponent(pageName, framework, options.layout);

    // Create workflow
    await createWorkflow(pageName, route);

    spinner.succeed(chalk.green(`Page "${pageName}" created successfully!`));

    console.log(chalk.yellow('\nFiles created:'));
    console.log(chalk.cyan(`  src/client/pages/${pageName}.${framework === 'react' ? 'tsx' : 'vue'}`));
    console.log(chalk.cyan(`  workflows/json/${toKebabCase(pageName)}.json`));

    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.cyan(`  Visit: http://localhost:3000${route}`));

  } catch (error) {
    spinner.fail(chalk.red('Failed to create page'));
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

async function createPageComponent(pageName: string, framework: 'react' | 'vue', layout?: string) {
  const pagesDir = 'src/client/pages';
  await fs.ensureDir(pagesDir);

  if (framework === 'react') {
    const component = `import React from 'react';
import { Link } from '@mosaicjs/react/client';

interface ${pageName}Props {
  auth: { user: any };
  // Add your props here
}

const ${pageName}: React.FC<${pageName}Props> = ({ auth }) => {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>${pageName}</h1>
      <p>Welcome to the ${pageName} page!</p>
      
      {auth.user && (
        <p>Hello, {auth.user.name}!</p>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <Link href="/">← Back to Home</Link>
      </div>
    </div>
  );
};

${layout ? `${pageName}.layout = (page) => <${layout}>{page}</${layout}>;` : ''}

export default ${pageName};`;

    await fs.writeFile(path.join(pagesDir, `${pageName}.tsx`), component);
  } else {
    const component = `<template>
  <div style="padding: 2rem; font-family: system-ui">
    <h1>${pageName}</h1>
    <p>Welcome to the ${pageName} page!</p>
    
    <p v-if="auth.user">Hello, {{ auth.user.name }}!</p>
    
    <div style="margin-top: 2rem">
      <Link href="/">← Back to Home</Link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Link } from '@mosaicjs/vue/client';

interface ${pageName}Props {
  auth: { user: any };
  // Add your props here
}

defineProps<${pageName}Props>();
</script>`;

    await fs.writeFile(path.join(pagesDir, `${pageName}.vue`), component);
  }
}

async function createWorkflow(pageName: string, route: string) {
  const workflowsDir = 'workflows/json';
  await fs.ensureDir(workflowsDir);

  const workflow = {
    name: `${toKebabCase(pageName)}-page`,
    trigger: { 
      http: { 
        method: "GET", 
        path: route 
      } 
    },
    steps: [
      { name: "render", node: "mosaic" }
    ],
    nodes: {
      render: { 
        inputs: {
          component: pageName
        }
      }
    }
  };

  await fs.writeJson(path.join(workflowsDir, `${toKebabCase(pageName)}.json`), workflow, { spaces: 2 });
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
} 