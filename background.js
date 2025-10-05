// Background script for Recipe Cookbook extension
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    // Initialize storage with empty recipes array
    chrome.storage.local.set({ recipes: [] });
    
    // Show welcome notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Recipe Cookbook Installed!',
      message: 'Visit any recipe website and click the extension icon to save recipes!'
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(function(tab) {
  // This will open the popup automatically due to the manifest configuration
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'recipeSaved') {
    // Update badge to show number of saved recipes
    chrome.storage.local.get(['recipes'], function(result) {
      const count = result.recipes ? result.recipes.length : 0;
      chrome.action.setBadgeText({ text: count.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#e74c3c' });
    });
  }
});

// Update badge when storage changes
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'local' && changes.recipes) {
    const count = changes.recipes.newValue ? changes.recipes.newValue.length : 0;
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#e74c3c' });
  }
});
