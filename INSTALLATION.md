# Recipe Cookbook Chrome Extension - Installation Guide

## Quick Start

1. **Download the extension files** to your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top right)
4. **Click "Load unpacked"** and select the extension folder
5. **Start saving recipes!** Visit any recipe website and click the extension icon

## Creating Icons (Required)

The extension needs icon files. You can create them easily:

1. **Open `create_simple_icons.html`** in your browser
2. **Click the download buttons** to save the icons
3. **Place the downloaded files** in the `icons/` folder:
   - `icon16.png`
   - `icon48.png` 
   - `icon128.png`

## Testing the Extension

1. **Visit a recipe website** like:
   - Allrecipes.com
   - FoodNetwork.com
   - BBC Good Food
   - Any recipe site with structured data

2. **Click the extension icon** in your Chrome toolbar
3. **Click "Save Current Recipe"**
4. **View your saved recipes** in the popup

## Troubleshooting

### Extension not loading?
- Make sure all files are in the correct folder structure
- Check that `manifest.json` is in the root folder
- Ensure icons are in the `icons/` folder

### No recipes found?
- Try different recipe websites
- Some sites may not have structured recipe data
- The extension works best with major recipe sites

### Icons missing?
- Create the icon files using `create_simple_icons.html`
- Make sure they're named exactly: `icon16.png`, `icon48.png`, `icon128.png`
- Place them in the `icons/` folder

## File Structure

Your extension folder should look like this:

```
recipe-cookbook/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── background.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md
└── INSTALLATION.md
```

## Features

✅ **One-click recipe saving**  
✅ **Offline access to saved recipes**  
✅ **Smart recipe detection** (JSON-LD, microdata, RDFa)  
✅ **Complete recipe information** (ingredients, instructions, times)  
✅ **Local storage** (no external servers)  
✅ **Clean, modern interface**  

## Privacy

- All data stored locally in your browser
- No external requests or tracking
- Your recipes never leave your device
