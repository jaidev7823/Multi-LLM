// Multi LLM Hub - Popup Script
class MultiLLMPopup {
    constructor() {
        this.settings = {};
        this.llmConfig = {};
        this.init();
    }

    async init() {
        await this.loadSettings();
        await this.loadLLMConfig();
        this.setupEventListeners();
        this.renderUI();
    }

    async loadSettings() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
            this.settings = response;
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.settings = { llmSettings: {}, preferences: {} };
        }
    }

    async loadLLMConfig() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getLLMConfig' });
            this.llmConfig = response.config;
        } catch (error) {
            console.error('Failed to load LLM config:', error);
        }
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Send button
        document.getElementById('send-button').addEventListener('click', () => {
            this.sendPrompt();
        });

        // Open all button
        document.getElementById('open-all-button').addEventListener('click', () => {
            this.openAllActiveLLMs();
        });

        // Quick actions
        document.getElementById('enable-all').addEventListener('click', () => {
            this.toggleAllLLMs(true);
        });

        document.getElementById('disable-all').addEventListener('click', () => {
            this.toggleAllLLMs(false);
        });

        document.getElementById('reset-settings').addEventListener('click', () => {
            this.resetSettings();
        });

        // Open advanced settings
        document.getElementById('open-settings').addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });

        // Enter key in textarea
        document.getElementById('prompt-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.sendPrompt();
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }

    renderUI() {
        this.renderLLMChips();
        this.renderLLMList();
        this.updateActiveCount();
    }

    renderLLMChips() {
        const container = document.getElementById('llm-chips');
        container.innerHTML = '';

        Object.entries(this.llmConfig).forEach(([llmId, config]) => {
            const isEnabled = this.settings.llmSettings[llmId]?.enabled || false;
            
            const chip = document.createElement('div');
            chip.className = `llm-chip ${isEnabled ? 'enabled' : ''}`;
            chip.innerHTML = `
                <span>${config.icon}</span>
                <span>${config.name}</span>
            `;
            
            chip.addEventListener('click', () => {
                this.toggleLLM(llmId);
            });

            container.appendChild(chip);
        });
    }

    renderLLMList() {
        const container = document.getElementById('llm-list');
        container.innerHTML = '';

        // Group LLMs by category
        const categories = {};
        Object.entries(this.llmConfig).forEach(([llmId, config]) => {
            if (!categories[config.category]) {
                categories[config.category] = [];
            }
            categories[config.category].push({ llmId, config });
        });

        Object.entries(categories).forEach(([category, llms]) => {
            llms.forEach(({ llmId, config }) => {
                const isEnabled = this.settings.llmSettings[llmId]?.enabled || false;
                
                const item = document.createElement('div');
                item.className = 'llm-item';
                item.innerHTML = `
                    <div class="llm-info">
                        <div class="llm-icon">${config.icon}</div>
                        <div class="llm-details">
                            <h4>${config.name}</h4>
                            <p>${config.category} • ${new URL(config.url).hostname}</p>
                        </div>
                    </div>
                    <div class="toggle-switch ${isEnabled ? 'enabled' : ''}" data-llm="${llmId}"></div>
                `;

                const toggle = item.querySelector('.toggle-switch');
                toggle.addEventListener('click', () => {
                    this.toggleLLM(llmId);
                });

                container.appendChild(item);
            });
        });
    }

    async toggleLLM(llmId) {
        const currentState = this.settings.llmSettings[llmId]?.enabled || false;
        
        if (!this.settings.llmSettings[llmId]) {
            this.settings.llmSettings[llmId] = {};
        }
        
        this.settings.llmSettings[llmId].enabled = !currentState;

        await this.saveSettings();
        this.renderUI();
    }

    async toggleAllLLMs(enabled) {
        Object.keys(this.llmConfig).forEach(llmId => {
            if (!this.settings.llmSettings[llmId]) {
                this.settings.llmSettings[llmId] = {};
            }
            this.settings.llmSettings[llmId].enabled = enabled;
        });

        await this.saveSettings();
        this.renderUI();
    }

    async resetSettings() {
        if (confirm('Reset all settings to default? This cannot be undone.')) {
            Object.keys(this.llmConfig).forEach(llmId => {
                this.settings.llmSettings[llmId] = {
                    enabled: this.llmConfig[llmId].enabled,
                    lastUsed: null
                };
            });

            await this.saveSettings();
            this.renderUI();
            this.showStatus('Settings reset to default', 'success');
        }
    }

    async saveSettings() {
        try {
            await chrome.runtime.sendMessage({
                action: 'updateSettings',
                settings: this.settings
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showStatus('Failed to save settings', 'error');
        }
    }

    updateActiveCount() {
        const enabledCount = Object.values(this.settings.llmSettings)
            .filter(setting => setting.enabled).length;
        
        document.getElementById('active-count').textContent = enabledCount;
        
        const sendButton = document.getElementById('send-button');
        const openAllButton = document.getElementById('open-all-button');
        
        sendButton.disabled = enabledCount === 0;
        openAllButton.disabled = enabledCount === 0;
        
        if (enabledCount === 0) {
            sendButton.textContent = 'No LLMs Selected';
            openAllButton.textContent = '🚀 Open All';
        } else {
            sendButton.textContent = `Send to ${enabledCount} LLM${enabledCount > 1 ? 's' : ''}`;
            openAllButton.textContent = `🚀 Open ${enabledCount}`;
        }
    }

    async openAllActiveLLMs() {
        const enabledLLMs = Object.entries(this.settings.llmSettings)
            .filter(([_, setting]) => setting.enabled)
            .map(([llmId, _]) => llmId);

        if (enabledLLMs.length === 0) {
            this.showStatus('Please enable at least one LLM first!', 'error');
            return;
        }

        this.showStatus(`Opening ${enabledLLMs.length} LLM tab${enabledLLMs.length > 1 ? 's' : ''}...`, 'info');

        try {
            let openedCount = 0;
            for (const llmId of enabledLLMs) {
                const response = await chrome.runtime.sendMessage({
                    action: 'openLLM',
                    llmId: llmId
                });
                
                if (response.success) {
                    openedCount++;
                }
            }

            if (openedCount > 0) {
                this.showStatus(`Successfully opened ${openedCount} LLM tab${openedCount > 1 ? 's' : ''}!`, 'success');
            } else {
                this.showStatus('Failed to open LLM tabs', 'error');
            }
        } catch (error) {
            console.error('Open tabs error:', error);
            this.showStatus(`Error: ${error.message}`, 'error');
        }
    }

    async sendPrompt() {
        const prompt = document.getElementById('prompt-input').value.trim();
        
        if (!prompt) {
            this.showStatus('Please enter a prompt first!', 'error');
            return;
        }

        const enabledCount = Object.values(this.settings.llmSettings)
            .filter(setting => setting.enabled).length;

        if (enabledCount === 0) {
            this.showStatus('Please enable at least one LLM first!', 'error');
            return;
        }

        this.showStatus(`Sending prompt to ${enabledCount} LLM${enabledCount > 1 ? 's' : ''}...`, 'info');

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'broadcastPrompt',
                prompt: prompt
            });

            if (response.success) {
                this.showStatus(`Prompt sent successfully to enabled LLMs!`, 'success');
                
                // Clear the input after successful send
                document.getElementById('prompt-input').value = '';
            } else {
                this.showStatus('Failed to send prompt', 'error');
            }
        } catch (error) {
            console.error('Send error:', error);
            this.showStatus(`Error: ${error.message}`, 'error');
        }
    }

    showStatus(message, type) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';

        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                status.style.display = 'none';
            }, 5000);
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MultiLLMPopup();
});