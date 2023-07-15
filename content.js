// Create an element with an ID
const createElement = (tagName, id) => {
    const element = document.createElement(tagName);
    element.id = id;
    return element;
};

// Show or hide an element
const toggleElement = (element, shouldShow) => {
    element.style.display = shouldShow ? 'block' : 'none';
};

// Create an IndexedDB instance
let db;
const request = indexedDB.open('promptsDB', 1);
request.onerror = function(event) {
    console.log('error opening database');
};
request.onsuccess = function(event) {
    db = event.target.result;
    loadPrompts();
};
request.onupgradeneeded = function(event) {
    db = event.target.result;
    const objectStore = db.createObjectStore('prompts', {keyPath: 'id', autoIncrement: true});
};

// Function to load prompts from IndexedDB
function loadPrompts() {
    const transaction = db.transaction(['prompts'], 'readonly');
    const objectStore = transaction.objectStore('prompts');
    objectStore.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            // Create the container for the saved prompt
            let promptContainer = createElement('div', 'promptContainer');

            // Add the text of the saved prompt
            let promptText = createElement('p', 'promptText');
            promptText.textContent = cursor.value.value.substring(0, 15) + '...';
            promptContainer.appendChild(promptText);

            // Add the copy button
            let copyButton = createElement('button', 'copyButton');
            copyButton.textContent = 'Copy';
            copyButton.addEventListener('click', function () {
                navigator.clipboard.writeText(cursor.value.value).then(() => {
                    alert('Prompt copied to clipboard!');
                });
            });
            promptContainer.appendChild(copyButton);

            // Add a remove button
            let removeButton = createElement('img', 'removeButton');
            removeButton.src = 'remove_icon.svg';
            removeButton.addEventListener('click', function () {
                // Show the confirmation dialog
                toggleElement(confirmDialog, true);
                yesButton.onclick = function () {
                    promptContainer.remove();
                    // Remove the prompt from IndexedDB
                    const deleteTransaction = db.transaction(['prompts'], 'readwrite');
                    const deleteObjectStore = deleteTransaction.objectStore('prompts');
                    const deleteRequest = deleteObjectStore.delete(cursor.value.id);
                    deleteRequest.onsuccess = function(event) {
                        console.log('Prompt removed from IndexedDB');
                    };
                    toggleElement(confirmDialog, false);
                };
            });
            promptContainer.appendChild(removeButton);

            sidebar.appendChild(promptContainer);

            cursor.continue();
        }
    };
}

// Create the sidebar
const sidebar = createElement('div', 'sidebar');
document.body.appendChild(sidebar);

// Create the show button
const showButton = createElement('img', 'showButton');
showButton.src = 'menu_icon.svg';
showButton.alt = "Show sidebar";
showButton.addEventListener('click', () => {
    toggleElement(sidebar, true);
    toggleElement(showButton, false);
    document.body.style.marginRight = '20%';
});
document.body.appendChild(showButton);

// Create the hide button
const hideButton = createElement('img', 'hideButton');
hideButton.src = 'close_icon.svg';
hideButton.alt = "Hide sidebar";
hideButton.addEventListener('click', () => {
    toggleElement(sidebar, false);
    toggleElement(showButton, true);
    document.body.style.marginRight = '0';
});
sidebar.appendChild(hideButton);

// Create the textarea for entering a new prompt
const newPromptInput = createElement('textarea', 'newPromptInput');
newPromptInput.placeholder = 'Enter a new prompt...';
sidebar.appendChild(newPromptInput);

// Create the hint for saving a prompt
const saveHint = createElement('p', 'saveHint');
saveHint.textContent = 'Hit ↩️ to save';
sidebar.appendChild(saveHint);

newPromptInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        let newPrompt = newPromptInput.value;
        if (newPrompt.trim() !== '') {
            // Create the container for the saved prompt
            let promptContainer = createElement('div', 'promptContainer');

            // Add the text of the saved prompt
            let promptText = createElement('p', 'promptText');
            promptText.textContent = newPrompt.substring(0, 15) + '...';
            promptContainer.appendChild(promptText);

            // Add the copy button
            let copyButton = createElement('button', 'copyButton');
            copyButton.textContent = 'Copy';
            copyButton.addEventListener('click', function () {
                navigator.clipboard.writeText(newPrompt).then(() => {
                    alert('Prompt copied to clipboard!');
                });
            });
            promptContainer.appendChild(copyButton);

            // Add a remove button
            let removeButton = createElement('img', 'removeButton');
            removeButton.src = 'remove_icon.svg';
            removeButton.addEventListener('click', function () {
                // Show the confirmation dialog
                toggleElement(confirmDialog, true);
                yesButton.onclick = function () {
                    promptContainer.remove();
                    // Remove the prompt from IndexedDB
                    const transaction = db.transaction(['prompts'], 'readwrite');
                    const objectStore = transaction.objectStore('prompts');
                    const request = objectStore.delete(newPrompt);
                    request.onsuccess = function(event) {
                        console.log('Prompt removed from IndexedDB');
                    };
                    toggleElement(confirmDialog, false);
                };
            });
            promptContainer.appendChild(removeButton);

            sidebar.appendChild(promptContainer);
            newPromptInput.value = '';

            // Save the prompt to IndexedDB
            const transaction = db.transaction(['prompts'], 'readwrite');
            const objectStore = transaction.objectStore('prompts');
            const request = objectStore.add({id: newPrompt, value: newPrompt});
            request.onsuccess = function(event) {
                console.log('Prompt added to IndexedDB');
            };
        }
    }
});

// Create the confirmation dialog
const confirmDialog = createElement('div', 'confirmDialog');
confirmDialog.textContent = 'Are you sure you want to delete this prompt?';
sidebar.appendChild(confirmDialog);

// Create the yes button for the confirmation dialog
const yesButton = createElement('button', 'yesButton');
yesButton.textContent = 'Yes';
confirmDialog.appendChild(yesButton);

// Create the no button for the confirmation dialog
const noButton = createElement('button', 'noButton');
noButton.textContent = 'No';
noButton.addEventListener('click', () => {
    // Hide the confirmation dialog
    toggleElement(confirmDialog, false);
});
confirmDialog.appendChild(noButton);
