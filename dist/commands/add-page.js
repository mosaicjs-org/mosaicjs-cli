"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPage = addPage;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
async function addPage(pageName, options = {}) {
    console.log(chalk_1.default.cyan.bold(`\n🎯 Adding page: ${pageName}\n`));
    // Detect framework
    const framework = await detectFramework();
    if (!framework) {
        console.error(chalk_1.default.red('Could not detect framework. Make sure you are in a MosaicJS project directory.'));
        return;
    }
    const spinner = (0, ora_1.default)('Creating page...').start();
    try {
        // Generate route if not provided
        const route = options.route || `/${toKebabCase(pageName)}`;
        // Create page component
        await createPageComponent(pageName, framework, options.layout);
        // Create workflow
        await createWorkflow(pageName, route);
        spinner.succeed(chalk_1.default.green(`Page "${pageName}" created successfully!`));
        console.log(chalk_1.default.yellow('\nFiles created:'));
        console.log(chalk_1.default.cyan(`  src/client/pages/${pageName}.${framework === 'react' ? 'tsx' : 'vue'}`));
        console.log(chalk_1.default.cyan(`  workflows/json/${toKebabCase(pageName)}.json`));
        console.log(chalk_1.default.yellow('\nNext steps:'));
        console.log(chalk_1.default.cyan(`  Visit: http://localhost:3000${route}`));
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Failed to create page'));
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
async function createPageComponent(pageName, framework, layout) {
    const pagesDir = 'src/client/pages';
    await fs_extra_1.default.ensureDir(pagesDir);
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
        await fs_extra_1.default.writeFile(path_1.default.join(pagesDir, `${pageName}.tsx`), component);
    }
    else {
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
        await fs_extra_1.default.writeFile(path_1.default.join(pagesDir, `${pageName}.vue`), component);
    }
}
async function createWorkflow(pageName, route) {
    const workflowsDir = 'workflows/json';
    await fs_extra_1.default.ensureDir(workflowsDir);
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
    await fs_extra_1.default.writeJson(path_1.default.join(workflowsDir, `${toKebabCase(pageName)}.json`), workflow, { spaces: 2 });
}
function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
}
//# sourceMappingURL=add-page.js.map