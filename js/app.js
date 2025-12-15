/**
 * Alongside - Main App Orchestrator
 * Building Habits Together
 */

import store from './store.js';
import ConversationEngine from './modules/conversationEngine.js';

// App State
const app = {
  container: null,
  currentView: null,
  conversationEngine: null
};

/**
 * Initialize the application
 */
async function init() {
  app.container = document.getElementById('app');
  
  // Check if onboarding is complete
  if (!store.isOnboarded()) {
    await showOnboarding();
  } else {
    await showCheckIn();
  }
}

/**
 * Show onboarding conversation
 */
async function showOnboarding() {
  app.currentView = 'onboarding';
  
  // Load onboarding scripts
  const scripts = await loadJSON('data/onboardingScripts.json');
  
  // Initialize conversation engine
  app.conversationEngine = new ConversationEngine({
    onComplete: handleOnboardingComplete,
    onStepChange: (step, data) => {
      console.log('Step:', step, 'Data:', data);
    }
  });
  
  app.conversationEngine.init(app.container, scripts);
  app.conversationEngine.start('welcome');
}

/**
 * Handle onboarding completion
 */
function handleOnboardingComplete(data) {
  console.log('Onboarding complete:', data);
  
  // Save to store
  store.update({
    'onboarding.complete': true,
    'onboarding.completedAt': new Date().toISOString(),
    'profile.name': data.name,
    'profile.preferredName': data.name,
    'profile.primaryGoal': data.primaryGoal || data.goalType,
    'profile.motivation': data.motivation,
    'profile.createdAt': new Date().toISOString()
  });
  
  // Show check-in
  showCheckIn();
}

/**
 * Show daily check-in
 */
async function showCheckIn() {
  app.currentView = 'checkin';
  
  const userName = store.getUserName();
  const todayCheckIn = store.getTodayCheckIn();
  
  // If already checked in today, show options
  if (todayCheckIn) {
    showOptions(todayCheckIn);
    return;
  }
  
  // Get time-based greeting
  const hour = new Date().getHours();
  let greeting = 'Hello';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else greeting = 'Good evening';
  
  app.container.innerHTML = `
    <div class="checkin">
      <header class="checkin__header">
        <p class="checkin__greeting">${greeting}, ${userName}</p>
        <h1 class="checkin__title">How are you today?</h1>
        <p class="checkin__subtitle">Be honest — there's no wrong answer</p>
      </header>
      
      <div class="checkin__content">
        <!-- Energy Level -->
        <section class="checkin__section">
          <div class="checkin__section-header">
            <span class="checkin__section-icon">⚡</span>
            <h2 class="checkin__section-title">Energy Level</h2>
          </div>
          
          <div class="energy-slider">
            <div class="energy-slider__value">
              <span class="energy-slider__number" id="energy-value">5</span>
              <span class="energy-slider__label" id="energy-label">Moderate — steady does it</span>
            </div>
            
            <input 
              type="range" 
              class="energy-slider__input" 
              id="energy-slider"
              min="1" 
              max="10" 
              value="5"
              aria-label="Energy level from 1 to 10"
            >
            
            <div class="energy-slider__scale">
              <span>Rest</span>
              <span>Push</span>
            </div>
          </div>
        </section>
        
        <!-- Mood -->
        <section class="checkin__section">
          <div class="checkin__section-header">
            <span class="checkin__section-icon">💭</span>
            <h2 class="checkin__section-title">Mood</h2>
          </div>
          
          <div class="energy-slider">
            <div class="energy-slider__value">
              <span class="energy-slider__number" id="mood-value">5</span>
              <span class="energy-slider__label" id="mood-label">Okay — could go either way</span>
            </div>
            
            <input 
              type="range" 
              class="energy-slider__input" 
              id="mood-slider"
              min="1" 
              max="10" 
              value="5"
              aria-label="Mood level from 1 to 10"
            >
            
            <div class="energy-slider__scale">
              <span>Low</span>
              <span>Great</span>
            </div>
          </div>
        </section>
        
        <!-- Time Available -->
        <section class="checkin__section">
          <div class="checkin__section-header">
            <span class="checkin__section-icon">⏱️</span>
            <h2 class="checkin__section-title">Time Available</h2>
          </div>
          
          <div class="time-select" id="time-select">
            <button class="time-select__btn" data-value="15">
              <span class="time-select__value">15</span>
              <span class="time-select__unit">mins</span>
            </button>
            <button class="time-select__btn time-select__btn--selected" data-value="30">
              <span class="time-select__value">30</span>
              <span class="time-select__unit">mins</span>
            </button>
            <button class="time-select__btn" data-value="45">
              <span class="time-select__value">45</span>
              <span class="time-select__unit">mins</span>
            </button>
            <button class="time-select__btn" data-value="60">
              <span class="time-select__value">60+</span>
              <span class="time-select__unit">mins</span>
            </button>
          </div>
        </section>
      </div>
      
      <footer class="checkin__footer">
        <button class="btn btn--primary btn--lg btn--full checkin__submit" id="checkin-submit">
          Show me my options
        </button>
      </footer>
    </div>
  `;
  
  // Initialize check-in interactions
  initCheckInHandlers();
}

