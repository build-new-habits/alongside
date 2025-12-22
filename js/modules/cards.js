/**
 * Alongside Exercise Card Renderer
 * Renders exercise cards (front) and detail modals (back)
 */

import { library } from './libraryLoader.js';
import { store } from '../store.js';
import { economy } from './economy.js';

// Movement pattern display info
const PATTERN_INFO = {
  hinge: { name: 'Strength', icon: '🏋️', category: 'strength' },
  squat: { name: 'Strength', icon: '🏋️', category: 'strength' },
  lunge: { name: 'Strength', icon: '🏋️', category: 'strength' },
  push: { name: 'Strength', icon: '💪', category: 'strength' },
  pull: { name: 'Strength', icon: '💪', category: 'strength' },
  carry: { name: 'Strength', icon: '🎒', category: 'strength' },
  rotation: { name: 'Mobility', icon: '🔄', category: 'mobility' },
  mobility: { name: 'Mobility', icon: '🧘', category: 'mobility' },
  stability: { name: 'Core', icon: '⚖️', category: 'stability' },
  locomotion: { name: 'Cardio', icon: '🏃', category: 'cardio' },
  recovery: { name: 'Recovery', icon: '💚', category: 'recovery' }
};

// Energy level display
const ENERGY_DISPLAY = {
  low: { label: 'Low', icon: '🔋' },
  medium: { label: 'Medium', icon: '⚡' },
  high: { label: 'High', icon: '🔥' }
};

/**
 * Render an exercise card (FRONT)
 */
function renderExerciseCard(exercise) {
  const pattern = PATTERN_INFO[exercise.movementPattern] || PATTERN_INFO.stability;
  const energy = ENERGY_DISPLAY[exercise.energyRequired] || ENERGY_DISPLAY.medium;
  
  // Calculate estimated calories for default duration
  const duration = exercise.duration || 30;
  const calories = Math.round((exercise.caloriesPerMinute || 5) * (duration / 60));
  
  // Calculate credits using economy module
  const credits = economy.calculateCredits(exercise);
  
  // Format duration display
  const durationDisplay = exercise.durationUnit === 'seconds' 
    ? `${duration}s` 
    : `${duration} min`;
  
  return `
    <article class="exercise-card" 
             tabindex="0" 
             role="button"
             aria-label="${exercise.name} - click for instructions"
             data-exercise-id="${exercise.id}"
             onclick="window.alongside.showExerciseModal('${exercise.id}')">
      
      <!-- Category Header -->
      <div class="exercise-card__header exercise-card__header--${pattern.category}">
        <span class="exercise-card__header-icon">${pattern.icon}</span>
        <span>${pattern.name}</span>
      </div>
      
      <!-- Card Body -->
      <div class="exercise-card__body">
        <h3 class="exercise-card__name">${exercise.name}</h3>
        <p class="exercise-card__description">${exercise.description}</p>
        
        <!-- Stats -->
        <div class="exercise-card__stats">
          <span class="exercise-card__energy exercise-card__energy--${exercise.energyRequired}">
            ${energy.icon} ${energy.label}
          </span>
          <span class="exercise-card__stat">
            <span class="exercise-card__stat-icon">⏱️</span>
            ${durationDisplay}
          </span>
          <span class="exercise-card__stat">
            <span class="exercise-card__stat-icon">🔥</span>
            ~${calories} cal
          </span>
        </div>
        
        <!-- Credits -->
        <div class="exercise-card__credits">
          +${credits} ⭐
        </div>
      </div>
      
      <!-- Hint -->
      <div class="exercise-card__hint">
        <span>👆</span>
        <span>Tap for instructions</span>
      </div>
    </article>
  `;
}

/**
 * Show exercise detail modal (BACK)
 */
