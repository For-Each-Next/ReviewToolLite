import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';
import { createDialogEnvironment } from './helpers/dialog-environment.mjs';

const { outputFiles } = await build({
    entryPoints: ['src/dialogs/annotation_editor.ts'],
    bundle: true, write: false, format: 'iife', globalName: 'editorTest',
    plugins: [{ name: 'editor-stub', setup(builder) {
        builder.onLoad({ filter: /\.vue$/ }, () => ({ contents: 'export default {}', loader: 'js' }));
    } }]
});
const settle = () => new Promise(resolve => setImmediate(resolve));

test('replacing an unresolved editor settles its promise and leaves the new dialog open', async () => {
    const environment = createDialogEnvironment();
    const context = vm.createContext(environment.globals);
    vm.runInContext(outputFiles[0].text, context);
    const { openAnnotationEditorDialog } = context.editorTest;
    const options = { sectionPath: 'Test', sentenceText: 'Original' };
    const first = openAnnotationEditorDialog(options);
    await settle();
    const replacement = openAnnotationEditorDialog(options);
    await settle();
    assert.equal((await first).action, 'replaced');
    assert.equal(environment.apps.length, 2);
    assert.equal(environment.elements.size, 1);
    environment.apps[1].render().props.onResolve({ action: 'save', opinion: 'Comment' });
    assert.deepEqual(await replacement, { action: 'save', opinion: 'Comment' });
});
