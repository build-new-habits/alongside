/**
 * Alongside - Today's Workout View
 * Shows the coach-generated workout for today
 */

import { store } from '../store.js';
import { coach } from './coach.js';
import { library } from './libraryLoader.js';
import { checkin } from './checkin.js';
import { economy } from './economy.js';

// Pattern icons
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
  breathing: '🌬️'
};

// Store the current workout
let currentWorkout = null;

/**
 * Render the today screen
 */
async function render(energy = 5, mood = 5) {
  const today = new Date().toDateString();
  
  // Check if we already have a workout saved for today
  const savedWorkout = store.get('workout.todayWorkout');
  const savedDate = store.get('workout.date');
  
  if (savedWorkout && savedDate === today) {
    // Use the saved workout
    currentWorkout = savedWorkout;
  } else {
    // Generate a new workout and save it
    currentWorkout = await coach.buildDailyWorkout({
      energy,
      mood,
      conditions: store.get('profile.conditions') || [],
      equipment: store.get('profile.equipment') || [],
      goals: store.get('profile.goals') || []
    });
    
    // Save to store so it persists all day
    if (currentWorkout) {
      store.set('workout.todayWorkout', currentWorkout);
      store.set('workout.date', today);
    }
  }
  
  if (!currentWorkout) {
    return renderError();
  }
  
  // Get today's date formatted
  const todayDate = new Date();
  const dateStr = todayDate.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  
  // Calculate totals using economy module for consistent credits
  const totalDuration = currentWorkout.sections.reduce((sum, section) => {
    return sum + section.exercises.reduce((s, e) => s + (e.duration || 30), 0);
  }, 0);
  
  const totalCredits = currentWorkout.sections.reduce((sum, section) => {
    return sum + section.exercises.reduce((s, e) => s + economy.calculateCredits(e), 0);
  }, 0);
  
  // Get completed exercises
  const completedToday = store.get('workout.completedExercises') || [];
  
  return `
    <div class="screen screen--active today" id="todayScreen">
      <!-- Header -->
      <div class="today__header">
        <p class="today__date">${dateStr}</p>
        <h1 class="today__title">${currentWorkout.name}</h1>
        <div class="today__summary">
          <span class="today__summary-item">
            <span>⏱️</span>
            <span>~${Math.round(totalDuration / 60)} min</span>
          </span>
          <span class="today__summary-item">
            <span>⭐</span>
            <span>${totalCredits} credits available</span>
          </span>
        </div>
      </div>
      
      <!-- Coach Message -->
      <div class="today__coach">
        <div class="today__coach-header">
          <span class="today__coach-avatar">🌱</span>
          <span class="today__coach-name">Your Coach</span>
        </div>
        <p class="today__coach-message">${currentWorkout.coachMessage}</p>
      </div>
      
      <!-- Workout Sections -->
      ${currentWorkout.sections.map((section, sectionIndex) => `
        <div class="today__section">
          <div class="today__section-header">
            <h2 class="today__section-title">${section.name}</h2>
            <span class="today__section-count">${section.exercises.length} exercises</span>
          </div>
          
          ${section.exercises.map((exercise, exerciseIndex) => {
            const isCompleted = completedToday.includes(exercise.id);
            const icon = PATTERN_ICONS[exercise.movementPattern] || '✨';
            const duration = exercise.durationUnit === 'seconds' 
              ? `${exercise.duration}s` 
              : `${exercise.duration} min`;
            
            // Calculate credits using economy module
            const credits = economy.calculateCredits(exercise);
            
            return `
              <div class="exercise-item ${isCompleted ? 'exercise-item--completed' : ''}"
                   data-exercise-id="${exercise.id}"
                   onclick="window.alongside.showExerciseModal('${exercise.id}')">
                <div class="exercise-item__icon">${icon}</div>
                <div class="exercise-item__content">
                  <div class="exercise-item__name">${exercise.name}</div>
                  <div class="exercise-item__meta">
                    <span>${duration}</span>
                    <span class="exercise-item__credits">+${credits}</span>
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
 * Render error state
 */
function renderError() {
  return `
    <div class="screen screen--active today" id="todayScreen">
      <div class="today__header">
        <h1 class="today__title">Oops!</h1>
      </div>
      <div class="today__coach">
        <div class="today__coach-header">
          <span class="today__coach-avatar">🌱</span>
          <span class="today__coach-name">Your Coach</span>
        </div>
        <p class="today__coach-message">
          I couldn't load your workout right now. Let's try refreshing the page, 
          or you can browse exercises manually.
        </p>
      </div>
      <button class="checkin__submit" onclick="location.reload()">
        Refresh
      </button>
    </div>
  `;
}

/**
 * Initialize today view
 */
function init() {
  // Nothing needed for now - click handlers are inline
}

/**
 * Refresh the view (after completing an exercise)
 */
async function refresh() {
  const checkinData = store.get('checkin');
  const energy = checkinData?.energy || 5;
  const mood = checkinData?.mood || 5;
  
  const main = document.getElementById('main');
  if (main) {
    main.innerHTML = await render(energy, mood);
  }
}

/**
 * Handle skip today
 */
function skipToday() {
  // Show a gentle message
  const main = document.getElementById('main');
  if (main) {
    main.innerHTML = `
      <div class="screen screen--active today" id="todayScreen">
        <div class="today__header" style="text-align: center; padding-top: 60px;">
          <span style="font-size: 4rem; display: block; margin-bottom: 20px;">💚</span>
          <h1 class="today__title">Rest is productive too</h1>
        </div>
        <div class="today__coach">
          <div class="today__coach-header">
            <span class="today__coach-avatar">🌱</span>
            <span class="today__coach-name">Your Coach</span>
          </div>
          <p class="today__coach-message">
            Taking a rest day is part of the process. Your body and mind need recovery 
            to grow stronger. See you tomorrow when you're ready.
          </p>
        </div>
        <button class="checkin__submit" style="background: var(--color-surface); color: var(--color-text);" 
                onclick="window.alongside.showCheckin()">
          ← Actually, let me try
        </button>
      </div>
    `;
  }
}

export const todayView = {
  render,
  init,
  refresh,
  skipToday,
  getCurrentWorkout: () => currentWorkout
};

export default todayView;
