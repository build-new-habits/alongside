/**
 * Alongside - Enhanced Daily Check-In Module
 * Captures comprehensive daily state with smart branching
 */

import { store } from '../store.js';

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
            <h2 class="checkin__section-title">How did you sleep?</h2>
          </div>
          
          <div class="checkin__field">
            <label class="checkin__label">
              <span>Sleep Hours</span>
              <span class="checkin__value" id="sleepHoursValue">7 hours</span>
            </label>
            <input 
              type="range" 
              class="checkin__slider" 
              id="sleepHoursSlider"
              min="4" 
              max="11" 
              step="0.5"
              value="7">
            <div class="checkin__slider-labels">
              <span>4h</span>
              <span>11h+</span>
            </div>
          </div>
          
          <div class="checkin__field">
            <label class="checkin__label">
              <span>Sleep Quality</span>
              <span class="checkin__value" id="sleepQualityValue">Average</span>
            </label>
            <input 
              type="range" 
              class="checkin__slider" 
              id="sleepQualitySlider"
              min="1" 
              max="10" 
              value="5">
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
            <h2 class="checkin__section-title">Yesterday's Hydration</h2>
          </div>
          
          <div class="checkin__field">
            <label class="checkin__label">
              <span>Water Intake</span>
              <span class="checkin__value" id="hydrationValue">4 glasses</span>
            </label>
            <input 
              type="range" 
              class="checkin__slider" 
              id="hydrationSlider"
              min="0" 
              max="12" 
              value="4">
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
            <h2 class="checkin__section-title">How are you feeling?</h2>
          </div>
          
          <div class="checkin__field">
            <label class="checkin__label">
              <span>Energy Level</span>
              <span class="checkin__value" id="energyValue">Moderate - steady does it</span>
            </label>
            <input 
              type="range" 
              class="checkin__slider" 
              id="energySlider"
              min="1" 
              max="10" 
              value="5">
            <div class="checkin__slider-labels">
              <span>Exhausted</span>
              <span>Peak</span>
            </div>
          </div>
          
          <div class="checkin__field">
            <label class="checkin__label">
              <span>Mood</span>
              <span class="checkin__value" id="moodValue">Okay - neutral</span>
            </label>
            <input 
              type="range" 
              class="checkin__slider" 
              id="moodSlider"
              min="1" 
              max="10" 
              value="5">
            <div class="checkin__slider-labels">
              <span>Struggling</span>
              <span>Thriving</span>
            </div>
          </div>
        </div>
        
        ${hasMenstrualTracking ? renderMenstrualSection() : ''}
        
        ${hasConditions ? renderConditionsSection() : ''}
        
        <!-- Section 4: Coaching Intensity -->
        <div class="checkin__section">
          <div class="checkin__section-header">
            <span class="checkin__section-icon">🎯</span>
            <h2 class="checkin__section-title">How hard should I push you today?</h2>
          </div>
          
          <div class="checkin__intensity-options">
            ${Object.entries(COACHING_INTENSITY).map(([key, config]) => `
              <button 
                class="checkin__intensity-btn ${key === 'moderate' ? 'checkin__intensity-btn--active' : ''}"
                data-intensity="${key}"
                onclick="window.alongside.selectCoachingIntensity('${key}')">
                <span class="checkin__intensity-emoji">${config.emoji}</span>
                <span class="checkin__intensity-label">${config.label}</span>
                <span class="checkin__intensity-desc">${config.description}</span>
              </button>
            `).join('')}
          </div>
        </div>
        
      </div>
      
      <!-- Submit Button -->
      <button 
        class="checkin__submit" 
        onclick="window.alongside.submitCheckin()">
        Continue to Today's Plan
      </button>
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
 */
