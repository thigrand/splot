import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveCoordinator } from '../extension/background.js';

function createApi({ terminal = 'complete' } = {}) {
  const data = {};
  const downloads = [];
  const closed = [];
  return {
    data,
    downloads,
    closed,
    storage: {
      async get(key) { return { [key]: data[key] }; },
      async set(values) { Object.assign(data, structuredClone(values)); }
    },
    downloadsApi: {
      async download(options) { downloads.push(options); return downloads.length; },
      async get(id) { return { id, state: terminal, error: terminal === 'interrupted' ? 'NETWORK_FAILED' : undefined }; },
      async waitForTerminalState() { throw new Error('Nie powinno czekać przy gotowym pobraniu.'); }
    },
    createBlob: async (json) => `blob:test/${encodeURIComponent(json)}`,
    releaseBlob: async () => undefined,
    tabs: {
      async get(id) { return { id, url: 'https://example.org/a' }; },
      async remove(id) { closed.push(id); }
    }
  };
}

test('wstępny zapis pobiera pełną migawkę do wymaganej ścieżki', async () => {
  const fake = createApi();
  const coordinator = new SaveCoordinator({
    storage: fake.storage, downloads: fake.downloadsApi, createBlob: fake.createBlob,
    releaseBlob: fake.releaseBlob, tabs: fake.tabs
  });
  const result = await coordinator.createDraft({ id: 7, url: 'https://example.org/a', title: 'Test' });
  assert.equal(result.persisted, true);
  assert.equal(fake.downloads[0].filename, 'agregator/materialy.json');
  assert.equal(fake.downloads[0].conflictAction, 'overwrite');
  assert.equal(fake.downloads[0].saveAs, false);
  assert.equal(fake.data.splotState.lastCompletedRevision, 1);
});

test('zatwierdzenie zapisuje przed zamknięciem tylko zgodnej karty', async () => {
  const fake = createApi();
  const coordinator = new SaveCoordinator({
    storage: fake.storage, downloads: fake.downloadsApi, createBlob: fake.createBlob,
    releaseBlob: fake.releaseBlob, tabs: fake.tabs
  });
  await coordinator.createDraft({ id: 7, url: 'https://example.org/a', title: 'Test' });
  await coordinator.submitAndClose({
    tabId: 7, sourceUrl: 'https://example.org/a', description: 'opis', tags: 'Dzieci',
    importance: 'less_important', intent: 'summarize'
  });
  assert.equal(fake.downloads.length, 2);
  assert.deepEqual(fake.closed, [7]);
  assert.equal(fake.data.splotState.records[0].description, 'opis');
});

test('przerwany zapis nie zamyka karty i pozwala kolejce przyjąć kolejną operację', async () => {
  const fake = createApi({ terminal: 'interrupted' });
  const coordinator = new SaveCoordinator({
    storage: fake.storage, downloads: fake.downloadsApi, createBlob: fake.createBlob,
    releaseBlob: fake.releaseBlob, tabs: fake.tabs
  });
  await assert.rejects(coordinator.createDraft({ id: 7, url: 'https://example.org/a', title: 'Test' }), /Nie udało się/);
  assert.deepEqual(fake.closed, []);
  await assert.rejects(coordinator.createDraft({ id: 8, url: 'https://example.org/b', title: 'Drugi' }), /Nie udało się/);
  assert.equal(fake.data.splotState.records.length, 2);
});

test('nie zamyka karty po przejściu na inny adres, mimo udanego zapisu', async () => {
  const fake = createApi();
  fake.tabs.get = async (id) => ({ id, url: 'https://example.org/nowa-strona' });
  const coordinator = new SaveCoordinator({
    storage: fake.storage, downloads: fake.downloadsApi, createBlob: fake.createBlob,
    releaseBlob: fake.releaseBlob, tabs: fake.tabs
  });
  await coordinator.createDraft({ id: 7, url: 'https://example.org/a', title: 'Test' });
  const result = await coordinator.submitAndClose({
    tabId: 7, sourceUrl: 'https://example.org/a', description: '', tags: '',
    importance: 'important', intent: 'remember'
  });
  assert.equal(result.closed, false);
  assert.deepEqual(fake.closed, []);
  assert.equal(fake.data.splotState.lastCompletedRevision, 1);
});
