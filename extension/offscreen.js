const objectUrls = new Map();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target !== 'offscreen') return;

  if (message.type === 'createBlob') {
    const objectUrl = URL.createObjectURL(new Blob([message.json], { type: 'application/json;charset=utf-8' }));
    objectUrls.set(objectUrl, true);
    sendResponse({ ok: true, objectUrl });
    return;
  }

  if (message.type === 'releaseBlob') {
    if (objectUrls.has(message.objectUrl)) {
      URL.revokeObjectURL(message.objectUrl);
      objectUrls.delete(message.objectUrl);
    }
    sendResponse({ ok: true });
  }
});
