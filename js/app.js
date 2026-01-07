/**
 * Alongside - Main App Orchestrator
 * Initializes modules and handles navigation
 * WITH ACTIVE COACH INTEGRATION - 3 Workout Options + Rationale
 */

import { store } from './store.js';
import { library } from './modules/libraryLoader.js';
import { coach } from './modules/coach.js';
import { checkinEnhanced } from './modules/checkin-enhanced.js';
import { todayView } from './modules/todayView.js';
import { cards } from './modules/cards.js';
import { economy } from './modules/economy.js';
import { weeklyCheckin } from './modules/weeklyCheckin.js';
import { savingsTracker } from './modules/savingsTracker.js';
import { onboarding } from './modules/onboarding.js';
import { generateDailyWorkouts } from './modules/workoutGenerator.js'; // NEW

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
  
  console.log('✅ Library loaded');
  
  // Check if onboarding is needed
  if (onboarding.needsOnboarding()) {
    onboarding.start();
    console.log('🌱 Starting onboarding...');
    return;
  }
  
  // Check if user has already checked in today
  if (store.hasCheckedInToday()) {
    // Check if they've already selected a workout
    const selectedWorkout = store.get('workout.selectedWorkout');
    
    if (selectedWorkout) {
      // Show the selected workout
      await showToday();
    } else {
      // Show workout options to choose from
      const checkinData = store.get('checkin');
      await showWorkoutOptions(checkinData);
    }
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
  
  main.innerHTML = checkinEnhanced.render();
  checkinEnhanced.init();
  currentScreen = 'checkin';
  
  // Update nav
  updateNav('today');
}

/**
 * Show workout options (NEW - Active Coach with 3 options)
 */
async function showWorkoutOptions(checkinData) {
  const main = document.getElementById('main');
  if (!main) return;
  
  // Show loading state
  main.innerHTML = `
    <div class="screen screen--loading screen--active">
      <div class="loading-spinner"></div>
      <p>Building your workout options...</p>
    </div>
  `;
  
  // Generate 3 workout options using Active Coach
  const { options, burnoutMode, message } = await generateDailyWorkouts(checkinData);
    
  // SAVE TO STORE - ADD THIS LINE
  store.set('workout.todayWorkouts', options);
  
  // Render workout options
  main.innerHTML = renderWorkoutOptions(options, burnoutMode, message, checkinData);
  
  currentScreen = 'workout-options';
  updateNav('today');
}

/**
 * Render workout options UI (NEW)
 */
function renderWorkoutOptions(workouts, burnoutMode, burnoutMessage, checkinData) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  
  return `
    <div class="screen screen--active" id="workoutOptionsScreen">
      <!-- Header -->
      <div class="today__header">
        <p class="today__date">${dateStr}</p>
        <h1 class="today__title">Choose Your Workout</h1>
      </div>
      
      ${burnoutMode ? `
        <!-- Burnout Warning Banner -->
        <div class="burnout-banner">
          <div class="burnout-banner__icon">🛡️</div>
          <div class="burnout-banner__content">
            <h2 class="burnout-banner__title">Recovery Mode Activated</h2>
            <p class="burnout-banner__message">${burnoutMessage}</p>
          </div>
        </div>
      ` : ''}
      
      <!-- Workout Options -->
      <div class="workout-options">
        ${workouts.map((workout, index) => renderWorkoutCard(workout, index)).join('')}
      </div>
      
      <!-- Skip Option -->
      <button class="today__skip" onclick="window.alongside.skipToday()">
        Not feeling it today? That's okay →
      </button>
    </div>
  `;
}

/**
 * Render individual workout card (NEW)
 */
function renderWorkoutCard(workout) {
  const durationMin = Math.ceil(workout.duration / 60);
  
  return `
    <div class="workout-card" onclick="window.alongside.selectWorkoutOption('${workout.id}')">
      <div class="workout-card__header">
        <div class="workout-card__icon">${getWorkoutIcon(workout.id)}</div>
        <h2 class="workout-card__title">${workout.title}</h2>
      </div>
      
      <p class="workout-card__subtitle">${workout.subtitle}</p>
      
      <div class="workout-card__stats">
        <span>⏱️ ~${durationMin} min</span>
        <span>⭐ ${workout.totalCredits} credits</span>
        <span>💪 ${workout.main.length} exercises</span>
      </div>
      
      <!-- Rationale Toggle -->
      <button class="workout-card__rationale-btn" 
              onclick="event.stopPropagation(); window.alongside.toggleRationale('${workout.id}')">
        Why this workout? ▼
      </button>
      
      <div id="rationale-${workout.id}" class="workout-card__rationale hidden">
        ${renderRationale(workout.rationale)}
      </div>
    </div>
  `;
}

