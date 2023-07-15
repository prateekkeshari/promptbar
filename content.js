// Create the sidebar
let sidebar = document.createElement('div');
sidebar.id = 'sidebar';
document.body.appendChild(sidebar);

// Create the show button
let showButton = document.createElement('img');
showButton.id = 'showButton';
showButton.src = 'menu_icon.svg';
showButton.title = "Show sidebar"; // Added title for better accessibility
showButton.addEventListener('mouseover', function () { showButton.style.opacity = '0.7'; }); // Added hover state
showButton.addEventListener('mouseout', function () { showButton.style.opacity = '1'; }); // Reset on mouse out
showButton.addEventListener('click', function () {
    sidebar.style.display = 'block';
    showButton.style.display = 'none';
    document.body.style.marginRight = '20%';
});
document.body.appendChild(showButton);

// Create the hide button
let hideButton = document.createElement('img');
hideButton.id = 'hideButton';
hideButton.src = 'close_icon.svg';
hideButton.title = "Hide sidebar"; // Added title for better accessibility
hideButton.addEventListener('mouseover', function () { hideButton.style.opacity = '0.7'; }); // Added hover state
hideButton.addEventListener('mouseout', function () { hideButton.style.opacity = '1'; }); // Reset on mouse out
hideButton.addEventListener('click', function () {
    sidebar.style.display = 'none';
    showButton.style.display = 'block';
    document.body.style.marginRight = '0';
});
sidebar.appendChild(hideButton);


// Create the textarea for entering a new prompt
let newPromptInput = document.createElement('textarea');
newPromptInput.id = 'newPromptInput';
newPromptInput.placeholder = 'Enter a new prompt...';
sidebar.appendChild(newPromptInput);

// Create the hint for saving a prompt
let saveHint = document.createElement('p');
saveHint.id = 'saveHint';
saveHint.textContent = 'Hit ↩️ to save';
sidebar.appendChild(saveHint);

newPromptInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        let newPrompt = newPromptInput.value;
        if (newPrompt.trim() !== '') {
            // Create the container for the saved prompt
            let promptContainer = document.createElement('div');
            promptContainer.id = 'promptContainer';

            // Add the text of the saved prompt
            let promptText = document.createElement('p');
            promptText.id = 'promptText';
            promptText.textContent = newPrompt.substring(0, 15) + '...';
            promptContainer.appendChild(promptText);

            // Add the copy button
            let copyButton = document.createElement('button');
            copyButton.id = 'copyButton';
            copyButton.textContent = 'Copy';
            copyButton.addEventListener('click', function () {
                let tempInput = document.createElement('input');
                document.body.appendChild(tempInput);
                tempInput.value = newPrompt;
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                alert('Prompt copied to clipboard!');
            });
            promptContainer.appendChild(copyButton);

            // Add a remove button
            let removeButton = document.createElement('img');
            removeButton.id = 'removeButton';
            removeButton.src = 'remove_icon.svg';
            removeButton.addEventListener('click', function () {
                // Show the confirmation dialog
                confirmDialog.style.display = 'block';
                yesButton.onclick = function () {
                    promptContainer.remove();
                    // Remove the prompt from Chrome storage
                    chrome.storage.local.remove(newPrompt);
                    // Hide the confirmation dialog
                    confirmDialog.style.display = 'none';
                };
            });
            promptContainer.appendChild(removeButton);

            sidebar.appendChild(promptContainer);
            newPromptInput.value = '';

            // Save the prompt to Chrome storage
            chrome.storage.local.set({ [newPrompt]: true });
        }
    }
});

// Create the confirmation dialog
let confirmDialog = document.createElement('div');
confirmDialog.id = 'confirmDialog';
confirmDialog.textContent = 'Are you sure you want to delete this prompt?';
sidebar.appendChild(confirmDialog);

// Create the yes button for the confirmation dialog
let yesButton = document.createElement('button');
yesButton.id = 'yesButton';
yesButton.textContent = 'Yes';
confirmDialog.appendChild(yesButton);

// Create the no button for the confirmation dialog
let noButton = document.createElement('button');
noButton.id = 'noButton';
noButton.textContent = 'No';
noButton.addEventListener('click', function () {
    // Hide the confirmation dialog
    confirmDialog.style.display = 'none';
});
confirmDialog.appendChild(noButton);
