# Recipe Cookbook Chrome Extension

A Chrome extension that allows you to save recipes from any website to your personal cookbook for offline access.

## Features

- 🍳 **One-click recipe saving** - Save recipes from any website with a single click
- 📱 **Offline access** - View your saved recipes even without internet connection
- 🔍 **Smart detection** - Automatically detects recipe data using structured data (JSON-LD, microdata, RDFa)
- 📋 **Complete recipe info** - Saves ingredients, instructions, cooking times, and more
- 🗂️ **Organized storage** - View, search, and manage all your saved recipes
- 🚀 **Fast and lightweight** - Minimal impact on browser performance

## Installation

### Method 1: Load as Unpacked Extension (Development)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your Chrome toolbar

### Method 2: Package and Install

1. Go to `chrome://extensions/`
2. Click "Pack extension"
3. Select the extension folder
4. Install the generated `.crx` file

## How to Use

1. **Save a Recipe**: Visit any recipe website and click the Recipe Cookbook extension icon in your toolbar
2. **View Saved Recipes**: Click the extension icon to see all your saved recipes
3. **Access Offline**: Your recipes are stored locally and available even without internet

## Supported Recipe Formats

The extension automatically detects recipes using:

- **JSON-LD structured data** (most reliable)
- **Microdata** (schema.org)
- **RDFa** (Resource Description Framework)
- **Heuristic detection** (fallback for sites without structured data)

## Supported Recipe Websites

Works with most major recipe websites including:
- Allrecipes
- Food Network
- BBC Good Food
- Serious Eats
- Bon Appétit
- And many more!

## Data Storage

- All recipes are stored locally in your browser
- No data is sent to external servers
- Recipes persist across browser sessions
- You can export/import your recipe data

## Privacy

- **100% Local Storage** - Your recipes never leave your device
- **No Tracking** - No analytics or user tracking
- **No External Requests** - All data stays on your computer

## Development

### File Structure

```
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── content.js            # Recipe extraction logic
├── background.js         # Background service worker
├── icons/                # Extension icons
└── README.md            # This file
```

### Key Components

- **Content Script** (`content.js`): Extracts recipe data from web pages
- **Popup** (`popup.html/js`): User interface for managing recipes
- **Background Script** (`background.js`): Extension lifecycle management
- **Storage**: Chrome's local storage API for offline data

## Troubleshooting

### Extension Not Working?
- Make sure you're on a recipe page with structured data
- Try refreshing the page and clicking the extension again
- Check that the extension is enabled in `chrome://extensions/`

### Recipes Not Saving?
- Ensure the website has recipe data in a supported format
- Some sites may not have structured recipe data
- Try the extension on well-known recipe sites first

### Performance Issues?
- The extension is designed to be lightweight
- If you have many saved recipes, consider deleting old ones
- Clear browser cache if needed

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - Feel free to use and modify as needed.