/**
 * Render transparent rationale (NEW)
 */
function renderRationale(rationale) {
  let html = `<p><strong>${rationale.primary}</strong></p>`;
  
  if (rationale.conditions && rationale.conditions.length > 0) {
    html += `<p>${rationale.conditions.join('. ')}.</p>`;
  }
  
  if (rationale.mood) {
    html += `<p>${rationale.mood}</p>`;
  }
  
  if (rationale.sleep) {
    html += `<p>${rationale.sleep}</p>`;
  }
  
  if (rationale.menstrualCycle) {
    html += `<p>${rationale.menstrualCycle}</p>`;
  }
  
  if (rationale.burnout) {
    html += `<p><strong>🛡️ Recovery Mode:</strong> Your body needs gentle movement and rest.</p>`;
  }
  
  return html;
}

/**
 * Get icon for workout type (NEW)
 */
function getWorkoutIcon(workoutId) {
  const icons = {
    'strength': '💪',
    'wellbeing': '🧘',
    'cardio': '🏃',
    'recovery': '💚'
  };
  return icons[workoutId] || '✨';
}

/**
 * Toggle rationale visibility (NEW)
 */
function toggleRationale(workoutId) {
  const rationaleEl = document.getElementById(`rationale-${workoutId}`);
  if (rationaleEl) {
    rationaleEl.classList.toggle('hidden');
    
    // Update button text
    const btn = rationaleEl.previousElementSibling;
    if (btn) {
      const isHidden = rationaleEl.classList.contains('hidden');
      btn.textContent = isHidden ? 'Why this workout? ▼' : 'Hide rationale ▲';
    }
  }
}

/**
 * Select a workout option (NEW)
 */
async function selectWorkoutOption(workoutId) {
  // Get the full workout data from today's generated options
  const todayWorkouts = store.get('workout.todayWorkouts');
  const selectedWorkout = todayWorkouts.find(w => w.id === workoutId);
  
  if (!selectedWorkout) {
    console.error('Workout not found:', workoutId);
    return;
  }
  
  // Save selected workout to store
  store.set('workout.selectedWorkout', selectedWorkout);
  
  // Show the workout execution view
  await showToday();
}

/**
 * Show today's workout (UPDATED - now shows selected workout)
 */
async function showToday() {
  const main = document.getElementById('main');
  if (!main) return;
  
  // Show loading state briefly
  main.innerHTML = `
    <div class="screen screen--loading screen--active">
      <div class="loading-spinner"></div>
      <p>Loading your workout...</p>
    </div>
  `;
  
  // Get the selected workout from store
  const selectedWorkout = store.get('workout.selectedWorkout');
  
  if (!selectedWorkout) {
    // No workout selected - show options
    const checkinData = store.get('checkin');
    await showWorkoutOptions(checkinData);
    return;
  }
  
  // Render workout execution view (using existing todayView)
  main.innerHTML = renderWorkoutExecution(selectedWorkout);
  todayView.init();
  currentScreen = 'today';
  
  // Update nav
  updateNav('today');
}

/**
 * Render workout execution (NEW - converts Active Coach format to todayView format)
 */
