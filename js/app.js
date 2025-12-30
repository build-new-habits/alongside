/**
 * Alongside - Main App Orchestrator
 * Initializes modules and handles navigation
 */

import { store } from './store.js';
import { library } from './modules/libraryLoader.js';
import { coach } from './modules/coach.js';
import { checkin } from './modules/checkin.js';
import { todayView } from './modules/todayView.js';
import { cards } from './modules/cards.js';
import { economy } from './modules/economy.js';
import { weeklyCheckin } from './modules/weeklyCheckin.js';
import { savingsTracker } from './modules/savingsTracker.js';
import { onboarding } from './modules/onboarding.js';

// App state
let currentScreen = 'loading';

/**
 * Initialize the app
 */
async function init() {
  console.log('🌱 Alongside starting...');
  
  // Initialize store
  store.init();
  
  // Update header credits display
  updateCreditsDisplay();
  
  // Subscribe to store changes
  store.subscribe(() => {
    updateCreditsDisplay();
  });
  
  // Initialize navigation
  initNavigation();
  
  // Initialize weekly check-in handlers
  weeklyCheckin.init();
  
  // Load exercise library
  console.log('📚 Loading exercise library...');
  const libraryLoaded = await library.loadIndex();
  
  if (!libraryLoaded) {
    console.error('Failed to load exercise library');
    showError('Could not load exercise library. Please refresh.');
    return;
  }
  
  // Preload exercise sources
  await Promise.all([
    library.loadExerciseSource('bodyweight'),
    library.loadExerciseSource('yoga-poses'),
    library.loadExerciseSource('breathing'),
    library.loadExerciseSource('mobility-drills')
  ]);
  
  console.log('✅ Library loaded');
  
  // Check if onboarding is needed
  if (onboarding.needsOnboarding()) {
    onboarding.start();
    console.log('🌱 Starting onboarding...');
    return;
  }
  
  // Check if user has already checked in today
  if (store.hasCheckedInToday()) {
    // Show today's workout
    const checkinData = store.get('checkin');
    await showToday(checkinData.energy, checkinData.mood);
  } else {
    // Show check-in
    showCheckin();
  }
  
  console.log('🌱 Alongside ready!');
}

/**
 * Show the check-in screen
 */
function showCheckin() {
  const main = document.getElementById('main');
  if (!main) return;
  
  main.innerHTML = checkin.render();
  checkin.init();
  currentScreen = 'checkin';
  
  // Update nav
  updateNav('today');
}

/**
 * Show today's workout
 */
async function showToday(energy = 5, mood = 5) {
  const main = document.getElementById('main');
  if (!main) return;
  
  // Show loading state briefly
  main.innerHTML = `
    <div class="screen screen--loading screen--active">
      <div class="loading-spinner"></div>
      <p>Building your workout...</p>
    </div>
  `;
  
  // Render today view
  main.innerHTML = await todayView.render(energy, mood);
  todayView.init();
  currentScreen = 'today';
  
  // Update nav
  updateNav('today');
}

/**
 * Show browse screen
 */
async function showBrowse() {
  const main = document.getElementById('main');
  if (!main) return;
  
  // Get all exercises
  const allExercises = [];
  
  const sources = ['bodyweight', 'yoga-poses', 'breathing', 'mobility-drills'];
  for (const sourceId of sources) {
    const source = await library.loadExerciseSource(sourceId);
    if (source && source.exercises) {
      allExercises.push(...source.exercises);
    }
  }
  
  main.innerHTML = `
    <div class="screen screen--active browse" id="browseScreen">
      <div class="browse__header">
        <h1 class="browse__title">Exercise Library</h1>
        <div class="browse__filters">
          <button class="browse__filter browse__filter--active" data-filter="all">All</button>
          <button class="browse__filter" data-filter="low">Low Energy</button>
          <button class="browse__filter" data-filter="medium">Medium</button>
          <button class="browse__filter" data-filter="high">High Energy</button>
        </div>
      </div>
      <div class="exercise-grid" id="exerciseGrid">
        ${allExercises.map(ex => cards.renderExerciseCard(ex)).join('')}
      </div>
    </div>
  `;
  
  // Init filter buttons
  initBrowseFilters(allExercises);
  
  currentScreen = 'browse';
  updateNav('browse');
}

/**
 * Initialize browse filter buttons
 */
function initBrowseFilters(allExercises) {
  const filterBtns = document.querySelectorAll('.browse__filter');
  const grid = document.getElementById('exerciseGrid');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('browse__filter--active'));
      btn.classList.add('browse__filter--active');
      
      // Filter exercises
      const filter = btn.dataset.filter;
      let filtered = allExercises;
      
      if (filter !== 'all') {
        filtered = allExercises.filter(ex => ex.energyRequired === filter);
      }
      
      // Re-render grid
      grid.innerHTML = filtered.map(ex => cards.renderExerciseCard(ex)).join('');
    });
  });
}

/**
 * Show savings/progress screen
 */
