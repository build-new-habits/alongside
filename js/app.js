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
 * Show progress screen (placeholder)
 */
function showProgress() {
  const main = document.getElementById('main');
  if (!main) return;
  
  const credits = store.get('credits.balance') || 0;
  const totalCredits = store.get('stats.totalCredits') || 0;
  
  main.innerHTML = `
    <div class="screen screen--active" id="progressScreen">
      <div class="today__header">
        <h1 class="today__title">Your Progress</h1>
      </div>
      
      <div class="today__coach" style="text-align: center;">
        <span style="font-size: 3rem; display: block; margin-bottom: 16px;">⭐</span>
        <h2 style="font-size: 2.5rem; font-family: var(--font-mono); color: var(--color-success);">
          ${credits}
        </h2>
        <p style="color: var(--color-text-muted);">Current Credits</p>
      </div>
      
      <div class="today__coach">
        <p class="today__coach-message" style="text-align: center;">
          <strong>${totalCredits}</strong> total credits earned<br>
          Keep going — every workout counts!
        </p>
      </div>
    </div>
  `;
  
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
  // Find the exercise to get credits
  const workout = todayView.getCurrentWorkout();
  let credits = 50; // Default
  
  if (workout) {
    for (const section of workout.sections) {
      const ex = section.exercises.find(e => e.id === exerciseId);
      if (ex) {
        credits = ex.credits || 50;
        break;
      }
    }
  }
  
  // Check if already completed
  if (store.isExerciseCompletedToday(exerciseId)) {
    console.log('Already completed today');
    cards.closeExerciseModal();
    return;
  }
  
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
  showCheckin,
  showToday,
  showBrowse,
  showProgress,
  showSettings,
  showExerciseModal: cards.showExerciseModal,
  closeExerciseModal: cards.closeExerciseModal,
  completeExercise,
  celebrate,
  skipToday: todayView.skipToday,
  resetApp,
  store,
  library
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { init };
