/**
 * Alongside Onboarding
 * First-time user setup flow
 */

import { store } from '../store.js';

// Condition options - expanded with body areas
const CONDITIONS = [
  { id: 'lower-back', name: 'Lower Back', icon: '🔙', area: 'back' },
  { id: 'upper-back', name: 'Upper Back', icon: '🔙', area: 'back' },
  { id: 'neck', name: 'Neck', icon: '🧣', area: 'neck' },
  { id: 'shoulder', name: 'Shoulder', icon: '💪', area: 'shoulder' },
  { id: 'elbow', name: 'Elbow', icon: '💪', area: 'elbow' },
  { id: 'wrist', name: 'Wrist', icon: '✋', area: 'wrist' },
  { id: 'hip', name: 'Hip', icon: '🦴', area: 'hip' },
  { id: 'knee', name: 'Knee', icon: '🦵', area: 'knee' },
  { id: 'ankle', name: 'Ankle', icon: '🦶', area: 'ankle' },
  { id: 'hamstring', name: 'Hamstring', icon: '🦵', area: 'hamstring' },
  { id: 'calf', name: 'Calf', icon: '🦵', area: 'calf' },
  { id: 'shin', name: 'Shin Splints', icon: '🦵', area: 'shin' },
  { id: 'foot', name: 'Foot / Plantar', icon: '🦶', area: 'foot' }
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
const TOTAL_STEPS = 6;

// Collected data
let onboardingData = {
  name: '',
  weight: null,
  goalWeight: null,
  weightUnit: 'kg',
  conditions: [], // Now stores { id, severity, type } objects
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
    case 6:
      main.innerHTML = renderCoachSummary();
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
                     max="500"
                     step="0.1">
              <select id="onboardingWeightUnit" class="onboarding__select" onchange="window.alongside.syncWeightUnit()">
                <option value="kg" ${onboardingData.weightUnit === 'kg' ? 'selected' : ''}>kg</option>
                <option value="lbs" ${onboardingData.weightUnit === 'lbs' ? 'selected' : ''}>lbs</option>
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
                     max="500"
                     step="0.1">
              <span class="onboarding__unit-match" id="goalWeightUnit">${onboardingData.weightUnit}</span>
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
 * Step 3: Conditions - Select areas that need care
 */
function renderConditions() {
  // Get currently selected condition IDs
  const selectedIds = onboardingData.conditions.map(c => c.id);
  
  return `
    <div class="screen screen--active onboarding">
      <div class="onboarding__header">
        <button class="onboarding__back" onclick="window.alongside.onboardingBack()">← Back</button>
        <span class="onboarding__step">Step ${currentStep} of ${TOTAL_STEPS}</span>
      </div>
      
      <div class="onboarding__content">
        <h2 class="onboarding__title">Any areas that need extra care?</h2>
        <p class="onboarding__subtitle">We'll adapt exercises to protect and strengthen these areas</p>
        
        <div class="onboarding__options onboarding__options--grid">
          ${CONDITIONS.map(condition => `
            <button class="onboarding__option ${selectedIds.includes(condition.id) ? 'onboarding__option--selected' : ''}"
                    onclick="window.alongside.toggleCondition('${condition.id}')">
              <span class="onboarding__option-icon">${condition.icon}</span>
              <span class="onboarding__option-name">${condition.name}</span>
            </button>
          `).join('')}
        </div>
        
        <p class="onboarding__hint">
          💡 Includes injuries, chronic conditions, or areas you want to protect
        </p>
        
        ${selectedIds.length > 0 ? `
          <div class="onboarding__severity-section">
            <h3 class="onboarding__severity-title">How are these areas right now?</h3>
            ${onboardingData.conditions.map(cond => {
              const condInfo = CONDITIONS.find(c => c.id === cond.id);
              return `
                <div class="onboarding__severity-item">
                  <div class="onboarding__severity-header">
                    <span>${condInfo?.icon || '🩹'} ${condInfo?.name || cond.id}</span>
                    <span class="onboarding__severity-value">${getSeverityLabel(cond.severity)}</span>
                  </div>
                  <input type="range" 
                         class="onboarding__severity-slider"
                         min="1" 
                         max="10" 
                         value="${cond.severity}"
                         onchange="window.alongside.updateConditionSeverity('${cond.id}', this.value)">
                  <div class="onboarding__severity-labels">
                    <span>Manageable</span>
                    <span>Severe</span>
                  </div>
                </div>
              `;
            }).join('')}
            
            <div class="onboarding__condition-type">
              <label class="onboarding__label">Are these mostly:</label>
              <div class="onboarding__type-options">
                <button class="onboarding__type-btn ${onboardingData.conditionType === 'acute' ? 'onboarding__type-btn--active' : ''}"
                        onclick="window.alongside.setConditionType('acute')">
                  🩹 Recent injuries<br><small>Need rest & recovery</small>
                </button>
                <button class="onboarding__type-btn ${onboardingData.conditionType === 'chronic' ? 'onboarding__type-btn--active' : ''}"
                        onclick="window.alongside.setConditionType('chronic')">
                  🔄 Ongoing conditions<br><small>Need careful strengthening</small>
                </button>
              </div>
            </div>
          </div>
        ` : ''}
        
        <button class="onboarding__btn onboarding__btn--primary" onclick="window.alongside.onboardingNext()">
          ${selectedIds.length > 0 ? 'Continue →' : 'No issues — skip →'}
        </button>
      </div>
      
      <div class="onboarding__progress">
        <div class="onboarding__progress-bar" style="width: ${(currentStep / TOTAL_STEPS) * 100}%"></div>
      </div>
    </div>
  `;
}

/**
 * Get severity label from value
 */
function getSeverityLabel(severity) {
  if (severity <= 3) return 'Mild';
  if (severity <= 5) return 'Moderate';
  if (severity <= 7) return 'Significant';
  return 'Severe';
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
 * Step 6: Coach Summary
 */
function renderCoachSummary() {
  const name = onboardingData.name || 'there';
  const conditions = onboardingData.conditions;
  const equipment = onboardingData.equipment.filter(e => e !== 'none');
  const goals = onboardingData.goals;
  
  // Build the coach message
  let message = `Got it, ${name}. `;
  
  // Conditions
  if (conditions.length > 0) {
    const conditionNames = conditions.map(c => {
      const info = CONDITIONS.find(ci => ci.id === c.id);
      return info?.name || c.id;
    });
    if (conditions.length === 1) {
      message += `You're managing a ${conditionNames[0].toLowerCase()} issue, `;
    } else {
      message += `You're managing ${conditionNames.slice(0, -1).join(', ').toLowerCase()} and ${conditionNames.slice(-1)[0].toLowerCase()} issues, `;
    }
    message += conditions[0].type === 'acute' 
      ? `so we'll focus on recovery and gentle movement. `
      : `so we'll include exercises to strengthen and protect those areas. `;
  }
  
  // Equipment
  if (equipment.length > 0) {
    const equipNames = equipment.map(e => {
      const info = EQUIPMENT.find(eq => eq.id === e);
      return info?.name || e;
    });
    message += `You've got ${equipNames.join(' and ').toLowerCase()} to work with. `;
  } else {
    message += `We'll focus on bodyweight exercises you can do anywhere. `;
  }
  
  // Goals
  if (goals.length > 0) {
    const goalNames = goals.map(g => {
      const info = GOALS.find(gi => gi.id === g);
      return info?.name || g;
    });
    message += `Your focus is on ${goalNames.join(', ').toLowerCase()}. `;
  }
  
  message += `I'll build each workout with all of this in mind.`;
  
  return `
    <div class="screen screen--active onboarding">
      <div class="onboarding__content onboarding__content--centered">
        <div class="onboarding__coach-summary">
          <span class="onboarding__coach-avatar">🌱</span>
          <h2 class="onboarding__coach-title">Your Coach</h2>
          <p class="onboarding__coach-message">${message}</p>
        </div>
        
        <div class="onboarding__summary-details">
          ${conditions.length > 0 ? `
            <div class="onboarding__summary-item">
              <span class="onboarding__summary-icon">🩹</span>
              <span>${conditions.length} area${conditions.length > 1 ? 's' : ''} to protect</span>
            </div>
          ` : ''}
          
          <div class="onboarding__summary-item">
            <span class="onboarding__summary-icon">🏠</span>
            <span>${equipment.length > 0 ? equipment.length + ' equipment item' + (equipment.length > 1 ? 's' : '') : 'Bodyweight only'}</span>
          </div>
          
          <div class="onboarding__summary-item">
            <span class="onboarding__summary-icon">🎯</span>
            <span>${goals.length} goal${goals.length > 1 ? 's' : ''} set</span>
          </div>
        </div>
        
        <button class="onboarding__btn onboarding__btn--primary" onclick="window.alongside.onboardingNext()">
          Let's go! →
        </button>
        
        <button class="onboarding__btn onboarding__btn--secondary" onclick="window.alongside.onboardingBack()" style="margin-top: var(--space-3);">
          ← Go back and edit
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
  const index = onboardingData.conditions.findIndex(c => c.id === conditionId);
  if (index > -1) {
    // Remove it
    onboardingData.conditions.splice(index, 1);
  } else {
    // Add it with default severity
    onboardingData.conditions.push({
      id: conditionId,
      severity: 5,
      type: onboardingData.conditionType || 'chronic'
    });
  }
  renderCurrentStep();
}

/**
 * Update condition severity
 */
function updateConditionSeverity(conditionId, severity) {
  const condition = onboardingData.conditions.find(c => c.id === conditionId);
  if (condition) {
    condition.severity = parseInt(severity);
    // Update the label without full re-render
    const valueEl = document.querySelector(`[data-condition="${conditionId}"] .onboarding__severity-value`);
    if (valueEl) {
      valueEl.textContent = getSeverityLabel(condition.severity);
    }
  }
}

/**
 * Set condition type (acute/chronic)
 */
function setConditionType(type) {
  onboardingData.conditionType = type;
  // Update all conditions with this type
  onboardingData.conditions.forEach(c => c.type = type);
  renderCurrentStep();
}

/**
 * Sync weight unit between current and goal
 */
function syncWeightUnit() {
  const unitEl = document.getElementById('onboardingWeightUnit');
  const goalUnitEl = document.getElementById('goalWeightUnit');
  if (unitEl && goalUnitEl) {
    onboardingData.weightUnit = unitEl.value;
    goalUnitEl.textContent = unitEl.value;
  }
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
  updateConditionSeverity,
  setConditionType,
  syncWeightUnit,
  toggleEquipment,
  toggleGoal,
  skip,
  CONDITIONS,
  EQUIPMENT,
  GOALS
};

export default onboarding;