function showProgress() {
  const main = document.getElementById('main');
  if (!main) return;
  
  // Initialize savings if needed
  savingsTracker.init();
  
  // Render savings tracker
  main.innerHTML = savingsTracker.render();
  
  currentScreen = 'progress';
  updateNav('progress');
}

/**
 * Show settings screen (placeholder)
 */
function showSettings() {
  const main = document.getElementById('main');
  if (!main) return;
  
  main.innerHTML = `
    <div class="screen screen--active" id="settingsScreen">
      <div class="today__header">
        <h1 class="today__title">Settings</h1>
      </div>
      
      <div class="today__coach">
        <div class="today__coach-header">
          <span class="today__coach-avatar">⚙️</span>
          <span class="today__coach-name">Coming Soon</span>
        </div>
        <p class="today__coach-message">
          Profile settings, condition management, and preferences will be here.
        </p>
      </div>
      
      <button class="checkin__submit" style="background: var(--color-primary); margin-bottom: var(--space-3);" 
              onclick="window.alongside.showWeeklyCheckin()">
        Weekly Check-In
      </button>
      
      <button class="checkin__submit" style="background: var(--color-danger);" 
              onclick="window.alongside.resetApp()">
        Reset All Data
      </button>
    </div>
  `;
  
  currentScreen = 'profile';
  updateNav('profile');
}

/**
 * Show weekly check-in screen
 */
function showWeeklyCheckin() {
  const main = document.getElementById('main');
  if (!main) return;
  
  main.innerHTML = weeklyCheckin.render();
  currentScreen = 'weekly';
}

/**
 * Initialize bottom navigation
 */
function initNavigation() {
  const navItems = document.querySelectorAll('.nav__item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const screen = item.dataset.screen;
      
      switch (screen) {
        case 'today':
          if (store.hasCheckedInToday()) {
            const checkinData = store.get('checkin');
            showToday(checkinData.energy, checkinData.mood);
          } else {
            showCheckin();
          }
          break;
        case 'browse':
          showBrowse();
          break;
        case 'progress':
          showProgress();
          break;
        case 'profile':
          showSettings();
          break;
      }
    });
  });
}

/**
 * Update navigation active state
 */
function updateNav(activeScreen) {
  const navItems = document.querySelectorAll('.nav__item');
  navItems.forEach(item => {
    item.classList.toggle('nav__item--active', item.dataset.screen === activeScreen);
  });
}

/**
 * Update credits display in header
 */
function updateCreditsDisplay() {
  const creditsEl = document.querySelector('.header__credits-value');
  if (creditsEl) {
    creditsEl.textContent = store.get('credits.balance') || 0;
  }
}

/**
 * Show celebration animation
 */
