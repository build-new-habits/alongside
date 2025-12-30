/**
 * Alongside Onboarding  
 * First-time user setup flow
 * 
 * FIXES APPLIED:
 * - Bug 1: Gender dropdown no longer resets name/age (saves before re-render)
 * - Bug 2: Scroll to top on Continue button
 * - Bug 4: Expanded equipment list (26 items)
 */

import { store } from '../store.js';
import equipmentModule from './onboarding/equipment-accordion.js';

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

/**
 * FLAT EQUIPMENT LIST
 */

const EQUIPMENT = [
  { id: 'none', name: 'No equipment', icon: '🏠' },
  
  // Weights
  { id: 'dumbbells', name: 'Dumbbells', icon: '🏋️' },
  { id: 'kettlebell', name: 'Kettlebell', icon: '🔔' },
  { id: 'barbell', name: 'Barbell', icon: '🏋️‍♂️' },
  { id: 'weight-plates', name: 'Weight Plates', icon: '⚙️' },
  { id: 'resistance-bands', name: 'Resistance Bands', icon: '🎗️' },
  
  // Cardio
  { id: 'treadmill', name: 'Treadmill', icon: '🏃' },
  { id: 'exercise-bike', name: 'Exercise Bike', icon: '🚴' },
  { id: 'rowing-machine', name: 'Rowing Machine', icon: '🚣' },
  { id: 'skipping-rope', name: 'Skipping Rope', icon: '🪢' },
  
  // Yoga/Recovery
  { id: 'yoga-mat', name: 'Yoga Mat', icon: '🧘' },
  { id: 'yoga-blocks', name: 'Yoga Blocks', icon: '🧱' },
  { id: 'foam-roller', name: 'Foam Roller', icon: '🧻' },
  
  // Functional
  { id: 'pull-up-bar', name: 'Pull-up Bar', icon: '🪜' },
  { id: 'plyo-box', name: 'Plyo Box', icon: '📦' },
  { id: 'balance-board', name: 'Balance Board', icon: '🛹' },
  
  // Boxing
  { id: 'punch-bag', name: 'Punch Bag', icon: '🥊' },
  { id: 'boxing-gloves', name: 'Boxing Gloves', icon: '🥊' },
  { id: 'focus-pads', name: 'Focus Pads', icon: '🎯' },
  
  // Access
  { id: 'gym-access', name: 'Gym Access', icon: '🏢' },
  { id: 'pool-access', name: 'Pool Access', icon: '🏊' }
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

// "Anything to declare" - non-physical conditions
const DECLARATIONS = [
  { id: 'digestive', name: 'Digestive issues', icon: '🫃', description: 'IBS, Colitis, etc.' },
  { id: 'migraines', name: 'Migraines / headaches', icon: '🤕', description: 'Frequent or chronic' },
  { id: 'fatigue', name: 'Chronic fatigue', icon: '😴', description: 'Persistent tiredness' },
  { id: 'anxiety', name: 'Anxiety / stress sensitivity', icon: '😰', description: 'Affects energy & focus' },
  { id: 'menstrual', name: 'Menstrual cycle', icon: '🌙', description: 'Energy varies with cycle' },
  { id: 'medication', name: 'Medication effects', icon: '💊', description: 'Affects energy or movement' },
  { id: 'breathing', name: 'Breathing / asthma', icon: '🌬️', description: 'Affects cardio capacity' },
  { id: 'sleep', name: 'Sleep disorder', icon: '😵', description: 'Insomnia, apnea, etc.' }
];

// Current step in onboarding
let currentStep = 1;
const TOTAL_STEPS = 7;

// Collected data
let onboardingData = {
  name: '',
  age: null,
  gender: null,
  menstrualTracking: false,
  weight: null,
  goalWeight: null,
  weightUnit: 'kg',
  conditions: [],
  conditionType: 'chronic',
  declarations: [],
  declarationNotes: '',
  equipment: [],
  equipmentOther: '',
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
  equipmentModule.reset();  // ← ADD THIS LINE
  onboardingData = {
    name: '',
    age: null,
    gender: null,
    menstrualTracking: false,
    weight: null,
    goalWeight: null,
    weightUnit: 'kg',
    conditions: [],
    conditionType: 'chronic',
    declarations: [],
    declarationNotes: '',
    equipment: [],
    equipmentOther: '',  // ← ADD THIS LINE
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
      main.innerHTML = renderDeclarations();
      break;
    case 5:
      main.innerHTML = renderEquipment();
      break;
    case 6:
      main.innerHTML = renderGoals();
      break;
    case 7:
      main.innerHTML = renderCoachSummary();
      break;
    default:
      completeOnboarding();
  } 
  
  // Scroll to top after rendering
  window.scrollTo({ top: 0, behavior: 'smooth' }); // ← ADD THIS
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
 * Step 2: Name, Age, Gender, and Weight
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
            <label class="onboarding__label">Age <span class="onboarding__optional">(optional)</span></label>
            <input type="number" 
                   id="onboardingAge" 
                   class="onboarding__input onboarding__input--number"
                   placeholder="0"
                   value="${onboardingData.age || ''}"
                   min="13"
                   max="120">
          </div>
          
          <div class="onboarding__field">
            <label class="onboarding__label">Gender <span class="onboarding__optional">(optional)</span></label>
            <select id="onboardingGender" class="onboarding__select" onchange="window.alongside.onGenderChange()">
              <option value="">Prefer not to say</option>
              <option value="male" ${onboardingData.gender === 'male' ? 'selected' : ''}>Male</option>
              <option value="female" ${onboardingData.gender === 'female' ? 'selected' : ''}>Female</option>
              <option value="non-binary" ${onboardingData.gender === 'non-binary' ? 'selected' : ''}>Non-binary</option>
            </select>
          </div>
          
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
 * Step 4: Declarations - "Anything else to declare?"
 */
function renderDeclarations() {
  return `
    <div class="screen screen--active onboarding">
      <div class="onboarding__header">
        <button class="onboarding__back" onclick="window.alongside.onboardingBack()">← Back</button>
        <span class="onboarding__step">Step ${currentStep} of ${TOTAL_STEPS}</span>
      </div>
      
      <div class="onboarding__content">
        <h2 class="onboarding__title">Anything else that affects your day-to-day?</h2>
        <p class="onboarding__subtitle">This helps me understand your context and adapt suggestions</p>
        
        <div class="onboarding__disclaimer">
          <span class="onboarding__disclaimer-icon">⚕️</span>
          <p>I'm not a doctor. This information helps me adjust workout intensity and tone — always consult a medical professional for health concerns.</p>
        </div>
        
        <div class="onboarding__options">
          ${DECLARATIONS.map(dec => `
            <button class="onboarding__option onboarding__option--wide ${(onboardingData.declarations || []).includes(dec.id) ? 'onboarding__option--selected' : ''}"
                    onclick="window.alongside.toggleDeclaration('${dec.id}')">
              <span class="onboarding__option-icon">${dec.icon}</span>
              <div class="onboarding__option-text">
                <span class="onboarding__option-name">${dec.name}</span>
                <span class="onboarding__option-desc">${dec.description}</span>
              </div>
              <span class="onboarding__option-check">${(onboardingData.declarations || []).includes(dec.id) ? '✓' : ''}</span>
            </button>
          `).join('')}
        </div>
        
        <div class="onboarding__field" style="margin-top: var(--space-4);">
          <label class="onboarding__label">Anything else? <span class="onboarding__optional">(optional)</span></label>
          <textarea id="declarationNotes" 
                    class="onboarding__textarea"
                    placeholder="Anything else that affects how you feel or move..."
                    rows="3"
                    maxlength="500">${onboardingData.declarationNotes || ''}</textarea>
        </div>
        
        <button class="onboarding__btn onboarding__btn--primary" onclick="window.alongside.onboardingNext()">
          ${(onboardingData.declarations || []).length > 0 || onboardingData.declarationNotes ? 'Continue →' : 'Nothing to add — skip →'}
        </button>
      </div>
      
      <div class="onboarding__progress">
        <div class="onboarding__progress-bar" style="width: ${(currentStep / TOTAL_STEPS) * 100}%"></div>
      </div>
    </div>
  `;
}

/**
 * Step 5: Equipment
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
        <p class="onboarding__subtitle">Select all that apply</p>
        
        <div class="onboarding__grid">
          ${EQUIPMENT.map(eq => `
            <div class="onboarding__card ${onboardingData.equipment.includes(eq.id) ? 'onboarding__card--selected' : ''}"
                 onclick="window.alongside.toggleEquipment('${eq.id}')">
              <div class="onboarding__card-icon">${eq.icon}</div>
              <div class="onboarding__card-name">${eq.name}</div>
            </div>
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
 * Toggle equipment selection
 */
function toggleEquipment(equipmentId) {
  const index = onboardingData.equipment.indexOf(equipmentId);
  if (index > -1) {
    onboardingData.equipment.splice(index, 1);
  } else {
    onboardingData.equipment.push(equipmentId);
    
    // Remove 'none' if selecting actual equipment
    const noneIndex = onboardingData.equipment.indexOf('none');
    if (noneIndex > -1) {
      onboardingData.equipment.splice(noneIndex, 1);
    }
  }
  renderCurrentStep();
}

/**
 * Step 6: Goals
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
 * Step 7: Coach Summary
 */
function renderCoachSummary() {
  const name = onboardingData.name || 'there';
  const conditions = onboardingData.conditions;
  const equipment = onboardingData.equipment.filter(e => e !== 'none');
  const goals = onboardingData.goals;
  
  // Build the coach message
  let message = `Got it, ${name}. `;  // ✅ BACKTICKS not quotes
  
  // Conditions
  if (conditions.length > 0) {
    const conditionNames = conditions.map(c => {
      const info = CONDITIONS.find(ci => ci.id === c.id);
      return info?.name || c.id;
    });
    if (conditions.length === 1) {
      message += `You're managing a ${conditionNames[0].toLowerCase()} issue, `;  // ✅ BACKTICKS
    } else {
      message += `You're managing ${conditionNames.slice(0, -1).join(', ').toLowerCase()} and ${conditionNames.slice(-1)[0].toLowerCase()} issues, `;  // ✅ BACKTICKS
    }
    message += conditions[0].type === 'acute' 
      ? `so we'll focus on recovery and gentle movement. `  // ✅ BACKTICKS
      : `so we'll include exercises to strengthen and protect those areas. `;  // ✅ BACKTICKS
  }
  
  // Declarations
  const declarations = onboardingData.declarations || [];
  if (declarations.length > 0) {
    message += `I'll also keep in mind that you're managing some other factors that affect your energy. `;  // ✅ BACKTICKS
  }
  
  // Equipment
  if (equipment.length > 0) {
    const equipNames = equipmentModule.getEquipmentNames(equipment);
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
          
          ${declarations.length > 0 ? `
            <div class="onboarding__summary-item">
              <span class="onboarding__summary-icon">💚</span>
              <span>${declarations.length} other factor${declarations.length > 1 ? 's' : ''} noted</span>
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
 * FIX #2: Added scroll to top
 */
function next() {
  saveCurrentStepData();
  currentStep++;
  
  if (currentStep > TOTAL_STEPS) {
    completeOnboarding();
  } else {
    renderCurrentStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const ageEl = document.getElementById('onboardingAge');
      const genderEl = document.getElementById('onboardingGender');
      const menstrualEl = document.getElementById('onboardingMenstrualTracking');
      const weightEl = document.getElementById('onboardingWeight');
      const goalWeightEl = document.getElementById('onboardingGoalWeight');
      const unitEl = document.getElementById('onboardingWeightUnit');
      
      if (nameEl) onboardingData.name = nameEl.value.trim();
      if (ageEl) onboardingData.age = parseInt(ageEl.value) || null;
      if (genderEl) onboardingData.gender = genderEl.value || null;
      if (menstrualEl) onboardingData.menstrualTracking = menstrualEl.checked;
      if (weightEl) onboardingData.weight = parseFloat(weightEl.value) || null;
      if (goalWeightEl) onboardingData.goalWeight = parseFloat(goalWeightEl.value) || null;
      if (unitEl) onboardingData.weightUnit = unitEl.value;
      break;
    case 4:
      const notesEl = document.getElementById('declarationNotes');
      if (notesEl) onboardingData.declarationNotes = notesEl.value.trim();
      break;
    case 5:
      equipmentModule.onExit(onboardingData);
      break;
  }
}

/**
 * Toggle a declaration selection
 */
function toggleDeclaration(declarationId) {
  // Ensure declarations array exists
  if (!onboardingData.declarations) {
    onboardingData.declarations = [];
  }
  
  const index = onboardingData.declarations.indexOf(declarationId);
  if (index > -1) {
    onboardingData.declarations.splice(index, 1);
  } else {
    onboardingData.declarations.push(declarationId);
  }
  renderCurrentStep();
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
 * Handle gender selection change
 * FIX #1: Save form values BEFORE re-rendering
 */
function onGenderChange() {
  // FIX #1: Save all current values before re-rendering
  const nameEl = document.getElementById('onboardingName');
  const ageEl = document.getElementById('onboardingAge');
  const genderEl = document.getElementById('onboardingGender');
  
  if (nameEl) onboardingData.name = nameEl.value.trim();
  if (ageEl) onboardingData.age = parseInt(ageEl.value) || null;
  if (genderEl) {
    onboardingData.gender = genderEl.value || null;
    // If changing away from female, clear menstrual tracking
    if (onboardingData.gender !== 'female') {
      onboardingData.menstrualTracking = false;
    }
  }
  
  // Now safe to re-render with saved data
  renderCurrentStep();
}

/**
 * Handle menstrual tracking checkbox change
 */
function onMenstrualTrackingChange() {
  const checkboxEl = document.getElementById('onboardingMenstrualTracking');
  if (checkboxEl) {
    onboardingData.menstrualTracking = checkboxEl.checked;
  }
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
  store.set('profile.age', onboardingData.age);
  store.set('profile.gender', onboardingData.gender);
  store.set('profile.equipment', onboardingData.equipment);
  store.set('profile.equipmentOther', onboardingData.equipmentOther);
  store.set('profile.equipmentOther', onboardingData.equipmentOther);
  store.set('profile.menstrualTracking', onboardingData.menstrualTracking);
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
  renderCurrentStep,
  toggleCondition,
  updateConditionSeverity,
  setConditionType,
  syncWeightUnit,
  toggleEquipment,
  toggleDeclaration,
  toggleGoal,
  onGenderChange,
  onMenstrualTrackingChange,
  skip,
  CONDITIONS,
  DECLARATIONS,
  EQUIPMENT,
  GOALS,
  equipmentModule
};

export default onboarding;
