import { test } from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';
import Grid from '../models/Grid.js';

test('HTTP grid load, save, reset, validation, and concurrent creation retry', async (t) => {
    let stored = null;
    let simulateRace = false;
    const calls = [];
    t.mock.method(Grid, 'findOneAndUpdate', async (filter, update, options) => {
        calls.push({ filter, update, options });
        if (simulateRace && options.upsert) {
            simulateRace = false;
            stored = { gridid: 'default-grid', selectedBoxes: [9] };
            throw Object.assign(new Error('Duplicate key'), {
                code: 11000, keyPattern: { gridid: 1 },
            });
        }
        if (!stored) stored = { ...filter, ...update.$setOnInsert };
        Object.assign(stored, update.$set);
        return { ...stored };
    });
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    t.after(() => new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
        server.closeAllConnections();
    }));
    const url = `http://127.0.0.1:${server.address().port}/api/grid`;
    const send = async (method = 'GET', body) => {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
        return { status: response.status, body: await response.json() };
    };

    let result = await send();
    assert.equal(result.status, 200);
    assert.deepEqual(result.body.data.selectedBoxes, []);
    assert.equal(calls[0].options.upsert, true);
    result = await send('PUT', { selectedBoxes: [0, 63, 0] });
    assert.deepEqual(result.body.data.selectedBoxes, [0, 63]);
    assert.deepEqual((await send()).body.data.selectedBoxes, [0, 63]);
    for (const selectedBoxes of [null, '1', [-1], [64], [1.5], ['2']]) {
        assert.equal((await send('PUT', { selectedBoxes })).status, 400);
    }
    assert.equal((await send('PUT', {})).status, 400);
    result = await send('DELETE');
    assert.equal(result.status, 200);
    assert.deepEqual(result.body.data.selectedBoxes, []);
    assert.equal(calls.at(-1).options.runValidators, true);

    stored = null;
    simulateRace = true;
    const concurrent = await Promise.all([send(), send()]);
    for (const response of concurrent) {
        assert.equal(response.status, 200);
        assert.deepEqual(response.body.data.selectedBoxes, [9]);
    }
    assert.ok(calls.some(call => call.options.upsert === false));
    assert.ok(calls.every(call => call.filter.gridid === 'default-grid'));
});

test('model enforces box range and uniqueness outside the controller', async () => {
    await new Grid({ gridid: 'test', selectedBoxes: [0, 63] }).validate();
    for (const selectedBoxes of [[1, 1], [-1], [64], [1.5]]) {
        await assert.rejects(new Grid({ gridid: 'test', selectedBoxes }).validate());
    }
});
