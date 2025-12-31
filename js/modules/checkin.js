/**
 * Alongside - Check-in Module
 * Daily energy and mood check-in
 */

import { store } from '../store.js';

// Energy level descriptions (compassionate, non-judgmental)
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

// Mood level descriptions (validating, supportive)
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

// Current values
let currentEnergy = 5;
let currentMood = 5;

/**
 * Render the check-in screen
 */
function render() {
  return `
    <div class="screen screen--active checkin" id="checkinScreen">
      <div class="checkin__greeting">
        <span class="checkin__wave">👋</span>
        <h1 class="checkin__title">How are you today?</h1>
        <p class="checkin__subtitle">Quick check-in to personalise your workout</p>
      </div>
      
      <!-- Energy Slider -->
      <div class="checkin__slider-group">
        <div class="checkin__slider-label">
          <span class="checkin__slider-title">⚡ Energy Level</span>
          <span class="checkin__slider-value" id="energyValue">${currentEnergy}</span>
        </div>
        <p class="checkin__slider-description" id="energyDesc">
          ${ENERGY_DESCRIPTIONS[currentEnergy]}
        </p>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value="${currentEnergy}" 
          class="checkin__slider" 
          id="energySlider"
          aria-label="Energy level from 1 to 10"
        >
        <div class="checkin__scale">
          <span>Exhausted</span>
          <span>Peak</span>
        </div>
      </div>
      
      <!-- Mood Slider -->
      <div class="checkin__slider-group">
        <div class="checkin__slider-label">
          <span class="checkin__slider-title">🧠 Mood</span>
          <span class="checkin__slider-value" id="moodValue">${currentMood}</span>
        </div>
        <p class="checkin__slider-description" id="moodDesc">
          ${MOOD_DESCRIPTIONS[currentMood]}
        </p>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value="${currentMood}" 
          class="checkin__slider" 
          id="moodSlider"
          aria-label="Mood from 1 to 10"
        >
        <div class="checkin__scale">
          <span>Struggling</span>
          <span>Great</span>
        </div>
      </div>
      
      <button class="checkin__submit" id="checkinSubmit">
        Show me today's workout →
      </button>
    </div>
  `;
}

/**
 * Initialize check-in event listeners
 */
function init() {
  const energySlider = document.getElementById('energySlider');
  const moodSlider = document.getElementById('moodSlider');
  const submitBtn = document.getElementById('checkinSubmit');
  
  if (energySlider) {
    energySlider.addEventListener('input', (e) => {
      currentEnergy = parseInt(e.target.value);
      document.getElementById('energyValue').textContent = currentEnergy;
      document.getElementById('energyDesc').textContent = ENERGY_DESCRIPTIONS[currentEnergy];
    });
  }
  
  if (moodSlider) {
    moodSlider.addEventListener('input', (e) => {
      currentMood = parseInt(e.target.value);
      document.getElementById('moodValue').textContent = currentMood;
      document.getElementById('moodDesc').textContent = MOOD_DESCRIPTIONS[currentMood];
    });
  }
  
  if (submitBtn) {
    submitBtn.addEventListener('click', handleSubmit);
  }
}

/**
 * Handle check-in submission
 */
async function handleSubmit() {
  // Get profile data
  const profile = store.get('profile') || {};
  const conditions = profile.conditions || [];
  
  // Save check-in to store with conditions
  store.saveCheckin(currentEnergy, currentMood, conditions);
  
  // Show loading state
  const submitBtn = document.getElementById('checkinSubmit');
  if (submitBtn) {
    submitBtn.textContent = 'Generating your workout...';
    submitBtn.disabled = true;
  }
  
  // Trigger navigation to today's workout
  if (window.alongside?.showToday) {
    await window.alongside.showToday(currentEnergy, currentMood);
  }
}

/**
 * Get current check-in values
 */
function getValues() {
  return {
    energy: currentEnergy,
    mood: currentMood
  };
}

export const checkin = {
  render,
  init,
  getValues,
  ENERGY_DESCRIPTIONS,
  MOOD_DESCRIPTIONS
};

export default checkin;
