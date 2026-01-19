/**
 * Alongside - Main App Orchestrator
 * Initializes modules and handles navigation
 * WITH ACTIVE COACH INTEGRATION - 3 Workout Options + Rationale
 * 
 * FIXES (Jan 20, 2026):
 * - ✅ Time display always in minutes (not seconds)
 * - ✅ Connected exercise detail modal from todayView
 * - ✅ Better exercise meta formatting
 */

import { store } from './store.js';
import { library } from './modules/libraryLoader.js';
import { checkinEnhanced } from './modules/checkin-enhanced.js';
import { todayView } from './modules/todayView.js';
import { cards } from './modules/cards.js';
import { economy } from './modules/economy.js';
import { weeklyCheckin } from './modules/weeklyCheckin.js';
import { savingsTracker } from './modules/savingsTracker.js';
import { onboarding } from './modules/onboarding.js';
import { generateDailyWorkouts } from './modules/workoutGenerator.js';

// App state
let currentScreen = 'loading';

// Pattern icons for exercises
const PATTERN_ICONS = {
  hinge: '🏋️',
  squat: '🏋️',
  lunge: '🏋️',
  push: '💪',
  pull: '💪',
  carry: '🎒',
  rotation: '🔄',
  mobility: '🧘',
  stability: '⚖️',
  locomotion: '🏃',
  recovery: '💚',
  breathing: '🌬️',
  stretch: '🧘',
  stillness: '🧘',
  core: '⚖️'
};

// ===================================================================
// HELPER: Format seconds to minutes display
// ===================================================================
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '~1 min';
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return '~1 min';
  return `~${minutes} min`;
}

// ===================================================================
// HELPER: Get exercise duration in seconds
// ===================================================================
function getExerciseDuration(exercise) {
  if (exercise.sets && exercise.reps) {
    const repTime = exercise.sets * exercise.reps * 3;
    const restTime = (exercise.sets - 1) * (exercise.rest || 60);
    return repTime + restTime;
  }
  return exercise.duration || 30;
}

// ===================================================================
// HELPER: Format exercise metadata for display
// ===================================================================
function formatExerciseMeta(exercise) {
  // For strength exercises with sets/reps
  if (exercise.sets && exercise.reps) {
    const rest = exercise.rest || 60;
    const totalSeconds = getExerciseDuration(exercise);
    return `${exercise.sets} × ${exercise.reps} • Rest ${rest}s • ${formatDuration(totalSeconds)}`;
  }
  
  // For timed exercises - ALWAYS show in minutes
  if (exercise.duration) {
    return formatDuration(exercise.duration);
  }
  
  // For exercises with duration note
  if (exercise.durationNote) {
    return exercise.durationNote;
  }
  
  return '~1 min';
}

// ===================================================================
// HELPER: Get exercise icon
// ===================================================================
function getExerciseIcon(exercise) {
  if (exercise.movementPattern && PATTERN_ICONS[exercise.movementPattern]) {
    return PATTERN_ICONS[exercise.movementPattern];
  }
  return '✨';
}

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
 * Show workout options (Active Coach with 3 options)
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
    
  // Save to store
  store.set('workout.todayWorkouts', options);
  
  // Render workout options
  main.innerHTML = renderWorkoutOptions(options, burnoutMode, message, checkinData);
  
  currentScreen = 'workout-options';
  updateNav('today');
}

/**
 * Render workout options UI
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
 * Render individual workout card
 */
