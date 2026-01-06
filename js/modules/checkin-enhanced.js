/**
 * Alongside - Enhanced Check-in Module
 * Comprehensive daily assessment: Energy, Mood, Sleep, Hydration, Condition Pain
 * 
 * ADHD-FRIENDLY DESIGN:
 * - Visual sliders with immediate feedback
 * - Clear descriptions (no medical jargon)
 * - < 90 seconds to complete
 * - Skip option for overwhelm days
 * - Compassionate language throughout
 */

import { store } from '../store.js';

// ============================================================================
// DESCRIPTIVE LABELS (Compassionate, Non-Judgmental)
// ============================================================================

const ENERGY_DESCRIPTIONS = {
  1: "Exhausted — rest is the priority today",
  2: "Very tired — gentle movement only",
  3: "Low energy — let's keep it light",
  4: "Below average — we'll pace ourselves",
  5: "Moderate — steady does it",
  6: "Pretty good — some options opening up",
  7: "Good energy — nice foundation to work with",
  8: "High energy — feeling capable today",
  9: "Very high — lots to work with!",
  10: "Peak energy — make it count!"
};

const MOOD_DESCRIPTIONS = {
  1: "Really struggling — be gentle with yourself",
  2: "Quite low — small wins matter today",
  3: "Feeling down — movement might help",
  4: "A bit flat — that's okay",
  5: "Neutral — neither up nor down",
  6: "Reasonably okay — something to build on",
  7: "Feeling positive — good headspace",
  8: "Good mood — energy to spare",
  9: "Really good — momentum on your side",
  10: "Excellent — everything's clicking"
};

const SLEEP_QUALITY_DESCRIPTIONS = {
  1: "Terrible — barely slept",
  2: "Poor — very restless",
  3: "Okay — some interruptions",
  4: "Good — mostly solid",
  5: "Excellent — deep and restorative"
};

const HYDRATION_LEVELS = {
  'under': { label: 'Under-hydrated', color: 'var(--color-warning)', icon: '🚰', description: 'Less than usual' },
  'adequate': { label: 'Adequate', color: 'var(--color-info)', icon: '💧', description: 'Normal intake' },
  'well': { label: 'Well-hydrated', color: 'var(--color-success)', icon: '✨', description: 'Plenty of water' }
};

const PAIN_DESCRIPTIONS = {
  0: "No pain",
  1: "Barely noticeable",
  2: "Mild — slightly aware",
  3: "Mild — somewhat aware",
  4: "Moderate — hard to ignore",
  5: "Moderate — quite noticeable",
  6: "Significant — affecting movement",
  7: "Significant — limiting activities",
  8: "Severe — major impact",
  9: "Severe — very limiting",
  10: "Extreme — unable to use"
};

const FUNCTIONAL_IMPACT = {
  'none': { label: 'No limitation', color: 'var(--color-success)' },
  'some': { label: 'Some limitation', color: 'var(--color-info)' },
  'major': { label: 'Major limitation', color: 'var(--color-warning)' }
};

// Condition display names and icons (from onboarding)
const CONDITION_INFO = {
  'lower-back': { name: 'Lower Back', icon: '🔙' },
  'upper-back': { name: 'Upper Back', icon: '🔙' },
  'neck': { name: 'Neck', icon: '🧣' },
  'shoulder': { name: 'Shoulder', icon: '💪' },
  'elbow': { name: 'Elbow', icon: '💪' },
  'wrist': { name: 'Wrist', icon: '✋' },
  'hip': { name: 'Hip', icon: '🦴' },
  'knee': { name: 'Knee', icon: '🦵' },
  'ankle': { name: 'Ankle', icon: '🦶' },
  'hamstring': { name: 'Hamstring', icon: '🦵' },
  'calf': { name: 'Calf', icon: '🦵' },
  'shin': { name: 'Shin Splints', icon: '🦵' },
  'foot': { name: 'Foot / Plantar', icon: '🦶' }
};

// ============================================================================
// STATE
// ============================================================================

let checkinState = {
  energy: 5,
  mood: 5,
  sleepHours: 7,
  sleepQuality: 3,
  hydration: 'adequate',
  conditions: [], // Array of { id, pain, impact }
  menstrualDay: null, // 1-35 if tracking
  completed: false
};

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

