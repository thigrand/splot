const form = document.querySelector('#form');
const status = document.querySelector('#status');
const saveButton = document.querySelector('#save');
let sourceTab;

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function selectedValue(name) {
  return form.elements[name].value;
}

async function send(type, payload) {
  const response = await chrome.runtime.sendMessage({ target: 'background', type, ...payload });
  if (!response?.ok) throw new Error(response?.error || 'Wystąpił nieznany błąd.');
  return response;
}

async function initialize() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  sourceTab = tab;
  try {
    const response = await send('createDraft', { tab });
    const { record } = response;
    form.description.value = record.description;
    form.tags.value = record.tags.join(', ');
    form.elements.importance.value = record.importance;
    form.elements.intent.value = record.intent;
    setStatus('');
  } catch (error) {
    setStatus(error.message, true);
    saveButton.disabled = true;
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  saveButton.disabled = true;
  setStatus('Zapisuję plik…');
  try {
    const response = await send('submitAndClose', {
      payload: {
        tabId: sourceTab.id,
        sourceUrl: sourceTab.url,
        description: form.description.value,
        tags: form.tags.value,
        importance: selectedValue('importance'),
        intent: selectedValue('intent')
      }
    });
    if (response.closed) {
      setStatus('Zapisano. Karta zostanie zamknięta.');
      window.close();
    } else {
      setStatus('Zapisano, ale karta zmieniła adres albo została już zamknięta.');
      saveButton.disabled = false;
    }
  } catch (error) {
    setStatus(error.message, true);
    saveButton.disabled = false;
  }
});

initialize();
