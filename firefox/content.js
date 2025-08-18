// Multi LLM Hub - Content Script
(function() {
    console.log('Multi LLM Hub content script loaded on:', window.location.href);

    // Prevent multiple script execution
    if (typeof window.multiLLMHubLoaded !== 'undefined') {
        console.log('Multi LLM Hub content script already loaded, skipping...');
        return;
    }
    window.multiLLMHubLoaded = true;

// Load LLM config if not already available
if (typeof LLM_CONFIG === 'undefined') {
    // Fallback config in case llm-config.js isn't loaded
    window.LLM_CONFIG = {};
}

class LLMInjector {
    constructor() {
        this.currentLLM = this.detectCurrentLLM();
        this.setupMessageListener();
    }

    detectCurrentLLM() {
        const url = window.location.href;
        
        // Try to match against known LLM configs
        if (typeof LLM_CONFIG !== 'undefined') {
            for (const [llmId, config] of Object.entries(LLM_CONFIG)) {
                const llmDomain = new URL(config.url).hostname;
                if (url.includes(llmDomain)) {
                    console.log(`Detected LLM: ${config.name} (${llmId})`);
                    return { llmId, config };
                }
            }
        }

        // Fallback detection for common LLMs
        if (url.includes('chatgpt.com') || url.includes('chat.openai.com')) {
            return { llmId: 'chatgpt', config: { name: 'ChatGPT' } };
        } else if (url.includes('claude.ai')) {
            return { llmId: 'claude', config: { name: 'Claude' } };
        } else if (url.includes('gemini.google.com') || url.includes('bard.google.com')) {
            return { llmId: 'gemini', config: { name: 'Gemini' } };
        } else if (url.includes('deepseek.com')) {
            return { llmId: 'deepseek', config: { name: 'DeepSeek' } };
        }

        return null;
    }

    setupMessageListener() {
        // Use browser API for Firefox compatibility
        const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
        browserAPI.runtime.onMessage.addListener((msg, sender, sendResponse) => {
            if (msg.action === "injectPrompt") {
                console.log('Received prompt injection request:', msg.prompt);
                this.handlePromptInjection(msg, sendResponse);
                return true; // Async response
            }
        });
    }

    async handlePromptInjection(msg, sendResponse) {
        try {
            const result = await this.injectPrompt(msg.prompt, msg.llmConfig);
            sendResponse(result);
        } catch (error) {
            console.error('Injection error:', error);
            sendResponse({
                success: false,
                error: error.message,
                site: window.location.hostname
            });
        }
    }

    async injectPrompt(prompt, llmConfig) {
        const config = llmConfig || this.currentLLM?.config;
        if (!config) {
            throw new Error('No LLM configuration found for this site');
        }

        console.log(`Injecting prompt into ${config.name}:`, prompt);

        // Find input element
        const input = this.findInputElement(config);
        if (!input) {
            throw new Error('No suitable input element found');
        }

        console.log('Found input element:', input);

        // Inject the prompt
        await this.setInputValue(input, prompt);

        // Try to submit if auto-submit is enabled
        const submitted = await this.trySubmit(config, input);

        return {
            success: true,
            site: window.location.hostname,
            llmId: this.currentLLM?.llmId,
            submitted: submitted
        };
    }

    findInputElement(config) {
        let input = null;

        // Use selectors from config if available
        if (config.selectors && config.selectors.input) {
            for (const selector of config.selectors.input) {
                input = document.querySelector(selector);
                if (input && this.isElementVisible(input)) {
                    console.log(`Found input with selector: ${selector}`);
                    return input;
                }
            }
        }

        // Fallback to generic selectors
        const fallbackSelectors = [
            'div[contenteditable="true"]',
            'textarea[placeholder*="Ask"]',
            'textarea[placeholder*="Message"]',
            'textarea[placeholder*="Chat"]',
            'textarea[placeholder*="Talk"]',
            'textarea',
            'input[type="text"]',
            '[role="textbox"]'
        ];

        for (const selector of fallbackSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                if (this.isElementVisible(element)) {
                    console.log(`Found input with fallback selector: ${selector}`);
                    return element;
                }
            }
        }

        return null;
    }

    isElementVisible(element) {
        if (!element) return false;
        
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
    }

    async setInputValue(input, value) {
        // Focus the input
        input.focus();

        // Special handling for Perplexity's complex structure
        if (window.location.href.includes('perplexity.ai')) {
            return this.handlePerplexityInput(input, value);
        }

        // Handle different input types
        if (input.contentEditable === 'true') {
            // Contenteditable div
            input.innerHTML = '';
            input.textContent = value;
            
            // Trigger events for contenteditable
            this.triggerEvents(input, ['input', 'change']);
        } else if (input.tagName === 'P' || input.tagName === 'SPAN') {
            // Handle paragraph or span elements (like Perplexity)
            input.textContent = value;
            this.triggerEvents(input, ['input', 'change', 'keyup']);
        } else {
            // Regular input/textarea
            input.value = '';
            
            // Use native setter to bypass React/framework interference
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype, "value"
            )?.set || Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype, "value"
            )?.set;
            
            if (nativeInputValueSetter) {
                nativeInputValueSetter.call(input, value);
            } else {
                input.value = value;
            }
            
            // Trigger events for regular inputs
            this.triggerEvents(input, ['input', 'change', 'keyup']);
        }

        // Wait a bit for the UI to update
        await this.sleep(100);
    }

    async handlePerplexityInput(input, value) {
        // Always target the outer editable div
        let editableElement = input.closest('#ask-input[contenteditable="true"]') || input;
    
        if (!editableElement) {
            console.error("Perplexity: editable element not found");
            return;
        }
    
        // Focus the editor
        editableElement.focus();
    
        // Clear existing content
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
    
        // Insert new text as if typed by a user
        document.execCommand('insertText', false, value);
    
        // Fire input event so Lexical editor updates its internal state
        editableElement.dispatchEvent(new InputEvent('input', { bubbles: true }));
    
        // Small delay to let UI react
        await this.sleep(150);
    }
    

    async trySubmit(config, input) {
        try {
            // Look for submit button using config selectors
            let submitBtn = null;
            
            if (config.selectors && config.selectors.submit) {
                for (const selector of config.selectors.submit) {
                    submitBtn = document.querySelector(selector);
                    if (submitBtn && !submitBtn.disabled && this.isElementVisible(submitBtn)) {
                        console.log(`Found submit button with selector: ${selector}`);
                        break;
                    }
                }
            }

            // Fallback submit button selectors
            if (!submitBtn) {
                const fallbackSelectors = [
                    'button[type="submit"]',
                    'button[aria-label*="Send"]',
                    'button[aria-label*="Submit"]',
                    'button:has(svg)',
                    '[data-testid="send-button"]',
                    '.send-button'
                ];

                for (const selector of fallbackSelectors) {
                    submitBtn = document.querySelector(selector);
                    if (submitBtn && !submitBtn.disabled && this.isElementVisible(submitBtn)) {
                        console.log(`Found submit button with fallback selector: ${selector}`);
                        break;
                    }
                }
            }

            if (submitBtn) {
                console.log('Clicking submit button');
                submitBtn.click();
                return true;
            } else {
                // Try Enter key as fallback
                console.log('No submit button found, trying Enter key');
                this.triggerKeyboardEvent(input, 'Enter');
                return false;
            }
        } catch (error) {
            console.log('Submit failed:', error);
            return false;
        }
    }

    triggerEvents(element, eventTypes) {
        eventTypes.forEach(eventType => {
            const event = new Event(eventType, { bubbles: true, cancelable: true });
            element.dispatchEvent(event);
        });
    }

    triggerKeyboardEvent(element, key) {
        const event = new KeyboardEvent('keydown', {
            key: key,
            keyCode: key === 'Enter' ? 13 : 0,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

    // Initialize the injector only if not already initialized
    if (typeof window.llmInjectorInstance === 'undefined') {
        window.llmInjectorInstance = new LLMInjector();
    }
})();