function renderWorkoutExecution(workout) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  
  const durationMin = Math.ceil(workout.duration / 60);
  
  // Build sections array in todayView format
  const sections = [];
  
  if (workout.warmup && workout.warmup.length > 0) {
    sections.push({
      name: '🔥 Warm-Up',
      exercises: workout.warmup
    });
  }
  
  if (workout.main && workout.main.length > 0) {
    sections.push({
      name: '💪 Main Set',
      exercises: workout.main
    });
  }
  
  if (workout.cooldown && workout.cooldown.length > 0) {
    sections.push({
      name: '🧘 Cool Down',
      exercises: workout.cooldown
    });
  }
  
  // Get completed exercises
  const completedToday = store.get('workout.completedExercises') || [];
  
  return `
    <div class="screen screen--active today" id="todayScreen">
      <!-- Header -->
      <div class="today__header">
        <p class="today__date">${dateStr}</p>
        <h1 class="today__title">${workout.title}</h1>
        <div class="today__summary">
          <span class="today__summary-item">
            <span>⏱️</span>
            <span>~${durationMin} min</span>
          </span>
          <span class="today__summary-item">
            <span>⭐</span>
            <span>${workout.totalCredits} credits available</span>
          </span>
        </div>
      </div>
      
      <!-- Coach Message -->
      <div class="today__coach">
        <div class="today__coach-header">
          <span class="today__coach-avatar">🌱</span>
          <span class="today__coach-name">Your Coach</span>
        </div>
        <p class="today__coach-message">${workout.rationale.primary}</p>
      </div>
      
      <!-- Workout Sections -->
      ${sections.map((section, sectionIndex) => `
        <div class="today__section">
          <div class="today__section-header">
            <h2 class="today__section-title">${section.name}</h2>
            <span class="today__section-count">${section.exercises.length} exercises</span>
          </div>
          
          ${section.exercises.map((exercise, exerciseIndex) => {
            const isCompleted = completedToday.includes(exercise.exerciseId);
            const icon = getExerciseIcon(exercise);
            
            return `
              <div class="exercise-item ${isCompleted ? 'exercise-item--completed' : ''}"
                   data-exercise-id="${exercise.exerciseId}"
                   onclick="window.alongside.showExerciseModal('${exercise.exerciseId}')">
                <div class="exercise-item__icon">${icon}</div>
                <div class="exercise-item__content">
                  <div class="exercise-item__name">${exercise.name}</div>
                  <div class="exercise-item__meta">
                    <span>${formatExerciseMeta(exercise)}</span>
                    <span class="exercise-item__credits">+${exercise.credits || 0}</span>
                  </div>
                </div>
                <div class="exercise-item__check">
                  ${isCompleted ? '✓' : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `).join('')}
      
      <!-- Skip Option -->
      <button class="today__skip" onclick="window.alongside.skipToday()">
        Not feeling it today? That's okay →
      </button>
    </div>
  `;
}

/**
 * Format exercise metadata for display (NEW)
 */
function formatExerciseMeta(exercise) {
  if (exercise.duration) {
    return `${exercise.duration}s`;
  }
  if (exercise.sets && exercise.reps) {
    return `${exercise.sets} × ${exercise.reps}`;
  }
  if (exercise.durationNote) {
    return exercise.durationNote;
  }
  return 'Complete';
}

/**
 * Get exercise icon (NEW)
 */
function getExerciseIcon(exercise) {
  // Default icons - could be enhanced based on exercise type
  return '✨';
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
            showToday();
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
  const workout = store.get('workout.selectedWorkout');
  let exercise = null;
  
  if (workout) {
    // Search in all sections
    for (const section of ['warmup', 'main', 'cooldown']) {
      if (workout[section]) {
        const ex = workout[section].find(e => e.exerciseId === exerciseId);
        if (ex) {
          exercise = ex;
          break;
        }
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
  
  // Get credits
  const credits = exercise.credits || 0;
  
  // Mark as completed in store
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
  // Same as above but with actual value tracking
  completeExercise(exerciseId);
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
  showCheckin,
  showWorkoutOptions, // NEW
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
  // Active Coach functions (NEW)
  toggleRationale, // NEW
  selectWorkoutOption, // NEW
  // Today view
  skipToday: todayView.skipToday,
  selectWorkout: todayView.selectWorkout,
  startWorkout: todayView.startWorkout,
  startTimer: todayView.startTimer,
  completeSet: todayView.completeSet,
  completeCurrentExercise: todayView.completeCurrentExercise,
  quitWorkout: todayView.quitWorkout,
  showDifficultyFeedback: todayView.showDifficultyFeedback,
  recordDifficulty: todayView.recordDifficulty,
  saveFeedback: todayView.saveFeedback,
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
  // Equipment functions
  toggleEquipmentCategory: onboarding.toggleEquipmentCategory,
  toggleNoEquipment: onboarding.toggleNoEquipment,
  equipmentCategoriesNext: onboarding.equipmentCategoriesNext,
  equipmentCategoryNext: onboarding.equipmentCategoryNext,
  equipmentCategoryBack: onboarding.equipmentCategoryBack,
  toggleEquipmentItem: onboarding.toggleEquipmentItem,
  equipmentOtherDone: onboarding.equipmentOtherDone,
  // Enhanced Check-in methods
  renderCheckin: checkinEnhanced.render,
  initCheckin: checkinEnhanced.init,
  adjustSleepHours: checkinEnhanced.adjustSleepHours,
  selectHydration: checkinEnhanced.selectHydration,
  setConditionImpact: checkinEnhanced.setConditionImpact,
  skipCheckin: checkinEnhanced.skipCheckin,
  // NEW: Fitness level and cardio preference functions
  selectFitnessLevel: onboarding.selectFitnessLevel,
  selectCardioType: onboarding.selectCardioType,
  toggleBlacklistExercise: onboarding.toggleBlacklistExercise,
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
