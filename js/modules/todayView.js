/**
 * Alongside - Today's Workout View
 * Shows the coach-generated workout for today
 * 
 * FIXES (Jan 20, 2026):
 * - ✅ Time display always in minutes (not seconds)
 * - ✅ Sets/reps display with rest time and total duration
 * - ✅ Countdown timer for timed exercises
 * - ✅ Exercise modal fixes
 */

import { store } from '../store.js';
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
  breathing: '🌬️',
  stretch: '🧘',
  stillness: '🧘',
  core: '⚖️'
};

// Store the current workout and timer state
let currentWorkout = null;
let activeTimer = null;
let timerInterval = null;

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
// HELPER: Format time for countdown display (MM:SS)
// ===================================================================
function formatCountdown(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ===================================================================
// HELPER: Calculate exercise duration for display
// ===================================================================
function getExerciseDuration(exercise) {
  // For set-based exercises, calculate total time
  if (exercise.sets && exercise.reps) {
    // Estimate: 3 seconds per rep + rest time between sets
    const repTime = exercise.sets * exercise.reps * 3;
    const restTime = (exercise.sets - 1) * (exercise.rest || 60);
    return repTime + restTime;
  }
  
  // For timed exercises, use duration directly
  if (exercise.duration) {
    return exercise.duration;
  }
  
  // Default 30 seconds
  return 30;
}

// ===================================================================
// HELPER: Get display info for exercise
// ===================================================================
function getExerciseDisplayInfo(exercise) {
  // For strength exercises with sets/reps
  if (exercise.sets && exercise.reps) {
    const totalSeconds = getExerciseDuration(exercise);
    const rest = exercise.rest || 60;
    return {
      primary: `${exercise.sets} × ${exercise.reps}`,
      secondary: `Rest: ${rest}s between sets`,
      duration: formatDuration(totalSeconds),
      isTimeBased: false
    };
  }
  
  // For timed exercises
  const duration = exercise.duration || 30;
  return {
    primary: formatDuration(duration),
    secondary: exercise.durationNote || null,
    duration: formatDuration(duration),
    isTimeBased: true,
    durationSeconds: duration
  };
}

// ===================================================================
// RENDER: Main workout view
// ===================================================================
async function render(energy = 5, mood = 5) {
  // Get the selected workout from store
  const selectedWorkout = store.get('workout.selectedWorkout');
  
  if (!selectedWorkout) {
    return renderError('No workout selected. Please go back and choose one.');
  }
  
  currentWorkout = selectedWorkout;
  
  // Get today's date formatted
  const todayDate = new Date();
  const dateStr = todayDate.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  
  // Calculate totals
  let totalSeconds = 0;
  let totalCredits = 0;
  
  // Process warmup
  if (selectedWorkout.warmup) {
    for (const ex of selectedWorkout.warmup) {
      totalSeconds += getExerciseDuration(ex);
      totalCredits += ex.credits || 20;
    }
  }
  
  // Process main exercises
  if (selectedWorkout.main) {
    for (const ex of selectedWorkout.main) {
      totalSeconds += getExerciseDuration(ex);
      totalCredits += ex.credits || 30;
    }
  }
  
  // Process cooldown
  if (selectedWorkout.cooldown) {
    for (const ex of selectedWorkout.cooldown) {
      totalSeconds += getExerciseDuration(ex);
      totalCredits += ex.credits || 20;
    }
  }
  
  // Get completed exercises
  const completedToday = store.get('workout.completedExercises') || [];
  
  // Build rationale display
  const rationale = selectedWorkout.rationale || {};
  const rationaleText = rationale.primary || `Your energy is ${energy}/10 - steady, sustainable pace`;
  
  return `
    <div class="screen screen--active today" id="todayScreen">
      <!-- Header -->
      <div class="today__header">
        <p class="today__date">${dateStr}</p>
        <h1 class="today__title">${selectedWorkout.title}</h1>
        <div class="today__summary">
          <span class="today__summary-item">
            <span>⏱️</span>
            <span>${formatDuration(totalSeconds)}</span>
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
        <p class="today__coach-message">${rationaleText}</p>
      </div>
      
      <!-- Warmup Section -->
      ${selectedWorkout.warmup && selectedWorkout.warmup.length > 0 ? `
        <div class="today__section">
          <div class="today__section-header">
            <h2 class="today__section-title">🔥 Warm Up</h2>
            <span class="today__section-count">${selectedWorkout.warmup.length} exercises</span>
          </div>
          ${renderExerciseList(selectedWorkout.warmup, completedToday)}
        </div>
      ` : ''}
      
      <!-- Main Set Section -->
      ${selectedWorkout.main && selectedWorkout.main.length > 0 ? `
        <div class="today__section">
          <div class="today__section-header">
            <h2 class="today__section-title">💪 Main Set</h2>
            <span class="today__section-count">${selectedWorkout.main.length} exercises</span>
          </div>
          ${renderExerciseList(selectedWorkout.main, completedToday)}
        </div>
      ` : ''}
      
      <!-- Cooldown Section -->
      ${selectedWorkout.cooldown && selectedWorkout.cooldown.length > 0 ? `
        <div class="today__section">
          <div class="today__section-header">
            <h2 class="today__section-title">🧘 Cool Down</h2>
            <span class="today__section-count">${selectedWorkout.cooldown.length} exercises</span>
          </div>
          ${renderExerciseList(selectedWorkout.cooldown, completedToday)}
        </div>
      ` : ''}
      
      <!-- Skip Option -->
      <button class="today__skip" onclick="window.alongside.skipToday()">
        Not feeling it today? That's okay →
      </button>
    </div>
    
    <!-- Timer Modal (hidden by default) -->
    <div id="timerModal" class="timer-modal" style="display: none;">
      <div class="timer-modal__content">
        <div class="timer-modal__header">
          <h2 id="timerExerciseName">Exercise</h2>
          <button class="timer-modal__close" onclick="window.alongside.closeTimer()">✕</button>
        </div>
        <div class="timer-modal__body">
          <div class="timer-modal__display" id="timerDisplay">00:00</div>
          <div class="timer-modal__progress">
            <div class="timer-modal__progress-bar" id="timerProgressBar"></div>
          </div>
          <p class="timer-modal__instruction" id="timerInstruction">Get ready...</p>
        </div>
        <div class="timer-modal__footer">
          <button class="timer-modal__btn timer-modal__btn--secondary" onclick="window.alongside.closeTimer()">
            Cancel
          </button>
          <button class="timer-modal__btn timer-modal__btn--primary" id="timerActionBtn" onclick="window.alongside.toggleTimer()">
            Start
          </button>
        </div>
      </div>
    </div>
  `;
}

// ===================================================================
// RENDER: Exercise list
// ===================================================================
function renderExerciseList(exercises, completedToday) {
  return exercises.map(exercise => {
    const exerciseId = exercise.exerciseId || exercise.id;
    const isCompleted = completedToday.includes(exerciseId);
    const icon = PATTERN_ICONS[exercise.movementPattern] || '✨';
    const displayInfo = getExerciseDisplayInfo(exercise);
    const credits = exercise.credits || economy.calculateCredits(exercise);
    
    return `
      <div class="exercise-item ${isCompleted ? 'exercise-item--completed' : ''}"
           data-exercise-id="${exerciseId}"
           onclick="window.alongside.showExerciseDetail('${exerciseId}')">
        <div class="exercise-item__icon">${icon}</div>
        <div class="exercise-item__content">
          <div class="exercise-item__name">${exercise.name}</div>
          <div class="exercise-item__meta">
            <span class="exercise-item__primary">${displayInfo.primary}</span>
            ${displayInfo.secondary ? `<span class="exercise-item__secondary">${displayInfo.secondary}</span>` : ''}
            <span class="exercise-item__duration">${displayInfo.duration}</span>
          </div>
        </div>
        <div class="exercise-item__credits">+${credits}</div>
        <div class="exercise-item__check">
          ${isCompleted ? '✓' : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ===================================================================
// SHOW: Exercise detail modal
// ===================================================================
function showExerciseDetail(exerciseId) {
  // Find exercise in current workout
  const exercise = findExerciseById(exerciseId);
  
  if (!exercise) {
    console.error('Exercise not found in current workout:', exerciseId);
    return;
  }
  
  const displayInfo = getExerciseDisplayInfo(exercise);
  const credits = exercise.credits || economy.calculateCredits(exercise);
  const isCompleted = (store.get('workout.completedExercises') || []).includes(exerciseId);
  
  // Build instructions HTML
  let instructionsHtml = '';
  if (Array.isArray(exercise.instructions)) {
    instructionsHtml = exercise.instructions.map((step, i) => `
      <li class="exercise-detail__step">
        <span class="exercise-detail__step-num">${i + 1}</span>
        <span>${step}</span>
      </li>
    `).join('');
  } else if (typeof exercise.instructions === 'string') {
    instructionsHtml = `<li class="exercise-detail__step"><span>1</span><span>${exercise.instructions}</span></li>`;
  }
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'exercise-detail-modal';
  modal.id = 'exerciseDetailModal';
  
  modal.innerHTML = `
    <div class="exercise-detail__content">
      <div class="exercise-detail__header">
        <div>
          <h2 class="exercise-detail__title">${exercise.name}</h2>
          <p class="exercise-detail__summary">
            ${displayInfo.primary} • ${displayInfo.duration} • +${credits} credits
          </p>
        </div>
        <button class="exercise-detail__close" onclick="window.alongside.closeExerciseDetail()">✕</button>
      </div>
      
      <div class="exercise-detail__body">
        ${exercise.description ? `<p class="exercise-detail__desc">${exercise.description}</p>` : ''}
        
        ${instructionsHtml ? `
          <h3>How to do it</h3>
          <ol class="exercise-detail__instructions">${instructionsHtml}</ol>
        ` : ''}
        
        ${exercise.modifications ? `
          <div class="exercise-detail__mods">
            <p><strong>🟢 Easier:</strong> ${exercise.modifications.easier}</p>
            <p><strong>🔴 Harder:</strong> ${exercise.modifications.harder}</p>
          </div>
        ` : ''}
      </div>
      
      <div class="exercise-detail__footer">
        ${displayInfo.isTimeBased ? `
          <button class="exercise-detail__btn exercise-detail__btn--timer" 
                  onclick="window.alongside.startTimerForExercise('${exerciseId}', ${displayInfo.durationSeconds || 30})">
            ⏱️ Start Timer
          </button>
        ` : ''}
        
        <button class="exercise-detail__btn exercise-detail__btn--complete ${isCompleted ? 'completed' : ''}"
                onclick="window.alongside.completeExerciseFromDetail('${exerciseId}')"
                ${isCompleted ? 'disabled' : ''}>
          ${isCompleted ? '✓ Completed' : '✓ Mark Complete'}
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeExerciseDetail();
    }
  });
}

