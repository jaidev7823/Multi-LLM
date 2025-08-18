// LLM Configuration - Predefined list of supported LLMs
// Use var to avoid redeclaration errors, or check if already defined
if (typeof LLM_CONFIG === 'undefined') {
    var LLM_CONFIG = {
    chatgpt: {
        id: 'chatgpt',
        name: 'ChatGPT',
        url: 'https://chatgpt.com',
        icon: '🤖',
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
        icon: '🧠',
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
        icon: '✨',
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
        icon: '🔍',
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
        icon: '🎭',
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
        enabled: false
    },

    mistral: {
        id: 'mistral',
        name: 'Mistral AI',
        url: 'https://chat.mistral.ai',
        icon: '🌪️',
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
        enabled: false
    },

    cohere: {
        id: 'cohere',
        name: 'Cohere',
        url: 'https://chat.cohere.com',
        icon: '🔗',
        category: 'Cohere',
        selectors: {
            input: [
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
        enabled: false
    },

    perplexity: {
        id: 'perplexity',
        name: 'Perplexity',
        url: 'https://perplexity.ai',
        icon: '🔮',
        category: 'Perplexity',
        selectors: {
            input: [
                'textarea[placeholder*="Ask anything"]',
                'textarea',
                'div[contenteditable="true"]'
            ],
            submit: [
                'button[aria-label*="Submit"]',
                'button[type="submit"]',
                'button:has(svg)'
            ]
        },
        enabled: false
    },

    you: {
        id: 'you',
        name: 'You.com',
        url: 'https://you.com',
        icon: '🔍',
        category: 'You.com',
        selectors: {
            input: [
                'textarea[placeholder*="Ask"]',
                'textarea',
                'input[type="text"]'
            ],
            submit: [
                'button[aria-label*="Search"]',
                'button[type="submit"]',
                'button:has(svg)'
            ]
        },
        enabled: false
    },

    huggingface: {
        id: 'huggingface',
        name: 'HuggingFace Chat',
        url: 'https://huggingface.co/chat',
        icon: '🤗',
        category: 'HuggingFace',
        selectors: {
            input: [
                'textarea[placeholder*="Ask anything"]',
                'textarea',
                'div[contenteditable="true"]'
            ],
            submit: [
                'button[type="submit"]',
                'button:has(svg)'
            ]
        },
        enabled: false
    }
    };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LLM_CONFIG };
} else if (typeof window !== 'undefined') {
    window.LLM_CONFIG = LLM_CONFIG;
}