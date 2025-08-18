// Content script for Multi LLM Broadcaster
console.log('Multi LLM Broadcaster content script loaded on:', window.location.href);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "injectPrompt") {
        console.log('Received prompt injection request:', msg.prompt);

        // More specific selectors for different LLM sites
        let input = null;

        // Try ChatGPT selectors (both old and new URLs)
        if (window.location.href.includes('chat.openai.com') || window.location.href.includes('chatgpt.com')) {
            // Debug: log all available elements
            console.log('Available textareas:', document.querySelectorAll('textarea'));
            console.log('Available contenteditable divs:', document.querySelectorAll('div[contenteditable="true"]'));
            console.log('Available role=textbox:', document.querySelectorAll('[role="textbox"]'));
            
            // Try multiple selectors for ChatGPT's evolving interface
            input = document.querySelector('div[contenteditable="true"][data-id="root"]') ||
                    document.querySelector('div[contenteditable="true"]') ||
                    document.querySelector('textarea[placeholder*="Ask"]') ||
                    document.querySelector('textarea[name="prompt-textarea"]') ||
                    document.querySelector('#prompt-textarea') ||
                    document.querySelector('textarea') ||
                    document.querySelector('[role="textbox"]');
            
            console.log('ChatGPT input search result:', input);
            
            // If still no input found, try a more aggressive search
            if (!input) {
                const allInputs = document.querySelectorAll('input, textarea, [contenteditable="true"], [role="textbox"]');
                console.log('All possible input elements:', allInputs);
                if (allInputs.length > 0) {
                    input = allInputs[allInputs.length - 1]; // Try the last one
                    console.log('Using fallback input:', input);
                }
            }
        }

        // Try DeepSeek selectors  
        if (window.location.href.includes('deepseek.com')) {
            input = document.querySelector('#chat-input') ||
                    document.querySelector('textarea[placeholder*="Message DeepSeek"]');
        }

        // Fallback to any textarea or input
        if (!input) {
            input = document.querySelector("textarea") || document.querySelector("input[type='text']");
        }

        if (input) {
            console.log('Found input element:', input);
            
            // Focus the input
            input.focus();
            
            // For contenteditable divs (some modern chat interfaces)
            if (input.contentEditable === 'true') {
                input.innerHTML = '';
                input.textContent = msg.prompt;
                
                // Trigger events for contenteditable
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.dispatchEvent(new Event("change", { bubbles: true }));
                
                // For ChatGPT contenteditable, try to find and click submit button
                if (window.location.href.includes('chatgpt.com') || window.location.href.includes('chat.openai.com')) {
                    setTimeout(() => {
                        const submitBtn = document.querySelector('button[data-testid="send-button"]') ||
                                        document.querySelector('button[aria-label*="Send"]') ||
                                        document.querySelector('button[type="submit"]') ||
                                        document.querySelector('button:has([data-icon="send"])') ||
                                        document.querySelector('form button[type="submit"]') ||
                                        document.querySelector('button svg').closest('button');
                        
                        if (submitBtn && !submitBtn.disabled) {
                            console.log('Clicking ChatGPT submit button (contenteditable)');
                            submitBtn.click();
                        } else {
                            console.log('No submit button found, trying Enter key');
                            input.dispatchEvent(new KeyboardEvent("keydown", { 
                                key: "Enter", 
                                keyCode: 13,
                                bubbles: true,
                                cancelable: true
                            }));
                        }
                    }, 200);
                } else {
                    // For other contenteditable interfaces, just try Enter
                    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
                }
            } else {
                // For regular textareas
                input.value = '';
                
                // Use a more robust method to set the value
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                nativeInputValueSetter.call(input, msg.prompt);
                
                // Trigger multiple events to ensure the site detects the change
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.dispatchEvent(new Event("change", { bubbles: true }));
                input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
                
                // Try to find and click submit button for DeepSeek
                if (window.location.href.includes('deepseek.com')) {
                    setTimeout(() => {
                        const submitBtn = document.querySelector('button[type="submit"]') ||
                                        document.querySelector('button[aria-label*="Send"]') ||
                                        document.querySelector('button:has(svg)') ||
                                        document.querySelector('.send-button');
                        
                        if (submitBtn && !submitBtn.disabled) {
                            console.log('Clicking submit button for DeepSeek');
                            submitBtn.click();
                        } else {
                            // Fallback: try Enter key
                            input.dispatchEvent(new KeyboardEvent("keydown", { 
                                key: "Enter", 
                                keyCode: 13,
                                bubbles: true 
                            }));
                        }
                    }, 100);
                }
                
                // Try to find and click submit button for ChatGPT
                if (window.location.href.includes('chatgpt.com') || window.location.href.includes('chat.openai.com')) {
                    setTimeout(() => {
                        const submitBtn = document.querySelector('button[data-testid="send-button"]') ||
                                        document.querySelector('button[aria-label*="Send"]') ||
                                        document.querySelector('button:has(svg)') ||
                                        document.querySelector('[data-testid="send-button"]');
                        
                        if (submitBtn && !submitBtn.disabled) {
                            console.log('Clicking submit button for ChatGPT');
                            submitBtn.click();
                        } else {
                            // Fallback: try Enter key
                            input.dispatchEvent(new KeyboardEvent("keydown", { 
                                key: "Enter", 
                                keyCode: 13,
                                bubbles: true 
                            }));
                        }
                    }, 100);
                }
            }

            console.log('Prompt injected successfully');
            sendResponse({ success: true, site: window.location.hostname });
        } else {
            console.log('No suitable input found');
            sendResponse({ success: false, error: "No input found", site: window.location.hostname });
        }
    }

    // Return true to indicate we'll send a response asynchronously
    return true;
});
