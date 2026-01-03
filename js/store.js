/**
 * Alongside - State Management Store
 * LocalStorage-backed reactive state
 */

const STORAGE_KEY = 'alongside_data';

// Default state structure
const defaultState = {
  // User profile
  profile: {
    name: '',
    conditions: [],
    equipment: [],
    goals: [],
    menstrualTracking: false,
    onboardingComplete: false
  },
  
  // Today's check-in
  checkin: {
    date: null,
    energy: 5,
    mood: 5,
    sleepHours: 7,
    sleepQuality: 3,
    hydration: 'adequate',
    conditions: [],
    menstrualDay: null,
    completed: false,
    skipped: false
  },

  //Check-in history for burnout detection
  checkinHistory: [],
  
  // Today's workout
  workout: {
    date: null,
    exercises: [],
    completedExercises: []
  },
  
  // Credits system
  credits: {
    balance: 0,
    history: []
  },
  
  // Stats
  stats: {
    totalWorkouts: 0,
    totalCredits: 0,
    currentStreak: 0,
    longestStreak: 0
  },
  
  // Check-in history for burnout detection
  checkinHistory: []
};

// In-memory state
let state = {};

// Subscribers for reactive updates
const subscribers = new Set();

/**
 * Initialize the store
 */
function init() {
  // Load from localStorage
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state = deepMerge(defaultState, parsed);
    } catch (e) {
      console.warn('Failed to parse saved state, using defaults');
      state = { ...defaultState };
    }
  } else {
    state = { ...defaultState };
  }
  
  // Check if we need to reset daily data
  checkDailyReset();
  
  console.log('Store initialized:', state);
  return state;
}

/**
 * Check if daily data needs to be reset
 */
function checkDailyReset() {
  const today = new Date().toDateString();
  
  // Reset check-in if it's a new day
  if (state.checkin.date !== today) {
    state.checkin = {
      ...defaultState.checkin,
      date: null
    };
  }
  
  // Reset workout completed exercises if it's a new day
  if (state.workout.date !== today) {
    state.workout = {
      date: null,
      exercises: [],
      completedExercises: []
    };
  }
  
  persist();
}

/**
 * Get a value from the store
 */
function get(path) {
  if (!path) return state;
  
  const keys = path.split('.');
  let value = state;
  
  for (const key of keys) {
    if (value === undefined || value === null) return undefined;
    value = value[key];
  }
  
  return value;
}

/**
 * Set a value in the store
 */
function set(path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let target = state;
  
  for (const key of keys) {
    if (target[key] === undefined) {
      target[key] = {};
    }
    target = target[key];
  }
  
  target[lastKey] = value;
  persist();
  notify();
  
  return value;
}

/**
 * Update multiple values at once
 */
function update(updates) {
  for (const [path, value] of Object.entries(updates)) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = state;
    
    for (const key of keys) {
      if (target[key] === undefined) {
        target[key] = {};
      }
      target = target[key];
    }
    
    target[lastKey] = value;
  }
  
  persist();
  notify();
}

/**
 * Save state to localStorage
 */
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to persist state:', e);
  }
}

/**
 * Notify all subscribers of state change
 */
function notify() {
  subscribers.forEach(fn => fn(state));
}

/**
 * Subscribe to state changes
 */
function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/**
 * Reset state to defaults
 */
function reset() {
  state = { ...defaultState };
  persist();
  notify();
}

/**
 * Deep merge two objects
 * FIXED: Properly handles arrays to prevent them becoming objects
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key of Object.keys(source)) {
    // Handle arrays specially - don't merge them, just use source
    if (Array.isArray(source[key])) {
      result[key] = source[key];
    }
    // Handle objects (but not arrays or null)
    else if (source[key] instanceof Object && source[key] !== null && key in target) {
      result[key] = deepMerge(target[key], source[key]);
    } 
    // Primitive values
    else {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * Check if user has completed today's check-in
 */
function hasCheckedInToday() {
  const today = new Date().toDateString();
  return state.checkin.date === today && state.checkin.completed;
}

/**
 * Save today's check-in
 */
function saveCheckin(energy, mood, conditions = []) {
  const today = new Date().toDateString();
  const now = new Date().toISOString();
  
  state.checkin = {
    date: today,
    energy,
    mood,
    conditions,
    completed: true
  };
  
  // Add to history for burnout detection
  if (!Array.isArray(state.checkinHistory)) {
    state.checkinHistory = [];
  }
  
  state.checkinHistory.push({
    date: now,
    energy,
    mood,
    conditions
  });
  
  // Keep only last 30 days of history
  if (state.checkinHistory.length > 30) {
    state.checkinHistory = state.checkinHistory.slice(-30);
  }
  
  persist();
  notify();
}

/**
 * Add credits to balance
 * FIXED: Added safety check to ensure history is an array
 */
function addCredits(amount, reason = 'exercise') {
  // Safety check: ensure history is an array
  if (!Array.isArray(state.credits.history)) {
    state.credits.history = [];
  }
  
  state.credits.balance += amount;
  state.credits.history.push({
    amount,
    reason,
    date: new Date().toISOString()
  });
  
  state.stats.totalCredits += amount;
  
  persist();
  notify();
  
  return state.credits.balance;
}

/**
 * Mark an exercise as completed
 */
function completeExercise(exerciseId, credits) {
  const today = new Date().toDateString();
  
  // Ensure we have today's workout data
  if (state.workout.date !== today) {
    state.workout = {
      date: today,
      exercises: state.workout.exercises || [],
      completedExercises: []
    };
  }
  
  // Check if already completed today
  if (state.workout.completedExercises.includes(exerciseId)) {
    console.log('Exercise already completed today');
    return false;
  }
  
  // Add to completed
  state.workout.completedExercises.push(exerciseId);
  
  // Add credits
  addCredits(credits, `Completed: ${exerciseId}`);
  
  persist();
  notify();
  
  return true;
}

/**
 * Check if an exercise is completed today
 */
function isExerciseCompletedToday(exerciseId) {
  const today = new Date().toDateString();
  return state.workout.date === today && 
         state.workout.completedExercises.includes(exerciseId);
}

// Export store interface
export const store = {
  init,
  get,
  set,
  update,
  subscribe,
  reset,
  hasCheckedInToday,
  saveCheckin,
  addCredits,
  completeExercise,
  isExerciseCompletedToday,
  saveCheckinEnhanced,
  addCheckinToHistory,
  getCheckinHistory,
  detectBurnout,
  getBurnoutAdaptation
};

export default store;
