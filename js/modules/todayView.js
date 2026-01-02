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
  
  // Render workout detail view
  const main = document.getElementById('main');
  if (main) {
    main.innerHTML = renderWorkoutDetail(selected);
  }
}

/**
 * Render workout detail view with exercise list
 */
function renderWorkoutDetail(workout) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  
  return `
    <div class="screen screen--active today" id="workoutDetailScreen">
      <!-- Header -->
      <div class="today__header">
        <button class="back-button" onclick="window.alongside.showToday()">
          ← Back
        </button>
        <p class="today__date">${dateStr}</p>
        <h1 class="today__title">${workout.title}</h1>
        <p style="color: var(--color-text-muted); margin-top: 8px;">${workout.subtitle || ''}</p>
        
        <div class="today__summary">
          <span class="today__summary-item">
            <span>⏱️</span>
            <span>~${Math.round(workout.duration / 60)} min</span>
          </span>
          <span class="today__summary-item">
            <span>⭐</span>
            <span>${workout.totalCredits} credits</span>
          </span>
        </div>
      </div>
      
      <!-- Rationale -->
      <div class="today__coach">
        <div class="today__coach-header">
          <span class="today__coach-avatar">🌱</span>
          <span class="today__coach-name">Why this workout?</span>
        </div>
        <div class="workout-rationale-detail">
          ${workout.rationale?.primary ? `<p><strong>✅ ${workout.rationale.primary}</strong></p>` : ''}
          ${workout.rationale?.conditions?.length ? 
            workout.rationale.conditions.map(c => `<p>⚠️ ${c}</p>`).join('') : ''}
          ${workout.rationale?.mood ? `<p>😊 ${workout.rationale.mood}</p>` : ''}
          ${workout.rationale?.sleep ? `<p>💤 ${workout.rationale.sleep}</p>` : ''}
          ${workout.rationale?.menstrualCycle ? `<p>🌸 ${workout.rationale.menstrualCycle}</p>` : ''}
        </div>
      </div>
      
      <!-- Warmup Section -->
      ${workout.warmup && workout.warmup.length > 0 ? `
        <div class="today__section">
          <div class="today__section-header">
            <h2 class="today__section-title">Warmup</h2>
            <span class="today__section-count">${workout.warmup.length} exercises</span>
          </div>
          ${workout.warmup.map(ex => `
            <div class="exercise-item">
              <div class="exercise-item__icon">🔥</div>
              <div class="exercise-item__content">
                <div class="exercise-item__name">${ex.name}</div>
                <div class="exercise-item__meta">
                  <span>${ex.durationNote || `${ex.duration}s`}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <!-- Main Exercises -->
      <div class="today__section">
        <div class="today__section-header">
          <h2 class="today__section-title">Main Workout</h2>
          <span class="today__section-count">${workout.main.length} exercises</span>
        </div>
        ${workout.main.map(ex => {
          const setInfo = ex.sets ? `${ex.sets} sets × ` : '';
          const repInfo = ex.reps ? `${ex.reps} reps` : '';
          const durationInfo = ex.duration ? `${Math.round(ex.duration / 60)} min` : ex.durationNote || '';
          const restInfo = ex.rest ? ` (${ex.rest}s rest)` : '';
          
          return `
            <div class="exercise-item">
              <div class="exercise-item__icon">💪</div>
              <div class="exercise-item__content">
                <div class="exercise-item__name">${ex.name}</div>
                <div class="exercise-item__meta">
                  <span>${setInfo}${repInfo}${durationInfo}${restInfo}</span>
                  ${ex.credits ? `<span class="exercise-item__credits">⭐ ${ex.credits}</span>` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <!-- Cooldown Section -->
      ${workout.cooldown && workout.cooldown.length > 0 ? `
        <div class="today__section">
          <div class="today__section-header">
            <h2 class="today__section-title">Cooldown</h2>
            <span class="today__section-count">${workout.cooldown.length} exercises</span>
          </div>
          ${workout.cooldown.map(ex => `
            <div class="exercise-item">
              <div class="exercise-item__icon">💚</div>
              <div class="exercise-item__content">
                <div class="exercise-item__name">${ex.name}</div>
                <div class="exercise-item__meta">
                  <span>${ex.durationNote || `${ex.duration}s`}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <!-- Start Button -->
      <button class="checkin__submit" onclick="window.alongside.startWorkout()">
        Start Workout →
      </button>
      
      <button class="today__skip" onclick="window.alongside.showToday()">
        Choose different workout
      </button>
    </div>
  `;
}

/**
 * Start the workout - initialize execution
 */
function startWorkout() {
  const selected = store.get('workout.selectedWorkout');
  if (!selected) return;
  
  // Build flat exercise list: warmup + main + cooldown
  const allExercises = [
    ...selected.warmup.map(ex => ({ ...ex, section: 'warmup' })),
    ...selected.main.map(ex => ({ ...ex, section: 'main' })),
    ...selected.cooldown.map(ex => ({ ...ex, section: 'cooldown' }))
  ];
  
  // Initialize workout state
  const workoutState = {
    exercises: allExercises,
    currentIndex: 0,
    completedExercises: [],
    totalCredits: 0,
    startTime: Date.now()
  };
  
  store.set('workout.executionState', workoutState);
  
  // Render first exercise
  renderExerciseExecution(workoutState);
}

/**
 * Render exercise execution view
 */
function renderExerciseExecution(state) {
  const exercise = state.exercises[state.currentIndex];
  const progress = state.currentIndex + 1;
  const total = state.exercises.length;
  const isLast = state.currentIndex === state.exercises.length - 1;
  
  // Scroll to top when rendering new exercise
  window.scrollTo(0, 0);
  
  // Determine exercise type and display
  const isTimeBase = exercise.duration && !exercise.sets;
  const isRepsBase = exercise.sets && exercise.reps;
  
  const main = document.getElementById('main');
  if (!main) return;
  
  main.innerHTML = `
    <div class="screen screen--active workout-execution" id="workoutExecutionScreen">
      <!-- Progress Header -->
      <div class="execution-header">
        <div class="execution-progress">
          <span class="execution-progress__text">${progress} of ${total}</span>
          <div class="execution-progress__bar">
            <div class="execution-progress__fill" style="width: ${(progress / total) * 100}%"></div>
          </div>
        </div>
        <button class="execution-quit" onclick="window.alongside.quitWorkout()">
          ✕ Quit
        </button>
      </div>
      
      <!-- Section Badge -->
      <div class="execution-section-badge ${exercise.section}">
        ${exercise.section === 'warmup' ? '🔥 Warmup' : 
          exercise.section === 'main' ? '💪 Main Workout' : 
          '💚 Cooldown'}
      </div>
      
      <!-- Exercise Info -->
      <div class="execution-exercise">
        <h1 class="execution-exercise__name">${exercise.name}</h1>
        
        ${isTimeBase ? `
          <!-- Time-based exercise -->
          <div class="execution-timer" id="timer">
            <div class="execution-timer__display" id="timerDisplay">
              ${formatTime(exercise.duration)}
            </div>
            <div class="execution-timer__label">seconds</div>
          </div>
          <button class="execution-button execution-button--start" id="startTimerBtn" 
                  onclick="window.alongside.startTimer(${exercise.duration})">
            ▶ Start
          </button>
        ` : ''}
        
        ${isRepsBase ? `
          <!-- Reps-based exercise -->
          <div class="execution-reps">
            <div class="execution-reps__target">
              <span class="execution-reps__sets">${exercise.sets}</span>
              <span class="execution-reps__label">sets</span>
              <span class="execution-reps__times">×</span>
              <span class="execution-reps__count">${exercise.reps}</span>
              <span class="execution-reps__label">reps</span>
            </div>
            ${exercise.rest ? `
              <div class="execution-reps__rest">
                Rest: ${exercise.rest}s between sets
              </div>
            ` : ''}
          </div>
          
          <!-- Set Tracker - ENTIRE BOX IS CLICKABLE -->
          <div class="execution-sets" id="setTracker">
            ${Array.from({ length: exercise.sets }, (_, i) => `
              <div class="execution-set" data-set="${i + 1}" 
                   onclick="window.alongside.completeSet(${i + 1})">
                <span class="execution-set__number">Set ${i + 1}</span>
                <div class="execution-set__check">
                  ✓
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
      
      <!-- Action Buttons -->
      <div class="execution-actions">
        ${isTimeBase ? `
          <button class="execution-button execution-button--secondary" id="skipTimerBtn" 
                  onclick="window.alongside.showDifficultyFeedback()" style="display: none;">
            Done →
          </button>
        ` : `
          <button class="execution-button execution-button--primary" 
                  onclick="window.alongside.showDifficultyFeedback()">
            ${isLast ? 'Finish Workout 🎉' : 'Next Exercise →'}
          </button>
        `}
      </div>
      
      <!-- Credits Preview -->
      ${exercise.credits ? `
        <div class="execution-credits">
          <span>⭐ ${exercise.credits} credits</span>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Start timer for time-based exercise
 */
let timerInterval = null;
function startTimer(duration) {
  let remaining = duration;
  const display = document.getElementById('timerDisplay');
  const startBtn = document.getElementById('startTimerBtn');
  const skipBtn = document.getElementById('skipTimerBtn');
  
  if (!display || !startBtn) return;
  
  // Hide start button, show skip button
  startBtn.style.display = 'none';
  if (skipBtn) skipBtn.style.display = 'block';
  
  // Clear any existing timer
  if (timerInterval) clearInterval(timerInterval);
  
  // Start countdown
  timerInterval = setInterval(() => {
    remaining--;
    display.textContent = formatTime(remaining);
    
    if (remaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      // Auto-complete when timer finishes
      setTimeout(() => {
        completeCurrentExercise();
      }, 500);
    }
  }, 1000);
}

/**
 * Complete a set (for reps-based exercises)
 */
let completedSets = new Set();
function completeSet(setNumber) {
  completedSets.add(setNumber);
  
  // Update UI
  const setEl = document.querySelector(`[data-set="${setNumber}"]`);
  if (setEl) {
    setEl.classList.add('execution-set--completed');
  }
  
  // Check if all sets completed
  const state = store.get('workout.executionState');
  const exercise = state.exercises[state.currentIndex];
  
  if (completedSets.size >= exercise.sets) {
    // All sets done - enable next button (already visible)
    completedSets.clear();
  }
}

/**
 * Show difficulty feedback after exercise
 */
function showDifficultyFeedback() {
  // Clear timer if running
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  const state = store.get('workout.executionState');
  const exercise = state.exercises[state.currentIndex];
  
  // Scroll to top
  window.scrollTo(0, 0);
  
  const main = document.getElementById('main');
  if (!main) return;
  
  main.innerHTML = `
    <div class="screen screen--active feedback-screen">
      <div class="feedback-content">
        <h2 class="feedback-title">How was that?</h2>
        <p class="feedback-subtitle">${exercise.name}</p>
        
        <div class="feedback-options">
          <button class="feedback-option" onclick="window.alongside.recordDifficulty('too-easy')">
            <span class="feedback-option__emoji">😌</span>
            <span class="feedback-option__text">Too Easy</span>
          </button>
          
          <button class="feedback-option" onclick="window.alongside.recordDifficulty('just-right')">
            <span class="feedback-option__emoji">👍</span>
            <span class="feedback-option__text">Just Right</span>
          </button>
          
          <button class="feedback-option" onclick="window.alongside.recordDifficulty('challenging')">
            <span class="feedback-option__emoji">💪</span>
            <span class="feedback-option__text">Challenging</span>
          </button>
          
          <button class="feedback-option" onclick="window.alongside.recordDifficulty('too-hard')">
            <span class="feedback-option__emoji">😓</span>
            <span class="feedback-option__text">Too Hard</span>
          </button>
        </div>
        
        <button class="feedback-skip" onclick="window.alongside.recordDifficulty('skip')">
          Skip →
        </button>
      </div>
    </div>
  `;
}

/**
 * Record difficulty and handle follow-up
 */
function recordDifficulty(difficulty) {
  const state = store.get('workout.executionState');
  const exercise = state.exercises[state.currentIndex];
  
  if (difficulty === 'too-hard') {
    // Show follow-up: WHY was it hard?
    showHardnessReason(exercise, difficulty);
  } else if (difficulty === 'too-easy') {
    // Show follow-up: Want to increase difficulty?
    showEasyFollowup(exercise, difficulty);
  } else {
    // Just record and move on
    saveFeedback(exercise, difficulty, null);
    completeCurrentExercise();
  }
}

/**
 * Ask WHY exercise was too hard
 */
function showHardnessReason(exercise, difficulty) {
  window.scrollTo(0, 0);
  
  const main = document.getElementById('main');
  if (!main) return;
  
  main.innerHTML = `
    <div class="screen screen--active feedback-screen">
      <div class="feedback-content">
        <h2 class="feedback-title">What made it hard?</h2>
        <p class="feedback-subtitle">This helps us adapt future workouts</p>
        
        <div class="feedback-reasons">
          <button class="feedback-reason" onclick="window.alongside.saveFeedback('${exercise.exerciseId || exercise.name}', '${difficulty}', 'injury')">
            🤕 Injury or pain
          </button>
          
          <button class="feedback-reason" onclick="window.alongside.saveFeedback('${exercise.exerciseId || exercise.name}', '${difficulty}', 'discomfort')">
            😣 Physical discomfort
          </button>
          
          <button class="feedback-reason" onclick="window.alongside.saveFeedback('${exercise.exerciseId || exercise.name}', '${difficulty}', 'today')">
            📅 Just today (tired/stressed)
          </button>
          
          <button class="feedback-reason" onclick="window.alongside.saveFeedback('${exercise.exerciseId || exercise.name}', '${difficulty}', 'hate-it')">
            🚫 I don't like this exercise
          </button>
          
          <button class="feedback-reason" onclick="window.alongside.saveFeedback('${exercise.exerciseId || exercise.name}', '${difficulty}', 'too-advanced')">
            📈 Too advanced for me right now
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Ask if user wants to increase difficulty
 */
function showEasyFollowup(exercise, difficulty) {
  window.scrollTo(0, 0);
  
  const main = document.getElementById('main');
  if (!main) return;
  
  main.innerHTML = `
    <div class="screen screen--active feedback-screen">
      <div class="feedback-content">
        <h2 class="feedback-title">Want more challenge?</h2>
        <p class="feedback-subtitle">We can adjust this for next time</p>
        
        <div class="feedback-reasons">
          <button class="feedback-reason" onclick="window.alongside.saveFeedback('${exercise.exerciseId || exercise.name}', '${difficulty}', 'increase-reps')">
            ➕ More reps
          </button>
          
          <button class="feedback-reason" onclick="window.alongside.saveFeedback('${exercise.exerciseId || exercise.name}', '${difficulty}', 'increase-weight')">
            ⬆️ More weight/resistance
          </button>
          
          <button class="feedback-reason" onclick="window.alongside.saveFeedback('${exercise.exerciseId || exercise.name}', '${difficulty}', 'increase-sets')">
            📊 More sets
          </button>
          
          <button class="feedback-reason" onclick="window.alongside.saveFeedback('${exercise.exerciseId || exercise.name}', '${difficulty}', 'keep-same')">
            👍 Keep it the same
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Save feedback and move to next exercise
 */
function saveFeedback(exerciseId, difficulty, reason) {
  // Get or create feedback history
  let feedbackHistory = store.get('exerciseFeedback') || [];
  
  feedbackHistory.push({
    exerciseId,
    difficulty,
    reason,
    date: new Date().toISOString()
  });
  
  // Keep last 100 feedback entries
  if (feedbackHistory.length > 100) {
    feedbackHistory = feedbackHistory.slice(-100);
  }
  
  store.set('exerciseFeedback', feedbackHistory);
  
  // Now complete the exercise
  completeCurrentExercise();
}

/**
 * Complete current exercise and move to next
 */
function completeCurrentExercise() {
  const state = store.get('workout.executionState');
  const exercise = state.exercises[state.currentIndex];
  
  // Add to completed
  state.completedExercises.push(exercise);
  
  // Add credits
  if (exercise.credits) {
    state.totalCredits += exercise.credits;
  }
  
  // Move to next exercise
  state.currentIndex++;
  
  // Save state
  store.set('workout.executionState', state);
  
  // Reset set tracker
  completedSets.clear();
  
  // Check if workout complete
  if (state.currentIndex >= state.exercises.length) {
    completeWorkout(state);
  } else {
    // Render next exercise
    renderExerciseExecution(state);
  }
}

/**
 * Quit workout early
 */
function quitWorkout() {
  if (confirm('Are you sure you want to quit? Your progress will be saved.')) {
    // Clear timer
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    
    const state = store.get('workout.executionState');
    
    // Save partial credits
    if (state.totalCredits > 0) {
      store.set('credits.balance', store.get('credits.balance') + state.totalCredits);
    }
    
    // Clear execution state
    store.set('workout.executionState', null);
    
    // Return to today view
    const checkinData = store.get('checkin');
    showToday(checkinData.energy, checkinData.mood);
  }
}

/**
 * Complete entire workout
 */
function completeWorkout(state) {
  const endTime = Date.now();
  const duration = Math.round((endTime - state.startTime) / 1000 / 60); // minutes
  
  // Award credits
  store.set('credits.balance', store.get('credits.balance') + state.totalCredits);
  
  // Update stats
  const stats = store.get('stats') || {};
  stats.totalWorkouts = (stats.totalWorkouts || 0) + 1;
  stats.totalCredits = (stats.totalCredits || 0) + state.totalCredits;
  store.set('stats', stats);
  
  // Clear execution state
  store.set('workout.executionState', null);
  
  // Show celebration
  const main = document.getElementById('main');
  if (main) {
    main.innerHTML = `
      <div class="screen screen--active workout-complete">
        <div class="workout-complete__content">
          <div class="workout-complete__emoji">🎉</div>
          <h1 class="workout-complete__title">Workout Complete!</h1>
          <div class="workout-complete__stats">
            <div class="workout-complete__stat">
              <div class="workout-complete__stat-value">${state.completedExercises.length}</div>
              <div class="workout-complete__stat-label">exercises</div>
            </div>
            <div class="workout-complete__stat">
              <div class="workout-complete__stat-value">${duration}</div>
              <div class="workout-complete__stat-label">minutes</div>
            </div>
            <div class="workout-complete__stat">
              <div class="workout-complete__stat-value">⭐ ${state.totalCredits}</div>
              <div class="workout-complete__stat-label">credits earned</div>
            </div>
          </div>
          <button class="checkin__submit" onclick="window.alongside.showToday()">
            Done →
          </button>
        </div>
      </div>
    `;
  }
  
  // Trigger confetti celebration
  if (window.alongside.celebrate) {
    setTimeout(() => {
      window.alongside.celebrate(state.totalCredits);
    }, 500);
  }
}

/**
 * Helper: Format seconds to display time
 */
function formatTime(seconds) {
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return seconds.toString();
}

export const todayView = {
  render,
  init,
  refresh,
  skipToday,
  selectWorkout,
  startWorkout,
  startTimer,
  completeSet,
  completeCurrentExercise,
  quitWorkout,
  showDifficultyFeedback,
  recordDifficulty,
  saveFeedback,
  getCurrentWorkout: () => currentWorkout
};

export default todayView;
