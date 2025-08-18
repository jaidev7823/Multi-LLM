// Background script for Multi LLM Broadcaster
chrome.runtime.onInstalled.addListener(() => {
  console.log('Multi LLM Broadcaster extension installed');
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'broadcastPrompt') {
    broadcastToAllTabs(message.prompt);
    sendResponse({ success: true });
  }
});

async function broadcastToAllTabs(prompt) {
  try {
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
      if (tab.url && (tab.url.includes('chatgpt.com') || tab.url.includes('deepseek.com'))) {
        try {
          await chrome.tabs.sendMessage(tab.id, { 
            action: 'injectPrompt', 
            prompt: prompt 
          });
          console.log(`Sent prompt to tab: ${tab.url}`);
        } catch (error) {
          console.log(`Failed to send to tab ${tab.url}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error broadcasting prompt:', error);
  }
}