import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import esbuild from 'esbuild';
import { createUserscript } from '../build.mjs';

async function compileApplication(body) {
    const { outputFiles } = await esbuild.build({
        entryPoints: [fileURLToPath(new URL('../src/bootstrap.ts', import.meta.url))],
        bundle: true,
        write: false,
        format: 'esm',
        target: 'es2019',
        plugins: [{
            name: 'test-application',
            setup(build) {
                build.onLoad({ filter: /\/main\.ts$/ }, () => ({
                    // Use the real state module to catch premature MediaWiki access.
                    contents: `import state from './state';
window.reviewToolModuleUser = state.userName;
export async function init() {
${body}
}`,
                    loader: 'ts',
                    resolveDir: fileURLToPath(new URL('../src/', import.meta.url))
                }));
            }
        }]
    });
    return outputFiles[0].text;
}

function setup(mode, { ready = false, dependencyError } = {}) {
    const errors = [];
    const requests = [];
    let removed = false;
    let resolveDependencies;
    const dependencies = new Promise(resolve => { resolveDependencies = resolve; });
    const page = vm.createContext({
        console: { error: (...args) => errors.push(args) }
    });
    page.window = page;
    if (ready) page.RLQ = { push: callback => callback() };
    const loadMediaWiki = () => {
        page.mw = {
            loader: {
                using: module => {
                    requests.push(module);
                    return dependencyError ? Promise.reject(dependencyError) : dependencies;
                }
            },
            config: { get: () => 'Reviewer' }
        };
    };
    if (ready) loadMediaWiki();
    const sandbox = vm.createContext({
        document: {
            createElement: tag => {
                assert.equal(tag, 'script');
                return { textContent: '', remove: () => { removed = true; } };
            },
            documentElement: { appendChild: script => vm.runInContext(script.textContent, page) }
        }
    });
    return {
        page, requests, errors, loadMediaWiki,
        resolveDependencies: () => resolveDependencies(),
        run: async body => {
            const application = await compileApplication(body);
            if (mode === 'userscript') {
                vm.runInContext(await createUserscript(application, '1.2.3'), sandbox);
                assert.equal(removed, true);
            } else {
                const { code } = await esbuild.transform(application, {
                    format: 'iife', target: 'es2019', minify: true
                });
                vm.runInContext(code, page);
            }
        }
    };
}

const settle = () => new Promise(resolve => setImmediate(resolve));

test('userscript metadata identifies the release and limits automatic execution to Chinese Wikipedia', async () => {
    const timestamp = '2026-09-22T22:50:39.358Z';
    const script = await createUserscript('', '1.2.3', timestamp);
    assert.ok(script.startsWith('// ==UserScript==\n'));
    const [metadata, body] = script.split('// ==/UserScript==');
    assert.ok(metadata.includes('// ReviewToolLite (based on [[User:SuperGrey/gadgets/ReviewTool]])\n'));
    assert.ok(metadata.includes(`// Timestamp: ${timestamp}\n`));
    assert.match(metadata, /@homepageURL\s+https:\/\/github\.com\/For-Each-Next\/ReviewToolLite\n/);
    assert.match(metadata, /@version\s+1\.2\.3\n/);
    assert.deepEqual([...metadata.matchAll(/@match\s+(\S+)/g)].map(match => match[1]), [
        'https://zh.wikipedia.org/*', 'https://zh.m.wikipedia.org/*'
    ]);
    assert.match(metadata, /@grant\s+none\n/);
    assert.match(metadata, /@run-at\s+document-end\n/);
    assert.doesNotMatch(body, /\/\/ (?:ReviewToolLite|Repository:|Release:|Timestamp:)/);
    assert.equal(script.match(/\/\/ <nowiki>/g).length, 1);
    assert.equal(script.match(/\/\/ <\/nowiki>/g).length, 1);
    assert.ok(body.startsWith('\n// <nowiki>\n'));
    assert.ok(body.endsWith('// </nowiki>\n'));
});

for (const mode of ['userscript', 'bundle']) {
    test(`${mode} waits for MediaWiki and dependencies before evaluating application modules`, async () => {
        const { run, page, requests, errors, loadMediaWiki, resolveDependencies } = setup(mode);
        await run('window.reviewToolUser = mw.config.get("wgUserName");');
        assert.equal(page.RLQ.length, 1);
        assert.equal(page.reviewToolModuleUser, undefined);
        assert.equal(page.reviewToolUser, undefined);
        assert.deepEqual(requests, []);
        loadMediaWiki();
        page.RLQ.shift()();
        await settle();
        assert.deepEqual(requests, ['mediawiki.util']);
        assert.equal(page.reviewToolModuleUser, undefined);
        assert.equal(page.reviewToolUser, undefined);
        resolveDependencies();
        await settle();
        assert.equal(page.reviewToolModuleUser, 'Reviewer');
        assert.equal(page.reviewToolUser, 'Reviewer');
        assert.deepEqual(errors, []);
    });

    test(`${mode} runs in the page context after startup and preserves embedded code characters`, async () => {
        const { run, page, errors, resolveDependencies } = setup(mode, { ready: true });
        const text = '批註 "quoted" `template` ${literal} </script>\n\\';
        await run(`window.reviewToolText = ${JSON.stringify(text)};`);
        resolveDependencies();
        await settle();
        assert.equal(page.reviewToolModuleUser, 'Reviewer');
        assert.equal(page.reviewToolText, text);
        assert.deepEqual(errors, []);
    });

    test(`${mode} reports dependency failures without evaluating application modules`, async () => {
        const failure = new Error('ResourceLoader failed');
        const { run, page, errors } = setup(mode, { ready: true, dependencyError: failure });
        await run('window.reviewToolStarted = true;');
        await settle();
        assert.equal(page.reviewToolModuleUser, undefined);
        assert.equal(page.reviewToolStarted, undefined);
        assert.equal(errors.length, 1);
        assert.equal(errors[0][1], failure);
    });

    test(`${mode} reports application initialization failures`, async () => {
        const { run, page, errors, resolveDependencies } = setup(mode, { ready: true });
        await run('throw new Error("Application failed");');
        resolveDependencies();
        await settle();
        assert.equal(page.reviewToolModuleUser, 'Reviewer');
        assert.equal(errors.length, 1);
        assert.equal(errors[0][1].message, 'Application failed');
    });
}
