/**
 * Alongside Onboarding
 * First-time user setup flow
 */

import { store } from '../store.js';

// Condition options
const CONDITIONS = [
  { id: 'back', name: 'Lower Back', icon: '🔙' },
  { id: 'knee', name: 'Knee', icon: '🦵' },
  { id: 'shoulder', name: 'Shoulder', icon: '💪' },
  { id: 'hip', name: 'Hip', icon: '🦴' },
  { id: 'ankle', name: 'Ankle', icon: '🦶' },
  { id: 'wrist', name: 'Wrist', icon: '✋' },
  { id: 'neck', name: 'Neck', icon: '🧣' }
];

// Equipment options
const EQUIPMENT = [
  { id: 'none', name: 'No equipment', icon: '🏠', description: 'Bodyweight only' },
  { id: 'dumbbells', name: 'Dumbbells', icon: '🏋️', description: 'Any weight' },
  { id: 'kettlebell', name: 'Kettlebell', icon: '🔔', description: 'Any weight' },
  { id: 'resistance-bands', name: 'Resistance Bands', icon: '🎗️', description: 'Any resistance' },
  { id: 'pull-up-bar', name: 'Pull-up Bar', icon: '🪜', description: 'Doorway or mounted' },
  { id: 'yoga-mat', name: 'Yoga Mat', icon: '🧘', description: 'For floor work' }
];

// Goal options
const GOALS = [
  { id: 'lose-weight', name: 'Lose weight', icon: '⚖️' },
  { id: 'build-muscle', name: 'Build muscle', icon: '💪' },
  { id: 'get-stronger', name: 'Get stronger', icon: '🏋️' },
  { id: 'improve-cardio', name: 'Improve cardio', icon: '❤️' },
  { id: 'more-energy', name: 'Have more energy', icon: '⚡' },
  { id: 'reduce-stress', name: 'Reduce stress', icon: '🧘' },
  { id: 'move-without-pain', name: 'Move without pain', icon: '🩹' },
  { id: 'build-habit', name: 'Build exercise habit', icon: '📅' }
];

// Current step in onboarding
let currentStep = 1;
const TOTAL_STEPS = 5;

// Collected data
let onboardingData = {
  name: '',
  weight: null,
  goalWeight: null,
  weightUnit: 'kg',
  conditions: [],
  equipment: ['none'],
  goals: []
};

/**
 * Check if onboarding is needed
 */
function needsOnboarding() {
  return !store.get('profile.onboardingComplete');
}

/**
 * Start onboarding flow
 */
function start() {
  currentStep = 1;
  onboardingData = {
    name: '',
    weight: null,
    goalWeight: null,
    weightUnit: 'kg',
    conditions: [],
    equipment: ['none'],
    goals: []
  };
  renderCurrentStep();
}

/**
 * Render the current step
 */
function renderCurrentStep() {
  const main = document.getElementById('main');
  if (!main) return;
  
  // Hide nav during onboarding
  const nav = document.getElementById('nav');
  if (nav) nav.style.display = 'none';
  
  switch (currentStep) {
    case 1:
      main.innerHTML = renderWelcome();
      break;
    case 2:
      main.innerHTML = renderNameWeight();
      break;
    case 3:
      main.innerHTML = renderConditions();
      break;
    case 4:
      main.innerHTML = renderEquipment();
      break;
    case 5:
      main.innerHTML = renderGoals();
      break;
    default:
      completeOnboarding();
  }
}

/**
 * Step 1: Welcome
 */
function renderWelcome() {
  return `
    <div class="screen screen--active onboarding">
      <div class="onboarding__content onboarding__content--centered">
        <span class="onboarding__hero-icon">🌱</span>
        <h1 class="onboarding__title">Welcome to Alongside</h1>
        <p class="onboarding__subtitle">
          Your compassionate fitness coach that adapts to your life, 
          not the other way around.
        </p>
        
        <div class="onboarding__features">
          <div class="onboarding__feature">
            <span>💚</span>
            <span>No shame, no pressure</span>
          </div>
          <div class="onboarding__feature">
            <span>🎯</span>
            <span>Adapts to how you feel</span>
          </div>
          <div class="onboarding__feature">
            <span>🩹</span>
            <span>Respects your injuries</span>
          </div>
        </div>
        
        <button class="onboarding__btn onboarding__btn--primary" onclick="window.alongside.onboardingNext()">
          Let's get started →
        </button>
      </div>
      
      <div class="onboarding__progress">
        <div class="onboarding__progress-bar" style="width: ${(currentStep / TOTAL_STEPS) * 100}%"></div>
      </div>
    </div>
  `;
}

