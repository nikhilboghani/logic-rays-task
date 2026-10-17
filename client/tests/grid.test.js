import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reducer } from '../src/hooks/useGridHistory.js';
import { getGrid, saveGrid, resetGrid } from '../src/services/gridApi.js';
import { readFile } from 'node:fs/promises';
import React from 'react';
import { transformWithOxc } from 'vite';

test('history buttons invoke their callbacks and reflect disabled state', async () => {
    const source = await readFile(new URL('../src/components/HistoryControls.jsx', import.meta.url), 'utf8');
    const { code } = await transformWithOxc(source, 'HistoryControls.jsx', {
        jsx: { runtime: 'classic' },
    });
    const HistoryControls = new Function('React', code.replace('export default', 'return'))(React);
    let undos = 0;
    let redos = 0;
    const props = {
        onUndo: () => undos++, onRedo: () => redos++, canUndo: true, canRedo: true,
    };
    const [undo, redo] = HistoryControls(props).props.children;
    undo.props.onClick();
    redo.props.onClick();
    assert.equal(undos, 1);
    assert.equal(redos, 1);
    const disabled = HistoryControls({ ...props, canUndo: false, canRedo: false }).props.children;
    assert.ok(disabled.every(button => button.props.disabled));
});

test('undo and redo restore selections and clear, with correct history boundaries', () => {
    let state = reducer(initialState, { type: 'LOAD', payload: [2, 2, 7] });
    assert.deepEqual(state.present, [2, 7]);
    assert.equal(reducer(state, { type: 'UNDO' }), state);
    state = reducer(state, { type: 'TOGGLE', payload: 7 });
    assert.deepEqual(state.present, [2]);
    state = reducer(state, { type: 'UNDO' });
    assert.deepEqual(state.present, [2, 7]);
    state = reducer(state, { type: 'REDO' });
    assert.deepEqual(state.present, [2]);
    assert.equal(reducer(state, { type: 'REDO' }), state);
    state = reducer(state, { type: 'RESET' });
    assert.deepEqual(state.present, []);
    state = reducer(state, { type: 'UNDO' });
    assert.deepEqual(state.present, [2]);
    state = reducer(state, { type: 'TOGGLE', payload: 63 });
    assert.deepEqual(state.present, [2, 63]);
    assert.deepEqual(state.future, []);
    state = reducer(state, { type: 'LOAD', payload: [1] });
    assert.deepEqual(state.past, []);
    assert.deepEqual(state.future, []);
});

test('API accepts successful JSON, deduplicates, and forwards cancellation', async (t) => {
    const calls = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        calls.push({ url, options });
        return Response.json({ success: true, data: { selectedBoxes: [3, 3, 5] } });
    });
    const controller = new AbortController();
    assert.deepEqual((await getGrid({ signal: controller.signal })).selectedBoxes, [3, 5]);
    assert.equal(calls[0].url, '/api/grid');
    assert.equal(calls[0].options.signal, controller.signal);
    await saveGrid([3, 3, 5]);
    assert.equal(calls[1].options.method, 'PUT');
    assert.deepEqual(JSON.parse(calls[1].options.body), { selectedBoxes: [3, 5] });
    await resetGrid();
    assert.equal(calls[2].options.method, 'DELETE');
});

test('API reports HTTP, application, malformed JSON, and invalid data errors', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch');
    for (const [response, expected] of [
        [Response.json({ success: false, message: 'Invalid boxes' }, { status: 400 }), /Invalid boxes/],
        [Response.json({ success: false, message: 'Failed' }), /Failed/],
        [new Response('<html>Not found</html>', { status: 404 }), /invalid response.*404/],
        [Response.json({ success: true, data: {} }), /invalid grid data/],
        [Response.json({ success: true, data: { selectedBoxes: [64] } }), /invalid grid data/],
    ]) {
        fetchMock.mock.mockImplementation(async () => response);
        await assert.rejects(getGrid(), expected);
    }
});
