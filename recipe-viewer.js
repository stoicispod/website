// Recipe viewer script
// Get recipe data from URL parameters
function getRecipeData() {
  const urlParams = new URLSearchParams(window.location.search);
  const recipeData = urlParams.get('data');
  
  if (recipeData) {
    try {
      const recipe = JSON.parse(decodeURIComponent(recipeData));
      displayRecipe(recipe);
    } catch (e) {
      showError('Invalid recipe data');
    }
  } else {
    showError('No recipe data provided');
  }
}

// Show error message
function showError(message) {
  document.getElementById('recipeTitle').textContent = 'Error';
  document.getElementById('recipeSource').textContent = message;
  document.getElementById('ingredientsList').innerHTML = '';
  document.getElementById('instructionsText').textContent = '';
}

// Display the recipe
function displayRecipe(recipe) {
  // Set title and source
  document.getElementById('recipeTitle').textContent = recipe.name || 'Untitled Recipe';
  document.getElementById('recipeSource').textContent = `From: ${recipe.url || 'Unknown source'}`;
  
  // Set ingredients
  const ingredientsList = document.getElementById('ingredientsList');
  if (recipe.recipeIngredient && recipe.recipeIngredient.length > 0) {
    ingredientsList.innerHTML = recipe.recipeIngredient.map(ingredient => 
      `<li>${ingredient}</li>`
    ).join('');
  } else {
    ingredientsList.innerHTML = '<li>No ingredients found</li>';
  }
  
  // Set instructions
  const instructionsText = document.getElementById('instructionsText');
  if (recipe.recipeInstructions) {
    instructionsText.textContent = formatInstructions(recipe.recipeInstructions);
  } else {
    instructionsText.textContent = 'No instructions found';
  }
  
  // Set meta information
  const metaContainer = document.getElementById('recipeMeta');
  const metaItems = [];
  
  if (recipe.prepTime) metaItems.push({ label: 'Prep Time', value: recipe.prepTime });
  if (recipe.cookTime) metaItems.push({ label: 'Cook Time', value: recipe.cookTime });
  if (recipe.totalTime) metaItems.push({ label: 'Total Time', value: recipe.totalTime });
  if (recipe.recipeYield) metaItems.push({ label: 'Servings', value: recipe.recipeYield });
  
  if (metaItems.length > 0) {
    metaContainer.innerHTML = metaItems.map(item => `
      <div class="meta-item">
        <div class="meta-label">${item.label}</div>
        <div class="meta-value">${item.value}</div>
      </div>
    `).join('');
    metaContainer.style.display = 'flex';
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
  
  // Clean up image captions and unwanted text
  formatted = cleanInstructions(formatted);
  
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

// Clean up instructions by removing image captions and unwanted text
function cleanInstructions(instructions) {
  let cleaned = instructions;
  
  // Remove photographer credits and image captions
  cleaned = cleaned.replace(/Photographer:\s*[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Food\s*Styling:\s*[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Prop\s*Styling:\s*[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Photo\s*by:\s*[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Image\s*by:\s*[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Credit:\s*[^\\n]*/gi, '');
  
  // Remove common unwanted patterns
  cleaned = cleaned.replace(/\*+\s*Percent\s*Daily\s*Values[^*]*\*/gi, '');
  cleaned = cleaned.replace(/\*+\s*Nutrient\s*information[^*]*\*/gi, '');
  cleaned = cleaned.replace(/\*+\s*Information\s*is\s*not\s*currently\s*available[^*]*\*/gi, '');
  cleaned = cleaned.replace(/\*+\s*If\s*you\s*are\s*following[^*]*\*/gi, '');
  
  // Remove privacy policy and terms text
  cleaned = cleaned.replace(/Store\s*and\/or\s*access\s*information[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Use\s*limited\s*data[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Create\s*profiles[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Measure\s*advertising[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Develop\s*and\s*improve[^\\n]*/gi, '');
  cleaned = cleaned.replace(/List\s*of\s*Partners[^\\n]*/gi, '');
  
  // Remove community guidelines and help text
  cleaned = cleaned.replace(/Get\s*recipe\s*help[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Check\s*out\s*our\s*Community[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Connect\s*with\s*the\s*community[^\\n]*/gi, '');
  
  // Remove recipe scaling notes
  cleaned = cleaned.replace(/This\s*recipe\s*was\s*developed[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Ingredient\s*amounts\s*are\s*automatically[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Note\s*that\s*not\s*all\s*recipes[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Original\s*recipe[^\\n]*/gi, '');
  
  // Remove recipe developer credits
  cleaned = cleaned.replace(/Recipe\s*developed\s*by[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Recipe\s*by:[^\\n]*/gi, '');
  
  // Remove cookie and privacy policy text (very long patterns)
  cleaned = cleaned.replace(/We\s*process\s*your\s*data[^\\n]*/gi, '');
  cleaned = cleaned.replace(/These\s*cookies[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Advertising\s*presented[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Information\s*about\s*your\s*activity[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Content\s*presented[^\\n]*/gi, '');
  cleaned = cleaned.replace(/Reports\s*can\s*be\s*generated[^\\n]*/gi, '');
  
  // Clean up multiple newlines and whitespace
  cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n');
  cleaned = cleaned.replace(/^\s+|\s+$/g, '');
  
  return cleaned;
}

// Setup event listeners for buttons
function setupEventListeners() {
  // Print button
  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', function() {
      console.log('Print button clicked'); // Debug log
      window.print();
    });
  }
  
  // Back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Back button clicked'); // Debug log
      window.close();
    });
  }
}

// Load recipe when page loads
document.addEventListener('DOMContentLoaded', function() {
  getRecipeData();
  setupEventListeners();
});