/**
 * Initialize check-in event handlers
 */
function initCheckInHandlers() {
  const energySlider = document.getElementById('energy-slider');
  const energyValue = document.getElementById('energy-value');
  const energyLabel = document.getElementById('energy-label');
  
  const moodSlider = document.getElementById('mood-slider');
  const moodValue = document.getElementById('mood-value');
  const moodLabel = document.getElementById('mood-label');
  
  const timeSelect = document.getElementById('time-select');
  const submitBtn = document.getElementById('checkin-submit');
  
  let selectedTime = 30;
  
  // Energy labels
  const energyLabels = {
    1: "Complete rest — breathe and be gentle",
    2: "Very low — gentle movement only",
    3: "Low — active recovery day",
    4: "Light — building the foundation",
    5: "Moderate — steady does it",
    6: "Solid — let's get to work",
    7: "Good — time to push a bit",
    8: "Strong — feeling capable",
    9: "High — ready to go hard",
    10: "All out — let's make it count!"
  };
  
  // Mood labels
  const moodLabels = {
    1: "Really struggling — be gentle with yourself",
    2: "Quite low — small wins matter",
    3: "Feeling down — movement might help",
    4: "A bit flat — but showing up",
    5: "Okay — could go either way",
    6: "Decent — feeling alright",
    7: "Good — positive outlook",
    8: "Great — feeling motivated",
    9: "Excellent — ready for anything",
    10: "Amazing — on top of the world!"
  };
  
  // Energy color
  function getEnergyColor(value) {
    if (value <= 3) return 'var(--color-energy-2)';
    if (value <= 6) return 'var(--color-energy-5)';
    if (value <= 8) return 'var(--color-energy-7)';
    return 'var(--color-energy-9)';
  }
  
  // Energy slider handler
  energySlider.addEventListener('input', () => {
    const value = parseInt(energySlider.value);
    energyValue.textContent = value;
    energyLabel.textContent = energyLabels[value];
    energyValue.style.color = getEnergyColor(value);
  });
  
  // Mood slider handler  
  moodSlider.addEventListener('input', () => {
    const value = parseInt(moodSlider.value);
    moodValue.textContent = value;
    moodLabel.textContent = moodLabels[value];
  });
  
  // Time select handler
  timeSelect.addEventListener('click', (e) => {
    const btn = e.target.closest('.time-select__btn');
    if (!btn) return;
    
    timeSelect.querySelectorAll('.time-select__btn').forEach(b => {
      b.classList.remove('time-select__btn--selected');
    });
    btn.classList.add('time-select__btn--selected');
    selectedTime = parseInt(btn.dataset.value);
  });
  
  // Submit handler
  submitBtn.addEventListener('click', () => {
    const checkIn = {
      energy: parseInt(energySlider.value),
      mood: parseInt(moodSlider.value),
      timeAvailable: selectedTime
    };
    
    // Save check-in
    store.saveCheckIn(checkIn);
    
    // Show options
    showOptions(checkIn);
  });
}