function celebrate(credits) {
  const celebration = document.getElementById('celebration');
  const creditsEarned = document.getElementById('creditsEarned');
  const confetti = document.getElementById('confetti');
  
  if (!celebration) return;
  
  // Update credits display
  if (creditsEarned) {
    creditsEarned.textContent = credits;
  }
  
  // Generate confetti
  if (confetti) {
    confetti.innerHTML = '';
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];
    
    for (let i = 0; i < 30; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 200 - 100}px`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = `${Math.random() * 0.5}s`;
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.appendChild(piece);
    }
  }
  
  // Show celebration
  celebration.hidden = false;
  
  // Hide after delay
  setTimeout(() => {
    celebration.hidden = true;
    
    // Refresh today view
    if (currentScreen === 'today') {
      todayView.refresh();
    }
  }, 2000);
}

/**
 * Complete an exercise (called from modal)
 */
function completeExercise(exerciseId) {
  // Find the exercise to get full data
  const workout = todayView.getCurrentWorkout();
  let exercise = null;
  
  if (workout) {
    for (const section of workout.sections) {
      const ex = section.exercises.find(e => e.id === exerciseId);
      if (ex) {
        exercise = ex;
        break;
      }
    }
  }
  
  if (!exercise) {
    console.warn('Exercise not found:', exerciseId);
    cards.closeExerciseModal();
    return;
  }
  
  // Check if already completed today
  if (store.isExerciseCompletedToday(exerciseId)) {
    console.log('Already completed today');
    cards.closeExerciseModal();
    return;
  }
  
  // Calculate credits using economy module
  const credits = economy.calculateCredits(exercise);
  
  // Log the completion with economy module
  economy.logExerciseCompletion(exercise);
  
  // Mark as completed in store (for daily tracking)
  store.completeExercise(exerciseId, credits);
  
  // Close modal
  cards.closeExerciseModal();
  
  // Show celebration
  celebrate(credits);
}

/**
 * Complete an exercise with actual value (reps/duration) entered by user
 */
function completeExerciseWithValue(exerciseId, actualValue, isReps, unit) {
  // Find the exercise to get full data
  const workout = todayView.getCurrentWorkout();
  let exercise = null;
  
  if (workout) {
    for (const section of workout.sections) {
      const ex = section.exercises.find(e => e.id === exerciseId);
      if (ex) {
        exercise = ex;
        break;
      }
    }
  }
  
  if (!exercise) {
    console.warn('Exercise not found:', exerciseId);
    cards.closeExerciseModal();
    return;
  }
  
  // Check if already completed today
  if (store.isExerciseCompletedToday(exerciseId)) {
    console.log('Already completed today');
    cards.closeExerciseModal();
    return;
  }
  
  // Calculate duration in minutes based on actual input
  let actualDurationMinutes;
  if (isReps) {
    // Estimate ~3 seconds per rep
    actualDurationMinutes = (actualValue * 3) / 60;
  } else if (unit === 'seconds') {
    actualDurationMinutes = actualValue / 60;
  } else {
    actualDurationMinutes = actualValue;
  }
  
  // Create modified exercise with actual duration for credit calculation
  const exerciseWithActual = {
    ...exercise,
    duration: actualDurationMinutes,
    durationUnit: 'minutes'
  };
  
  // Calculate credits based on actual effort
  const credits = economy.calculateCredits(exerciseWithActual);
  
  // Log the completion with actual duration
  economy.logExerciseCompletion(exercise, actualDurationMinutes);
  
  // Mark as completed in store
  store.completeExercise(exerciseId, credits);
  
  // Close modal
  cards.closeExerciseModal();
  
  // Show celebration
  celebrate(credits);
}

/**
 * Reset the app (for testing)
 */
function resetApp() {
  if (confirm('This will delete all your data. Are you sure?')) {
    store.reset();
    location.reload();
  }
}

/**
 * Show error message
 */
function showError(message) {
  const main = document.getElementById('main');
  if (main) {
    main.innerHTML = `
      <div class="screen screen--active" style="text-align: center; padding-top: 100px;">
        <span style="font-size: 3rem;">😕</span>
        <h2 style="margin: 20px 0;">Something went wrong</h2>
        <p style="color: var(--color-text-muted);">${message}</p>
        <button class="checkin__submit" onclick="location.reload()" style="margin-top: 30px;">
          Try Again
        </button>
      </div>
    `;
  }
}

// Global interface
window.alongside = {
  onGenderChange: onboarding.onGenderChange,
  onMenstrualTrackingChange: onboarding.onMenstrualTrackingChange,
  selectMenstrual: checkin.selectMenstrual,
  selectMenstrualImpact: checkin.selectMenstrualImpact,
  selectCoachingIntensity: checkin.selectCoachingIntensity,
  submitCheckin: checkin.submitCheckin,
  showCheckin,
  showToday,
  showBrowse,
  showProgress,
  showSettings,
  showWeeklyCheckin,
  showExerciseModal: cards.showExerciseModal,
  closeExerciseModal: cards.closeExerciseModal,
  completeExercise,
  completeExerciseWithValue,
  adjustExerciseValue: cards.adjustExerciseValue,
  updateCreditsPreview: cards.updateCreditsPreview,
  toggleTimeUnit: cards.toggleTimeUnit,
  celebrate,
  skipToday: todayView.skipToday,
  resetApp,
  // Savings functions
  logSaving: savingsTracker.logSaving,
  logSpend: savingsTracker.logSpend,
  showAddGoal: savingsTracker.showAddGoal,
  closeAddGoal: savingsTracker.closeAddGoal,
  saveGoal: savingsTracker.saveGoal,
  removeGoal: savingsTracker.removeGoal,
  // Onboarding functions
  onboardingNext: onboarding.next,
  onboardingBack: onboarding.back,
  toggleCondition: onboarding.toggleCondition,
  toggleEquipment: onboarding.toggleEquipment,
  updateConditionSeverity: onboarding.updateConditionSeverity,
  setConditionType: onboarding.setConditionType,
  syncWeightUnit: onboarding.syncWeightUnit,
  toggleDeclaration: onboarding.toggleDeclaration,
  toggleGoal: onboarding.toggleGoal,
  skipOnboarding: onboarding.skip,
  
  // Equipment module (NEW - replaces old equipment functions)
  equipment: {
    toggleCategory: (id) => {
      onboarding.equipmentModule.toggleCategory(id, () => onboarding.renderCurrentStep());
    },
    doneWithCategory: (id) => {
      onboarding.equipmentModule.doneWithCategory(id, () => onboarding.renderCurrentStep());
    },
    noneInCategory: (id) => {
      const data = { equipment: store.get('profile.equipment') || ['none'] };
      onboarding.equipmentModule.noneInCategory(id, data, () => onboarding.renderCurrentStep());
    },
    toggleItem: (id) => {
      const data = { equipment: store.get('profile.equipment') || ['none'] };
      onboarding.equipmentModule.toggleItem(id, data, () => onboarding.renderCurrentStep());
    },
    toggleNoEquipment: () => {
      const data = { equipment: store.get('profile.equipment') || ['none'] };
      onboarding.equipmentModule.toggleNoEquipment(data, () => onboarding.renderCurrentStep());
    }
  },
  
  // Modules
  store,
  library,
  economy
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { init };
