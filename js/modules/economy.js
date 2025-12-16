/**
 * Alongside Economy Module
 * Manages credits, weekly tiers, treats, and savings
 */

import { store } from '../store.js';

// Economy configuration (loaded from JSON)
let economyConfig = null;

// Intensity multipliers for credit calculation
const INTENSITY_MULTIPLIERS = {
  low: 0.5,
  medium: 1.0,
  high: 1.5,
  veryHigh: 2.0
};

// Base credits per minute of exercise
const BASE_CREDITS_PER_MINUTE = 5;
const MINIMUM_CREDITS = 5;

/**
 * Load economy configuration
 */
async function loadConfig() {
  if (economyConfig) return economyConfig;
  
  try {
    const response = await fetch('data/economy.json');
    if (response.ok) {
      economyConfig = await response.json();
      return economyConfig;
    }
  } catch (e) {
    console.warn('Could not load economy config, using defaults');
  }
  
  return null;
}

/**
 * Calculate credits for an exercise
 * Formula: basePerMinute × durationInMinutes × intensityMultiplier
 */
function calculateCredits(exercise) {
  if (!exercise) return MINIMUM_CREDITS;
  
  // Get duration in minutes
  let durationMinutes;
  if (exercise.durationUnit === 'seconds') {
    durationMinutes = (exercise.duration || 30) / 60;
  } else {
    durationMinutes = exercise.duration || 1;
  }
  
  // Get intensity multiplier
  const intensity = exercise.energyRequired || 'medium';
  const multiplier = INTENSITY_MULTIPLIERS[intensity] || 1.0;
  
  // Calculate
  const credits = Math.round(BASE_CREDITS_PER_MINUTE * durationMinutes * multiplier);
  
  // Enforce minimum
  return Math.max(credits, MINIMUM_CREDITS);
}

/**
 * Get weekly exercise stats
 */
function getWeeklyStats() {
  const history = store.get('exercise.history') || [];
  const now = new Date();
  const weekStart = getWeekStart(now);
  
  // Filter to this week's exercises
  const thisWeek = history.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= weekStart;
  });
  
  // Calculate totals
  const totalMinutes = thisWeek.reduce((sum, entry) => sum + (entry.durationMinutes || 0), 0);
  const totalCredits = thisWeek.reduce((sum, entry) => sum + (entry.credits || 0), 0);
  const workoutCount = new Set(thisWeek.map(e => e.date.split('T')[0])).size;
  
  return {
    totalMinutes,
    totalCredits,
    workoutCount,
    exercises: thisWeek
  };
}

/**
 * Get the start of the current week (Monday)
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Determine weekly tier based on exercise minutes
 */
function getWeeklyTier(totalMinutes) {
  if (totalMinutes >= 240) return 'platinum';
  if (totalMinutes >= 180) return 'gold';
  if (totalMinutes >= 120) return 'silver';
  if (totalMinutes >= 60) return 'bronze';
  return 'building';
}

/**
 * Get tier details
 */
function getTierDetails(tierId) {
  const tiers = {
    building: {
      name: 'Building',
      icon: '🌱',
      colour: '#64748b',
      unlocks: [],
      message: "Keep building! You're laying the foundation.",
      minMinutes: 0
    },
    bronze: {
      name: 'Bronze',
      icon: '🥉',
      colour: '#cd7f32',
      unlocks: ['small'],
      message: "Solid week! You've earned a small reward.",
      minMinutes: 60
    },
    silver: {
      name: 'Silver',
      icon: '🥈',
      colour: '#c0c0c0',
      unlocks: ['small', 'medium'],
      message: "Great consistency! A medium treat is yours if you want it.",
      minMinutes: 120
    },
    gold: {
      name: 'Gold',
      icon: '🥇',
      colour: '#ffd700',
      unlocks: ['small', 'medium', 'large'],
      message: "Impressive dedication! You've unlocked all treat tiers.",
      minMinutes: 180
    },
    platinum: {
      name: 'Platinum',
      icon: '💎',
      colour: '#e5e4e2',
      unlocks: ['small', 'medium', 'large', 'premium'],
      message: "Outstanding! Consider banking this week for something special.",
      minMinutes: 240
    }
  };
  
  return tiers[tierId] || tiers.building;
}

