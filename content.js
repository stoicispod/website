// Content script for recipe extraction
(function() {
  'use strict';

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'extractRecipe') {
      const recipe = extractRecipeData();
      sendResponse({
        success: recipe !== null,
        recipe: recipe
      });
    }
  });

  // Extract recipe data from the current page
  function extractRecipeData() {
    let recipe = null;

    // Try to find JSON-LD structured data first (most reliable)
    recipe = extractFromJSONLD();
    if (recipe) return recipe;

    // Try to find microdata
    recipe = extractFromMicrodata();
    if (recipe) return recipe;

    // Try to find RDFa
    recipe = extractFromRDFa();
    if (recipe) return recipe;

    // Fallback to heuristic extraction
    recipe = extractFromHeuristics();
    if (recipe) return recipe;

    return null;
  }

  // Extract recipe from JSON-LD structured data
  function extractFromJSONLD() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    for (let script of scripts) {
      try {
        const data = JSON.parse(script.textContent);
        const recipes = Array.isArray(data) ? data : [data];
        
        for (let item of recipes) {
          if (item['@type'] === 'Recipe' || item['@type'] === 'http://schema.org/Recipe') {
            return parseRecipeObject(item);
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    return null;
  }

  // Extract recipe from microdata
  function extractFromMicrodata() {
    const recipeElement = document.querySelector('[itemtype*="Recipe"]');
    if (!recipeElement) return null;

    const recipe = {};
    
    // Extract name
    const nameElement = recipeElement.querySelector('[itemprop="name"]');
    if (nameElement) recipe.name = nameElement.textContent.trim();

    // Extract description
    const descriptionElement = recipeElement.querySelector('[itemprop="description"]');
    if (descriptionElement) recipe.description = descriptionElement.textContent.trim();

    // Extract ingredients
    const ingredientElements = recipeElement.querySelectorAll('[itemprop="recipeIngredient"]');
    if (ingredientElements.length > 0) {
      recipe.recipeIngredient = Array.from(ingredientElements).map(el => el.textContent.trim());
    }

    // Extract instructions
    const instructionElements = recipeElement.querySelectorAll('[itemprop="recipeInstructions"]');
    if (instructionElements.length > 0) {
      recipe.recipeInstructions = Array.from(instructionElements).map(el => el.textContent.trim()).join('\n\n');
    }

    // Extract cook time
    const cookTimeElement = recipeElement.querySelector('[itemprop="cookTime"]');
    if (cookTimeElement) recipe.cookTime = cookTimeElement.textContent.trim();

    // Extract prep time
    const prepTimeElement = recipeElement.querySelector('[itemprop="prepTime"]');
    if (prepTimeElement) recipe.prepTime = prepTimeElement.textContent.trim();

    // Extract total time
    const totalTimeElement = recipeElement.querySelector('[itemprop="totalTime"]');
    if (totalTimeElement) recipe.totalTime = totalTimeElement.textContent.trim();

    // Extract yield/servings
    const yieldElement = recipeElement.querySelector('[itemprop="recipeYield"]');
    if (yieldElement) recipe.recipeYield = yieldElement.textContent.trim();

    return recipe.name ? recipe : null;
  }

  // Extract recipe from RDFa
  function extractFromRDFa() {
    const recipeElement = document.querySelector('[typeof*="Recipe"]');
    if (!recipeElement) return null;

    const recipe = {};
    
    // Extract name
    const nameElement = recipeElement.querySelector('[property="name"]');
    if (nameElement) recipe.name = nameElement.textContent.trim();

    // Extract description
    const descriptionElement = recipeElement.querySelector('[property="description"]');
    if (descriptionElement) recipe.description = descriptionElement.textContent.trim();

    // Extract ingredients
    const ingredientElements = recipeElement.querySelectorAll('[property="recipeIngredient"]');
    if (ingredientElements.length > 0) {
      recipe.recipeIngredient = Array.from(ingredientElements).map(el => el.textContent.trim());
    }

    // Extract instructions
    const instructionElements = recipeElement.querySelectorAll('[property="recipeInstructions"]');
    if (instructionElements.length > 0) {
      recipe.recipeInstructions = Array.from(instructionElements).map(el => el.textContent.trim()).join('\n\n');
    }

    return recipe.name ? recipe : null;
  }

  // Fallback heuristic extraction
  function extractFromHeuristics() {
    const recipe = {};

    // Try to find recipe title
    const titleSelectors = [
      'h1[class*="recipe"]',
      'h1[class*="title"]',
      '.recipe-title',
      '.recipe-name',
      'h1'
    ];
    
    for (let selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        recipe.name = element.textContent.trim();
        break;
      }
    }

    // Try to find ingredients
    const ingredientSelectors = [
      '[class*="ingredient"]',
      '[class*="ingredients"]',
      'ul li',
      'ol li'
    ];
    
    for (let selector of ingredientSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 3) { // Likely ingredients if more than 3 items
        const ingredients = Array.from(elements)
          .map(el => el.textContent.trim())
          .filter(text => text.length > 0 && text.length < 200);
        
        if (ingredients.length > 0) {
          recipe.recipeIngredient = ingredients;
          break;
        }
      }
    }

    // Try to find instructions
    const instructionSelectors = [
      '[class*="instruction"]',
      '[class*="direction"]',
      '[class*="step"]',
      'p'
    ];
    
    for (let selector of instructionSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        const instructions = Array.from(elements)
          .map(el => el.textContent.trim())
          .filter(text => text.length > 20 && text.length < 1000);
        
        if (instructions.length > 0) {
          recipe.recipeInstructions = instructions.join('\n\n');
          break;
        }
      }
    }

    return recipe.name ? recipe : null;
  }

  // Parse recipe object from structured data
  function parseRecipeObject(data) {
    const recipe = {};

    // Extract name
    if (data.name) {
      recipe.name = typeof data.name === 'string' ? data.name : data.name['@value'] || data.name;
    }

    // Extract description
    if (data.description) {
      recipe.description = typeof data.description === 'string' ? data.description : data.description['@value'] || data.description;
    }

    // Extract ingredients
    if (data.recipeIngredient) {
      if (Array.isArray(data.recipeIngredient)) {
        recipe.recipeIngredient = data.recipeIngredient.map(ingredient => 
          typeof ingredient === 'string' ? ingredient : ingredient['@value'] || ingredient
        );
      } else {
        recipe.recipeIngredient = [typeof data.recipeIngredient === 'string' ? data.recipeIngredient : data.recipeIngredient['@value'] || data.recipeIngredient];
      }
    }

    // Extract instructions
    if (data.recipeInstructions) {
      if (Array.isArray(data.recipeInstructions)) {
        recipe.recipeInstructions = data.recipeInstructions.map(instruction => 
          typeof instruction === 'string' ? instruction : instruction.text || instruction['@value'] || instruction
        ).join('\n\n');
      } else {
        recipe.recipeInstructions = typeof data.recipeInstructions === 'string' ? data.recipeInstructions : data.recipeInstructions.text || data.recipeInstructions['@value'] || data.recipeInstructions;
      }
    }

    // Extract times
    if (data.cookTime) {
      recipe.cookTime = typeof data.cookTime === 'string' ? data.cookTime : data.cookTime['@value'] || data.cookTime;
    }
    if (data.prepTime) {
      recipe.prepTime = typeof data.prepTime === 'string' ? data.prepTime : data.prepTime['@value'] || data.prepTime;
    }
    if (data.totalTime) {
      recipe.totalTime = typeof data.totalTime === 'string' ? data.totalTime : data.totalTime['@value'] || data.totalTime;
    }

    // Extract yield
    if (data.recipeYield) {
      recipe.recipeYield = typeof data.recipeYield === 'string' ? data.recipeYield : data.recipeYield['@value'] || data.recipeYield;
    }

    return recipe;
  }

})();
