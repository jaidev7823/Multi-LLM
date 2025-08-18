// LLM Configuration - Predefined list of supported LLMs
// Use var to avoid redeclaration errors, or check if already defined
if (typeof LLM_CONFIG === 'undefined') {
    var LLM_CONFIG = {
        chatgpt: {
            id: 'chatgpt',
            name: 'ChatGPT',
            url: 'https://chatgpt.com',
            icon: '🤖',
            iconUrl: 'llm-logo/chatgpt.png',
            category: 'OpenAI',
            selectors: {
                input: [
                    'div[contenteditable="true"][data-id="root"]',
                    'div[contenteditable="true"]',
                    'textarea[placeholder*="Ask"]',
                    'textarea[name="prompt-textarea"]',
                    '#prompt-textarea',
                    'textarea',
                    '[role="textbox"]'
                ],
                submit: [
                    'button[data-testid="send-button"]',
                    'button[aria-label*="Send"]',
                    'button[type="submit"]',
                    'button:has([data-icon="send"])',
                    'form button[type="submit"]'
                ]
            },
            enabled: true
        },

        claude: {
            id: 'claude',
            name: 'Claude (Anthropic)',
            url: 'https://claude.ai',
            iconUrl: 'llm-logo/claude.png',
            category: 'Anthropic',
            selectors: {
                input: [
                    'div[contenteditable="true"]',
                    'textarea[placeholder*="Talk to Claude"]',
                    'textarea',
                    '[role="textbox"]'
                ],
                submit: [
                    'button[aria-label*="Send"]',
                    'button[type="submit"]',
                    'button:has(svg)'
                ]
            },
            enabled: true
        },

        gemini: {
            id: 'gemini',
            name: 'Gemini',
            url: 'https://gemini.google.com',
            iconUrl: 'llm-logo/gemini.png',
            category: 'Google',
            selectors: {
                input: [
                    'div[contenteditable="true"]',
                    'textarea[placeholder*="Enter a prompt"]',
                    'textarea',
                    '[role="textbox"]'
                ],
                submit: [
                    'button[aria-label*="Send"]',
                    'button[type="submit"]',
                    'button:has(svg)'
                ]
            },
            enabled: true
        },

        deepseek: {
            id: 'deepseek',
            name: 'DeepSeek',
            url: 'https://chat.deepseek.com',
            iconUrl: 'llm-logo/deepseek.png',
            category: 'DeepSeek',
            selectors: {
                input: [
                    '#chat-input',
                    'textarea[placeholder*="Message DeepSeek"]',
                    'textarea'
                ],
                submit: [
                    'button[type="submit"]',
                    'button[aria-label*="Send"]',
                    'button:has(svg)',
                    '.send-button'
                ]
            },
            enabled: true
        },

        poe: {
            id: 'poe',
            name: 'Poe',
            url: 'https://poe.com',
            iconUrl: 'llm-logo/poe.png',
            category: 'Quora',
            selectors: {
                input: [
                    'textarea[placeholder*="Talk to"]',
                    'textarea',
                    'div[contenteditable="true"]'
                ],
                submit: [
                    'button[aria-label*="Send"]',
                    'button[type="submit"]',
                    'button:has(svg)'
                ]
            },
            enabled: true
        },

        mistral: {
            id: 'mistral',
            name: 'Mistral AI',
            url: 'https://chat.mistral.ai',
            iconUrl: 'llm-logo/mistral.png',
            category: 'Mistral',
            selectors: {
                input: [
                    'textarea[placeholder*="Ask anything"]',
                    'textarea',
                    'div[contenteditable="true"]'
                ],
                submit: [
                    'button[aria-label*="Send"]',
                    'button[type="submit"]',
                    'button:has(svg)'
                ]
            },
            enabled: true
        },

        cohere: {
            id: 'cohere',
            name: 'Cohere',
            url: 'https://coral.cohere.com',
            iconUrl: 'llm-logo/cohere.png',
            category: 'Cohere',
            selectors: {
                input: [
                    '#composer',
                    'textarea[placeholder*="Message"]',
                    'textarea',
                    'div[contenteditable="true"]'
                ],
                submit: [
                    'button[aria-label*="Send"]',
                    'button[type="submit"]',
                    'button:has(svg)'
                ]
            },
            enabled: true
        },

        perplexity: {
            id: 'perplexity',
            name: 'Perplexity',
            url: 'https://perplexity.ai',
            iconUrl: 'llm-logo/perplexity.png',
            category: 'Perplexity',
            selectors: {
                input: [
                    '#ask-input[contenteditable="true"]', // main editor div
                    'div[contenteditable="true"][id="ask-input"]',
                    '[role="textbox"][data-lexical-editor="true"]'
                ],
                submit: [
                    'button[aria-label*="Submit"]',
                    'button[type="submit"]',
                    'button:has(svg)'
                ]
            },
            enabled: true
        },
        

        you: {
            id: 'you',
            name: 'You.com',
            url: 'https://you.com',
            iconUrl: 'llm-logo/you.png',
            category: 'You.com',
            selectors: {
                input: [
                    '#search-input-textarea'
                ],
                submit: [
                    'button[type="submit"]',
                    'button[aria-label*="Search"]',
                    'button:has(svg)'
                ]
            },
            enabled: true
        },

        grok: {
            id: 'grok',
            name: 'Grok',
            url: 'https://grok.com/',
            iconUrl: 'llm-logo/grok.png',
            category: 'Grok',
            selectors: {
                input: [
                    'textarea[aria-label="Ask Grok anything"]',
                    'textarea[class*="bg-transparent"]',
                    'textarea',
                    'div[contenteditable="true"]'
                ],
                submit: [
                    'button[aria-label*="Send"]',
                    'button[type="submit"]',
                    'button:has(svg)'
                ]
            },
            enabled: true
        }
    };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LLM_CONFIG };
} else if (typeof window !== 'undefined') {
    window.LLM_CONFIG = LLM_CONFIG;
}