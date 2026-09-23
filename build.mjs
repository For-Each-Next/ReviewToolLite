import esbuild from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse, compileScript, compileTemplate, rewriteDefault } from '@vue/compiler-sfc';

const { version } = JSON.parse(await readFile(new URL('./package.json', import.meta.url), 'utf8'));

const watch = process.argv.includes('--watch');
const release = process.argv.includes('--release');
const distDirectory = new URL('./dist/', import.meta.url);
const repository = 'https://github.com/For-Each-Next/ReviewToolLite';
const upstreamRepository = 'https://github.com/QZGao/ReviewTool';
const attribution = 'ReviewToolLite (based on [[User:SuperGrey/gadgets/ReviewTool]])';
const modifications = 'For-Each-Next, with AI assistance';
const outputOptions = { charset: 'utf8', target: ['es2019'], format: 'iife' };

export async function createUserscript(application, version, timestamp = new Date().toISOString()) {
    const header = `// ==UserScript==
// ${attribution}
// Original project: ${upstreamRepository}
// Modifications: ${modifications}
// Timestamp: ${timestamp}
//
// @name         ReviewToolLite
// @namespace    ${repository}
// @version      ${version}
// @description  Annotate Chinese Wikipedia articles and copy review feedback as wikitext.
// @author       Quinn Gao (QZGao / SuperGrey) https://zh.wikipedia.org/wiki/User:SuperGrey
// @license      MIT
// @homepageURL  ${repository}
// @supportURL   ${repository}/issues
// @match        https://zh.wikipedia.org/*
// @match        https://zh.m.wikipedia.org/*
// @run-at       document-end
// @grant        none
// @noframes
// ==/UserScript==
// <nowiki>`;

    // The application owns startup; this adapter only crosses the userscript sandbox.
    // Format the complete script so application code keeps consistent indentation.
    const { code } = await esbuild.transform(`
function reviewToolApplication() {
${application}
}

function installInPage(application) {
    const script = document.createElement('script');
    script.textContent = '(' + application.toString() + ')();';
    document.documentElement.appendChild(script);
    script.remove();
}

installInPage(reviewToolApplication);
`, {
        ...outputOptions,
        minify: false,
        banner: header,
        footer: '// </nowiki>'
    });
    return code;
}

function rewriteVueNamedImports(code) {
    return code.replace(/import\s*\{([^}]+)\}\s*from\s*["']vue["'];?/g, (_match, spec) => {
        const entries = spec
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)
            .map((part) => {
                const aliasMatch = part.split(/\s+as\s+/i).map((s) => s.trim()).filter(Boolean);
                if (aliasMatch.length === 2) {
                    return { original: aliasMatch[0], local: aliasMatch[1] };
                }
                return { original: part, local: part };
            });
        const lines = entries.map(({ original, local }) => {
            if (original === 'defineComponent') {
                return `const ${local} = (...args) => (window.Vue?.defineComponent?.(...args) ?? args[0]);`;
            }
            return `const ${local} = (...args) => window.Vue.${original}(...args);`;
        });
        return lines.join('\n');
    });
}

