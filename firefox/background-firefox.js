// Background script for Multi LLM Hub - Firefox (Manifest V2)
console.log('Multi LLM Hub Firefox background script loaded');

// Initialize extension
browser.runtime.onInstalled.addListener(async () => {
  console.log('Multi LLM Hub extension installed on Firefox');
  
  // Initialize default settings
  try {
    const result = await browser.storage.sync.get(['llmSettings']);
    if (!result.llmSettings) {
      const defaultSettings = {};
      Object.keys(LLM_CONFIG).forEach(llmId => {
        defaultSettings[llmId] = {
          enabled: LLM_CONFIG[llmId].enabled,
          lastUsed: null
        };
      });
      
      await browser.storage.sync.set({ 
        llmSettings: defaultSettings,
        preferences: {
          autoSubmit: true,
          showNotifications: true,
          theme: 'light'
        }
      });
      console.log('Default settings initialized');
    }
  } catch (error) {
    console.error('Failed to initialize settings:', error);
  }
});

// Listen for tab updates to ensure content scripts are loaded
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const llmId = findLLMByUrl(tab.url);
    if (llmId) {
      console.log(`LLM tab updated: ${llmId} in tab ${tabId}`);
      // Content scripts should be automatically injected via manifest
      // but we can verify they're working by sending a ping
      try {
        await browser.tabs.sendMessage(tabId, { action: 'ping' });
        console.log(`Content script confirmed active in tab ${tabId}`);
      } catch (error) {
        console.log(`Content script not active in tab ${tabId}, will inject manually when needed`);
      }
    }
  }
});

// Handle messages from popup and content scripts
browser.runtime.onMessage.addListener(async (message, sender) => {
  console.log('Received message:', message);
  
  switch (message.action) {
    case 'broadcastPrompt':
      return await broadcastToEnabledLLMs(message.prompt);
      
    case 'getLLMConfig':
      return { config: LLM_CONFIG };
      
    case 'getSettings':
      return await getSettings();
      
    case 'updateSettings':
      await updateSettings(message.settings);
      return { success: true };
      
    case 'openLLM':
      await openLLMTab(message.llmId);
      return { success: true };
      
    default:
      console.warn('Unknown action:', message.action);
      return { success: false, error: 'Unknown action' };
  }
});

async function broadcastToEnabledLLMs(prompt) {
  try {
    const settings = await getSettings();
    const tabs = await browser.tabs.query({});
    const results = [];
    
    for (const tab of tabs) {
      if (!tab.url) continue;
      
      // Find which LLM this tab belongs to
      const llmId = findLLMByUrl(tab.url);
      if (!llmId || !settings.llmSettings[llmId]?.enabled) continue;
      
      try {
        // For Firefox, we need to ensure content scripts are active
        // Try to send message first, if it fails, inject scripts manually
        let response;
        try {
          response = await browser.tabs.sendMessage(tab.id, { 
            action: 'injectPrompt', 
            prompt: prompt,
            llmConfig: LLM_CONFIG[llmId]
          });
        } catch (messageError) {
          console.log(`Content script not active in tab ${tab.id}, injecting manually...`);
          
          // For Firefox, we need to activate the tab briefly to ensure content scripts load
          // Store current active tab to restore later
          const currentTabs = await browser.tabs.query({ active: true, currentWindow: true });
          const currentActiveTab = currentTabs[0];
          
          try {
            // First try to inject scripts without activating the tab
            try {
              await browser.tabs.executeScript(tab.id, {
                file: 'llm-config.js'
              });
              await browser.tabs.executeScript(tab.id, {
                file: 'content.js'
              });
              
              // Wait a bit for scripts to initialize
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Try sending message
              response = await browser.tabs.sendMessage(tab.id, { 
                action: 'injectPrompt', 
                prompt: prompt,
                llmConfig: LLM_CONFIG[llmId]
              });
            } catch (injectionError) {
              console.log('Direct injection failed, trying with tab activation...');
              
              // Activate the target tab briefly as fallback
              await browser.tabs.update(tab.id, { active: true });
              
              // Wait for content scripts to load
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Inject content scripts manually for inactive tabs
              await browser.tabs.executeScript(tab.id, {
                file: 'llm-config.js'
              });
              await browser.tabs.executeScript(tab.id, {
                file: 'content.js'
              });
              
              // Wait a bit for scripts to initialize
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Try sending message again
              response = await browser.tabs.sendMessage(tab.id, { 
                action: 'injectPrompt', 
                prompt: prompt,
                llmConfig: LLM_CONFIG[llmId]
              });
              
              // Restore the original active tab
              if (currentActiveTab) {
                await browser.tabs.update(currentActiveTab.id, { active: true });
              }
            }
          } catch (activationError) {
            console.error('Error with tab activation:', activationError);
            // Restore the original active tab even if there was an error
            if (currentActiveTab) {
              await browser.tabs.update(currentActiveTab.id, { active: true });
            }
            throw activationError;
          }
        }
        
        results.push({
          llmId,
          success: response?.success || false,
          error: response?.error
        });
        
        // Update last used timestamp
        if (response?.success) {
          await updateLastUsed(llmId);
        }
        
      } catch (error) {
        console.log(`Error with tab ${tab.url}:`, error);
        results.push({
          llmId,
          success: false,
          error: error.message
        });
      }
    }
    
    console.log('Broadcast results:', results);
    return { success: true, results };
    
  } catch (error) {
    console.error('Error broadcasting to LLMs:', error);
    return { success: false, error: error.message };
  }
}

function findLLMByUrl(url) {
  for (const [llmId, config] of Object.entries(LLM_CONFIG)) {
    try {
      const llmDomain = new URL(config.url).hostname;
      if (url.includes(llmDomain)) {
        return llmId;
      }
    } catch (error) {
      console.warn(`Invalid URL in config for ${llmId}:`, config.url);
    }
  }
  return null;
}

async function getSettings() {
  try {
    const result = await browser.storage.sync.get(['llmSettings', 'preferences']);
    return {
      llmSettings: result.llmSettings || {},
      preferences: result.preferences || {}
    };
  } catch (error) {
    console.error('Failed to get settings:', error);
    return { llmSettings: {}, preferences: {} };
  }
}

async function updateSettings(newSettings) {
  try {
    await browser.storage.sync.set(newSettings);
    console.log('Settings updated successfully');
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw error;
  }
}

async function updateLastUsed(llmId) {
  try {
    const settings = await getSettings();
    if (!settings.llmSettings[llmId]) {
      settings.llmSettings[llmId] = {};
    }
    settings.llmSettings[llmId].lastUsed = Date.now();
    await browser.storage.sync.set({ llmSettings: settings.llmSettings });
  } catch (error) {
    console.error('Failed to update last used:', error);
  }
}

async function openLLMTab(llmId) {
  try {
    const config = LLM_CONFIG[llmId];
    if (config) {
      await browser.tabs.create({ url: config.url });
      console.log(`Opened tab for ${config.name}`);
    } else {
      throw new Error(`LLM config not found for ${llmId}`);
    }
  } catch (error) {
    console.error(`Failed to open tab for ${llmId}:`, error);
    throw error;
  }
}