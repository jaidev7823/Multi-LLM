// Background script for Multi LLM Hub
importScripts('llm-config.js');

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Multi LLM Hub extension installed');
  
  // Initialize default settings
  const result = await chrome.storage.sync.get(['llmSettings']);
  if (!result.llmSettings) {
    const defaultSettings = {};
    Object.keys(LLM_CONFIG).forEach(llmId => {
      defaultSettings[llmId] = {
        enabled: LLM_CONFIG[llmId].enabled,
        lastUsed: null
      };
    });
    
    await chrome.storage.sync.set({ 
      llmSettings: defaultSettings,
      preferences: {
        autoSubmit: true,
        showNotifications: true,
        theme: 'light'
      }
    });
    console.log('Default settings initialized');
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'broadcastPrompt':
      broadcastToEnabledLLMs(message.prompt);
      sendResponse({ success: true });
      break;
      
    case 'getLLMConfig':
      sendResponse({ config: LLM_CONFIG });
      break;
      
    case 'getSettings':
      getSettings().then(settings => sendResponse(settings));
      return true; // Async response
      
    case 'updateSettings':
      updateSettings(message.settings).then(() => sendResponse({ success: true }));
      return true; // Async response
      
    case 'openLLM':
      openLLMTab(message.llmId);
      sendResponse({ success: true });
      break;
  }
});

async function broadcastToEnabledLLMs(prompt) {
  try {
    const settings = await getSettings();
    const tabs = await chrome.tabs.query({});
    const results = [];
    
    for (const tab of tabs) {
      if (!tab.url) continue;
      
      // Find which LLM this tab belongs to
      const llmId = findLLMByUrl(tab.url);
      if (!llmId || !settings.llmSettings[llmId]?.enabled) continue;
      
      try {
        // Inject content script if needed
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['llm-config.js', 'content.js']
        });
        
        // Send prompt
        const response = await chrome.tabs.sendMessage(tab.id, { 
          action: 'injectPrompt', 
          prompt: prompt,
          llmConfig: LLM_CONFIG[llmId]
        });
        
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
        results.push({
          llmId,
          success: false,
          error: error.message
        });
      }
    }
    
    console.log('Broadcast results:', results);
    return results;
    
  } catch (error) {
    console.error('Error broadcasting to LLMs:', error);
  }
}

function findLLMByUrl(url) {
  for (const [llmId, config] of Object.entries(LLM_CONFIG)) {
    const llmDomain = new URL(config.url).hostname;
    if (url.includes(llmDomain)) {
      return llmId;
    }
  }
  return null;
}

async function getSettings() {
  const result = await chrome.storage.sync.get(['llmSettings', 'preferences']);
  return {
    llmSettings: result.llmSettings || {},
    preferences: result.preferences || {}
  };
}

async function updateSettings(newSettings) {
  await chrome.storage.sync.set(newSettings);
}

async function updateLastUsed(llmId) {
  const settings = await getSettings();
  settings.llmSettings[llmId].lastUsed = Date.now();
  await chrome.storage.sync.set({ llmSettings: settings.llmSettings });
}

async function openLLMTab(llmId) {
  const config = LLM_CONFIG[llmId];
  if (config) {
    await chrome.tabs.create({ url: config.url });
  }
}