import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compileModule } from './helpers/load-module.mjs';

const createDialog = await compileModule('dialog.ts');

function setup() {
    const elements = new Map();
    const timers = new Map();
    const listeners = new Map();
    let timerId = 0;
    const document = {
        getElementById: id => elements.get(id) ?? null,
        createElement: () => ({ id: '', remove() { elements.delete(this.id); } }),
        body: { appendChild: element => elements.set(element.id, element) }
    };
    const window = {
        addEventListener: (type, callback) => listeners.set(type, callback),
        removeEventListener: type => listeners.delete(type),
        setTimeout: callback => { timers.set(++timerId, callback); return timerId; },
        clearTimeout: id => timers.delete(id)
    };
    const api = createDialog({ document, window });
    const app = () => ({ mount() {}, unmounts: 0, unmount() { this.unmounts++; } });
    const flush = () => {
        const pending = [...timers.values()];
        timers.clear();
        pending.forEach(callback => callback());
    };
    return { api, app, elements, listeners, flush };
}

test('closing a dialog unmounts Vue and removes its mount and IME listeners', () => {
    const { api, app, elements, listeners, flush } = setup();
    const current = app();
    let closed = 0;
    api.mountApp(current);
    assert.equal(elements.size, 1);
    assert.equal(listeners.size, 7);
    api.closeDialogAfterTransition(() => closed++);
    assert.equal(current.unmounts, 0);
    flush();
    assert.equal(current.unmounts, 1);
    assert.equal(api.getMountedApp(), null);
    assert.equal(elements.size, 0);
    assert.equal(listeners.size, 0);
    assert.equal(closed, 1);
});

test('a stale close timer cannot remove a replacement dialog or run its close callback', () => {
    const { api, app, elements, listeners, flush } = setup();
    const previous = app();
    const replacement = app();
    api.mountApp(previous);
    api.closeDialogAfterTransition(() => assert.fail('stale callback ran'));
    api.mountApp(replacement);
    flush();
    assert.equal(previous.unmounts, 1);
    assert.equal(replacement.unmounts, 0);
    assert.equal(api.getMountedApp(), replacement);
    assert.equal(elements.size, 1);
    assert.equal(listeners.size, 7);
});

test('repeated close requests only unmount and notify once', () => {
    const { api, app, flush } = setup();
    const current = app();
    let closed = 0;
    api.mountApp(current);
    api.closeDialogAfterTransition(() => closed++);
    api.closeDialogAfterTransition(() => closed++);
    flush();
    assert.equal(current.unmounts, 1);
    assert.equal(closed, 1);
});