/**
 * Step 2: Name and Weight
 */
function renderNameWeight() {
  return `
    <div class="screen screen--active onboarding">
      <div class="onboarding__header">
        <button class="onboarding__back" onclick="window.alongside.onboardingBack()">← Back</button>
        <span class="onboarding__step">Step ${currentStep} of ${TOTAL_STEPS}</span>
      </div>
      
      <div class="onboarding__content">
        <h2 class="onboarding__title">Let's get to know you</h2>
        <p class="onboarding__subtitle">This helps us personalise your experience</p>
        
        <div class="onboarding__form">
          <div class="onboarding__field">
            <label class="onboarding__label">What should we call you?</label>
            <input type="text" 
                   id="onboardingName" 
                   class="onboarding__input"
                   placeholder="Your name"
                   value="${onboardingData.name}"
                   maxlength="30">
          </div>
          
          <div class="onboarding__field">
            <label class="onboarding__label">Current weight <span class="onboarding__optional">(optional)</span></label>
            <div class="onboarding__input-row">
              <input type="number" 
                     id="onboardingWeight" 
                     class="onboarding__input onboarding__input--number"
                     placeholder="0"
                     value="${onboardingData.weight || ''}"
                     min="30"
                     max="300"
                     step="0.1">
              <select id="onboardingWeightUnit" class="onboarding__select">
                <option value="kg" ${onboardingData.weightUnit === 'kg' ? 'selected' : ''}>kg</option>
                <option value="st" ${onboardingData.weightUnit === 'st' ? 'selected' : ''}>stone</option>
                <option value="lb" ${onboardingData.weightUnit === 'lb' ? 'selected' : ''}>lbs</option>
              </select>
            </div>
          </div>
          
          <div class="onboarding__field">
            <label class="onboarding__label">Goal weight <span class="onboarding__optional">(optional)</span></label>
            <div class="onboarding__input-row">
              <input type="number" 
                     id="onboardingGoalWeight" 
                     class="onboarding__input onboarding__input--number"
                     placeholder="0"
                     value="${onboardingData.goalWeight || ''}"
                     min="30"
                     max="300"
                     step="0.1">
              <span class="onboarding__unit-label" id="goalWeightUnit">${onboardingData.weightUnit}</span>
            </div>
          </div>
        </div>
        
        <button class="onboarding__btn onboarding__btn--primary" onclick="window.alongside.onboardingNext()">
          Continue →
        </button>
      </div>
      
      <div class="onboarding__progress">
        <div class="onboarding__progress-bar" style="width: ${(currentStep / TOTAL_STEPS) * 100}%"></div>
      </div>
    </div>
  `;
}

/**
 * Step 3: Conditions
 */
function renderConditions() {
  return `
    <div class="screen screen--active onboarding">
      <div class="onboarding__header">
        <button class="onboarding__back" onclick="window.alongside.onboardingBack()">← Back</button>
        <span class="onboarding__step">Step ${currentStep} of ${TOTAL_STEPS}</span>
      </div>
      
      <div class="onboarding__content">
        <h2 class="onboarding__title">Any areas we should be careful with?</h2>
        <p class="onboarding__subtitle">We'll filter out exercises that might aggravate these</p>
        
        <div class="onboarding__options onboarding__options--grid">
          ${CONDITIONS.map(condition => `
            <button class="onboarding__option ${onboardingData.conditions.includes(condition.id) ? 'onboarding__option--selected' : ''}"
                    onclick="window.alongside.toggleCondition('${condition.id}')">
              <span class="onboarding__option-icon">${condition.icon}</span>
              <span class="onboarding__option-name">${condition.name}</span>
            </button>
          `).join('')}
        </div>
        
        <p class="onboarding__hint">
          💡 Select all that apply, or skip if none
        </p>
        
        <button class="onboarding__btn onboarding__btn--primary" onclick="window.alongside.onboardingNext()">
          ${onboardingData.conditions.length > 0 ? 'Continue →' : 'Skip →'}
        </button>
      </div>
      
      <div class="onboarding__progress">
        <div class="onboarding__progress-bar" style="width: ${(currentStep / TOTAL_STEPS) * 100}%"></div>
      </div>
    </div>
  `;
}

