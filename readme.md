# 🤖 Multi LLM Hub

A browser extension that allows you to interact with multiple AI assistants simultaneously from one interface. Send prompts to ChatGPT, Claude, Gemini, DeepSeek, and more with a single click!

## ✨ Features

- **Multi-LLM Support**: 10+ predefined LLMs ready to use
- **One-Click Broadcasting**: Send prompts to all enabled LLMs simultaneously
- **Smart Toggle System**: Easy enable/disable for each LLM
- **Open All Active LLMs**: Quickly open tabs for all enabled LLMs
- **Persistent Settings**: Remembers your preferences across sessions
- **Usage Tracking**: Statistics and last-used timestamps
- **Cross-Browser**: Works on both Chrome and Firefox
- **Export/Import**: Backup and restore your settings

## 🚀 Supported LLMs

- **ChatGPT** (OpenAI) 🤖
- **Claude** (Anthropic) 🧠
- **Gemini** (Google) ✨
- **DeepSeek** 🔍
- **Poe** (Quora) 🎭
- **Mistral AI** 🌪️
- **Cohere** 🔗
- **Perplexity** 🔮
- **You.com** 🔍
- **HuggingFace Chat** 🤗

## 📦 Installation

### Chrome (Manifest V3)

1. **Download/Clone** this repository
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"** and select the extension folder
5. **Use `manifest.json`** (the default manifest file)

### Firefox (Manifest V2)

1. **Download/Clone** this repository
2. **Rename** `manifest-firefox.json` to `manifest.json`
3. **Rename** the original `manifest.json` to `manifest-chrome.json` (backup)
4. **Open Firefox** and go to `about:debugging`
5. **Click "This Firefox"** → **"Load Temporary Add-on"**
6. **Select** the `manifest.json` file (the renamed Firefox version)

## 🎯 How to Use

### Quick Start
1. **Install the extension** (see installation steps above)
2. **Click the extension icon** in your browser toolbar
3. **Go to Settings tab** and enable your preferred LLMs
4. **Click "🚀 Open All Active LLMs"** to open tabs for enabled LLMs
5. **Switch to Search tab**, enter your prompt, and click "Send to All LLMs"

### Detailed Usage

#### 1. **Configure LLMs**
- Click the extension icon
- Go to the **Settings tab**
- Toggle LLMs on/off using the switches
- Use quick actions: "Enable All", "Disable All", or "Reset"

#### 2. **Open LLM Tabs**
- Click **"🚀 Open All Active LLMs"** to open tabs for all enabled LLMs
- Or manually open the LLM websites you want to use

#### 3. **Send Prompts**
- Go to the **Search tab**
- Enter your prompt in the text area
- Click **"Send to All LLMs"** to broadcast to all enabled LLMs
- Check the status for success/error feedback

#### 4. **Advanced Settings**
- Click **"Advanced Settings"** in the popup footer
- View detailed LLM configurations
- Check usage statistics
- Export/import your settings

## 🔧 Key Features Explained

### Multi-LLM Broadcasting
Send one prompt to multiple AI assistants simultaneously to:
- **Compare responses** from different models
- **Get diverse perspectives** on complex questions
- **Save time** by not manually copying prompts

### Smart LLM Detection
The extension automatically:
- **Detects which LLM** you're on based on the URL
- **Uses specific selectors** for each LLM's interface
- **Handles different input types** (textarea, contenteditable, etc.)

### Persistent Configuration
Your settings are automatically saved and include:
- **Enabled/disabled LLMs**
- **Usage timestamps**
- **User preferences**
- **Cross-device sync** (Chrome only)

## 🛠️ Technical Details

### File Structure
```
├── manifest.json              # Chrome Manifest V3
├── manifest-firefox.json      # Firefox Manifest V2
├── background.js             # Chrome background script
├── background-firefox.js     # Firefox background script
├── llm-config.js            # LLM configurations
├── popup.html               # Extension popup UI
├── popup.js                 # Popup functionality
├── settings.html            # Settings page UI
├── settings.js              # Settings functionality
├── content.js               # Content script for LLM injection
└── README.md               # This file
```

### Browser Compatibility
- **Chrome**: Uses Manifest V3 with service workers
- **Firefox**: Uses Manifest V2 with background scripts
- **Cross-compatible APIs**: Automatically detects and uses appropriate browser APIs

## 🔒 Permissions

### Chrome
- `tabs` - To query and message tabs
- `scripting` - To inject content scripts
- `activeTab` - To access current tab
- `storage` - To save settings
- `host_permissions` - To access LLM websites

### Firefox
- `tabs` - To query and message tabs
- `activeTab` - To access current tab
- `storage` - To save settings
- URL permissions for each LLM website

## 🐛 Troubleshooting

### Common Issues

**"No LLM tabs found"**
- Make sure you have LLM websites open in tabs
- Check that the LLMs are enabled in settings
- Verify the URLs match supported LLM sites

**"Could not establish connection"**
- Reload the extension after installation
- Refresh the LLM website tabs
- Check browser console for errors

**Prompt not injecting**
- Make sure you're on a supported LLM website
- Check that the input field is visible and accessible
- Try refreshing the page and extension

### Firefox-Specific Issues

**"background.service_worker is currently disabled"**
- Make sure you're using `manifest-firefox.json` renamed to `manifest.json`
- Firefox uses Manifest V2, not V3

## 🤝 Contributing

Feel free to:
- **Add new LLMs** by updating `llm-config.js`
- **Improve selectors** for better compatibility
- **Report bugs** or suggest features
- **Submit pull requests**

## 📄 License

This project is open source. Feel free to use, modify, and distribute.

---

**Happy AI chatting!** 🚀✨