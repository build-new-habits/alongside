/**
 * Alongside State Management Store
 * Handles all user data persistence via localStorage
 */

const STORAGE_KEY = 'alongside_data';

// Default state structure
const DEFAULT_STATE = {
  onboarding: {
    complete: false,
    currentStep: 'welcome',
    startedAt: null,
    completedAt: null
  },
  
  profile: {
    name: '',
    preferredName: '',
    primaryGoal: null,
    secondaryGoals: [],
    motivation: '',
    conditions: [],
    equipment: [],
    cycleTracking: false,
    cycleLength: 28,
    lastPeriodStart: null,
    createdAt: null,
    updatedAt: null
  },
  
  checkIns: [],
  workouts: [],
  
  session: {
    todayCheckIn: null,
    selectedOption: null,
    currentWorkout: null
  },
  
  settings: {
    theme: 'dark',
    reducedMotion: false,
    notifications: false,
    units: 'metric'
  },
  
  access: {
    tier: 'free',
    foundingCode: null,
    expiresAt: null
  }
};

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return deepMerge(DEFAULT_STATE, parsed);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return { ...DEFAULT_STATE };
}

function saveState(state) {
  try {
    const toSave = { ...state };
    toSave.session = DEFAULT_STATE.session;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch (e) {
    console.error('Failed to save state:', e);
    return false;
  }
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

let state = loadState();
const listeners = new Set();

function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(path, value) {
  listeners.forEach(callback => callback(path, value, state));
}

export const store = {
  get(path) {
    if (!path) return state;
    
    const parts = path.split('.');
    let value = state;
    
    for (const part of parts) {
      if (value === undefined || value === null) return undefined;
      value = value[part];
    }
    
    return value;
  },
  
  set(path, value) {
    const parts = path.split('.');
    let current = state;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
    saveState(state);
    notifyListeners(path, value);
    
    return value;
  },
  
  update(updates) {
    for (const [path, value] of Object.entries(updates)) {
      this.set(path, value);
    }
  },
  
  push(path, item) {
    const arr = this.get(path) || [];
    arr.push(item);
    this.set(path, arr);
    return arr;
  },
  
  remove(path, indexOrPredicate) {
    const arr = this.get(path) || [];
    let newArr;
    
    if (typeof indexOrPredicate === 'function') {
      newArr = arr.filter((item, i) => !indexOrPredicate(item, i));
    } else {
      newArr = arr.filter((_, i) => i !== indexOrPredicate);
    }
    
    this.set(path, newArr);
    return newArr;
  },
  
  subscribe,
  
  reset() {
    state = { ...DEFAULT_STATE };
    saveState(state);
    notifyListeners('*', null);
  },
  
  export() {
    return JSON.stringify(state, null, 2);
  },
  
  import(json) {
    try {
      const imported = JSON.parse(json);
      state = deepMerge(DEFAULT_STATE, imported);
      saveState(state);
      notifyListeners('*', null);
      return true;
    } catch (e) {
      console.error('Failed to import state:', e);
      return false;
    }
  },
  
  isOnboarded() {
    return this.get('onboarding.complete') === true;
  },
  
  getUserName() {
    return this.get('profile.preferredName') || this.get('profile.name') || 'there';
  },
  
  getTodayCheckIn() {
    const today = new Date().toISOString().split('T')[0];
    const checkIns = this.get('checkIns') || [];
    return checkIns.find(c => c.date === today);
  },
  
  saveCheckIn(data) {
    const today = new Date().toISOString().split('T')[0];
    const checkIns = this.get('checkIns') || [];
    
    const filtered = checkIns.filter(c => c.date !== today);
    
    const checkIn = {
      ...data,
      date: today,
      timestamp: new Date().toISOString()
    };
    
    filtered.push(checkIn);
    
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const recent = filtered.filter(c => new Date(c.date) >= cutoff);
    
    this.set('checkIns', recent);
    this.set('session.todayCheckIn', checkIn);
    
    return checkIn;
  },
  
  getRecentCheckIns(days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const checkIns = this.get('checkIns') || [];
    return checkIns.filter(c => new Date(c.date) >= cutoff);
  },
  
  getActiveConditions() {
    const conditions = this.get('profile.conditions') || [];
    const todayCheckIn = this.getTodayCheckIn();
    
    return conditions.map(condition => ({
      ...condition,
      todaySeverity: todayCheckIn?.conditions?.[condition.id] ?? condition.defaultSeverity ?? 5
    }));
  },
  
  isPremium() {
    const tier = this.get('access.tier');
    return tier === 'premium' || tier === 'founding';
  }
};

export default store;