/**
 * Main render function - assembles complete check-in screen
 */
function render() {
  const profile = store.get('profile') || {};
  const userConditions = profile.conditions || [];
  const menstrualTracking = profile.menstrualTracking || false;
  
  // Initialize condition states if not already set
  if (checkinState.conditions.length === 0 && userConditions.length > 0) {
    checkinState.conditions = userConditions.map(c => ({
      id: c.id,
      pain: 3, // Default: mild awareness
      impact: 'some'
    }));
  }
  
  return `
    <div class="screen screen--active checkin checkin--enhanced" id="checkinScreen">
      ${renderGreeting()}
      ${renderEnergySlider()}
      ${renderMoodSlider()}
      ${renderSleepInputs()}
      ${renderHydrationSelector()}
      ${userConditions.length > 0 ? renderConditionPainTracking(userConditions) : ''}
      ${menstrualTracking ? renderMenstrualDayInput() : ''}
      ${renderSubmitButton()}
      ${renderSkipOption()}
    </div>
  `;
}

/**
 * Greeting section
 */
function renderGreeting() {
  const profile = store.get('profile') || {};
  const name = profile.name || 'there';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  
  return `
    <div class="checkin__greeting">
      <span class="checkin__wave">👋</span>
      <h1 class="checkin__title">Good morning, ${name}</h1>
      <p class="checkin__subtitle">${today} — Let's see how you're doing today</p>
    </div>
  `;
}

/**
 * Energy slider (1-10)
 */
function renderEnergySlider() {
  return `
    <div class="checkin__slider-group">
      <div class="checkin__slider-label">
        <span class="checkin__slider-title">⚡ Energy Level</span>
        <span class="checkin__slider-value" id="energyValue">${checkinState.energy}</span>
      </div>
      <p class="checkin__slider-description" id="energyDesc">
        ${ENERGY_DESCRIPTIONS[checkinState.energy]}
      </p>
      <input 
        type="range" 
        min="1" 
        max="10" 
        value="${checkinState.energy}" 
        class="checkin__slider" 
        id="energySlider"
        aria-label="Energy level from 1 to 10"
      >
      <div class="checkin__scale">
        <span>Exhausted</span>
        <span>Peak</span>
      </div>
    </div>
  `;
}

/**
 * Mood slider (1-10)
 */
function renderMoodSlider() {
  return `
    <div class="checkin__slider-group">
      <div class="checkin__slider-label">
        <span class="checkin__slider-title">🧠 Mood</span>
        <span class="checkin__slider-value" id="moodValue">${checkinState.mood}</span>
      </div>
      <p class="checkin__slider-description" id="moodDesc">
        ${MOOD_DESCRIPTIONS[checkinState.mood]}
      </p>
      <input 
        type="range" 
        min="1" 
        max="10" 
        value="${checkinState.mood}" 
        class="checkin__slider" 
        id="moodSlider"
        aria-label="Mood from 1 to 10"
      >
      <div class="checkin__scale">
        <span>Struggling</span>
        <span>Great</span>
      </div>
    </div>
  `;
}

/**
 * Sleep inputs (hours + quality)
 */
function renderSleepInputs() {
  return `
    <div class="checkin__section">
      <div class="checkin__section-header">
        <span class="checkin__section-icon">😴</span>
        <h3 class="checkin__section-title">Sleep Last Night</h3>
      </div>
      
      <div class="checkin__sleep-row">
        <div class="checkin__sleep-hours">
          <label class="checkin__label" for="sleepHours">Hours slept</label>
          <div class="checkin__number-input">
            <button class="checkin__number-btn" onclick="window.alongside.adjustSleepHours(-0.5)" aria-label="Decrease sleep hours">−</button>
            <input 
              type="number" 
              id="sleepHours" 
              class="checkin__number-value"
              value="${checkinState.sleepHours}"
              min="0"
              max="16"
              step="0.5"
              aria-label="Hours of sleep"
            >
            <button class="checkin__number-btn" onclick="window.alongside.adjustSleepHours(0.5)" aria-label="Increase sleep hours">+</button>
          </div>
        </div>
        
        <div class="checkin__sleep-quality">
          <label class="checkin__label" for="sleepQuality">Quality</label>
          <div class="checkin__quality-value" id="sleepQualityLabel">
            ${SLEEP_QUALITY_DESCRIPTIONS[checkinState.sleepQuality]}
          </div>
        </div>
      </div>
      
      <input 
        type="range" 
        min="1" 
        max="5" 
        value="${checkinState.sleepQuality}" 
        class="checkin__slider checkin__slider--compact" 
        id="sleepQualitySlider"
        aria-label="Sleep quality from 1 to 5"
      >
      <div class="checkin__scale checkin__scale--compact">
        <span>Terrible</span>
        <span>Excellent</span>
      </div>
    </div>
  `;
}

