/**
 * Alongside - State Management Store
 * LocalStorage-backed reactive state
 * ENHANCED VERSION - With burnout detection, comprehensive check-in, and goal system
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
    onboardingComplete: false,
    
    // NEW: Fitness Level
    fitnessLevel: null, // 'beginner' | 'intermediate' | 'advanced'
    
    // NEW: User Preferences
    preferences: {
      cardioType: null, // 'running' | 'hiit' | 'mixed' | 'low-impact'
      exerciseBlacklist: [], // Exercise IDs user never wants to see
      yogaStyle: null // 'power' | 'restorative' | 'mixed'
    }
  },
  
  // Today's check-in - ENHANCED
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
  
  // Check-in history for burnout detection
  checkinHistory: [],
  
  // Today's workout
  workout: {
    date: null,
    todayWorkouts: [],
    selectedWorkout: null,
    executionState: null,
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
  
  // Exercise feedback
  exerciseFeedback: []
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
      todayWorkouts: [],
      selectedWorkout: null,
      executionState: null,
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
 * Save today's check-in (LEGACY - for backward compatibility)
 */
function saveCheckin(energy, mood) {
  const today = new Date().toDateString();
  
  state.checkin = {
    date: today,
    energy,
    mood,
    sleepHours: 7,
    sleepQuality: 3,
    hydration: 'adequate',
    conditions: [],
    menstrualDay: null,
    completed: true,
    skipped: false
  };
  
  persist();
  notify();
}

/**
 * Save enhanced check-in with all data
 */
function saveCheckinEnhanced(checkinData) {
  const today = new Date().toDateString();
  
  state.checkin = {
    date: today,
    energy: checkinData.energy,
    mood: checkinData.mood,
    sleepHours: checkinData.sleepHours,
    sleepQuality: checkinData.sleepQuality,
    hydration: checkinData.hydration,
    conditions: checkinData.conditions || [],
    menstrualDay: checkinData.menstrualDay || null,
    completed: true,
    skipped: checkinData.skipped || false
  };
  
  persist();
  notify();
}

/**
 * Add today's check-in to history (for burnout detection)
 * Keeps last 30 days
 */
function addCheckinToHistory(checkinData) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Ensure history array exists
  if (!Array.isArray(state.checkinHistory)) {
    state.checkinHistory = [];
  }
  
  // Add today's data
  state.checkinHistory.push({
    date: today,
    energy: checkinData.energy,
    mood: checkinData.mood,
    sleepQuality: checkinData.sleepQuality,
    avgConditionPain: calculateAverageConditionPain(checkinData.conditions),
    skipped: checkinData.skipped || false
  });
  
  // Keep only last 30 days
  if (state.checkinHistory.length > 30) {
    state.checkinHistory = state.checkinHistory.slice(-30);
  }
  
  persist();
  notify();
}

/**
 * Calculate average pain across all conditions
 */
function calculateAverageConditionPain(conditions) {
  if (!conditions || conditions.length === 0) return 0;
  
  const totalPain = conditions.reduce((sum, c) => sum + (c.pain || 0), 0);
  return Math.round(totalPain / conditions.length);
}

/**
 * Get check-in history (last N days)
 */
function getCheckinHistory(days = 7) {
  if (!Array.isArray(state.checkinHistory)) {
    return [];
  }
  
  return state.checkinHistory.slice(-days);
}

/**
 * Detect burnout patterns from check-in history
 * Returns: { detected: boolean, patterns: string[], severity: 'low'|'moderate'|'high' }
 */
function detectBurnout() {
  const history = getCheckinHistory(7); // Last 7 days
  
  if (history.length < 3) {
    return { detected: false, patterns: [], severity: 'low' };
  }
  
  const patterns = [];
  let severityScore = 0;
  
  // Pattern 1: Consecutive low energy (3+ days with energy ≤3)
  const consecutiveLowEnergy = getConsecutiveCount(history, 'energy', (val) => val <= 3);
  if (consecutiveLowEnergy >= 3) {
    patterns.push('consecutive-low-energy');
    severityScore += 2;
  }
  
  // Pattern 2: Low energy trend (7-day average <4)
  const avgEnergy = calculateAverage(history, 'energy');
  if (avgEnergy < 4) {
    patterns.push('low-energy-trend');
    severityScore += 1;
  }
  
  // Pattern 3: Consecutive low mood (3+ days with mood ≤4)
  const consecutiveLowMood = getConsecutiveCount(history, 'mood', (val) => val <= 4);
  if (consecutiveLowMood >= 3) {
    patterns.push('consecutive-low-mood');
    severityScore += 2;
  }
  
  // Pattern 4: Poor sleep pattern (3+ days with quality ≤2)
  const poorSleepDays = history.filter(d => d.sleepQuality <= 2).length;
  if (poorSleepDays >= 3) {
    patterns.push('poor-sleep-pattern');
    severityScore += 1;
  }
  
  // Pattern 5: High pain pattern (3+ days with avg pain ≥6)
  const highPainDays = history.filter(d => d.avgConditionPain >= 6).length;
  if (highPainDays >= 3) {
    patterns.push('pain-flare');
    severityScore += 2;
  }
  
  // Pattern 6: Combined low energy AND low mood
  const combinedLowDays = history.filter(d => d.energy <= 3 && d.mood <= 4).length;
  if (combinedLowDays >= 2) {
    patterns.push('energy-mood-crash');
    severityScore += 3;
  }
  
  // Determine severity
  let severity = 'low';
  if (severityScore >= 5) severity = 'high';
  else if (severityScore >= 3) severity = 'moderate';
  
  const detected = patterns.length > 0;
  
  return { detected, patterns, severity };
}

/**
 * Helper: Get consecutive count of days matching condition
 */
function getConsecutiveCount(history, field, condition) {
  let maxConsecutive = 0;
  let currentConsecutive = 0;
  
  for (let i = history.length - 1; i >= 0; i--) {
    if (condition(history[i][field])) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 0;
    }
  }
  
  return maxConsecutive;
}

/**
 * Helper: Calculate average of a field over history
 */
function calculateAverage(history, field) {
  if (history.length === 0) return 0;
  
  const sum = history.reduce((total, day) => total + (day[field] || 0), 0);
  return sum / history.length;
}

/**
 * Get burnout-safe workout recommendations
 * Returns: { mode: 'recovery' | 'normal', message: string }
 */
function getBurnoutAdaptation() {
  const burnout = detectBurnout();
  
  if (!burnout.detected) {
    return { mode: 'normal', message: null };
  }
  
  let message = '';
  
  if (burnout.severity === 'high') {
    message = 'You\'ve been running on low reserves lately. Today, we\'re prioritizing rest and gentle movement. Your wellbeing matters more than any workout goal.';
  } else if (burnout.severity === 'moderate') {
    message = 'I\'ve noticed your energy and mood have been lower recently. Let\'s keep today\'s workout gentle and restorative.';
  } else {
    message = 'You might be feeling a bit depleted. I\'ll suggest lighter options today.';
  }
  
  return { mode: 'recovery', message, patterns: burnout.patterns, severity: burnout.severity };
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
      todayWorkouts: state.workout.todayWorkouts || [],
      selectedWorkout: state.workout.selectedWorkout || null,
      executionState: state.workout.executionState || null,
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
  saveCheckinEnhanced,
  addCheckinToHistory,
  getCheckinHistory,
  detectBurnout,
  getBurnoutAdaptation,
  addCredits,
  completeExercise,
  isExerciseCompletedToday
};

export default store;
