// Multi LLM Hub - Settings Page Script
class SettingsManager {
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
        // Save settings
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Open all active LLMs
        document.getElementById('open-all-llms').addEventListener('click', () => {
            this.openAllActiveLLMs();
        });

        // Enable/Disable all
        document.getElementById('enable-all').addEventListener('click', () => {
            this.toggleAllLLMs(true);
        });

        document.getElementById('disable-all').addEventListener('click', () => {
            this.toggleAllLLMs(false);
        });

        // Reset settings
        document.getElementById('reset-settings').addEventListener('click', () => {
            this.resetSettings();
        });

        // Export/Import settings
        document.getElementById('export-settings').addEventListener('click', () => {
            this.exportSettings();
        });

        document.getElementById('import-settings').addEventListener('click', () => {
            this.importSettings();
        });
    }

    renderUI() {
        this.renderLLMGrid();
        this.renderPreferences();
        this.renderStatistics();
    }

    renderLLMGrid() {
        const container = document.getElementById('llm-grid');
        container.innerHTML = '';

        // Group LLMs by category
        const categories = {};
        Object.entries(this.llmConfig).forEach(([llmId, config]) => {
            if (!categories[config.category]) {
                categories[config.category] = [];
            }
            categories[config.category].push({ llmId, config });
        });

        // Render each category
        Object.entries(categories).forEach(([category, llms]) => {
            // Add category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = category;
            categoryHeader.style.gridColumn = '1 / -1';
            container.appendChild(categoryHeader);

            // Add LLM cards for this category
            llms.forEach(({ llmId, config }) => {
                const isEnabled = this.settings.llmSettings[llmId]?.enabled || false;
                const lastUsed = this.settings.llmSettings[llmId]?.lastUsed;
                
                const card = document.createElement('div');
                card.className = `llm-card ${isEnabled ? 'enabled' : ''}`;
                card.innerHTML = `
                    <div class="llm-header">
                        <div class="llm-info">
                            <div class="llm-icon">${config.icon}</div>
                            <div class="llm-details">
                                <h3>${config.name}</h3>
                                <p>${config.category}</p>
                            </div>
                        </div>
                        <div class="toggle-switch ${isEnabled ? 'enabled' : ''}" data-llm="${llmId}"></div>
                    </div>
                    
                    <div class="llm-url">${config.url}</div>
                    
                    <div class="llm-stats">
                        <span>Status: <strong>${isEnabled ? 'Enabled' : 'Disabled'}</strong></span>
                        <span>Last Used: ${lastUsed ? this.formatDate(lastUsed) : 'Never'}</span>
                    </div>
                `;

                const toggle = card.querySelector('.toggle-switch');
                toggle.addEventListener('click', () => {
                    this.toggleLLM(llmId);
                });

                container.appendChild(card);
            });
        });
    }

    renderPreferences() {
        const container = document.getElementById('preferences-grid');
        container.innerHTML = '';

        const preferences = [
            {
                key: 'autoSubmit',
                title: 'Auto Submit',
                description: 'Automatically submit prompts after injection',
                type: 'toggle'
            },
            {
                key: 'showNotifications',
                title: 'Show Notifications',
                description: 'Display notifications for successful operations',
                type: 'toggle'
            },
            {
                key: 'theme',
                title: 'Theme',
                description: 'Choose your preferred theme',
                type: 'select',
                options: ['light', 'dark', 'auto']
            }
        ];

        preferences.forEach(pref => {
            const item = document.createElement('div');
            item.className = 'preference-item';
            
            const currentValue = this.settings.preferences[pref.key];
            
            if (pref.type === 'toggle') {
                item.innerHTML = `
                    <div class="preference-info">
                        <h4>${pref.title}</h4>
                        <p>${pref.description}</p>
                    </div>
                    <div class="toggle-switch ${currentValue ? 'enabled' : ''}" data-pref="${pref.key}"></div>
                `;

                const toggle = item.querySelector('.toggle-switch');
                toggle.addEventListener('click', () => {
                    this.togglePreference(pref.key);
                });
            } else if (pref.type === 'select') {
                const options = pref.options.map(opt => 
                    `<option value="${opt}" ${currentValue === opt ? 'selected' : ''}>${opt}</option>`
                ).join('');

                item.innerHTML = `
                    <div class="preference-info">
                        <h4>${pref.title}</h4>
                        <p>${pref.description}</p>
                    </div>
                    <select data-pref="${pref.key}" style="padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
                        ${options}
                    </select>
                `;

                const select = item.querySelector('select');
                select.addEventListener('change', (e) => {
                    this.updatePreference(pref.key, e.target.value);
                });
            }

            container.appendChild(item);
        });
    }

    renderStatistics() {
        const container = document.getElementById('stats-content');
        
        const totalLLMs = Object.keys(this.llmConfig).length;
        const enabledLLMs = Object.values(this.settings.llmSettings)
            .filter(setting => setting.enabled).length;
        
        const recentlyUsed = Object.entries(this.settings.llmSettings)
            .filter(([_, setting]) => setting.lastUsed)
            .sort(([_, a], [__, b]) => (b.lastUsed || 0) - (a.lastUsed || 0))
            .slice(0, 3);

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                    <h3 style="font-size: 24px; color: #667eea; margin-bottom: 8px;">${totalLLMs}</h3>
                    <p>Total LLMs</p>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                    <h3 style="font-size: 24px; color: #28a745; margin-bottom: 8px;">${enabledLLMs}</h3>
                    <p>Enabled LLMs</p>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                    <h3 style="font-size: 24px; color: #ffc107; margin-bottom: 8px;">${totalLLMs - enabledLLMs}</h3>
                    <p>Disabled LLMs</p>
                </div>
            </div>
            
            ${recentlyUsed.length > 0 ? `
                <div style="margin-top: 25px;">
                    <h4 style="margin-bottom: 15px;">Recently Used LLMs</h4>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${recentlyUsed.map(([llmId, setting]) => `
                            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 6px;">
                                <span style="font-size: 18px;">${this.llmConfig[llmId]?.icon || '🤖'}</span>
                                <div>
                                    <strong>${this.llmConfig[llmId]?.name || llmId}</strong>
                                    <p style="font-size: 12px; color: #6c757d; margin: 0;">
                                        Last used: ${this.formatDate(setting.lastUsed)}
                                    </p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }

    toggleLLM(llmId) {
        const currentState = this.settings.llmSettings[llmId]?.enabled || false;
        
        if (!this.settings.llmSettings[llmId]) {
            this.settings.llmSettings[llmId] = {};
        }
        
        this.settings.llmSettings[llmId].enabled = !currentState;
        this.renderLLMGrid();
    }

    toggleAllLLMs(enabled) {
        Object.keys(this.llmConfig).forEach(llmId => {
            if (!this.settings.llmSettings[llmId]) {
                this.settings.llmSettings[llmId] = {};
            }
            this.settings.llmSettings[llmId].enabled = enabled;
        });
        this.renderLLMGrid();
    }

    togglePreference(key) {
        const currentValue = this.settings.preferences[key];
        this.settings.preferences[key] = !currentValue;
        this.renderPreferences();
    }

    updatePreference(key, value) {
        this.settings.preferences[key] = value;
    }

    async openAllActiveLLMs() {
        const enabledLLMs = Object.entries(this.settings.llmSettings)
            .filter(([_, setting]) => setting.enabled)
            .map(([llmId, _]) => llmId);

        if (enabledLLMs.length === 0) {
            this.showStatus('Please enable at least one LLM first!', 'error');
            return;
        }

        this.showStatus(`Opening ${enabledLLMs.length} LLM tab${enabledLLMs.length > 1 ? 's' : ''}...`, 'success');

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
                
                // Small delay between opening tabs to avoid overwhelming the browser
                await new Promise(resolve => setTimeout(resolve, 100));
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

    async saveSettings() {
        try {
            await chrome.runtime.sendMessage({
                action: 'updateSettings',
                settings: this.settings
            });
            this.showStatus('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showStatus('Failed to save settings', 'error');
        }
    }

    async resetSettings() {
        if (confirm('Reset all settings to default? This cannot be undone.')) {
            Object.keys(this.llmConfig).forEach(llmId => {
                this.settings.llmSettings[llmId] = {
                    enabled: this.llmConfig[llmId].enabled,
                    lastUsed: null
                };
            });

            this.settings.preferences = {
                autoSubmit: true,
                showNotifications: true,
                theme: 'light'
            };

            await this.saveSettings();
            this.renderUI();
            this.showStatus('Settings reset to default', 'success');
        }
    }

    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'multi-llm-hub-settings.json';
        link.click();
        
        this.showStatus('Settings exported successfully!', 'success');
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedSettings = JSON.parse(e.target.result);
                        this.settings = importedSettings;
                        this.renderUI();
                        this.showStatus('Settings imported successfully!', 'success');
                    } catch (error) {
                        this.showStatus('Invalid settings file', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    showStatus(message, type) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';

        setTimeout(() => {
            status.style.display = 'none';
        }, 5000);
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Never';
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});