// ===================================================================
// CLOSE: Exercise detail modal
// ===================================================================
function closeExerciseDetail() {
  const modal = document.getElementById('exerciseDetailModal');
  if (modal) {
    modal.remove();
  }
}

// ===================================================================
// FIND: Exercise by ID in current workout
// ===================================================================
function findExerciseById(exerciseId) {
  if (!currentWorkout) return null;
  
  // Search in warmup
  if (currentWorkout.warmup) {
    const found = currentWorkout.warmup.find(e => (e.exerciseId || e.id) === exerciseId);
    if (found) return found;
  }
  
  // Search in main
  if (currentWorkout.main) {
    const found = currentWorkout.main.find(e => (e.exerciseId || e.id) === exerciseId);
    if (found) return found;
  }
  
  // Search in cooldown
  if (currentWorkout.cooldown) {
    const found = currentWorkout.cooldown.find(e => (e.exerciseId || e.id) === exerciseId);
    if (found) return found;
  }
  
  return null;
}

// ===================================================================
// TIMER: Start timer for exercise
// ===================================================================
function startTimerForExercise(exerciseId, durationSeconds) {
  const exercise = findExerciseById(exerciseId);
  if (!exercise) return;
  
  // Close exercise detail modal first
  closeExerciseDetail();
  
  // Set up timer state
  activeTimer = {
    exerciseId,
    exerciseName: exercise.name,
    totalDuration: durationSeconds,
    remainingSeconds: durationSeconds,
    isRunning: false,
    credits: exercise.credits || 30
  };
  
  // Show timer modal
  const timerModal = document.getElementById('timerModal');
  if (timerModal) {
    timerModal.style.display = 'flex';
    document.getElementById('timerExerciseName').textContent = exercise.name;
    document.getElementById('timerDisplay').textContent = formatCountdown(durationSeconds);
    document.getElementById('timerProgressBar').style.width = '100%';
    document.getElementById('timerInstruction').textContent = 'Press Start when ready';
    document.getElementById('timerActionBtn').textContent = 'Start';
  }
}

