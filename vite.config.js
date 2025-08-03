import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    root: 'src',
    base: './',
    publicDir: '../public',
    
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        assetsInlineLimit: 4096,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'src/index.html')
            },
            output: {
                assetFileNames: 'assets/[name].[hash].[ext]',
                chunkFileNames: 'js/[name].[hash].js',
                entryFileNames: 'js/[name].[hash].js'
            }
        }
    },
    
    resolve: {
        alias: [
            {
                find: /^~.+/,
                replacement: (val) => val.replace(/^~/, ""),
            },
            {
                find: '@',
                replacement: path.resolve(__dirname, 'src'),
            },
            {
                find: '/js',
                replacement: path.resolve(__dirname, 'src/js'),
            },
            {
                find: '/scss',
                replacement: path.resolve(__dirname, 'src/scss'),
            },
            {
                find: '/modules',
                replacement: path.resolve(__dirname, 'src/js/modules'),
            }
        ],
    },
    
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `
                    @use "@/scss/abstracts/variables" as *;
                    @use "@/scss/abstracts/mixins" as *;
                    @use "@/scss/abstracts/functions" as *;
                `,
                implementation: require('sass'),
            },
        },
        modules: {
            localsConvention: 'camelCaseOnly',
        },
    },
    
    server: {
        open: true,
        hmr: {
            overlay: true,
        },
        fs: {
            strict: true,
        },
    },
    
    optimizeDeps: {
        include: [
            '/js/main.js',
            '/js/modules/theme-switcher.js'
        ],
        exclude: [],
    },
    
    plugins: [
        // Add any additional plugins here
    ],
    
    define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    }
});