/**
 * Alongside - Enhanced Daily Check-In Module
 * Captures comprehensive daily state with smart branching
 * 
 * FIXED: Condition names now display correctly (was showing "undefined")
 */

import { store } from '../store.js';

// CONDITIONS array - matches onboarding.js
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

// Current check-in values
let currentValues = {
  sleepHours: 7,
  sleepQuality: 5,
  hydration: 4,
  energy: 5,
  mood: 5,
  menstruating: null,
  menstrualImpact: null,
  coachingIntensity: 'moderate',
  conditions: []
};

// Descriptive labels for sliders
const SLEEP_QUALITY_LABELS = {
  1: "Terrible - barely slept",
  2: "Very poor - restless",
  3: "Poor - disrupted",
  4: "Below average",
  5: "Average",
  6: "Decent",
  7: "Good",
  8: "Very good",
  9: "Excellent",
  10: "Perfect - refreshed"
};

const ENERGY_LABELS = {
  1: "Exhausted - rest is priority",
  2: "Very tired - gentle only",
  3: "Low energy - keep it light",
  4: "Below average - pace yourself",
  5: "Moderate - steady does it",
  6: "Good - ready to work",
  7: "Strong - feeling capable",
  8: "Very strong - ready to push",
  9: "Excellent - high capacity",
  10: "Peak energy - make it count!"
};

const MOOD_LABELS = {
  1: "Really struggling - be gentle",
  2: "Quite low - small wins matter",
  3: "Feeling down - movement might help",
  4: "Below average - not great",
  5: "Okay - neutral",
  6: "Pretty good - stable",
  7: "Good - positive",
  8: "Very good - upbeat",
  9: "Excellent - feeling great",
  10: "Amazing - thriving!"
};

const COACHING_INTENSITY = {
  gentle: {
    emoji: '🌱',
    label: 'Gentle',
    description: 'Listen to my body, prioritize recovery. Encourage me without pressure.'
  },
  moderate: {
    emoji: '💪',
    label: 'Moderate',
    description: 'Balanced approach. Give me options and gentle nudges toward my goal.'
  },
  aggressive: {
    emoji: '🔥',
    label: 'Aggressive',
    description: 'Push me! Keep me accountable. I want to work hard today.'
  }
};

/**
 * Render the complete check-in flow
 */
