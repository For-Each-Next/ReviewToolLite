import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const { outputFiles } = await build({
    entryPoints: [fileURLToPath(new URL('../src/annotations.ts', import.meta.url))],
    bundle: true,
    write: false,
    format: 'iife',
    globalName: 'annotations'
});

function memoryStorage() {
    const values = new Map();
    return {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: key => values.delete(key)
    };
}

function setup() {
    const window = { localStorage: memoryStorage(), sessionStorage: memoryStorage() };
    const context = vm.createContext({
        window,
        mw: { config: { get: () => 'Test user' } },
        console: { error() {}, warn() {} }
    });
    vm.runInContext(outputFiles[0].text, context);
    return { api: context.annotations, ...window };
}

const pageName = '測試條目';
const key = `reviewtool:annotations:${pageName}`;
const annotation = {
    id: 'example', sectionPath: '序言', sentencePos: '1.2', sentenceText: '原文',
    opinion: '建議', createdBy: 'Reviewer', createdAt: 1234, resolved: false,
    textAnchor: { start: 5, end: 7, quote: '原文' }
};
const backup = annotations => JSON.stringify({
    exportedAt: 5678,
    groups: [{ sectionPath: '序言', annotations }]
});

test('imports an exported backup with author, positions and anchors intact', () => {
    const { api, localStorage } = setup();
    assert.equal(api.importAnnotations(pageName, backup([annotation])), 1);
    const stored = JSON.parse(localStorage.getItem(key));
    assert.equal(stored.pageName, pageName);
    assert.deepEqual(stored.annotations, [annotation]);
    assert.equal(api.buildAnnotationGroups(pageName)[0].annotations[0].opinion, '建議');
});

test('merges without replacing local edits or duplicating repeated imports', () => {
    const { api } = setup();
    api.importAnnotations(pageName, backup([{ ...annotation, opinion: '本地修改' }]));
    const json = backup([annotation, { ...annotation, id: 'new' }, { ...annotation, id: 'new' }]);
    assert.equal(api.importAnnotations(pageName, json), 1);
    assert.equal(api.importAnnotations(pageName, json), 0);
    assert.equal(api.loadAnnotations(pageName).annotations.length, 2);
    assert.equal(api.getAnnotation(pageName, annotation.id).opinion, '本地修改');
});

test('accepts legacy exports without positions, UTF-8 BOMs, and stored annotation backups', () => {
    const { api } = setup();
    const { sentencePos, textAnchor, ...legacy } = annotation;
    assert.equal(api.importAnnotations(pageName, '\uFEFF' + backup([legacy])), 1);
    assert.equal(api.getAnnotation(pageName, legacy.id).sentencePos, '');
    assert.equal(api.getAnnotation(pageName, legacy.id).textAnchor, undefined);
    assert.equal(api.importAnnotations(pageName, JSON.stringify({
        pageName: '另一條目', annotations: [{ ...annotation, id: 'stored' }]
    })), 1);
    assert.equal(api.loadAnnotations(pageName).pageName, pageName);
});

for (const [name, json] of [
    ['malformed JSON', '{'],
    ['unrelated JSON', '{"hello":"world"}'],
    ['invalid groups', '{"groups":[null]}'],
    ['partially invalid entries', backup([annotation, { id: 'invalid' }])],
    ['empty IDs', backup([{ ...annotation, id: ' ' }])],
    ['non-finite timestamps', backup([annotation]).replace('1234', '1e400')]
]) {
    test(`rejects ${name} without changing saved annotations`, () => {
        const { api, localStorage } = setup();
        api.importAnnotations(pageName, backup([{ ...annotation, id: 'existing' }]));
        const before = localStorage.getItem(key);
        assert.throws(() => api.importAnnotations(pageName, json));
        assert.equal(localStorage.getItem(key), before);
    });
}

test('empty backups leave existing annotations intact', () => {
    const { api, localStorage } = setup();
    api.importAnnotations(pageName, backup([annotation]));
    const before = localStorage.getItem(key);
    assert.equal(api.importAnnotations(pageName, backup([])), 0);
    assert.equal(localStorage.getItem(key), before);
});

test('uses session fallback without reading a stale local copy', () => {
    const { api, localStorage, sessionStorage } = setup();
    api.importAnnotations(pageName, backup([annotation]));
    localStorage.setItem = () => { throw new Error('Quota exceeded'); };
    assert.equal(api.importAnnotations(pageName, backup([{ ...annotation, id: 'new' }])), 1);
    assert.equal(localStorage.getItem(key), null);
    assert.equal(JSON.parse(sessionStorage.getItem(key)).annotations.length, 2);
    assert.equal(api.loadAnnotations(pageName).annotations.length, 2);
});

test('reports failed persistence while preserving the existing backup', () => {
    const { api, localStorage, sessionStorage } = setup();
    api.importAnnotations(pageName, backup([annotation]));
    const before = localStorage.getItem(key);
    localStorage.setItem = sessionStorage.setItem = () => { throw new Error('Quota exceeded'); };
    assert.throws(() => api.importAnnotations(pageName, backup([{ ...annotation, id: 'new' }])), /Unable to save/);
    assert.equal(localStorage.getItem(key), before);
});
