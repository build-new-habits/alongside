/**
 * Alongside Onboarding
 * First-time user setup flow
 * UPDATED: Now includes Age, Gender, and Menstrual Tracking opt-in
 */

import { store } from '../store.js';

// [All your existing CONDITIONS, EQUIPMENT, GOALS, DECLARATIONS arrays stay the same]
// ... (keeping file length manageable, I'll show the key changes)

// UPDATED: Collected data now includes age, gender, menstrualTracking
let onboardingData = {
  name: '',
  age: null,  // NEW
  gender: null,  // NEW: 'male' | 'female' | 'non-binary' | ''
  menstrualTracking: false,  // NEW
  weight: null,
  goalWeight: null,
  weightUnit: 'kg',
  conditions: [],
  conditionType: 'chronic',
  declarations: [],
  declarationNotes: '',
  equipment: ['none'],
  goals: []
};

// ... (all your existing helper functions)

/**
 * Step 2: Name, Age, Gender, and Weight
 * UPDATED VERSION with Age and Gender fields
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
          
          <!-- NEW: Age field -->
          <div class="onboarding__field">
            <label class="onboarding__label">Age <span class="onboarding__optional">(optional)</span></label>
            <input type="number" 
                   id="onboardingAge" 
                   class="onboarding__input onboarding__input--number"
                   placeholder="0"
                   value="${onboardingData.age || ''}"
                   min="13"
                   max="120">
          </div>
          
          <!-- NEW: Gender field -->
          <div class="onboarding__field">
            <label class="onboarding__label">Gender <span class="onboarding__optional">(optional)</span></label>
            <select id="onboardingGender" class="onboarding__select" onchange="window.alongside.onGenderChange()">
              <option value="">Prefer not to say</option>
              <option value="male" ${onboardingData.gender === 'male' ? 'selected' : ''}>Male</option>
              <option value="female" ${onboardingData.gender === 'female' ? 'selected' : ''}>Female</option>
              <option value="non-binary" ${onboardingData.gender === 'non-binary' ? 'selected' : ''}>Non-binary</option>
            </select>
          </div>
          
          <!-- NEW: Menstrual tracking opt-in (only shows if gender === 'female') -->
          ${onboardingData.gender === 'female' ? `
            <div class="onboarding__field onboarding__menstrual-opt-in" style="background: var(--color-bg-tertiary); padding: var(--space-3); border-radius: var(--radius-md); margin-top: var(--space-2);">
              <label class="onboarding__checkbox-label" style="display: flex; align-items: flex-start; gap: var(--space-2); cursor: pointer;">
                <input type="checkbox" 
                       id="onboardingMenstrualTracking"
                       ${onboardingData.menstrualTracking ? 'checked' : ''}
                       onchange="window.alongside.onMenstrualTrackingChange()"
                       style="margin-top: 2px;">
                <span style="flex: 1;">
                  <strong>Track menstrual cycle</strong><br>
                  <span style="font-size: var(--text-sm); color: var(--color-text-muted);">
                    Helps me adjust workout intensity and energy expectations throughout your cycle
                  </span>
                </span>
              </label>
              <p class="onboarding__hint" style="margin-top: var(--space-2); margin-bottom: 0;">
                🔒 This data stays private on your device and is never shared or transmitted.
              </p>
            </div>
          ` : ''}
          
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
 * NEW: Handle gender selection change
 */
function onGenderChange() {
  const genderEl = document.getElementById('onboardingGender');
  if (genderEl) {
    onboardingData.gender = genderEl.value || null;
    // If changing away from female, clear menstrual tracking
    if (onboardingData.gender !== 'female') {
      onboardingData.menstrualTracking = false;
    }
    renderCurrentStep(); // Re-render to show/hide menstrual option
  }
}

/**
 * NEW: Handle menstrual tracking checkbox change
 */
function onMenstrualTrackingChange() {
  const checkboxEl = document.getElementById('onboardingMenstrualTracking');
  if (checkboxEl) {
    onboardingData.menstrualTracking = checkboxEl.checked;
  }
}

/**
 * Save data from current step - UPDATED to include age, gender, menstrualTracking
 */
function saveCurrentStepData() {
  switch (currentStep) {
    case 2:
      const nameEl = document.getElementById('onboardingName');
      const ageEl = document.getElementById('onboardingAge');  // NEW
      const genderEl = document.getElementById('onboardingGender');  // NEW
      const menstrualEl = document.getElementById('onboardingMenstrualTracking');  // NEW
      const weightEl = document.getElementById('onboardingWeight');
      const goalWeightEl = document.getElementById('onboardingGoalWeight');
      const unitEl = document.getElementById('onboardingWeightUnit');
      
      if (nameEl) onboardingData.name = nameEl.value.trim();
      if (ageEl) onboardingData.age = parseInt(ageEl.value) || null;  // NEW
      if (genderEl) onboardingData.gender = genderEl.value || null;  // NEW
      if (menstrualEl) onboardingData.menstrualTracking = menstrualEl.checked;  // NEW
      if (weightEl) onboardingData.weight = parseFloat(weightEl.value) || null;
      if (goalWeightEl) onboardingData.goalWeight = parseFloat(goalWeightEl.value) || null;
      if (unitEl) onboardingData.weightUnit = unitEl.value;
      break;
    case 4:
      const notesEl = document.getElementById('declarationNotes');
      if (notesEl) onboardingData.declarationNotes = notesEl.value.trim();
      break;
  }
}

/**
 * Complete onboarding and save to store - UPDATED to save age, gender, menstrualTracking
 */
function completeOnboarding() {
  // Save all data to store
  store.set('profile.name', onboardingData.name);
  store.set('profile.age', onboardingData.age);  // NEW
  store.set('profile.gender', onboardingData.gender);  // NEW
  store.set('profile.menstrualTracking', onboardingData.menstrualTracking);  // NEW
  store.set('profile.weight', onboardingData.weight);
  store.set('profile.goalWeight', onboardingData.goalWeight);
  store.set('profile.weightUnit', onboardingData.weightUnit);
  store.set('profile.lastWeight', onboardingData.weight);
  
  // Save conditions with their severity and type
  store.set('profile.conditions', onboardingData.conditions.map(cond => ({
    id: cond.id,
    area: CONDITIONS.find(c => c.id === cond.id)?.area || cond.id,
    severity: cond.severity,
    type: cond.type || 'chronic'
  })));
  
  // Save declarations
  store.set('profile.declarations', onboardingData.declarations);
  store.set('profile.declarationNotes', onboardingData.declarationNotes);
  
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

// Export with NEW functions
export const onboarding = {
  needsOnboarding,
  start,
  next,
  back,
  toggleCondition,
  updateConditionSeverity,
  setConditionType,
  syncWeightUnit,
  toggleDeclaration,
  toggleEquipment,
  toggleGoal,
  onGenderChange,  // NEW
  onMenstrualTrackingChange,  // NEW
  skip,
  CONDITIONS,
  DECLARATIONS,
  EQUIPMENT,
  GOALS
};

export default onboarding;
