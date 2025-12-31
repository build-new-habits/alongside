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
  
  // Import Active Coach modules
  const { generateDailyWorkouts } = await import('./workoutGenerator.js');
  
  // Check if we already have workouts saved for today
  const savedWorkouts = store.get('workout.todayWorkouts');
  const savedDate = store.get('workout.date');
  
  let workouts;
  
  if (savedWorkouts && savedDate === today) {
    // Use saved workouts
    workouts = savedWorkouts;
  } else {
    // Generate new workouts
    const profile = store.get('profile') || {};
    const checkinData = {
      energy,
      mood,
      conditions: profile.conditions || [],
      equipment: profile.equipment || [],
      goals: profile.goals || [],
      sleep: { hours: 7, quality: 4 }, // Default for now
      hydration: 'ok',
      menstrualDay: null // TODO: Add menstrual tracking
    };
    
    workouts = await generateDailyWorkouts(checkinData);
    
    // Save workouts for the day
    if (workouts) {
      store.set('workout.todayWorkouts', workouts);
      store.set('workout.date', today);
    }
  }
  
  if (!workouts || !workouts.options || workouts.options.length === 0) {
    return renderError();
  }
  
  // Get today's date formatted
  const todayDate = new Date();
  const dateStr = todayDate.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  
  // Check if burnout mode
  if (workouts.burnoutMode) {
    return renderBurnoutMode(workouts, dateStr);
  }
  
  // Render normal 3-option view
  return renderWorkoutOptions(workouts, dateStr);
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

/**
 * Render burnout mode
 */
function renderBurnoutMode(workouts, dateStr) {
  const workout = workouts.options[0]; // Recovery workout
  
  return `
    <div class="screen screen--active today" id="todayScreen">
      <!-- Burnout Banner -->
      <div class="burnout-banner">
        <div class="burnout-banner__icon">🛡️</div>
        <div class="burnout-banner__content">
          <h3 class="burnout-banner__title">Recovery Mode</h3>
          <p class="burnout-banner__message">${workouts.message}</p>
        </div>
      </div>
      
      <!-- Header -->
      <div class="today__header">
        <p class="today__date">${dateStr}</p>
        <h1 class="today__title">${workout.title}</h1>
        <p style="color: var(--color-text-muted); margin-top: 8px;">${workout.subtitle}</p>
      </div>
      
      <!-- Coach Message -->
      <div class="today__coach">
        <div class="today__coach-header">
          <span class="today__coach-avatar">🌱</span>
          <span class="today__coach-name">Your Coach</span>
        </div>
        <p class="today__coach-message">${workout.rationale?.primary || 'Rest is the priority today.'}</p>
      </div>
      
      <!-- Recovery Exercises -->
      <div class="today__section">
        <div class="today__section-header">
          <h2 class="today__section-title">Gentle Activities</h2>
        </div>
        ${workout.main.map(ex => `
          <div class="exercise-item">
            <div class="exercise-item__icon">💚</div>
            <div class="exercise-item__content">
              <div class="exercise-item__name">${ex.name}</div>
              <div class="exercise-item__meta">
                <span>${ex.durationNote || `${Math.round(ex.duration / 60)} min`}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <button class="today__skip" onclick="window.alongside.skipToday()">
        I'm feeling better →
      </button>
    </div>
  `;
}

/**
 * Render 3 workout options
 */
function renderWorkoutOptions(workouts, dateStr) {
  return `
    <div class="screen screen--active today" id="todayScreen">
      <!-- Header -->
      <div class="today__header">
        <p class="today__date">${dateStr}</p>
        <h1 class="today__title">Choose Your Focus</h1>
        <p style="color: var(--color-text-muted); margin-top: 8px;">Pick one that feels right today</p>
      </div>
      
      <!-- Workout Options -->
      <div class="workout-options">
        ${workouts.options.map((workout, index) => {
          const icon = index === 0 ? '💪' : index === 1 ? '🧘' : '🏃';
          return `
            <div class="workout-card" onclick="window.alongside.selectWorkout(${index})">
              <div class="workout-card__header">
                <span class="workout-card__icon">${icon}</span>
                <h3 class="workout-card__title">${workout.title}</h3>
              </div>
              <p class="workout-card__subtitle">${workout.subtitle || ''}</p>
              
              <div class="workout-card__stats">
                <span>⏱️ ~${Math.round(workout.duration / 60)} min</span>
                <span>⭐ ${workout.totalCredits} credits</span>
              </div>
              
              <!-- Rationale Toggle -->
              <button class="workout-card__rationale-btn" onclick="event.stopPropagation(); this.nextElementSibling.classList.toggle('hidden')">
                Why this? ↓
              </button>
              <div class="workout-card__rationale hidden">
                <p><strong>✅ ${workout.rationale?.primary || ''}</strong></p>
                ${workout.rationale?.conditions?.length ? `
                  ${workout.rationale.conditions.map(c => `<p>⚠️ ${c}</p>`).join('')}
                ` : ''}
                ${workout.rationale?.mood ? `<p>😊 ${workout.rationale.mood}</p>` : ''}
                ${workout.rationale?.sleep ? `<p>💤 ${workout.rationale.sleep}</p>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <button class="today__skip" onclick="window.alongside.skipToday()">
        Not feeling it today? That's okay →
      </button>
    </div>
  `;
}

/**
 * Select a workout option
 */
function selectWorkout(index) {
  const workouts = store.get('workout.todayWorkouts');
  if (!workouts || !workouts.options) return;
  
  const selected = workouts.options[index];
  currentWorkout = selected;
  
  // Save selected workout
  store.set('workout.selectedWorkout', selected);
  
  // TODO: Show workout details / execution view
  alert(`Selected: ${selected.title}
Next: Build workout execution UI to show exercises one by one`);
}

export const todayView = {
  render,
  init,
  refresh,
  skipToday,
  selectWorkout,
  getCurrentWorkout: () => currentWorkout
};

export default todayView;
