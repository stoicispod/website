// Popup script for the Recipe Cookbook extension
document.addEventListener('DOMContentLoaded', function() {
  const saveRecipeBtn = document.getElementById('saveRecipeBtn');
  const statusDiv = document.getElementById('status');
  const recipesList = document.getElementById('recipesList');

  // Show status message
  function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    if (type === 'success') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);
    }
  }

  // Format instructions for better readability
  function formatInstructions(instructions) {
    if (!instructions) return 'No instructions found';
    
    // If it's already an array, join it
    if (Array.isArray(instructions)) {
      return instructions.map((step, index) => `${index + 1}. ${step}`).join('\n\n');
    }
    
    // If it's a string, try to split it into steps
    let formatted = instructions.toString();
    
    // Try to split by common patterns
    const patterns = [
      /\d+\.\s+/g,  // "1. " pattern
      /\n\s*\d+\.\s+/g,  // New line followed by number
      /\n\s*-\s+/g,  // Bullet points
      /\n\s*\*\s+/g  // Asterisk bullets
    ];
    
    for (let pattern of patterns) {
      if (pattern.test(formatted)) {
        const steps = formatted.split(pattern).filter(step => step.trim());
        return steps.map((step, index) => `${index + 1}. ${step.trim()}`).join('\n\n');
      }
    }
    
    // If no clear pattern, try to split by sentences and number them
    const sentences = formatted.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length > 1) {
      return sentences.map((sentence, index) => `${index + 1}. ${sentence.trim()}.`).join('\n\n');
    }
    
    // Fallback: return as-is but with better formatting
    return formatted.replace(/\n/g, '\n\n');
  }

  // Event delegation for recipe actions
  function setupEventListeners() {
    recipesList.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const action = e.target.getAttribute('data-action');
      const index = parseInt(e.target.getAttribute('data-index'));
      
      console.log('Button clicked:', action, 'Index:', index); // Debug log
      
      if (action === 'view') {
        // Get recipe data and pass it to the viewer
        chrome.storage.local.get(['recipes'], function(result) {
          const recipes = result.recipes || [];
          const recipe = recipes[index];
          
          if (recipe) {
            // Encode recipe data and pass it to the viewer
            const recipeData = encodeURIComponent(JSON.stringify(recipe));
            const viewerUrl = chrome.runtime.getURL('recipe-viewer.html') + `?data=${recipeData}`;
            chrome.tabs.create({ url: viewerUrl });
          } else {
            showStatus('Recipe not found', 'error');
          }
        });
      } else if (action === 'delete') {
        if (confirm('Are you sure you want to delete this recipe?')) {
          chrome.storage.local.get(['recipes'], function(result) {
            const recipes = result.recipes || [];
            recipes.splice(index, 1);
            
            chrome.storage.local.set({ recipes: recipes }, function() {
              loadRecipes();
              showStatus('Recipe deleted successfully', 'success');
            });
          });
        }
      } else if (action === 'close') {
        const details = document.getElementById(`details-${index}`);
        if (details) {
          details.style.display = 'none';
        }
      }
    });
  }

  // Load and display saved recipes
  function loadRecipes() {
    chrome.storage.local.get(['recipes'], function(result) {
      const recipes = result.recipes || [];
      
      if (recipes.length === 0) {
        recipesList.innerHTML = `
          <div class="empty-state">
            <p>No recipes saved yet.<br>Visit a recipe page and click "Save Current Recipe" to get started!</p>
          </div>
        `;
        return;
      }

      recipesList.innerHTML = recipes.map((recipe, index) => `
        <div class="recipe-item" data-index="${index}">
          <div class="recipe-title">${recipe.name}</div>
          <div class="recipe-source">From: ${recipe.url}</div>
          <div class="recipe-actions">
            <button class="btn-small btn-view" data-action="view" data-index="${index}">View Recipe</button>
            <button class="btn-small btn-delete" data-action="delete" data-index="${index}">Delete</button>
          </div>
          <div class="recipe-details" id="details-${index}" style="display: none;">
            <h3>${recipe.name}</h3>
            <div class="recipe-ingredients">
              <h4>Ingredients:</h4>
              <ul>
                ${recipe.recipeIngredient ? recipe.recipeIngredient.map(ingredient => `<li>${ingredient}</li>`).join('') : '<li>No ingredients found</li>'}
              </ul>
            </div>
            <div class="recipe-instructions">
              <h4>Instructions:</h4>
              <div class="instructions-text">${formatInstructions(recipe.recipeInstructions).replace(/\n/g, '<br>')}</div>
            </div>
            <button class="close-details" data-action="close" data-index="${index}">Close</button>
          </div>
        </div>
      `).join('');
      
      // Re-setup event listeners after HTML is generated
      setupEventListeners();
    });
  }

  // Save current recipe
  saveRecipeBtn.addEventListener('click', function() {
    saveRecipeBtn.disabled = true;
    saveRecipeBtn.textContent = 'Saving...';
    
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const activeTab = tabs[0];
      
      // Send message to content script to extract recipe data
      chrome.tabs.sendMessage(activeTab.id, { action: 'extractRecipe' }, function(response) {
        if (chrome.runtime.lastError) {
          showStatus('Error: Could not access the current page. Make sure you\'re on a recipe page.', 'error');
          saveRecipeBtn.disabled = false;
          saveRecipeBtn.textContent = 'Save Current Recipe';
          return;
        }
        
        if (response && response.success) {
          // Save recipe to storage
          chrome.storage.local.get(['recipes'], function(result) {
            const recipes = result.recipes || [];
            recipes.push({
              ...response.recipe,
              savedAt: new Date().toISOString(),
              url: activeTab.url
            });
            
            chrome.storage.local.set({ recipes: recipes }, function() {
              showStatus('Recipe saved successfully!', 'success');
              loadRecipes();
              saveRecipeBtn.disabled = false;
              saveRecipeBtn.textContent = 'Save Current Recipe';
            });
          });
        } else {
          showStatus('No recipe found on this page. Make sure you\'re on a recipe website.', 'error');
          saveRecipeBtn.disabled = false;
          saveRecipeBtn.textContent = 'Save Current Recipe';
        }
      });
    });
  });

  // Load recipes when popup opens
  loadRecipes();
});