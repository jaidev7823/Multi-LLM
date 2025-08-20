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
            const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
            const response = await browserAPI.runtime.sendMessage({ action: 'getSettings' });
            this.settings = response;
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.settings = { llmSettings: {}, preferences: {} };
        }
    }

    async loadLLMConfig() {
        try {
            const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
            const response = await browserAPI.runtime.sendMessage({ action: 'getLLMConfig' });
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
                
                // Create llm-header div
                const llmHeader = document.createElement('div');
                llmHeader.className = 'llm-header';
                
                // Create llm-info div
                const llmInfo = document.createElement('div');
                llmInfo.className = 'llm-info';
                
                // Create llm-icon div
                const llmIcon = document.createElement('div');
                llmIcon.className = 'llm-icon';
                
                const img = document.createElement('img');
                img.src = config.iconUrl || `llm-logo/${llmId}.png`;
                img.alt = config.name;
                img.style.cssText = 'width:24px;height:24px;object-fit:contain;margin-right:10px;';
                img.onerror = function() { this.style.display = 'none'; };
                
                llmIcon.appendChild(img);
                
                // Create llm-details div
                const llmDetails = document.createElement('div');
                llmDetails.className = 'llm-details';
                
                const h3 = document.createElement('h3');
                h3.textContent = config.name;
                
                const p = document.createElement('p');
                p.textContent = config.category;
                
                llmDetails.appendChild(h3);
                llmDetails.appendChild(p);
                
                llmInfo.appendChild(llmIcon);
                llmInfo.appendChild(llmDetails);
                
                // Create toggle switch
                const toggle = document.createElement('div');
                toggle.className = `toggle-switch ${isEnabled ? 'enabled' : ''}`;
                toggle.dataset.llm = llmId;
                
                llmHeader.appendChild(llmInfo);
                llmHeader.appendChild(toggle);
                
                // Create llm-url div
                const llmUrl = document.createElement('div');
                llmUrl.className = 'llm-url';
                llmUrl.textContent = config.url;
                
                // Create llm-stats div
                const llmStats = document.createElement('div');
                llmStats.className = 'llm-stats';
                
                const statusSpan = document.createElement('span');
                statusSpan.textContent = 'Status: ';
                
                const strong = document.createElement('strong');
                strong.textContent = isEnabled ? 'Enabled' : 'Disabled';
                statusSpan.appendChild(strong);
                
                const lastUsedSpan = document.createElement('span');
                lastUsedSpan.textContent = `Last Used: ${lastUsed ? this.formatDate(lastUsed) : 'Never'}`;
                
                llmStats.appendChild(statusSpan);
                llmStats.appendChild(lastUsedSpan);
                
                card.appendChild(llmHeader);
                card.appendChild(llmUrl);
                card.appendChild(llmStats);

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
                // Create preference-info div
                const preferenceInfo = document.createElement('div');
                preferenceInfo.className = 'preference-info';
                
                const h4 = document.createElement('h4');
                h4.textContent = pref.title;
                
                const p = document.createElement('p');
                p.textContent = pref.description;
                
                preferenceInfo.appendChild(h4);
                preferenceInfo.appendChild(p);
                
                // Create toggle switch
                const toggle = document.createElement('div');
                toggle.className = `toggle-switch ${currentValue ? 'enabled' : ''}`;
                toggle.dataset.pref = pref.key;
                
                item.appendChild(preferenceInfo);
                item.appendChild(toggle);

                toggle.addEventListener('click', () => {
                    this.togglePreference(pref.key);
                });
            } else if (pref.type === 'select') {
                // Create preference-info div
                const preferenceInfo = document.createElement('div');
                preferenceInfo.className = 'preference-info';
                
                const h4 = document.createElement('h4');
                h4.textContent = pref.title;
                
                const p = document.createElement('p');
                p.textContent = pref.description;
                
                preferenceInfo.appendChild(h4);
                preferenceInfo.appendChild(p);
                
                // Create select element
                const select = document.createElement('select');
                select.dataset.pref = pref.key;
                select.style.cssText = 'padding: 8px; border-radius: 4px; border: 1px solid #ddd;';
                
                pref.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    if (currentValue === opt) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
                
                item.appendChild(preferenceInfo);
                item.appendChild(select);

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

        // Clear container
        container.innerHTML = '';
        
        // Create stats grid
        const statsGrid = document.createElement('div');
        statsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;';
        
        // Total LLMs card
        const totalCard = document.createElement('div');
        totalCard.style.cssText = 'background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;';
        
        const totalH3 = document.createElement('h3');
        totalH3.style.cssText = 'font-size: 24px; color: #667eea; margin-bottom: 8px;';
        totalH3.textContent = totalLLMs;
        
        const totalP = document.createElement('p');
        totalP.textContent = 'Total LLMs';
        
        totalCard.appendChild(totalH3);
        totalCard.appendChild(totalP);
        
        // Enabled LLMs card
        const enabledCard = document.createElement('div');
        enabledCard.style.cssText = 'background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;';
        
        const enabledH3 = document.createElement('h3');
        enabledH3.style.cssText = 'font-size: 24px; color: #28a745; margin-bottom: 8px;';
        enabledH3.textContent = enabledLLMs;
        
        const enabledP = document.createElement('p');
        enabledP.textContent = 'Enabled LLMs';
        
        enabledCard.appendChild(enabledH3);
        enabledCard.appendChild(enabledP);
        
        // Disabled LLMs card
        const disabledCard = document.createElement('div');
        disabledCard.style.cssText = 'background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;';
        
        const disabledH3 = document.createElement('h3');
        disabledH3.style.cssText = 'font-size: 24px; color: #ffc107; margin-bottom: 8px;';
        disabledH3.textContent = totalLLMs - enabledLLMs;
        
        const disabledP = document.createElement('p');
        disabledP.textContent = 'Disabled LLMs';
        
        disabledCard.appendChild(disabledH3);
        disabledCard.appendChild(disabledP);
        
        statsGrid.appendChild(totalCard);
        statsGrid.appendChild(enabledCard);
        statsGrid.appendChild(disabledCard);
        
        container.appendChild(statsGrid);
        
        // Recently Used section
        if (recentlyUsed.length > 0) {
            const recentlySection = document.createElement('div');
            recentlySection.style.marginTop = '25px';
            
            const recentlyH4 = document.createElement('h4');
            recentlyH4.style.marginBottom = '15px';
            recentlyH4.textContent = 'Recently Used LLMs';
            
            const recentlyList = document.createElement('div');
            recentlyList.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
            
            recentlyUsed.forEach(([llmId, setting]) => {
                const item = document.createElement('div');
                item.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 6px;';
                
                const img = document.createElement('img');
                img.src = this.llmConfig[llmId]?.iconUrl || `llm-logo/${llmId}.png`;
                img.alt = this.llmConfig[llmId]?.name || llmId;
                img.style.cssText = 'width:18px;height:18px;object-fit:contain;';
                img.onerror = function() { this.style.display = 'none'; };
                
                const details = document.createElement('div');
                
                const strong = document.createElement('strong');
                strong.textContent = this.llmConfig[llmId]?.name || llmId;
                
                const p = document.createElement('p');
                p.style.cssText = 'font-size: 12px; color: #6c757d; margin: 0;';
                p.textContent = `Last used: ${this.formatDate(setting.lastUsed)}`;
                
                details.appendChild(strong);
                details.appendChild(p);
                
                item.appendChild(img);
                item.appendChild(details);
                recentlyList.appendChild(item);
            });
            
            recentlySection.appendChild(recentlyH4);
            recentlySection.appendChild(recentlyList);
            container.appendChild(recentlySection);
        }
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
            const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
            let openedCount = 0;
            for (const llmId of enabledLLMs) {
                const response = await browserAPI.runtime.sendMessage({
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
            const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
            await browserAPI.runtime.sendMessage({
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