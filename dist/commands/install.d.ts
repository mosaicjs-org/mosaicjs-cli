interface InstallOptions {
    framework: 'react' | 'vue' | 'svelte';
    template: 'basic' | 'dashboard' | 'blog';
    skipInstall?: boolean;
    force?: boolean;
}
export declare function installMosaic(options?: InstallOptions): Promise<void>;
export {};
//# sourceMappingURL=install.d.ts.map