function renderWorkoutCard(workout) {
  const durationMin = formatDuration(workout.duration);
  
  return `
    <div class="workout-card" onclick="window.alongside.selectWorkoutOption('${workout.id}')">
      <div class="workout-card__header">
        <div class="workout-card__icon">${getWorkoutIcon(workout.id)}</div>
        <h2 class="workout-card__title">${workout.title}</h2>
      </div>
      
      <p class="workout-card__subtitle">${workout.subtitle}</p>
      
      <div class="workout-card__stats">
        <span>⏱️ ${durationMin}</span>
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
 * Render transparent rationale
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
 * Get icon for workout type
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
 * Toggle rationale visibility
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
 * Select a workout option
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
 * Show today's workout (uses todayView module)
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
  
  // Use todayView module to render
  const checkinData = store.get('checkin');
  main.innerHTML = await todayView.render(checkinData?.energy || 5, checkinData?.mood || 5);
  todayView.init();
  currentScreen = 'today';
  
  // Scroll to top
  window.scrollTo(0, 0);
  
  // Update nav
  updateNav('today');
}

/**
 * Show browse screen
 */
async function showBrowse() {
  const main = document.getElementById('main');
  if (!main) return;
  
  main.innerHTML = `
    <div class="screen screen--active browse" id="browseScreen">
      <div class="today__header">
        <h1 class="today__title">Exercise Library</h1>
      </div>
      <div class="today__coach">
        <p class="today__coach-message">
          Coming soon: Browse all exercises by category, search, and filter.
        </p>
      </div>
    </div>
  `;
  
  currentScreen = 'browse';
  updateNav('browse');
}

/**
 * Show progress screen
 */
function showProgress() {
  const main = document.getElementById('main');
  if (!main) return;
  
  const stats = store.get('stats') || {};
  const credits = store.get('credits') || { balance: 0, history: [] };
  
  main.innerHTML = `
    <div class="screen screen--active progress" id="progressScreen">
      <div class="today__header">
        <h1 class="today__title">Your Progress</h1>
      </div>
      
      <div class="today__coach">
        <div class="today__coach-header">
          <span class="today__coach-avatar">📊</span>
          <span class="today__coach-name">Stats Overview</span>
        </div>
        
        <div class="progress-stats">
          <div class="progress-stat">
            <span class="progress-stat__value">${stats.totalWorkouts || 0}</span>
            <span class="progress-stat__label">Workouts</span>
          </div>
          <div class="progress-stat">
            <span class="progress-stat__value">${credits.balance || 0}</span>
            <span class="progress-stat__label">Credits</span>
          </div>
          <div class="progress-stat">
            <span class="progress-stat__value">${stats.currentStreak || 0}</span>
            <span class="progress-stat__label">Day Streak</span>
          </div>
        </div>
      </div>
      
      <div class="today__section">
        <h2 class="today__section-title">Recent Activity</h2>
        <p class="today__coach-message">
          More detailed progress tracking coming soon!
        </p>
      </div>
    </div>
  `;
  
  currentScreen = 'progress';
  updateNav('progress');
}

/**
 * Show settings/profile screen
 */
function showSettings() {
  const main = document.getElementById('main');
  if (!main) return;
  
  const profile = store.get('profile') || {};
  
  main.innerHTML = `
    <div class="screen screen--active settings" id="settingsScreen">
      <div class="today__header">
        <h1 class="today__title">Settings</h1>
      </div>
      
      <div class="today__coach">
        <div class="today__coach-header">
          <span class="today__coach-avatar">👤</span>
          <span class="today__coach-name">${profile.name || 'User'}</span>
        </div>
        <p class="today__coach-message">
          Manage your profile, preferences, and app settings.
        </p>
      </div>
      
      <div class="today__section">
        <h2 class="today__section-title">Quick Actions</h2>
      </div>
      
      <button class="checkin__submit" style="background: var(--color-surface);" 
              onclick="window.alongside.showWeeklyCheckin()">
        Weekly Check-In
      </button>
      
      <button class="checkin__submit" style="background: var(--color-danger); margin-top: 20px;" 
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
        const ex = workout[section].find(e => (e.exerciseId || e.id) === exerciseId);
        if (ex) {
          exercise = ex;
          break;
        }
      }
    }
  }
  
  if (!exercise) {
    console.warn('Exercise not found:', exerciseId);
    return;
  }
  
  // Check if already completed today
  if (store.isExerciseCompletedToday(exerciseId)) {
    console.log('Already completed today');
    return;
  }
  
  // Get credits
  const credits = exercise.credits || 0;
  
  // Mark as completed in store
  store.completeExercise(exerciseId, credits);
  
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
  // Onboarding functions
  onGenderChange: onboarding.onGenderChange,
  onMenstrualTrackingChange: onboarding.onMenstrualTrackingChange,
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
  toggleEquipmentCategory: onboarding.toggleEquipmentCategory,
  toggleNoEquipment: onboarding.toggleNoEquipment,
  equipmentCategoriesNext: onboarding.equipmentCategoriesNext,
  equipmentCategoryNext: onboarding.equipmentCategoryNext,
  equipmentCategoryBack: onboarding.equipmentCategoryBack,
  toggleEquipmentItem: onboarding.toggleEquipmentItem,
  equipmentOtherDone: onboarding.equipmentOtherDone,
  selectFitnessLevel: onboarding.selectFitnessLevel,
  selectCardioType: onboarding.selectCardioType,
  toggleBlacklistExercise: onboarding.toggleBlacklistExercise,
  
  // Navigation
  showCheckin,
  showWorkoutOptions,
  showToday,
  showBrowse,
  showProgress,
  showSettings,
  showWeeklyCheckin,
  
  // Active Coach functions
  toggleRationale,
  selectWorkoutOption,
  
  // Today view / Exercise functions
  skipToday: todayView.skipToday,
  showExerciseDetail: todayView.showExerciseDetail,
  closeExerciseDetail: todayView.closeExerciseDetail,
  completeExerciseFromDetail: todayView.completeExerciseFromDetail,
  
  // Timer functions
  startTimerForExercise: todayView.startTimerForExercise,
  toggleTimer: todayView.toggleTimer,
  closeTimer: todayView.closeTimer,
  
  // Legacy exercise modal (kept for backwards compatibility)
  showExerciseModal: todayView.showExerciseDetail,
  closeExerciseModal: todayView.closeExerciseDetail,
  completeExercise,
  completeExerciseWithValue,
  
  // Cards module (kept for backwards compatibility)
  adjustExerciseValue: cards.adjustExerciseValue,
  updateCreditsPreview: cards.updateCreditsPreview,
  toggleTimeUnit: cards.toggleTimeUnit,
  
  // Celebration
  celebrate,
  
  // Enhanced Check-in methods
  renderCheckin: checkinEnhanced.render,
  initCheckin: checkinEnhanced.init,
  adjustSleepHours: checkinEnhanced.adjustSleepHours,
  selectHydration: checkinEnhanced.selectHydration,
  setConditionImpact: checkinEnhanced.setConditionImpact,
  skipCheckin: checkinEnhanced.skipCheckin,
  
  // Savings functions
  logSaving: savingsTracker.logSaving,
  logSpend: savingsTracker.logSpend,
  showAddGoal: savingsTracker.showAddGoal,
  closeAddGoal: savingsTracker.closeAddGoal,
  saveGoal: savingsTracker.saveGoal,
  removeGoal: savingsTracker.removeGoal,
  
  // System
  resetApp,
  
  // Modules exposed for debugging
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