function render() {
  // Check if user has female profile and menstrual tracking enabled
  const profile = store.get('profile') || {};
  const hasMenstrualTracking = profile.gender === 'female' && profile.menstrualTracking === true;
  const hasConditions = (profile.conditions || []).length > 0;
  
  return `
    <div class="screen screen--active checkin" id="checkinScreen">
      <!-- Header -->
      <div class="checkin__header">
        <h1 class="checkin__title">Daily Check-In</h1>
        <p class="checkin__subtitle">Help me understand how you're feeling today</p>
      </div>
      
      <!-- Check-in Form -->
      <div class="checkin__form">
        
        <!-- Section 1: Sleep -->
        <div class="checkin__section">
          <div class="checkin__section-header">
            <span class="checkin__section-icon">😴</span>
            <h2 class="checkin__section-title">Sleep</h2>
          </div>
          
          <div class="checkin__field">
            <label class="checkin__label">
              <span>Hours of sleep</span>
              <span class="checkin__value" id="sleepHoursValue">${currentValues.sleepHours}h</span>
            </label>
            <input type="range" 
                   class="checkin__slider" 
                   id="sleepHours"
                   min="4" 
                   max="11" 
                   value="${currentValues.sleepHours}"
                   oninput="window.alongside.updateSleepHours(this.value)">
            <div class="checkin__slider-labels">
              <span>4h</span>
              <span>11h+</span>
            </div>
          </div>
          
          <div class="checkin__field">
            <label class="checkin__label">
              <span>Sleep quality</span>
              <span class="checkin__value" id="sleepQualityValue">${SLEEP_QUALITY_LABELS[currentValues.sleepQuality]}</span>
            </label>
            <input type="range" 
                   class="checkin__slider" 
                   id="sleepQuality"
                   min="1" 
                   max="10" 
                   value="${currentValues.sleepQuality}"
                   oninput="window.alongside.updateSleepQuality(this.value)">
            <div class="checkin__slider-labels">
              <span>Terrible</span>
              <span>Perfect</span>
            </div>
          </div>
        </div>
        
        <!-- Section 2: Hydration -->
        <div class="checkin__section">
          <div class="checkin__section-header">
            <span class="checkin__section-icon">💧</span>
            <h2 class="checkin__section-title">Hydration</h2>
          </div>
          
          <div class="checkin__field">
            <label class="checkin__label">
              <span>Glasses of water today</span>
              <span class="checkin__value" id="hydrationValue">${currentValues.hydration} glasses</span>
            </label>
            <input type="range" 
                   class="checkin__slider" 
                   id="hydration"
                   min="0" 
                   max="12" 
                   value="${currentValues.hydration}"
                   oninput="window.alongside.updateHydration(this.value)">
            <div class="checkin__slider-labels">
              <span>0</span>
              <span>12+</span>
            </div>
          </div>
        </div>
        
        <!-- Section 3: Energy & Mood -->
        <div class="checkin__section">
          <div class="checkin__section-header">
            <span class="checkin__section-icon">⚡</span>
            <h2 class="checkin__section-title">Energy & Mood</h2>
          </div>
          
          <div class="checkin__field">
            <label class="checkin__label">
              <span>Energy level</span>
              <span class="checkin__value" id="energyValue">${ENERGY_LABELS[currentValues.energy]}</span>
            </label>
            <input type="range" 
                   class="checkin__slider" 
                   id="energy"
                   min="1" 
                   max="10" 
                   value="${currentValues.energy}"
                   oninput="window.alongside.updateEnergy(this.value)">
            <div class="checkin__slider-labels">
              <span>Exhausted</span>
              <span>Peak</span>
            </div>
          </div>
          
          <div class="checkin__field">
            <label class="checkin__label">
              <span>Mood</span>
              <span class="checkin__value" id="moodValue">${MOOD_LABELS[currentValues.mood]}</span>
            </label>
            <input type="range" 
                   class="checkin__slider" 
                   id="mood"
                   min="1" 
                   max="10" 
                   value="${currentValues.mood}"
                   oninput="window.alongside.updateMood(this.value)">
            <div class="checkin__slider-labels">
              <span>Struggling</span>
              <span>Thriving</span>
            </div>
          </div>
        </div>
        
        <!-- Section 4: Menstrual Cycle (Conditional) -->
        ${hasMenstrualTracking ? renderMenstrualSection() : ''}
        
        <!-- Section 5: Conditions (Conditional) -->
        ${hasConditions ? renderConditionsSection() : ''}
        
        <!-- Section 6: Coaching Intensity -->
        <div class="checkin__section">
          <div class="checkin__section-header">
            <span class="checkin__section-icon">🎯</span>
            <h2 class="checkin__section-title">How should I coach you today?</h2>
          </div>
          
          <div class="checkin__coaching-options">
            ${Object.entries(COACHING_INTENSITY).map(([key, config]) => `
              <button class="checkin__coaching-btn ${currentValues.coachingIntensity === key ? 'checkin__coaching-btn--active' : ''}"
                      onclick="window.alongside.selectCoachingIntensity('${key}')">
                <span class="checkin__coaching-emoji">${config.emoji}</span>
                <span class="checkin__coaching-label">${config.label}</span>
                <p class="checkin__coaching-desc">${config.description}</p>
              </button>
            `).join('')}
          </div>
        </div>
        
      </div>
      
      <!-- Submit Button -->
      <div class="checkin__actions">
        <button class="checkin__submit-btn" onclick="window.alongside.submitCheckin()">
          Start Today's Workout →
        </button>
      </div>
    </div>
  `;
}

/**
 * Render menstrual tracking section (conditional)
 */