// ===================================================================
// TIMER: Toggle timer (start/pause)
// ===================================================================
function toggleTimer() {
  if (!activeTimer) return;
  
  const actionBtn = document.getElementById('timerActionBtn');
  
  if (activeTimer.isRunning) {
    // Pause
    activeTimer.isRunning = false;
    clearInterval(timerInterval);
    actionBtn.textContent = 'Resume';
    document.getElementById('timerInstruction').textContent = 'Paused';
  } else {
    // Start/Resume
    activeTimer.isRunning = true;
    actionBtn.textContent = 'Pause';
    document.getElementById('timerInstruction').textContent = 'Keep going!';
    
    timerInterval = setInterval(() => {
      activeTimer.remainingSeconds--;
      
      // Update display
      document.getElementById('timerDisplay').textContent = formatCountdown(activeTimer.remainingSeconds);
      
      // Update progress bar
      const progress = (activeTimer.remainingSeconds / activeTimer.totalDuration) * 100;
      document.getElementById('timerProgressBar').style.width = `${progress}%`;
      
      // Update instruction based on time remaining
      if (activeTimer.remainingSeconds <= 10 && activeTimer.remainingSeconds > 0) {
        document.getElementById('timerInstruction').textContent = `${activeTimer.remainingSeconds} seconds left!`;
      }
      
      // Timer complete
      if (activeTimer.remainingSeconds <= 0) {
        clearInterval(timerInterval);
        timerComplete();
      }
    }, 1000);
  }
}