/**
 * Show workout options based on check-in
 */
function showOptions(checkIn) {
  app.currentView = 'options';
  
  const userName = store.getUserName();
  const energy = checkIn.energy;
  
  // Determine intensity tier
  let intensityName, intensityClass, coachMessage;
  
  if (energy <= 3) {
    intensityName = 'Recovery Day';
    intensityClass = 'rest';
    coachMessage = "Your body is asking for rest. Let's honour that with some gentle movement.";
  } else if (energy <= 6) {
    intensityName = 'Moderate Session';
    intensityClass = 'moderate';
    coachMessage = "Steady energy today. Let's build with something sustainable.";
  } else if (energy <= 8) {
    intensityName = 'Push Day';
    intensityClass = 'push';
    coachMessage = "Good energy! Time to challenge yourself.";
  } else {
    intensityName = 'High Intensity';
    intensityClass = 'intense';
    coachMessage = "You're fired up! Let's make this count.";
  }
  
  app.container.innerHTML = `
    <div class="options-view">
      <header class="coach-header">
        <div class="coach-header__avatar">🤝</div>
        <div class="coach-header__content">
          <p class="coach-header__greeting">Your coach says:</p>
          <p class="coach-header__message">${coachMessage}</p>
          <span class="intensity-badge intensity-badge--${intensityClass}">${intensityName}</span>
        </div>
      </header>
      
      <section class="options-section">
        <h2 class="options-section__title">Today's Options</h2>
        
        <div class="options-grid">
          <!-- Option A -->
          <button class="option-card" id="option-a" tabindex="0">
            <div class="option-card__header">
              <span class="option-card__letter">A</span>
              <h3 class="option-card__title">${getOptionATitle(energy)}</h3>
            </div>
            
            <div class="option-card__stats">
              <div class="option-stat">
                <span class="option-stat__value">${getOptionADuration(energy, checkIn.timeAvailable)}</span>
                <span class="option-stat__label">mins</span>
              </div>
              <div class="option-stat">
                <span class="option-stat__value">~${getOptionACalories(energy, checkIn.timeAvailable)}</span>
                <span class="option-stat__label">cals</span>
              </div>
              <div class="option-stat">
                <span class="option-stat__value">+${getOptionACredits(energy)}</span>
                <span class="option-stat__label">credits</span>
              </div>
            </div>
            
            <p class="option-card__rationale">${getOptionARationale(energy, checkIn)}</p>
          </button>
          
          <!-- Option B -->
          <button class="option-card" id="option-b" tabindex="0">
            <div class="option-card__header">
              <span class="option-card__letter">B</span>
              <h3 class="option-card__title">${getOptionBTitle(energy)}</h3>
            </div>
            
            <div class="option-card__stats">
              <div class="option-stat">
                <span class="option-stat__value">${getOptionBDuration(energy, checkIn.timeAvailable)}</span>
                <span class="option-stat__label">mins</span>
              </div>
              <div class="option-stat">
                <span class="option-stat__value">~${getOptionBCalories(energy, checkIn.timeAvailable)}</span>
                <span class="option-stat__label">cals</span>
              </div>
              <div class="option-stat">
                <span class="option-stat__value">+${getOptionBCredits(energy)}</span>
                <span class="option-stat__label">credits</span>
              </div>
            </div>
            
            <p class="option-card__rationale">${getOptionBRationale(energy, checkIn)}</p>
          </button>
        </div>
        
        <button class="why-these" id="why-these">
          <span>🤔</span>
          <span>Why these options?</span>
        </button>
      </section>
      
      <footer class="options-footer">
        <div class="options-footer__primary">
          <button class="btn btn--ghost btn--lg" id="skip-today">
            Skip today
          </button>
          <button class="btn btn--primary btn--lg" id="confirm-option" disabled>
            Let's do this
          </button>
        </div>
        <p class="options-footer__secondary">
          <span class="options-footer__link" id="different-options">Show me different options</span>
        </p>
      </footer>
    </div>
  `;
  
  initOptionsHandlers();
}

/**
 * Initialize options event handlers
 */
