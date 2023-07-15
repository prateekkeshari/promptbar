const createElement = (tagName, id) => {
    const element = document.createElement(tagName);
    element.id = id;
    return element;
};

const toggleElement = (element, shouldShow) => {
    element.style.display = shouldShow ? 'block' : 'none';
};

const promptDB = indexedDB.open('promptsDB', 1);

let db;
promptDB.onerror = () => console.log('error opening database');
promptDB.onsuccess = (event) => {
    db = event.target.result;
    loadPrompts();
};
promptDB.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore('prompts', {keyPath: 'id', autoIncrement: true});
};

const loadPrompts = () => {
    const transaction = db.transaction(['prompts'], 'readonly');
    const objectStore = transaction.objectStore('prompts');
    objectStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (!cursor) return;

        const promptContainer = createElement('div', 'promptContainer');
        const promptText = createElement('p', 'promptText');
        const copyButton = createElement('button', 'copyButton');
        const removeButton = createElement('img', 'removeButton');

        promptText.textContent = cursor.value.value.substring(0, 15) + '...';
        copyButton.textContent = 'Copy';
        removeButton.src = 'remove_icon.svg';

        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(cursor.value.value)
                .then(() => alert('Prompt copied to clipboard!'));
        });

        removeButton.addEventListener('click', () => {
            toggleElement(confirmDialog, true);
            yesButton.onclick = () => {
                promptContainer.remove();
                const deleteTransaction = db.transaction(['prompts'], 'readwrite');
                const deleteObjectStore = deleteTransaction.objectStore('prompts');
                const deleteRequest = deleteObjectStore.delete(cursor.value.id);
                deleteRequest.onsuccess = () => console.log('Prompt removed from IndexedDB');
                toggleElement(confirmDialog, false);
            };
        });

        promptContainer.append(promptText, copyButton, removeButton);
        sidebar.appendChild(promptContainer);

        cursor.continue();
    };
};

const sidebar = createElement('div', 'sidebar');
const showButton = createElement('img', 'showButton');
const hideButton = createElement('img', 'hideButton');
const newPromptInput = createElement('textarea', 'newPromptInput');
const saveHint = createElement('p', 'saveHint');
const confirmDialog = createElement('div', 'confirmDialog');
const yesButton = createElement('button', 'yesButton');
const noButton = createElement('button', 'noButton');

showButton.src = 'menu_icon.svg';
showButton.alt = "Show sidebar";
hideButton.src = 'close_icon.svg';
hideButton.alt = "Hide sidebar";
newPromptInput.placeholder = 'Enter a new prompt...';
saveHint.textContent = 'Hit ↩️ to save';
confirmDialog.textContent = 'Are you sure you want to delete this prompt?';
yesButton.textContent = 'Yes';
noButton.textContent = 'No';

showButton.addEventListener('click', () => {
    toggleElement(sidebar, true);
    toggleElement(showButton, false);
    document.body.style.marginRight = '20%';
});

hideButton.addEventListener('click', () => {
    toggleElement(sidebar, false);
    toggleElement(showButton, true);
    document.body.style.marginRight = '0';
});

newPromptInput.addEventListener('keypress', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const newPrompt = newPromptInput.value;
    if (newPrompt.trim() === '') return;

    const promptContainer = createElement('div', 'promptContainer');
    const promptText = createElement('p', 'promptText');
    const copyButton = createElement('button', 'copyButton');
    const removeButton = createElement('img', 'removeButton');

    promptText.textContent = newPrompt.substring(0, 15) + '...';
    copyButton.textContent = 'Copy';
    removeButton.src = 'remove_icon.svg';

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(newPrompt)
            .then(() => alert('Prompt copied to clipboard!'));
    });

    removeButton.addEventListener('click', () => {
        toggleElement(confirmDialog, true);
        yesButton.onclick = () => {
            promptContainer.remove();
            const deleteTransaction = db.transaction(['prompts'], 'readwrite');
            const deleteObjectStore = deleteTransaction.objectStore('prompts');
            const deleteRequest = deleteObjectStore.delete(newPrompt);
            deleteRequest.onsuccess = () => console.log('Prompt removed from IndexedDB');
            toggleElement(confirmDialog, false);
        };
    });

    promptContainer.append(promptText, copyButton, removeButton);
    sidebar.appendChild(promptContainer);
    newPromptInput.value = '';

    const saveTransaction = db.transaction(['prompts'], 'readwrite');
    const saveObjectStore = saveTransaction.objectStore('prompts');
    const saveRequest = saveObjectStore.add({id: newPrompt, value: newPrompt});
    saveRequest.onsuccess = () => console.log('Prompt added to IndexedDB');
});

noButton.addEventListener('click', () => toggleElement(confirmDialog, false));

document.body.append(sidebar, showButton);
sidebar.append(hideButton, newPromptInput, saveHint, confirmDialog);
confirmDialog.append(yesButton, noButton);
