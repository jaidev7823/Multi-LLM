document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById("send");
    const promptTextarea = document.getElementById("prompt");
    const statusDiv = document.createElement('div');
    statusDiv.id = 'status';
    statusDiv.style.marginTop = '10px';
    statusDiv.style.fontSize = '12px';
    document.body.appendChild(statusDiv);

    sendButton.addEventListener("click", async () => {
        const prompt = promptTextarea.value.trim();

        if (!prompt) {
            updateStatus("Please enter a prompt first!", "error");
            return;
        }

        updateStatus("Sending prompt to LLM tabs...", "info");

        try {
            const tabs = await chrome.tabs.query({});
            let sentCount = 0;
            let results = [];
            let foundTabs = [];

            // Debug: log all tabs to see what we're working with
            console.log("All tabs:", tabs.map(t => ({ id: t.id, url: t.url })));

            for (const tab of tabs) {
                if (tab.url && (tab.url.includes("chat.openai.com") || tab.url.includes("chatgpt.com") || tab.url.includes("deepseek.com"))) {
                    foundTabs.push(tab.url);
                    console.log("Found LLM tab:", tab.url);

                    try {
                        // First try to inject content script if it's not already there
                        try {
                            await chrome.scripting.executeScript({
                                target: { tabId: tab.id },
                                files: ['content.js']
                            });
                            console.log(`Content script injected into tab: ${tab.url}`);
                        } catch (injectError) {
                            console.log(`Content script already exists or injection failed: ${injectError.message}`);
                        }

                        // Now try to send the message
                        const response = await chrome.tabs.sendMessage(tab.id, {
                            action: "injectPrompt",
                            prompt: prompt
                        });

                        console.log(`Response from ${tab.url}:`, response);

                        if (response && response.success) {
                            sentCount++;
                            results.push(`✓ ${response.site}`);
                        } else {
                            results.push(`✗ ${tab.url.split('/')[2]} - ${response?.error || 'Failed'}`);
                        }
                    } catch (error) {
                        console.log(`Error with tab ${tab.url}:`, error);
                        results.push(`✗ ${tab.url.split('/')[2]} - ${error.message}`);
                    }
                }
            }

            if (sentCount > 0) {
                updateStatus(`Sent to ${sentCount} LLM tab(s):\n${results.join('\n')}`, "success");
            } else {
                updateStatus("No LLM tabs found. Please open ChatGPT or DeepSeek tabs first.", "warning");
            }

        } catch (error) {
            updateStatus(`Error: ${error.message}`, "error");
        }
    });

    function updateStatus(message, type) {
        const colors = {
            info: '#007cba',
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545'
        };

        statusDiv.textContent = message;
        statusDiv.style.color = colors[type] || '#000';
        statusDiv.style.whiteSpace = 'pre-line';
    }
});