const vueSfcPlugin = {
    name: 'vue-sfc',
    setup(build) {
        build.onLoad({ filter: /\.vue$/ }, async (args) => {
            const source = await readFile(args.path, 'utf8');
            const { descriptor } = parse(source, { filename: args.path });
            const id = createHash('sha256').update(args.path).digest('hex').slice(0, 8);

            let scriptCode = 'const __sfc__ = {};';
            let bindingMetadata;
            const scriptLang = descriptor.scriptSetup?.lang ?? descriptor.script?.lang ?? '';
            const parserPlugins = scriptLang === 'ts' || scriptLang === 'tsx' ? ['typescript'] : [];
            if (descriptor.scriptSetup) {
                const compiled = compileScript(descriptor, { id });
                bindingMetadata = compiled.bindings;
                scriptCode = rewriteDefault(compiled.content, '__sfc__', parserPlugins);
            } else if (descriptor.script) {
                scriptCode = rewriteDefault(descriptor.script.content, '__sfc__', parserPlugins);
            }
            scriptCode = rewriteVueNamedImports(scriptCode);

            let templateCode = '';
            if (descriptor.template?.content.trim()) {
                const compiledTemplate = compileTemplate({
                    source: descriptor.template.content,
                    filename: args.path,
                    id,
                    compilerOptions: {
                        mode: 'function',
                        runtimeGlobalName: 'Vue',
                        hoistStatic: false,
                        bindingMetadata
                    }
                });
                const importRegex = /^import\s*\{([^}]+)\}\s*from\s*["']vue["'];?/m;
                const constRegex = /^const\s*\{([^}]+)\}\s*=\s*Vue;?/m;
                const importMatch = compiledTemplate.code.match(importRegex);
                const constMatch = compiledTemplate.code.match(constRegex);
                const helperList = (importMatch?.[1] ?? constMatch?.[1] ?? '').trim();
                templateCode = compiledTemplate.code
                    .replace(importRegex, '')
                    .replace(constRegex, '')
                    .replace(/^return function render/m, 'function render')
                    .replace(/^export function render/m, 'function render')
                    .replace(/^export const render/m, 'const render');
                if (helperList) {
                    templateCode = templateCode.replace(/function render\(([^)]*)\)\s*\{/, (match) => {
                        return `${match}\n  const {${helperList}} = window.Vue;\n`;
                    });
                }
                templateCode += '\n__sfc__.render = render;';
            }

            const contents = `${scriptCode}\n${templateCode}\nexport default __sfc__;\n`;
            return { contents, loader: 'ts' };
        });
    }
};

export function createCssModule(css) {
    // Preserve line breaks and escape template syntax without changing the CSS.
    const text = css.replace(/\\|`|\$\{/g, '\\$&');
    return `export default \`${text}\`;\n`;
}

const cssTextPlugin = {
    name: 'css-text',
    setup(build) {
        build.onLoad({ filter: /\.css$/ }, async (args) => {
            const text = await readFile(args.path, 'utf8');
            return { contents: createCssModule(text), loader: 'js' };
        });
    }
};

const distributionPlugin = {
    name: 'distribution',
    setup(build) {
        build.onEnd(async ({ errors, outputFiles }) => {
            if (errors.length) return;
            const timestamp = new Date().toISOString();
            const banner = `// ${attribution}
// Original project: ${upstreamRepository}
// Modifications: ${modifications}
// Repository: ${repository}
// Release: ${version}
// Timestamp: ${timestamp}
// <nowiki>`;
            const footer = '// </nowiki>';
            await mkdir(distDirectory, { recursive: true });
            for (const file of outputFiles) {
                const { code } = await esbuild.transform(file.text, {
                    ...outputOptions,
                    minify: release,
                    banner,
                    footer
                });
                await writeFile(file.path, code);
            }
            // Use the readable bundle for the userscript, including release builds.
            const userscript = await createUserscript(outputFiles[0].text, version, timestamp);
            await writeFile(new URL('ReviewToolLite.user.js', distDirectory), userscript);
        });
    }
};

const buildOptions = {
    entryPoints: [fileURLToPath(new URL('./src/bootstrap.ts', import.meta.url))],
    outfile: fileURLToPath(new URL('./dist/bundled.js', import.meta.url)),
    bundle: true,
    write: false,
    ...outputOptions,
    format: 'esm',
    minify: false,
    sourcemap: false,
    plugins: [vueSfcPlugin, cssTextPlugin, distributionPlugin],
    loader: {
        '.vue': 'ts'
    },
    logLevel: 'info',
};

// Importing the userscript generator in tests must not start a build or watcher.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
        if (watch) {
            const context = await esbuild.context(buildOptions);
            await context.watch();
            console.log('[ReviewTool build] Watching for changes...');
        } else {
            await esbuild.build(buildOptions);
            console.log('[ReviewTool build] Build complete');
        }
    } catch (error) {
        console.error('[ReviewTool build] Build failed:', error);
        process.exitCode = 1;
    }
}