/**
 * Hydration selector (3 levels)
 */
function renderHydrationSelector() {
  return `
    <div class="checkin__section">
      <div class="checkin__section-header">
        <span class="checkin__section-icon">💧</span>
        <h3 class="checkin__section-title">Hydration Today</h3>
      </div>
      
      <div class="checkin__hydration-options">
        ${Object.entries(HYDRATION_LEVELS).map(([key, info]) => `
          <button 
            class="checkin__hydration-option ${checkinState.hydration === key ? 'checkin__hydration-option--selected' : ''}"
            onclick="window.alongside.selectHydration('${key}')"
            aria-label="${info.label}"
            aria-pressed="${checkinState.hydration === key}"
          >
            <span class="checkin__hydration-icon">${info.icon}</span>
            <span class="checkin__hydration-label">${info.label}</span>
            <span class="checkin__hydration-desc">${info.description}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Per-condition pain tracking
 */
function renderConditionPainTracking(userConditions) {
  if (userConditions.length === 0) return '';
  
  return `
    <div class="checkin__section">
      <div class="checkin__section-header">
        <span class="checkin__section-icon">🩹</span>
        <h3 class="checkin__section-title">How are your areas today?</h3>
      </div>
      <p class="checkin__section-hint">Help me adapt exercises to what you can do today</p>
      
      <div class="checkin__conditions">
        ${userConditions.map(condition => renderConditionItem(condition)).join('')}
      </div>
    </div>
  `;
}

/**
 * Individual condition pain tracker
 */
function renderConditionItem(condition) {
  const info = CONDITION_INFO[condition.id] || { name: condition.id, icon: '🩹' };
  const conditionState = checkinState.conditions.find(c => c.id === condition.id) || 
                         { id: condition.id, pain: 3, impact: 'some' };
  
  return `
    <div class="checkin__condition-item" data-condition-id="${condition.id}">
      <div class="checkin__condition-header">
        <div class="checkin__condition-name">
          <span class="checkin__condition-icon">${info.icon}</span>
          <span>${info.name}</span>
        </div>
        <span class="checkin__condition-pain-value" id="pain-${condition.id}">
          Pain: ${conditionState.pain}/10
        </span>
      </div>
      
      <p class="checkin__condition-desc" id="painDesc-${condition.id}">
        ${PAIN_DESCRIPTIONS[conditionState.pain]}
      </p>
      
      <input 
        type="range" 
        min="0" 
        max="10" 
        value="${conditionState.pain}" 
        class="checkin__slider checkin__slider--compact" 
        id="painSlider-${condition.id}"
        data-condition-id="${condition.id}"
        aria-label="Pain level for ${info.name} from 0 to 10"
      >
      <div class="checkin__scale checkin__scale--compact">
        <span>None</span>
        <span>Extreme</span>
      </div>
      
      <div class="checkin__condition-impact">
        <span class="checkin__label">Functional impact:</span>
        <div class="checkin__impact-options">
          ${Object.entries(FUNCTIONAL_IMPACT).map(([key, impactInfo]) => `
            <button 
              class="checkin__impact-btn ${conditionState.impact === key ? 'checkin__impact-btn--selected' : ''}"
              onclick="window.alongside.setConditionImpact('${condition.id}', '${key}')"
              aria-label="${impactInfo.label}"
              aria-pressed="${conditionState.impact === key}"
            >
              ${impactInfo.label}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Menstrual cycle day input (if tracking enabled)
 */
function renderMenstrualDayInput() {
  const currentDay = checkinState.menstrualDay || 1;
  const phase = getMenstrualPhase(currentDay);
  
  return `
    <div class="checkin__section">
      <div class="checkin__section-header">
        <span class="checkin__section-icon">🌙</span>
        <h3 class="checkin__section-title">Cycle Tracking</h3>
      </div>
      
      <div class="checkin__menstrual-input">
        <label class="checkin__label" for="menstrualDay">
          Day of cycle (1-35)
        </label>
        <input 
          type="number" 
          id="menstrualDay" 
          class="checkin__input"
          value="${currentDay}"
          min="1"
          max="35"
          aria-label="Day of menstrual cycle"
        >
        <p class="checkin__menstrual-phase">
          Current phase: <strong>${phase}</strong>
        </p>
      </div>
      
      <p class="checkin__hint">
        💡 This helps adjust workout intensity to your hormonal cycle
      </p>
    </div>
  `;
}

/**
 * Submit button
 */
function renderSubmitButton() {
  return `
    <button class="checkin__submit" id="checkinSubmit">
      Show me today's workout →
    </button>
  `;
}

/**
 * Skip option (for overwhelm days)
 */
function renderSkipOption() {
  return `
    <button class="checkin__skip" onclick="window.alongside.skipCheckin()">
      Skip check-in today
    </button>
  `;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Initialize all event listeners
 */
function init() {
  // Energy slider
  const energySlider = document.getElementById('energySlider');
  if (energySlider) {
    energySlider.addEventListener('input', (e) => {
      checkinState.energy = parseInt(e.target.value);
      document.getElementById('energyValue').textContent = checkinState.energy;
      document.getElementById('energyDesc').textContent = ENERGY_DESCRIPTIONS[checkinState.energy];
    });
  }
  
  // Mood slider
  const moodSlider = document.getElementById('moodSlider');
  if (moodSlider) {
    moodSlider.addEventListener('input', (e) => {
      checkinState.mood = parseInt(e.target.value);
      document.getElementById('moodValue').textContent = checkinState.mood;
      document.getElementById('moodDesc').textContent = MOOD_DESCRIPTIONS[checkinState.mood];
    });
  }
  
  // Sleep hours input
  const sleepHoursInput = document.getElementById('sleepHours');
  if (sleepHoursInput) {
    sleepHoursInput.addEventListener('change', (e) => {
      checkinState.sleepHours = parseFloat(e.target.value);
    });
  }
  
  // Sleep quality slider
  const sleepQualitySlider = document.getElementById('sleepQualitySlider');
  if (sleepQualitySlider) {
    sleepQualitySlider.addEventListener('input', (e) => {
      checkinState.sleepQuality = parseInt(e.target.value);
      document.getElementById('sleepQualityLabel').textContent = 
        SLEEP_QUALITY_DESCRIPTIONS[checkinState.sleepQuality];
    });
  }
  
  // Menstrual day input (if present)
  const menstrualDayInput = document.getElementById('menstrualDay');
  if (menstrualDayInput) {
    menstrualDayInput.addEventListener('change', (e) => {
      const day = parseInt(e.target.value);
      if (day >= 1 && day <= 35) {
        checkinState.menstrualDay = day;
        // Update phase display
        const phase = getMenstrualPhase(day);
        const phaseEl = document.querySelector('.checkin__menstrual-phase strong');
        if (phaseEl) {
          phaseEl.textContent = phase;
        }
      }
    });
  }
  
  // Condition pain sliders
  const painSliders = document.querySelectorAll('[id^="painSlider-"]');
  painSliders.forEach(slider => {
    slider.addEventListener('input', (e) => {
      const conditionId = e.target.dataset.conditionId;
      const pain = parseInt(e.target.value);
      
      // Update state
      const condState = checkinState.conditions.find(c => c.id === conditionId);
      if (condState) {
        condState.pain = pain;
      }
      
      // Update UI
      document.getElementById(`pain-${conditionId}`).textContent = `Pain: ${pain}/10`;
      document.getElementById(`painDesc-${conditionId}`).textContent = PAIN_DESCRIPTIONS[pain];
    });
  });
  
  // Submit button
  const submitBtn = document.getElementById('checkinSubmit');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleSubmit);
  }
}

/**
 * Handle check-in submission
 */
async function handleSubmit() {
  checkinState.completed = true;
  
  // Save to store with ALL data
  store.saveCheckinEnhanced(checkinState);
  
  // Add to check-in history for burnout detection
  store.addCheckinToHistory(checkinState);
  
  // Scroll to top
  window.scrollTo(0, 0);
  
  // Navigate to workout options screen (NEW - Active Coach)
  if (window.alongside?.showWorkoutOptions) {
    await window.alongside.showWorkoutOptions(checkinState);
  }
}

/**
 * Skip check-in (use defaults)
 */
function skipCheckin() {
  if (confirm('Skip today\'s check-in? We\'ll use moderate defaults for your workout.')) {
    // Use default values
    const defaults = {
      energy: 5,
      mood: 5,
      sleepHours: 7,
      sleepQuality: 3,
      hydration: 'adequate',
      conditions: checkinState.conditions.map(c => ({ ...c, pain: 3, impact: 'some' })),
      menstrualDay: checkinState.menstrualDay,
      completed: true,
      skipped: true
    };
    
    store.saveCheckinEnhanced(defaults);
    
    window.scrollTo(0, 0);
    
    if (window.alongside?.showToday) {
      window.alongside.showToday();
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Adjust sleep hours (for +/- buttons)
 */
function adjustSleepHours(amount) {
  const input = document.getElementById('sleepHours');
  if (input) {
    let newValue = parseFloat(input.value) + amount;
    newValue = Math.max(0, Math.min(16, newValue)); // Clamp 0-16
    input.value = newValue;
    checkinState.sleepHours = newValue;
  }
}

/**
 * Select hydration level
 */
function selectHydration(level) {
  checkinState.hydration = level;
  
  // Update button states
  document.querySelectorAll('.checkin__hydration-option').forEach(btn => {
    btn.classList.remove('checkin__hydration-option--selected');
    btn.setAttribute('aria-pressed', 'false');
  });
  
  const selectedBtn = document.querySelector(`[onclick*="'${level}'"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('checkin__hydration-option--selected');
    selectedBtn.setAttribute('aria-pressed', 'true');
  }
}

/**
 * Set condition functional impact
 */
function setConditionImpact(conditionId, impact) {
  const condState = checkinState.conditions.find(c => c.id === conditionId);
  if (condState) {
    condState.impact = impact;
  }
  
  // Update button states for this condition
  const conditionEl = document.querySelector(`[data-condition-id="${conditionId}"]`);
  if (conditionEl) {
    conditionEl.querySelectorAll('.checkin__impact-btn').forEach(btn => {
      btn.classList.remove('checkin__impact-btn--selected');
      btn.setAttribute('aria-pressed', 'false');
    });
    
    const selectedBtn = conditionEl.querySelector(`[onclick*="'${impact}'"]`);
    if (selectedBtn) {
      selectedBtn.classList.add('checkin__impact-btn--selected');
      selectedBtn.setAttribute('aria-pressed', 'true');
    }
  }
}

/**
 * Determine menstrual cycle phase from day number
 * Based on standard 28-day cycle (adjustable)
 */
function getMenstrualPhase(day) {
  if (day >= 1 && day <= 5) return 'Menstrual';
  if (day >= 6 && day <= 13) return 'Follicular';
  if (day >= 14 && day <= 16) return 'Ovulatory';
  if (day >= 17 && day <= 28) return 'Luteal';
  // Extended cycles
  if (day > 28) return 'Luteal (Extended)';
  return 'Unknown';
}

/**
 * Get current check-in values
 */
function getValues() {
  return { ...checkinState };
}

/**
 * Reset state (for new day)
 */
function resetState() {
  const profile = store.get('profile') || {};
  const userConditions = profile.conditions || [];
  
  checkinState = {
    energy: 5,
    mood: 5,
    sleepHours: 7,
    sleepQuality: 3,
    hydration: 'adequate',
    conditions: userConditions.map(c => ({
      id: c.id,
      pain: 3,
      impact: 'some'
    })),
    menstrualDay: checkinState.menstrualDay, // Preserve from previous day
    completed: false
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const checkinEnhanced = {
  render,
  init,
  getValues,
  resetState,
  adjustSleepHours,
  selectHydration,
  setConditionImpact,
  skipCheckin,
  ENERGY_DESCRIPTIONS,
  MOOD_DESCRIPTIONS,
  SLEEP_QUALITY_DESCRIPTIONS,
  PAIN_DESCRIPTIONS
};

export default checkinEnhanced;