/**
 * Get available treats for a tier
 */
function getTreatsForTier(tierId) {
  const tier = getTierDetails(tierId);
  const allTreats = {
    small: [
      { id: 'fancy-coffee', name: 'Fancy Coffee', icon: '☕', description: 'Barista-made treat' },
      { id: 'small-snack', name: 'Small Snack', icon: '🍪', description: 'A little something sweet' }
    ],
    medium: [
      { id: 'cake', name: 'Cake or Dessert', icon: '🍰', description: 'A proper slice' },
      { id: 'glass-wine', name: 'Glass of Wine', icon: '🍷', description: 'One glass, savoured' },
      { id: 'beer', name: 'Pint of Beer', icon: '🍺', description: 'A well-earned pint' },
      { id: 'chocolate', name: 'Chocolate Bar', icon: '🍫', description: 'Full size' }
    ],
    large: [
      { id: 'takeaway', name: 'Takeaway Meal', icon: '🍕', description: 'Delivery or collection' },
      { id: 'bottle-wine', name: 'Bottle of Wine', icon: '🍾', description: 'To share (or not)' }
    ],
    premium: [
      { id: 'restaurant', name: 'Restaurant Meal', icon: '🍽️', description: 'The full experience' },
      { id: 'cheat-day', name: 'Cheat Day', icon: '🎉', description: 'No logging required' }
    ]
  };
  
  const available = [];
  for (const category of tier.unlocks) {
    if (allTreats[category]) {
      available.push({
        category,
        categoryName: category.charAt(0).toUpperCase() + category.slice(1),
        treats: allTreats[category]
      });
    }
  }
  
  return available;
}

/**
 * Check if user can spend (cooldown check)
 */
function canSpendTreat() {
  const lastTreat = store.get('economy.lastTreat');
  if (!lastTreat) return { allowed: true };
  
  const lastDate = new Date(lastTreat.date);
  const now = new Date();
  const daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
  
  if (daysSince < 7) {
    return {
      allowed: false,
      daysSince,
      daysRemaining: 7 - daysSince,
      lastTreat: lastTreat.name
    };
  }
  
  return { allowed: true, daysSince };
}

/**
 * Spend a treat
 */
function spendTreat(treat) {
  const now = new Date().toISOString();
  
  // Record the treat
  store.set('economy.lastTreat', {
    id: treat.id,
    name: treat.name,
    date: now
  });
  
  // Add to history
  const history = store.get('economy.treatHistory') || [];
  history.push({
    ...treat,
    date: now
  });
  store.set('economy.treatHistory', history);
  
  // Reset banked weeks
  store.set('economy.bankedWeeks', 0);
  
  return true;
}

/**
 * Bank the current week (skip treat for bigger reward later)
 */
function bankWeek() {
  const banked = store.get('economy.bankedWeeks') || 0;
  store.set('economy.bankedWeeks', banked + 1);
  
  // Record banking decision
  const history = store.get('economy.bankHistory') || [];
  history.push({
    date: new Date().toISOString(),
    weekNumber: getWeekNumber(new Date())
  });
  store.set('economy.bankHistory', history);
  
  return banked + 1;
}

/**
 * Get banked weeks count
 */
function getBankedWeeks() {
  return store.get('economy.bankedWeeks') || 0;
}

/**
 * Get week number
 */
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// ============================================
// SAVINGS SYSTEM
// ============================================

/**
 * Log a savings action (smart choice or spending)
 */
