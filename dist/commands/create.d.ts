interface CreateOptions {
    framework: 'react' | 'vue' | 'svelte';
    template: 'basic' | 'dashboard' | 'blog';
    skipInstall?: boolean;
}
export declare function createProject(projectName: string | undefined, options?: CreateOptions): Promise<void>;
export {};
//# sourceMappingURL=create.d.ts.map