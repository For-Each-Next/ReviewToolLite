import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from 'esbuild';
import { vueSfcPlugin } from '../build.mjs';

for (const [name, source] of [
    ['malformed markup', '<template><div></template>'],
    ['invalid template expressions', '<template><div>{{ value + }}</div></template>']
]) {
    test(`build rejects ${name} instead of distributing a broken component`, async t => {
        const directory = await mkdtemp(join(tmpdir(), 'reviewtool-vue-'));
        t.after(() => rm(directory, { recursive: true, force: true }));
        const path = join(directory, 'invalid.vue');
        await writeFile(path, source);
        await assert.rejects(build({
            entryPoints: [path], bundle: true, write: false, logLevel: 'silent', plugins: [vueSfcPlugin]
        }), /Build failed/);
    });
}
