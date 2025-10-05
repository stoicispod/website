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
            <button class="btn-small btn-view" onclick="viewRecipe(${index})">View</button>
            <button class="btn-small btn-delete" onclick="deleteRecipe(${index})">Delete</button>
          </div>
          <div class="recipe-details" id="details-${index}">
            <h3>${recipe.name}</h3>
            <div class="recipe-ingredients">
              <h4>Ingredients:</h4>
              <ul>
                ${recipe.recipeIngredient ? recipe.recipeIngredient.map(ingredient => `<li>${ingredient}</li>`).join('') : '<li>No ingredients found</li>'}
              </ul>
            </div>
            <div class="recipe-instructions">
              <h4>Instructions:</h4>
              <p>${recipe.recipeInstructions || 'No instructions found'}</p>
            </div>
            <button class="close-details" onclick="closeDetails(${index})">Close</button>
          </div>
        </div>
      `).join('');
    });
  }

  // View recipe details
  window.viewRecipe = function(index) {
    const details = document.getElementById(`details-${index}`);
    const isVisible = details.style.display === 'block';
    
    // Close all other details
    document.querySelectorAll('.recipe-details').forEach(detail => {
      detail.style.display = 'none';
    });
    
    // Toggle current details
    details.style.display = isVisible ? 'none' : 'block';
  };

  // Close recipe details
  window.closeDetails = function(index) {
    document.getElementById(`details-${index}`).style.display = 'none';
  };

  // Delete recipe
  window.deleteRecipe = function(index) {
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
  };

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