async function showExerciseModal(exerciseId) {
  // Get exercise data
  // Try to find in loaded sources, or load it
  let exercise = null;
  
  // Check bodyweight first
  const bodyweight = await library.loadExerciseSource('bodyweight');
  if (bodyweight) {
    exercise = bodyweight.exercises.find(e => e.id === exerciseId);
  }
  
  // Check yoga if not found
  if (!exercise) {
    const yoga = await library.loadExerciseSource('yoga-poses');
    if (yoga) {
      exercise = yoga.exercises.find(e => e.id === exerciseId);
    }
  }
  
  // Check breathing if not found
  if (!exercise) {
    const breathing = await library.loadExerciseSource('breathing');
    if (breathing) {
      exercise = breathing.exercises.find(e => e.id === exerciseId);
    }
  }
  
  // Check mobility if not found
  if (!exercise) {
    const mobility = await library.loadExerciseSource('mobility-drills');
    if (mobility) {
      exercise = mobility.exercises.find(e => e.id === exerciseId);
    }
  }
  
  if (!exercise) {
    console.error('Exercise not found:', exerciseId);
    return;
  }
  
  // Check if already completed today
  const completedToday = store.get('workouts.completedToday') || [];
  const isCompleted = completedToday.includes(exerciseId);
  
  // Build modal HTML
  const duration = exercise.duration || 30;
  const durationDisplay = exercise.durationUnit === 'seconds' 
    ? `${duration} secs` 
    : `${duration} min`;
  const calories = Math.round((exercise.caloriesPerMinute || 5) * (duration / 60));
  const credits = economy.calculateCredits(exercise);
  
  const youtubeUrl = library.getVideoSearchUrl(exercise);
  
  const modal = document.createElement('div');
  modal.className = 'exercise-modal';
  modal.id = 'exercise-detail-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'exercise-modal-title');
  
  modal.innerHTML = `
    <div class="exercise-modal__content">
      <!-- Header - Summary -->
      <div class="exercise-modal__header">
        <div>
          <h2 id="exercise-modal-title" class="exercise-modal__title">${exercise.name}</h2>
          <p class="exercise-modal__summary">
            ${durationDisplay} • ~${calories} cal • +${credits} credits
          </p>
        </div>
        <button class="exercise-modal__close" 
                onclick="window.alongside.closeExerciseModal()"
                aria-label="Close">
          ✕
        </button>
      </div>
      
      <!-- Body - Instructions -->
      <div class="exercise-modal__body">
        <h3 class="exercise-modal__section-title">How to do it</h3>
        
        <ol class="exercise-modal__instructions">
          ${Array.isArray(exercise.instructions) 
            ? exercise.instructions.map((step, i) => `
                <li class="exercise-modal__step">
                  <span class="exercise-modal__step-number">${i + 1}</span>
                  <span class="exercise-modal__step-text">${step}</span>
                </li>
              `).join('')
            : `<li class="exercise-modal__step">
                 <span class="exercise-modal__step-number">1</span>
                 <span class="exercise-modal__step-text">${exercise.instructions}</span>
               </li>`
          }
        </ol>
        
        ${exercise.modifications ? `
          <div class="exercise-modal__modifications">
            <h4 class="exercise-modal__mod-title">🟢 Make it easier</h4>
            <p class="exercise-modal__mod-text">${exercise.modifications.easier}</p>
            
            <h4 class="exercise-modal__mod-title">🔴 Make it harder</h4>
            <p class="exercise-modal__mod-text">${exercise.modifications.harder}</p>
          </div>
        ` : ''}
        
        ${youtubeUrl ? `
          <a href="${youtubeUrl}" 
             target="_blank" 
             rel="noopener noreferrer"
             class="exercise-modal__video-btn">
            <span class="exercise-modal__video-icon">🎬</span>
            Watch how to do this
          </a>
        ` : ''}
      </div>
      
      <!-- Footer - Actions -->
      <div class="exercise-modal__footer">
        <!-- Duration/Reps Input -->
        <div class="exercise-modal__input-section">
          <label class="exercise-modal__input-label">
            ${exercise.reps ? 'Reps completed' : 'Time completed'}
          </label>
          <div class="exercise-modal__input-row">
            <button class="exercise-modal__adjust-btn" 
                    onclick="window.alongside.adjustExerciseValue(-1, '${exerciseId}')"
                    aria-label="Decrease">−</button>
            <input type="number" 
                   id="exercise-actual-value"
                   class="exercise-modal__input"
                   value="${exercise.reps || duration}"
                   min="1"
                   max="${exercise.reps ? 100 : 3600}"
                   data-exercise-id="${exerciseId}"
                   data-is-reps="${exercise.reps ? 'true' : 'false'}"
                   data-default="${exercise.reps || duration}"
                   data-unit="${exercise.durationUnit || 'seconds'}"
                   onchange="window.alongside.updateCreditsPreview()">
            <button class="exercise-modal__adjust-btn" 
                    onclick="window.alongside.adjustExerciseValue(1, '${exerciseId}')"
                    aria-label="Increase">+</button>
            ${exercise.reps ? `
              <span class="exercise-modal__input-unit">reps</span>
            ` : `
              <select class="exercise-modal__unit-select" 
                      id="exercise-unit-select"
                      onchange="window.alongside.toggleTimeUnit()">
                <option value="seconds" ${(exercise.durationUnit || 'seconds') === 'seconds' ? 'selected' : ''}>secs</option>
                <option value="minutes" ${exercise.durationUnit === 'minutes' ? 'selected' : ''}>mins</option>
              </select>
            `}
          </div>
          <p class="exercise-modal__credits-preview" id="credits-preview">
            = <span id="credits-value">${credits}</span> credits
          </p>
        </div>
        
        <div class="exercise-modal__buttons">
          <button class="exercise-modal__back-btn" 
                  onclick="window.alongside.closeExerciseModal()">
            ← Back
          </button>
          <button class="exercise-modal__complete-btn ${isCompleted ? 'exercise-modal__complete-btn--completed' : ''}"
                  onclick="window.alongside.completeExerciseWithValue('${exerciseId}')"
                  ${isCompleted ? 'disabled' : ''}>
            ${isCompleted ? '✓ Completed' : '✓ Complete'}
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Focus trap - focus the close button
  modal.querySelector('.exercise-modal__close').focus();
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeExerciseModal();
    }
  });
  
  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeExerciseModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

/**
 * Close exercise detail modal
 */
function closeExerciseModal() {
  const modal = document.getElementById('exercise-detail-modal');
  if (modal) {
    modal.remove();
  }
}

/**
 * Adjust the exercise value (reps or duration) with +/- buttons
 */
function adjustExerciseValue(delta, exerciseId) {
  const input = document.getElementById('exercise-actual-value');
  if (!input) return;
  
  const isReps = input.dataset.isReps === 'true';
  const unit = input.dataset.unit;
  const min = 1;
  const max = isReps ? 100 : (unit === 'seconds' ? 300 : 60);
  
  // Adjust step based on type
  const step = isReps ? 1 : (unit === 'seconds' ? 5 : 1);
  
  let newValue = parseInt(input.value) + (delta * step);
  newValue = Math.max(min, Math.min(max, newValue));
  input.value = newValue;
  
  // Update credits preview
  updateCreditsPreview(input);
}

/**
 * Update the credits preview based on current input value
 */
function updateCreditsPreview(input) {
  input = input || document.getElementById('exercise-actual-value');
  const creditsEl = document.getElementById('credits-value');
  if (!creditsEl || !input) return;
  
  const value = parseInt(input.value);
  const isReps = input.dataset.isReps === 'true';
  const unitSelect = document.getElementById('exercise-unit-select');
  const unit = unitSelect ? unitSelect.value : input.dataset.unit;
  
  // Calculate duration in minutes
  let durationMinutes;
  if (isReps) {
    // Estimate ~3 seconds per rep
    durationMinutes = (value * 3) / 60;
  } else if (unit === 'seconds') {
    durationMinutes = value / 60;
  } else {
    durationMinutes = value;
  }
  
  // Simple credit calculation (will be refined with actual exercise data)
  // Base: 5 credits per minute, adjusted by rough intensity
  const credits = Math.max(1, Math.round(5 * durationMinutes * 1.5));
  creditsEl.textContent = credits;
}

/**
 * Toggle between seconds and minutes
 */
function toggleTimeUnit() {
  const input = document.getElementById('exercise-actual-value');
  const unitSelect = document.getElementById('exercise-unit-select');
  if (!input || !unitSelect) return;
  
  const currentValue = parseInt(input.value);
  const newUnit = unitSelect.value;
  const oldUnit = input.dataset.unit;
  
  // Convert value
  let newValue;
  if (oldUnit === 'seconds' && newUnit === 'minutes') {
    newValue = Math.round(currentValue / 60);
    if (newValue < 1) newValue = 1;
  } else if (oldUnit === 'minutes' && newUnit === 'seconds') {
    newValue = currentValue * 60;
  } else {
    newValue = currentValue;
  }
  
  input.value = newValue;
  input.dataset.unit = newUnit;
  
  // Update credits preview
  updateCreditsPreview(input);
}

/**
 * Complete an exercise with the actual value entered
 */
function completeExerciseWithValue(exerciseId) {
  const input = document.getElementById('exercise-actual-value');
  if (!input) {
    // Fallback to default completion
    if (window.alongside?.completeExercise) {
      window.alongside.completeExercise(exerciseId);
    }
    return;
  }
  
  const actualValue = parseInt(input.value);
  const isReps = input.dataset.isReps === 'true';
  const unit = input.dataset.unit;
  
  // Pass to main app with actual value
  if (window.alongside?.completeExerciseWithValue) {
    window.alongside.completeExerciseWithValue(exerciseId, actualValue, isReps, unit);
  } else if (window.alongside?.completeExercise) {
    window.alongside.completeExercise(exerciseId);
  }
}

/**
 * Complete an exercise
 * Delegates to main app for proper handling
 */
function completeExercise(exerciseId) {
  if (window.alongside?.completeExercise) {
    window.alongside.completeExercise(exerciseId);
  } else {
    console.warn('Complete exercise handler not available');
    closeExerciseModal();
  }
}

/**
 * Render a grid of exercise cards
 */
function renderExerciseGrid(exercises, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div class="exercise-grid">
      ${exercises.map(ex => renderExerciseCard(ex)).join('')}
    </div>
  `;
}

// Export functions
export const cards = {
  renderExerciseCard,
  showExerciseModal,
  closeExerciseModal,
  completeExercise,
  completeExerciseWithValue,
  adjustExerciseValue,
  updateCreditsPreview,
  toggleTimeUnit,
  renderExerciseGrid
};

// Make available globally
if (typeof window !== 'undefined') {
  window.alongside = window.alongside || {};
  window.alongside.showExerciseModal = showExerciseModal;
  window.alongside.closeExerciseModal = closeExerciseModal;
  window.alongside.completeExercise = completeExercise;
  window.alongside.adjustExerciseValue = adjustExerciseValue;
}

export default cards;