function logSavingsAction(actionId, type = 'save') {
  const actions = {
    'coffee-home': { name: 'Home brewed coffee', amount: 3.50, icon: '☕' },
    'coffee-bought': { name: 'Bought coffee', amount: -3.50, icon: '☕' },
    'lunch-packed': { name: 'Packed lunch', amount: 7.00, icon: '🥪' },
    'lunch-bought': { name: 'Bought lunch', amount: -7.00, icon: '🍱' },
    'dinner-cooked': { name: 'Cooked dinner', amount: 12.00, icon: '🍳' },
    'dinner-takeaway': { name: 'Takeaway dinner', amount: -15.00, icon: '🍕' },
    'walked': { name: 'Walked instead of taxi', amount: 8.00, icon: '🚶' },
    'taxi': { name: 'Took taxi/Uber', amount: -8.00, icon: '🚕' }
  };
  
  const action = actions[actionId];
  if (!action) return null;
  
  // Add to history
  const history = store.get('savings.history') || [];
  history.push({
    ...action,
    id: actionId,
    date: new Date().toISOString()
  });
  store.set('savings.history', history);
  
  // Update total
  const total = store.get('savings.total') || 0;
  store.set('savings.total', total + action.amount);
  
  return {
    action,
    newTotal: total + action.amount
  };
}

/**
 * Get savings stats
 */
function getSavingsStats() {
  const history = store.get('savings.history') || [];
  const total = store.get('savings.total') || 0;
  const goals = store.get('savings.goals') || [];
  
  // Calculate this week's savings
  const weekStart = getWeekStart(new Date());
  const thisWeek = history.filter(entry => new Date(entry.date) >= weekStart);
  const weekTotal = thisWeek.reduce((sum, entry) => sum + entry.amount, 0);
  
  return {
    total,
    weekTotal,
    history: history.slice(-20), // Last 20 entries
    goals
  };
}

/**
 * Add a savings goal
 */
function addSavingsGoal(name, targetAmount, icon = '🎯') {
  const goals = store.get('savings.goals') || [];
  goals.push({
    id: Date.now().toString(),
    name,
    targetAmount,
    icon,
    createdAt: new Date().toISOString()
  });
  store.set('savings.goals', goals);
  return goals;
}

/**
 * Remove a savings goal
 */
function removeSavingsGoal(goalId) {
  const goals = store.get('savings.goals') || [];
  const filtered = goals.filter(g => g.id !== goalId);
  store.set('savings.goals', filtered);
  return filtered;
}

/**
 * Log exercise completion with proper credit calculation
 */
function logExerciseCompletion(exercise, actualDuration = null) {
  const duration = actualDuration || exercise.duration || 30;
  const durationMinutes = exercise.durationUnit === 'seconds' ? duration / 60 : duration;
  
  // Calculate credits based on actual duration
  const credits = calculateCredits({
    ...exercise,
    duration: durationMinutes,
    durationUnit: 'minutes'
  });
  
  // Add to exercise history
  const history = store.get('exercise.history') || [];
  history.push({
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    durationMinutes,
    credits,
    date: new Date().toISOString()
  });
  store.set('exercise.history', history);
  
  // Update lifetime stats
  const lifetimeMinutes = store.get('stats.lifetimeMinutes') || 0;
  const lifetimeCredits = store.get('stats.lifetimeCredits') || 0;
  store.set('stats.lifetimeMinutes', lifetimeMinutes + durationMinutes);
  store.set('stats.lifetimeCredits', lifetimeCredits + credits);
  
  return {
    credits,
    durationMinutes,
    weeklyStats: getWeeklyStats()
  };
}

// Export
export const economy = {
  loadConfig,
  calculateCredits,
  getWeeklyStats,
  getWeeklyTier,
  getTierDetails,
  getTreatsForTier,
  canSpendTreat,
  spendTreat,
  bankWeek,
  getBankedWeeks,
  logSavingsAction,
  getSavingsStats,
  addSavingsGoal,
  removeSavingsGoal,
  logExerciseCompletion,
  INTENSITY_MULTIPLIERS,
  BASE_CREDITS_PER_MINUTE
};

export default economy;