function renderConditionsSection() {
  const conditions = store.get('profile.conditions') || [];
  
  return `
    <div class="checkin__section">
      <div class="checkin__section-header">
        <span class="checkin__section-icon">🩹</span>
        <h2 class="checkin__section-title">How are your conditions today?</h2>
      </div>
      
      ${conditions.map(condition => `
        <div class="checkin__condition" data-condition-id="${condition.id}">
          <div class="checkin__condition-header">
            <span class="checkin__condition-name">${condition.name}</span>
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
              value="0">
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
              value="0">
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Initialize the check-in screen
 */
function init() {
  // Initialize all sliders
  initSlider('sleepHoursSlider', 'sleepHoursValue', (val) => {
    currentValues.sleepHours = parseFloat(val);
    return val >= 11 ? '11+ hours' : `${val} hours`;
  });
  
  initSlider('sleepQualitySlider', 'sleepQualityValue', (val) => {
    currentValues.sleepQuality = parseInt(val);
    return SLEEP_QUALITY_LABELS[val];
  });
  
  initSlider('hydrationSlider', 'hydrationValue', (val) => {
    currentValues.hydration = parseInt(val);
    return val >= 12 ? '12+ glasses' : `${val} glass${val !== 1 ? 'es' : ''}`;
  });
  
  initSlider('energySlider', 'energyValue', (val) => {
    currentValues.energy = parseInt(val);
    return ENERGY_LABELS[val];
  });
  
  initSlider('moodSlider', 'moodValue', (val) => {
    currentValues.mood = parseInt(val);
    return MOOD_LABELS[val];
  });
  
  // Initialize condition sliders if they exist
  const conditionSliders = document.querySelectorAll('[data-condition]');
  conditionSliders.forEach(slider => {
    const conditionId = slider.dataset.condition;
    const type = slider.dataset.type;
    const valueId = `${type}-${conditionId}`;
    
    initSlider(slider.id || null, valueId, (val) => {
      // Store condition value
      const existing = currentValues.conditions.find(c => c.id === conditionId);
      if (existing) {
        existing[type] = parseInt(val);
      } else {
        currentValues.conditions.push({
          id: conditionId,
          [type]: parseInt(val)
        });
      }
      return `${val}/10`;
    }, slider);
  });
}

/**
 * Initialize a slider with value display
 */
function initSlider(sliderId, valueId, formatter, sliderElement = null) {
  const slider = sliderElement || document.getElementById(sliderId);
  const valueDisplay = document.getElementById(valueId);
  
  if (!slider || !valueDisplay) return;
  
  const updateValue = () => {
    const formatted = formatter(slider.value);
    valueDisplay.textContent = formatted;
  };
  
  slider.addEventListener('input', updateValue);
  updateValue(); // Set initial value
}

/**
 * Select menstrual status
 */
function selectMenstrual(isMenstruating) {
  currentValues.menstruating = isMenstruating;
  
  // Update button states
  const buttons = document.querySelectorAll('[data-menstruating]');
  buttons.forEach(btn => {
    const btnValue = btn.dataset.menstruating === 'true';
    btn.classList.toggle('checkin__option-btn--active', btnValue === isMenstruating);
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
function selectMenstrualImpact(level) {
  currentValues.menstrualImpact = level;
  
  // Update button state
  const buttons = document.querySelectorAll('[onclick*="selectMenstrualImpact"]');
  buttons.forEach(btn => {
    const isActive = btn.textContent.trim().toLowerCase() === level || 
                     (level === 'none' && btn.textContent.includes('No impact'));
    btn.classList.toggle('checkin__option-btn--active', isActive);
  });
}

/**
 * Select coaching intensity
 */
function selectCoachingIntensity(intensity) {
  currentValues.coachingIntensity = intensity;
  
  // Update button states
  const buttons = document.querySelectorAll('[data-intensity]');
  buttons.forEach(btn => {
    btn.classList.toggle('checkin__intensity-btn--active', 
                        btn.dataset.intensity === intensity);
  });
}

/**
 * Submit the check-in
 */
async function submitCheckin() {
  // Validate required fields
  if (currentValues.energy < 1 || currentValues.mood < 1) {
    alert('Please complete all required fields');
    return;
  }
  
  // Save to store
  const today = new Date().toDateString();
  
  store.set('checkin', {
    date: today,
    ...currentValues,
    completed: true
  });
  
  // Detect burnout patterns
  detectBurnout();
  
  // Navigate to today's workout
  await window.alongside.showToday(currentValues.energy, currentValues.mood);
}

/**
 * Detect burnout patterns
 */
function detectBurnout() {
  const history = store.get('checkinHistory') || [];
  
  // Get last 7 days
  const last7Days = history.slice(-7);
  
  if (last7Days.length < 3) return; // Need at least 3 days of data
  
  // Check for 3+ consecutive low energy days
  const consecutiveLowEnergy = last7Days
    .slice(-3)
    .every(day => day.energy <= 3);
  
  // Check for rolling average below 4
  const avgEnergy = last7Days.reduce((sum, day) => sum + day.energy, 0) / last7Days.length;
  
  // Check for combined low energy AND low mood
  const combinedLow = last7Days
    .slice(-3)
    .every(day => day.energy <= 4 && day.mood <= 4);
  
  if (consecutiveLowEnergy || avgEnergy < 4 || combinedLow) {
    store.set('burnoutDetected', true);
    console.log('🚨 Burnout pattern detected - activating recovery mode');
  } else {
    store.set('burnoutDetected', false);
  }
}

/**
 * Format body area name
 */
function formatArea(area) {
  return area
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get current check-in values
 */
function getValues() {
  return currentValues;
}

export const checkin = {
  render,
  init,
  getValues,
  selectMenstrual,
  selectMenstrualImpact,
  selectCoachingIntensity,
  submitCheckin,
  ENERGY_LABELS,
  MOOD_LABELS,
  SLEEP_QUALITY_LABELS,
  COACHING_INTENSITY
};

export default checkin;
