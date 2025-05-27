/**
 * Mosaic Init Command
 *  Transform your Nanoservice-ts project into a beautiful Mosaic application
 */
interface InitOptions {
    style: 'colorful' | 'minimal' | 'dark';
    typescript: boolean;
    force: boolean;
}
/**
 * Initialize Mosaic in an existing Nanoservice-ts project
 */
export declare function initCommand(options: InitOptions): Promise<void>;
export {};
//# sourceMappingURL=init.d.ts.map