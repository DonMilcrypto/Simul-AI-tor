// Get elements
const addressBar = document.getElementById('addressbar');
const simulationArea = document.getElementById('simulation-area');
const landingPage = document.getElementById('landing-page');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');
const publishModal = document.getElementById('publish-modal');
const publishModalClose = publishModal.querySelector('.modal-close');
const publishedUrlInput = document.getElementById('published-url');
const copyPublishedUrlButton = document.getElementById('copy-published-url');
const openPublishedUrlButton = document.getElementById('open-published-url');
const improvePromptModal = document.getElementById('improve-prompt-modal');
const improvePromptTextarea = document.getElementById('improved-prompt-text');
const useImprovedPromptButton = document.getElementById('use-improved-prompt');
const cancelImprovedPromptButton = document.getElementById('cancel-improved-prompt');
const editElementModal = document.getElementById('edit-element-modal');
const editElementInput = document.getElementById('edit-element-input');
const updateElementButton = document.getElementById('update-element');
const cancelEditElementButton = document.getElementById('cancel-edit-element');
const bookmarksPanel = document.getElementById('bookmarks-panel');
const modelSelectBtn = document.getElementById('model-select-btn');
const modelOptions = document.getElementById('model-options');
let currentModel = 'google/flan-t5-xxl'; // Example: Default Hugging Face model


// Event Listeners
addressBar.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        createSimulation();
    }
});

publishModalClose.addEventListener('click', () => {
    publishModal.classList.add('hidden');
});

copyPublishedUrlButton.addEventListener('click', () => {
    publishedUrlInput.select();
    document.execCommand('copy');
});

openPublishedUrlButton.addEventListener('click', () => {
    window.open(publishedUrlInput.value, '_blank');
});

modelSelectBtn.addEventListener('click', toggleModelOptions);

modelOptions.addEventListener('click', (event) => {
    if (event.target.classList.contains('model-option')) {
        currentModel = event.target.dataset.model;
        modelSelectBtn.textContent = event.target.textContent; // Update button text
        toggleModelOptions(); // Hide options
    }
});

// ... Add event listeners for improve prompt, edit element, bookmarks, etc.

// Functions

function createSimulation() {
    const prompt = addressBar.value;

    showLoading("Generating Simulation...");

    fetch('api_proxy.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: prompt,
            model: currentModel,
            parameters: { // Example parameters - customize!
                max_new_tokens: 500,
                temperature: 0.7
            }
        })
    })
        .then(response => response.json())
        .then(data => {
            hideLoading();

            if (data.success && data.generated_text) {
                const generatedText = data.generated_text;
                const generatedHTML = convertTextToHTML(generatedText);

                simulationArea.innerHTML = generatedHTML;
                landingPage.classList.add('hidden');
                simulationArea.classList.remove('hidden');
                addRightClickListeners();

                // Example: Add data-editable to all paragraphs:
                const editableElements = simulationArea.querySelectorAll('p'); // Customize selector
                editableElements.forEach(el => el.setAttribute('data-editable', 'true'));


            } else {
                console.error("Hugging Face API Error:", data);
                showError(data.error || "Failed to generate simulation.");
            }
        })
        .catch(error => {
            hideLoading();
            console.error("Network Error:", error);
            showError("Network error. Please try again later.");
        });
}


function showLoading(message) {
    loadingText.textContent = message;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function showError(message) {
    alert(message); // Placeholder: Replace with a better error display
}


function addRightClickListeners() {
    const editableElements = simulationArea.querySelectorAll('[data-editable]');

    editableElements.forEach(element => {
        element.addEventListener('contextmenu', function (event) {
            event.preventDefault();

            editElementInput.value = element.textContent;
            editElementModal.classList.remove('hidden');
            editElementModal.dataset.targetElement = element;
        });
    });

    updateElementButton.addEventListener('click', () => {
        const targetElement = editElementModal.dataset.targetElement;
        if (targetElement) {
            targetElement.textContent = editElementInput.value;
            editElementModal.classList.add('hidden');
        }
    });

    cancelEditElementButton.addEventListener('click', () => {
        editElementModal.classList.add('hidden');
    });
}

function publishSimulation() {
    // ... Your existing publish logic to get the URL ...

    const publishedURL = "https://example.com/your-published-simulation"; // Replace with actual URL

    publishedUrlInput.value = publishedURL;
    publishModal.classList.remove('hidden');
}

function toggleModelOptions() {
    modelOptions.classList.toggle('hidden');
}


function convertTextToHTML(text) {
    if (!text) return "";

    let html = text.replace(/\n/g, "<br>");

    html = html.replace(/<b>(.*?)<\/b>/g, "<strong>$1</strong>");
    html = html.replace(/<i>(.*?)<\/i>/g, "<em>$1</em>");
    // Add more tag replacements as needed

    if (!/<(p|h1|h2|h3|br|strong|em)>/i.test(html)) {
        html = `<p>${html}</p>`;
    }

    return html;
}

// ... (Implement other functions for improve prompt, bookmarks, etc.)