function renderMenstrualSection() {
  return `
    <div class="checkin__section">
      <div class="checkin__section-header">
        <span class="checkin__section-icon">🌸</span>
        <h2 class="checkin__section-title">Menstrual Cycle</h2>
      </div>
      
      <div class="checkin__field">
        <label class="checkin__label">
          <span>Are you menstruating today?</span>
        </label>
        <div class="checkin__button-group">
          <button 
            class="checkin__option-btn"
            data-menstruating="false"
            onclick="window.alongside.selectMenstrual(false)">
            No
          </button>
          <button 
            class="checkin__option-btn"
            data-menstruating="true"
            onclick="window.alongside.selectMenstrual(true)">
            Yes
          </button>
        </div>
      </div>
      
      <div class="checkin__menstrual-impact" id="menstrualImpact" style="display: none;">
        <label class="checkin__label">
          <span>How is it affecting you today?</span>
        </label>
        <div class="checkin__button-group">
          <button 
            class="checkin__option-btn checkin__option-btn--small"
            onclick="window.alongside.selectMenstrualImpact('none')">
            No impact
          </button>
          <button 
            class="checkin__option-btn checkin__option-btn--small"
            onclick="window.alongside.selectMenstrualImpact('light')">
            Light
          </button>
          <button 
            class="checkin__option-btn checkin__option-btn--small"
            onclick="window.alongside.selectMenstrualImpact('moderate')">
            Moderate
          </button>
          <button 
            class="checkin__option-btn checkin__option-btn--small"
            onclick="window.alongside.selectMenstrualImpact('heavy')">
            Heavy
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render conditions update section (conditional)
 * FIXED: Now looks up condition names from CONDITIONS array
 */
function renderConditionsSection() {
  const conditions = store.get('profile.conditions') || [];
  
  return `
    <div class="checkin__section">
      <div class="checkin__section-header">
        <span class="checkin__section-icon">🩹</span>
        <h2 class="checkin__section-title">How are your conditions today?</h2>
      </div>
      
      ${conditions.map(condition => {
        // FIX: Look up the condition name from CONDITIONS array
        const conditionInfo = CONDITIONS.find(c => c.id === condition.id);
        const conditionName = conditionInfo?.name || condition.id;
        const conditionIcon = conditionInfo?.icon || '🩹';
        
        return `
        <div class="checkin__condition" data-condition-id="${condition.id}">
          <div class="checkin__condition-header">
            <span class="checkin__condition-icon">${conditionIcon}</span>
            <span class="checkin__condition-name">${conditionName}</span>
            <span class="checkin__condition-area">${formatArea(condition.area)}</span>
          </div>
          
          <div class="checkin__field">
            <label class="checkin__label">
              <span>Pain Level</span>
              <span class="checkin__value" id="pain-${condition.id}">0/10</span>
            </label>
            <input 
              type="range" 
              class="checkin__slider" 
              data-condition="${condition.id}"
              data-type="pain"
              min="0" 
              max="10" 
              value="0"
              oninput="window.alongside.updateCondition('${condition.id}', 'pain', this.value)">
            <div class="checkin__slider-labels">
              <span>None</span>
              <span>Severe</span>
            </div>
          </div>
          
          <div class="checkin__field">
            <label class="checkin__label">
              <span>Difficulty Level</span>
              <span class="checkin__value" id="difficulty-${condition.id}">0/10</span>
            </label>
            <input 
              type="range" 
              class="checkin__slider"
              data-condition="${condition.id}"
              data-type="difficulty"
              min="0" 
              max="10" 
              value="0"
              oninput="window.alongside.updateCondition('${condition.id}', 'difficulty', this.value)">
            <div class="checkin__slider-labels">
              <span>Easy</span>
              <span>Very Hard</span>
            </div>
          </div>
        </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Format area name for display
 */
function formatArea(area) {
  if (!area) return '';
  return area.charAt(0).toUpperCase() + area.slice(1);
}

/**
 * Update sleep hours value
 */
function updateSleepHours(value) {
  currentValues.sleepHours = parseInt(value);
  const label = document.getElementById('sleepHoursValue');
  if (label) label.textContent = `${value}h`;
}

/**
 * Update sleep quality value
 */
function updateSleepQuality(value) {
  currentValues.sleepQuality = parseInt(value);
  const label = document.getElementById('sleepQualityValue');
  if (label) label.textContent = SLEEP_QUALITY_LABELS[value];
}

/**
 * Update hydration value
 */
function updateHydration(value) {
  currentValues.hydration = parseInt(value);
  const label = document.getElementById('hydrationValue');
  if (label) label.textContent = `${value} glasses`;
}

/**
 * Update energy value
 */
function updateEnergy(value) {
  currentValues.energy = parseInt(value);
  const label = document.getElementById('energyValue');
  if (label) label.textContent = ENERGY_LABELS[value];
}

/**
 * Update mood value
 */
function updateMood(value) {
  currentValues.mood = parseInt(value);
  const label = document.getElementById('moodValue');
  if (label) label.textContent = MOOD_LABELS[value];
}

/**
 * Select menstrual status
 */
function selectMenstrual(isMenstruating) {
  currentValues.menstruating = isMenstruating;
  
  // Update button states
  const buttons = document.querySelectorAll('[data-menstruating]');
  buttons.forEach(btn => {
    const btnValue = btn.getAttribute('data-menstruating') === 'true';
    if (btnValue === isMenstruating) {
      btn.classList.add('checkin__option-btn--active');
    } else {
      btn.classList.remove('checkin__option-btn--active');
    }
  });
  
  // Show/hide impact section
  const impactSection = document.getElementById('menstrualImpact');
  if (impactSection) {
    impactSection.style.display = isMenstruating ? 'block' : 'none';
  }
  
  // Reset impact if "No"
  if (!isMenstruating) {
    currentValues.menstrualImpact = null;
  }
}

/**
 * Select menstrual impact level
 */
function selectMenstrualImpact(impact) {
  currentValues.menstrualImpact = impact;
  
  // Update button states
  const buttons = document.querySelectorAll('#menstrualImpact .checkin__option-btn');
  buttons.forEach(btn => {
    if (btn.textContent.trim().toLowerCase().includes(impact)) {
      btn.classList.add('checkin__option-btn--active');
    } else {
      btn.classList.remove('checkin__option-btn--active');
    }
  });
}

/**
 * Select coaching intensity
 */
function selectCoachingIntensity(intensity) {
  currentValues.coachingIntensity = intensity;
  
  // Update button states
  const buttons = document.querySelectorAll('.checkin__coaching-btn');
  buttons.forEach(btn => {
    if (btn.onclick.toString().includes(`'${intensity}'`)) {
      btn.classList.add('checkin__coaching-btn--active');
    } else {
      btn.classList.remove('checkin__coaching-btn--active');
    }
  });
}

/**
 * Update condition pain/difficulty
 */
function updateCondition(conditionId, type, value) {
  // Find or create condition entry
  let conditionEntry = currentValues.conditions.find(c => c.id === conditionId);
  if (!conditionEntry) {
    conditionEntry = { id: conditionId, pain: 0, difficulty: 0 };
    currentValues.conditions.push(conditionEntry);
  }
  
  // Update the value
  conditionEntry[type] = parseInt(value);
  
  // Update the label
  const label = document.getElementById(`${type}-${conditionId}`);
  if (label) label.textContent = `${value}/10`;
}

/**
 * Submit check-in and save to store
 */
function submitCheckin() {
  const checkinData = {
    timestamp: new Date().toISOString(),
    sleepHours: currentValues.sleepHours,
    sleepQuality: currentValues.sleepQuality,
    hydration: currentValues.hydration,
    energy: currentValues.energy,
    mood: currentValues.mood,
    menstruating: currentValues.menstruating,
    menstrualImpact: currentValues.menstrualImpact,
    coachingIntensity: currentValues.coachingIntensity,
    conditions: currentValues.conditions
  };
  
  // Save to store
  store.saveCheckin(checkinData);
  
  // Detect burnout
  detectBurnout();
  
  // Show confetti
  if (window.alongside?.triggerConfetti) {
    window.alongside.triggerConfetti();
  }
  
  // Navigate to Today view
  if (window.alongside?.showToday) {
    window.alongside.showToday();
  }
}

/**
 * Detect potential burnout patterns
 */
function detectBurnout() {
  const history = store.get('checkinHistory') || [];
  if (history.length < 3) return;
  
  const recent = history.slice(-7);
  
  const avgEnergy = recent.reduce((sum, c) => sum + (c.energy || 5), 0) / recent.length;
  const avgMood = recent.reduce((sum, c) => sum + (c.mood || 5), 0) / recent.length;
  const avgSleepQuality = recent.reduce((sum, c) => sum + (c.sleepQuality || 5), 0) / recent.length;
  
  const isBurnout = avgEnergy < 4 && avgMood < 4 && avgSleepQuality < 5;
  
  if (isBurnout && !store.get('burnoutDetected')) {
    store.set('burnoutDetected', true);
    store.set('burnoutDetectedDate', new Date().toISOString());
  } else if (!isBurnout && store.get('burnoutDetected')) {
    store.set('burnoutDetected', false);
  }
}

/**
 * Show the check-in screen
 */
function show() {
  const main = document.getElementById('main');
  if (!main) return;
  
  // Reset current values to defaults
  currentValues = {
    sleepHours: 7,
    sleepQuality: 5,
    hydration: 4,
    energy: 5,
    mood: 5,
    menstruating: null,
    menstrualImpact: null,
    coachingIntensity: 'moderate',
    conditions: []
  };
  
  main.innerHTML = render();
  
  // Scroll to top
  window.scrollTo(0, 0);
}

// Export
export const checkin = {
  show,
  render,
  updateSleepHours,
  updateSleepQuality,
  updateHydration,
  updateEnergy,
  updateMood,
  selectMenstrual,
  selectMenstrualImpact,
  selectCoachingIntensity,
  updateCondition,
  submitCheckin
};

export default checkin;