/**
 * Step 4: Equipment
 */
function renderEquipment() {
  return `
    <div class="screen screen--active onboarding">
      <div class="onboarding__header">
        <button class="onboarding__back" onclick="window.alongside.onboardingBack()">← Back</button>
        <span class="onboarding__step">Step ${currentStep} of ${TOTAL_STEPS}</span>
      </div>
      
      <div class="onboarding__content">
        <h2 class="onboarding__title">What equipment do you have?</h2>
        <p class="onboarding__subtitle">We'll suggest exercises you can actually do</p>
        
        <div class="onboarding__options">
          ${EQUIPMENT.map(item => `
            <button class="onboarding__option onboarding__option--wide ${onboardingData.equipment.includes(item.id) ? 'onboarding__option--selected' : ''}"
                    onclick="window.alongside.toggleEquipment('${item.id}')">
              <span class="onboarding__option-icon">${item.icon}</span>
              <div class="onboarding__option-text">
                <span class="onboarding__option-name">${item.name}</span>
                <span class="onboarding__option-desc">${item.description}</span>
              </div>
              <span class="onboarding__option-check">${onboardingData.equipment.includes(item.id) ? '✓' : ''}</span>
            </button>
          `).join('')}
        </div>
        
        <button class="onboarding__btn onboarding__btn--primary" onclick="window.alongside.onboardingNext()">
          Continue →
        </button>
      </div>
      
      <div class="onboarding__progress">
        <div class="onboarding__progress-bar" style="width: ${(currentStep / TOTAL_STEPS) * 100}%"></div>
      </div>
    </div>
  `;
}

/**
 * Step 5: Goals
 */
function renderGoals() {
  return `
    <div class="screen screen--active onboarding">
      <div class="onboarding__header">
        <button class="onboarding__back" onclick="window.alongside.onboardingBack()">← Back</button>
        <span class="onboarding__step">Step ${currentStep} of ${TOTAL_STEPS}</span>
      </div>
      
      <div class="onboarding__content">
        <h2 class="onboarding__title">What are you working towards?</h2>
        <p class="onboarding__subtitle">Pick up to 3 main goals</p>
        
        <div class="onboarding__options onboarding__options--grid">
          ${GOALS.map(goal => `
            <button class="onboarding__option ${onboardingData.goals.includes(goal.id) ? 'onboarding__option--selected' : ''}"
                    onclick="window.alongside.toggleGoal('${goal.id}')"
                    ${onboardingData.goals.length >= 3 && !onboardingData.goals.includes(goal.id) ? 'disabled' : ''}>
              <span class="onboarding__option-icon">${goal.icon}</span>
              <span class="onboarding__option-name">${goal.name}</span>
            </button>
          `).join('')}
        </div>
        
        <p class="onboarding__hint">
          ${onboardingData.goals.length}/3 selected
        </p>
        
        <button class="onboarding__btn onboarding__btn--primary" 
                onclick="window.alongside.onboardingNext()"
                ${onboardingData.goals.length === 0 ? 'disabled' : ''}>
          Complete Setup →
        </button>
      </div>
      
      <div class="onboarding__progress">
        <div class="onboarding__progress-bar" style="width: ${(currentStep / TOTAL_STEPS) * 100}%"></div>
      </div>
    </div>
  `;
}

/**
 * Go to next step
 */
function next() {
  // Save current step data
  saveCurrentStepData();
  
  currentStep++;
  
  if (currentStep > TOTAL_STEPS) {
    completeOnboarding();
  } else {
    renderCurrentStep();
  }
}