// ===================================================================
// TIMER: Timer complete
// ===================================================================
function timerComplete() {
  if (!activeTimer) return;
  
  document.getElementById('timerDisplay').textContent = '🎉';
  document.getElementById('timerInstruction').textContent = 'Well done!';
  document.getElementById('timerActionBtn').textContent = 'Complete';
  document.getElementById('timerActionBtn').onclick = () => {
    completeExerciseFromTimer();
  };
  
  // Optional: Play completion sound (browser beep)
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    oscillator.start();
    setTimeout(() => oscillator.stop(), 200);
  } catch (e) {
    // Audio not supported, that's fine
  }
}

// ===================================================================
// TIMER: Close timer
// ===================================================================
function closeTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  activeTimer = null;
  
  const timerModal = document.getElementById('timerModal');
  if (timerModal) {
    timerModal.style.display = 'none';
  }
}

// ===================================================================
// COMPLETE: Exercise from timer
// ===================================================================
function completeExerciseFromTimer() {
  if (!activeTimer) return;
  
  const exerciseId = activeTimer.exerciseId;
  const credits = activeTimer.credits;
  
  // Mark as completed
  store.completeExercise(exerciseId, credits);
  
  // Close timer
  closeTimer();
  
  // Show celebration
  if (window.alongside && window.alongside.celebrate) {
    window.alongside.celebrate(credits);
  }
  
  // Refresh view
  refresh();
}

// ===================================================================
// COMPLETE: Exercise from detail modal
// ===================================================================
function completeExerciseFromDetail(exerciseId) {
  const exercise = findExerciseById(exerciseId);
  if (!exercise) return;
  
  // Check if already completed
  const completed = store.get('workout.completedExercises') || [];
  if (completed.includes(exerciseId)) {
    closeExerciseDetail();
    return;
  }
  
  const credits = exercise.credits || economy.calculateCredits(exercise);
  
  // Mark as completed
  store.completeExercise(exerciseId, credits);
  
  // Close modal
  closeExerciseDetail();
  
  // Show celebration
  if (window.alongside && window.alongside.celebrate) {
    window.alongside.celebrate(credits);
  }
  
  // Refresh view
  refresh();
}

// ===================================================================
// RENDER: Error state
// ===================================================================
function renderError(message) {
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
          ${message || "I couldn't load your workout right now. Let's try refreshing the page."}
        </p>
      </div>
      <button class="checkin__submit" onclick="location.reload()">
        Refresh
      </button>
    </div>
  `;
}

// ===================================================================
// INIT
// ===================================================================
function init() {
  // Nothing needed - handlers are inline
}

// ===================================================================
// REFRESH: Refresh the view
// ===================================================================
async function refresh() {
  const checkinData = store.get('checkin');
  const energy = checkinData?.energy || 5;
  const mood = checkinData?.mood || 5;
  
  const main = document.getElementById('main');
  if (main) {
    main.innerHTML = await render(energy, mood);
    window.scrollTo(0, 0);
  }
}

// ===================================================================
// SKIP: Skip today's workout
// ===================================================================
function skipToday() {
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

// ===================================================================
// EXPORT
// ===================================================================
export const todayView = {
  render,
  init,
  refresh,
  skipToday,
  getCurrentWorkout: () => currentWorkout,
  showExerciseDetail,
  closeExerciseDetail,
  startTimerForExercise,
  toggleTimer,
  closeTimer,
  completeExerciseFromDetail,
  completeExerciseFromTimer
};

export default todayView;