function initOptionsHandlers() {
  const optionA = document.getElementById('option-a');
  const optionB = document.getElementById('option-b');
  const confirmBtn = document.getElementById('confirm-option');
  let selectedOption = null;
  
  const selectOption = (option, btn) => {
    selectedOption = option;
    
    // Update UI
    optionA.classList.remove('option-card--selected');
    optionB.classList.remove('option-card--selected');
    btn.classList.add('option-card--selected');
    
    confirmBtn.disabled = false;
  };
  
  optionA.addEventListener('click', () => selectOption('A', optionA));
  optionB.addEventListener('click', () => selectOption('B', optionB));
  
  confirmBtn.addEventListener('click', () => {
    if (selectedOption) {
      // TODO: Start workout with selected option
      alert(`Starting Option ${selectedOption}!`);
    }
  });
  
  document.getElementById('skip-today').addEventListener('click', () => {
    // TODO: Handle skip
    alert('No problem. Rest is important too. See you tomorrow!');
  });
  
  document.getElementById('why-these').addEventListener('click', () => {
    // TODO: Show rationale modal
    alert('Rationale modal coming soon!');
  });
}

// === Option Generation Helpers ===

function getOptionATitle(energy) {
  if (energy <= 3) return 'Gentle Rest';
  if (energy <= 6) return 'Steady Session';
  if (energy <= 8) return 'Challenge Workout';
  return 'Full Intensity';
}

function getOptionBTitle(energy) {
  if (energy <= 3) return 'Mindful Movement';
  if (energy <= 6) return 'Active Recovery';
  if (energy <= 8) return 'Strength Focus';
  return 'Cardio Blast';
}

function getOptionADuration(energy, timeAvailable) {
  const maxTime = Math.min(timeAvailable, energy <= 3 ? 15 : energy <= 6 ? 35 : 50);
  return maxTime;
}

function getOptionBDuration(energy, timeAvailable) {
  const maxTime = Math.min(timeAvailable, energy <= 3 ? 10 : energy <= 6 ? 25 : 40);
  return maxTime;
}

function getOptionACalories(energy, timeAvailable) {
  const duration = getOptionADuration(energy, timeAvailable);
  const rate = energy <= 3 ? 3 : energy <= 6 ? 7 : energy <= 8 ? 10 : 14;
  return Math.round(duration * rate);
}

function getOptionBCalories(energy, timeAvailable) {
  const duration = getOptionBDuration(energy, timeAvailable);
  const rate = energy <= 3 ? 2 : energy <= 6 ? 5 : energy <= 8 ? 8 : 12;
  return Math.round(duration * rate);
}

function getOptionACredits(energy) {
  if (energy <= 3) return 50;
  if (energy <= 6) return 100;
  if (energy <= 8) return 150;
  return 200;
}

function getOptionBCredits(energy) {
  if (energy <= 3) return 30;
  if (energy <= 6) return 80;
  if (energy <= 8) return 120;
  return 180;
}

function getOptionARationale(energy, checkIn) {
  if (energy <= 3) {
    return "Your energy is low. This gentle session honours your body while keeping you moving.";
  }
  if (energy <= 6) {
    return "A balanced session that builds fitness without draining you. Sustainable progress.";
  }
  if (energy <= 8) {
    return "Your energy is good — this session will push you and build real fitness.";
  }
  return "High energy means we can go hard. This session will challenge your limits.";
}

function getOptionBRationale(energy, checkIn) {
  if (energy <= 3) {
    return "Even gentler. Breathing and mindfulness to restore without any physical demand.";
  }
  if (energy <= 6) {
    return "A lighter alternative if you want to move without too much intensity.";
  }
  if (energy <= 8) {
    return "Focuses on strength rather than cardio. Build muscle and power.";
  }
  return "Pure cardio intensity. Get your heart rate up and burn calories.";
}

// === Utility Functions ===

async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return await response.json();
  } catch (error) {
    console.error('Error loading JSON:', error);
    return {};
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for debugging
window.alongside = {
  store,
  app,
  reset: () => {
    store.reset();
    location.reload();
  }
};