/**
 * Go to previous step
 */
function back() {
  if (currentStep > 1) {
    currentStep--;
    renderCurrentStep();
  }
}

/**
 * Save data from current step
 */
function saveCurrentStepData() {
  switch (currentStep) {
    case 2:
      const nameEl = document.getElementById('onboardingName');
      const weightEl = document.getElementById('onboardingWeight');
      const goalWeightEl = document.getElementById('onboardingGoalWeight');
      const unitEl = document.getElementById('onboardingWeightUnit');
      
      if (nameEl) onboardingData.name = nameEl.value.trim();
      if (weightEl) onboardingData.weight = parseFloat(weightEl.value) || null;
      if (goalWeightEl) onboardingData.goalWeight = parseFloat(goalWeightEl.value) || null;
      if (unitEl) onboardingData.weightUnit = unitEl.value;
      break;
  }
}

/**
 * Toggle a condition selection
 */
function toggleCondition(conditionId) {
  const index = onboardingData.conditions.indexOf(conditionId);
  if (index > -1) {
    onboardingData.conditions.splice(index, 1);
  } else {
    onboardingData.conditions.push(conditionId);
  }
  renderCurrentStep();
}

/**
 * Toggle equipment selection
 */
function toggleEquipment(equipmentId) {
  // Special handling for 'none' - clear others
  if (equipmentId === 'none') {
    onboardingData.equipment = ['none'];
  } else {
    // Remove 'none' if selecting actual equipment
    const noneIndex = onboardingData.equipment.indexOf('none');
    if (noneIndex > -1) {
      onboardingData.equipment.splice(noneIndex, 1);
    }
    
    // Toggle the selected equipment
    const index = onboardingData.equipment.indexOf(equipmentId);
    if (index > -1) {
      onboardingData.equipment.splice(index, 1);
    } else {
      onboardingData.equipment.push(equipmentId);
    }
    
    // If nothing selected, default to 'none'
    if (onboardingData.equipment.length === 0) {
      onboardingData.equipment = ['none'];
    }
  }
  renderCurrentStep();
}

/**
 * Toggle goal selection
 */
function toggleGoal(goalId) {
  const index = onboardingData.goals.indexOf(goalId);
  if (index > -1) {
    onboardingData.goals.splice(index, 1);
  } else if (onboardingData.goals.length < 3) {
    onboardingData.goals.push(goalId);
  }
  renderCurrentStep();
}

/**
 * Complete onboarding and save to store
 */
function completeOnboarding() {
  // Save all data to store
  store.set('profile.name', onboardingData.name);
  store.set('profile.weight', onboardingData.weight);
  store.set('profile.goalWeight', onboardingData.goalWeight);
  store.set('profile.weightUnit', onboardingData.weightUnit);
  store.set('profile.lastWeight', onboardingData.weight); // For tracking changes
  store.set('profile.conditions', onboardingData.conditions.map(id => ({
    id,
    area: id,
    severity: 5, // Default mid severity
    ischronic: true
  })));
  store.set('profile.equipment', onboardingData.equipment);
  store.set('profile.goals', onboardingData.goals);
  store.set('profile.onboardingComplete', true);
  store.set('profile.onboardingDate', new Date().toISOString());
  
  // Show nav again
  const nav = document.getElementById('nav');
  if (nav) nav.style.display = 'flex';
  
  // Go to check-in
  if (window.alongside?.showCheckin) {
    window.alongside.showCheckin();
  }
}

/**
 * Skip onboarding (for returning users or testing)
 */
function skip() {
  store.set('profile.onboardingComplete', true);
  
  const nav = document.getElementById('nav');
  if (nav) nav.style.display = 'flex';
  
  if (window.alongside?.showCheckin) {
    window.alongside.showCheckin();
  }
}

// Export
export const onboarding = {
  needsOnboarding,
  start,
  next,
  back,
  toggleCondition,
  toggleEquipment,
  toggleGoal,
  skip,
  CONDITIONS,
  EQUIPMENT,
  GOALS
};

export default onboarding;
