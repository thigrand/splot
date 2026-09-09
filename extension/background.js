import {
  buildSnapshot,
  createDraft,
  mergeApprovedRecord,
  validateHttpUrl,
  validateSubmission
} from './material.js';

const STATE_KEY = 'splotState';
const DOWNLOAD_FILENAME = 'splot-materials.json';

function initialState() {
  return { records: [], revision: 0, lastCompletedRevision: 0, pending: null, lastError: null };
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

export class SaveCoordinator {
  constructor(api) {
    this.api = api;
    this.state = null;
    this.initializing = null;
    this.tail = Promise.resolve();
  }

  enqueue(action) {
    const result = this.tail.then(action, action);
    this.tail = result.catch(() => undefined);
    return result;
  }

  async load() {
    if (this.state) return this.state;
    if (!this.initializing) {
      this.initializing = this.api.storage.get(STATE_KEY).then((stored) => {
        const value = stored[STATE_KEY];
        if (value === undefined) return initialState();
        if (!value || !Array.isArray(value.records) || !Number.isInteger(value.revision)) {
          throw new Error('Stan rozszerzenia jest uszkodzony. Nie zapisano niczego do pliku.');
        }
        return value;
      }).then((state) => {
        this.state = state;
        return state;
      });
    }
    return this.initializing;
  }

  async persist() {
    await this.api.storage.set({ [STATE_KEY]: this.state });
  }

  async createDraft(tab) {
    return this.enqueue(async () => {
      await this.load();
      const url = validateHttpUrl(tab?.url);
      let record = this.state.records.find((item) => item.url === url);
      if (!record) {
        record = createDraft({ url, title: tab?.title });
        this.state.records.push(record);
        this.state.revision += 1;
        await this.persist();
      }
      return { record };
    });
  }

  async submitAndClose({ tabId, sourceUrl, description, tags, importance, intent }) {
    return this.enqueue(async () => {
      await this.load();
      const submitted = validateSubmission({ url: sourceUrl, description, tags, importance, intent });
      const index = this.state.records.findIndex((item) => item.url === submitted.url);
      if (index < 0) throw new Error('Nie znaleziono wstępnego zapisu tej karty. Otwórz popup ponownie.');

      const merged = mergeApprovedRecord(this.state.records[index], submitted);
      if (merged !== this.state.records[index]) {
        this.state.records[index] = merged;
        this.state.revision += 1;
        await this.persist();
      }
      await this.writeSnapshot();
      const closed = await this.closeOnlyMatchingTab(tabId, submitted.url);
      return { record: this.state.records[index], closed };
    });
  }

  async closeOnlyMatchingTab(tabId, expectedUrl) {
    let tab;
    try {
      tab = await this.api.tabs.get(tabId);
    } catch {
      return false;
    }
    if (tab.url !== expectedUrl) return false;
    try {
      await this.api.tabs.remove(tabId);
      return true;
    } catch {
      return false;
    }
  }

  async writeSnapshot() {
    await this.settlePreviousPending();
    const revision = this.state.revision;
    const json = `${JSON.stringify(buildSnapshot(this.state.records), null, 2)}\n`;
    this.state.pending = { revision, downloadId: null };
    this.state.lastError = null;
    await this.persist();

    let objectUrl;
    try {
      objectUrl = await this.api.createBlob(json);
      const downloadId = await this.api.downloads.download({
        url: objectUrl,
        filename: DOWNLOAD_FILENAME,
        conflictAction: 'overwrite',
        saveAs: false
      });
      this.state.pending.downloadId = downloadId;
      await this.persist();
      await this.waitForDownload(downloadId);
      this.state.lastCompletedRevision = revision;
      this.state.pending = null;
      this.state.lastError = null;
      await this.persist();
    } catch (error) {
      this.state.lastError = errorMessage(error);
      await this.persist();
      throw new Error(`Nie udało się zapisać pliku: ${this.state.lastError}`);
    } finally {
      if (objectUrl) {
        try {
          await this.api.releaseBlob(objectUrl);
        } catch {
          // Plik ma już własny stan pobrania; błąd porządkowania nie unieważnia zapisu.
        }
      }
    }
  }

  async settlePreviousPending() {
    const pending = this.state.pending;
    if (!pending) return;
    if (!pending.downloadId) return;

    const item = await this.api.downloads.get(pending.downloadId);
    if (!item || item.state === 'interrupted') {
      this.state.lastError = item?.error || 'Pobieranie zostało przerwane.';
      this.state.pending = null;
      await this.persist();
      return;
    }
    if (item.state === 'complete') {
      this.state.lastCompletedRevision = pending.revision;
      this.state.pending = null;
      this.state.lastError = null;
      await this.persist();
      return;
    }
    await this.waitForDownload(pending.downloadId);
    this.state.lastCompletedRevision = pending.revision;
    this.state.pending = null;
    this.state.lastError = null;
    await this.persist();
  }

  async waitForDownload(downloadId) {
    const current = await this.api.downloads.get(downloadId);
    if (!current || current.state === 'interrupted') {
      throw new Error(current?.error || 'Pobieranie zostało przerwane.');
    }
    if (current.state === 'complete') return;
    await this.api.downloads.waitForTerminalState(downloadId);
  }

  async recover() {
    return this.enqueue(async () => {
      await this.load();
      await this.settlePreviousPending();
    });
  }
}

async function ensureOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL('offscreen.html');
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });
  if (!contexts.length) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['BLOBS'],
      justification: 'Tworzenie adresu Blob dla lokalnego pliku JSON.'
    });
  }
}

async function createBlob(json) {
  await ensureOffscreenDocument();
  const response = await chrome.runtime.sendMessage({ target: 'offscreen', type: 'createBlob', json });
  if (!response?.ok) throw new Error('Nie udało się utworzyć danych do pobrania.');
  return response.objectUrl;
}

async function releaseBlob(objectUrl) {
  try {
    await chrome.runtime.sendMessage({ target: 'offscreen', type: 'releaseBlob', objectUrl });
  } finally {
    await chrome.offscreen.closeDocument();
  }
}

function createDownloadsAdapter() {
  return {
    download: (options) => chrome.downloads.download(options),
    async get(id) {
      const items = await chrome.downloads.search({ id });
      return items[0];
    },
    waitForTerminalState(id) {
      return new Promise((resolve, reject) => {
        const onChanged = (delta) => {
          if (delta.id !== id || !delta.state) return;
          chrome.downloads.onChanged.removeListener(onChanged);
          if (delta.state.current === 'complete') resolve();
          else reject(new Error(delta.error?.current || 'Pobieranie zostało przerwane.'));
        };
        chrome.downloads.onChanged.addListener(onChanged);
      });
    }
  };
}

if (globalThis.chrome?.runtime?.id) {
  const coordinator = new SaveCoordinator({
    storage: chrome.storage.local,
    downloads: createDownloadsAdapter(),
    createBlob,
    releaseBlob,
    tabs: chrome.tabs
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.target !== 'background') return;
    const action = message.type === 'createDraft'
      ? coordinator.createDraft(message.tab)
      : message.type === 'submitAndClose'
        ? coordinator.submitAndClose(message.payload)
        : Promise.reject(new Error('Nieznane żądanie.'));
    action.then((value) => sendResponse({ ok: true, ...value }))
      .catch((error) => sendResponse({ ok: false, error: errorMessage(error) }));
    return true;
  });

  chrome.runtime.onStartup.addListener(() => coordinator.recover().catch(() => undefined));
  coordinator.recover().catch(() => undefined);
}
