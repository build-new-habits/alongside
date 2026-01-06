// ===================================================================
// ACTIVE COACH: SMART FILTERING ENGINE (IMPROVED)
// ===================================================================
// This module filters exercises based on user context to generate
// personalized workout recommendations.
//
// Core Principle: "Listen first, prescribe second"
// - User's current state (energy, mood, sleep) drives recommendations
// - Conditions filtered for safety (never recommend unsafe exercises)
// - Equipment filtered for availability
// - Energy matched to user's capacity (FLEXIBLE MATCHING)
// - Menstrual cycle awareness (if tracking)
// ===================================================================

import { store } from '../store.js';

// ===================================================================
// 1. EXERCISE FILTERING: EQUIPMENT
// ===================================================================
// Only show exercises user has equipment for
// Bodyweight exercises always available

export function filterByEquipment(exercises, userEquipment) {
  return exercises.filter(exercise => {
    // Bodyweight exercises always available
    if (exercise.equipment.includes('bodyweight') && exercise.equipment.length === 1) {
      return true;
    }
    
    // Check if user has ALL required equipment
    return exercise.equipment.every(eq => userEquipment.includes(eq));
  });
}

// ===================================================================
// 2. EXERCISE FILTERING: CONDITION SAFETY (CRITICAL)
// ===================================================================
// NEVER recommend exercises that could cause injury
// Three-level system: blocked, caution, safe

export function filterByConditions(exercises, activeConditions) {
  return exercises.map(exercise => {
    let safetyLevel = 'safe'; // 'safe' | 'caution' | 'blocked'
    let warnings = [];
    let benefits = [];
    
    // Check each active condition against exercise contraindications
    for (const condition of activeConditions) {
      const conditionId = condition.id;
      const pain = condition.pain;
      const difficulty = condition.difficulty;
      
      // BLOCK if severe pain (8-10) and exercise contraindicated
      if (pain >= 8 && exercise.contraindications && exercise.contraindications.includes(conditionId)) {
        safetyLevel = 'blocked';
        warnings.push(`⛔ Blocked: ${conditionId} pain too high (${pain}/10)`);
      }
      
      // CAUTION if moderate pain (5-7) and exercise could aggravate
      else if (pain >= 5 && exercise.contraindications && exercise.contraindications.includes(conditionId)) {
        if (safetyLevel !== 'blocked') {
          safetyLevel = 'caution';
        }
        warnings.push(`⚠️ Caution: ${conditionId} pain level ${pain}/10`);
      }
      
      // BENEFICIAL if exercise helps with this condition
      else if (exercise.conditions && exercise.conditions[conditionId]) {
        benefits.push(`✅ May help: ${conditionId}`);
      }
    }
    
    return {
      ...exercise,
      safetyLevel,
      warnings,
      benefits
    };
  }).filter(ex => ex.safetyLevel !== 'blocked'); // Remove blocked exercises
}

// ===================================================================
// 3. EXERCISE FILTERING: ENERGY MATCHING (IMPROVED - MORE FLEXIBLE)
// ===================================================================
// Match exercises to user's current energy level (1-10)
// UPDATED: More flexible matching to give better variety

export function filterByEnergy(exercises, userEnergy) {
  return exercises.map(exercise => {
    // Convert text energy to number (1-10 scale)
    let exerciseEnergy;
    switch(exercise.energyRequired) {
      case 'low': exerciseEnergy = 3; break;
      case 'medium': exerciseEnergy = 6; break;
      case 'high': exerciseEnergy = 9; break;
      default: exerciseEnergy = 5;
    }
    
    // Calculate energy delta
    const delta = Math.abs(exerciseEnergy - userEnergy);
    
    // MORE FLEXIBLE: ±3 instead of ±2, and always keep low-energy for warmup/recovery
    let priority;
    if (delta <= 3) {
      priority = 'high'; // Perfect match (was ±2, now ±3)
    } else if (delta <= 6) {
      priority = 'medium'; // Acceptable (was ±4, now ±6)
    } else {
      priority = 'low'; // Too far from current energy
    }
    
    // SPECIAL RULE: Always keep low-energy exercises for warmup/cooldown/recovery
    // Even if user has high energy, they might need gentle exercises for balance
    if (exercise.energyRequired === 'low' && userEnergy >= 5) {
      priority = 'medium'; // Keep for warmup/recovery
    }
    
    return {
      ...exercise,
      energyMatch: priority,
      energyDelta: delta,
      exerciseEnergy
    };
  }).filter(ex => ex.energyMatch !== 'low'); // Remove extreme mismatches only
}

// ===================================================================
// 4. MENSTRUAL CYCLE ADAPTATION (WOMEN-FIRST DESIGN)
// ===================================================================
// Adjust recommendations based on cycle phase
// Respects hormonal fluctuations instead of ignoring them

export function adjustForMenstrualCycle(exercises, menstrualDay) {
  if (!menstrualDay) return exercises; // Not tracking - skip
  
  // Determine cycle phase (based on 28-day average)
  let phase;
  if (menstrualDay >= 1 && menstrualDay <= 5) {
    phase = 'menstruation'; // Days 1-5: Energy lowest
  } else if (menstrualDay >= 6 && menstrualDay <= 14) {
    phase = 'follicular'; // Days 6-14: Energy rising
  } else if (menstrualDay >= 15 && menstrualDay <= 17) {
    phase = 'ovulation'; // Days 15-17: Peak energy
  } else {
    phase = 'luteal'; // Days 18-28: Energy declining
  }
  
  return exercises.map(exercise => {
    let recommendation = 'neutral';
    let cycleNote = '';
    
    switch (phase) {
      case 'menstruation':
        // Lower intensity, avoid core compression
        if (exercise.energyRequired === 'high') {
          recommendation = 'reduce';
          cycleNote = 'Consider lower intensity during menstruation';
        }
        if (exercise.movementPattern === 'core_compression') {
          recommendation = 'avoid';
          cycleNote = 'Avoid core compression exercises during menstruation';
        }
        break;
        
      case 'follicular':
        // Energy rising, great for strength building
        if (exercise.category === 'strength') {
          recommendation = 'optimal';
          cycleNote = 'Great time for strength building (follicular phase)';
        }
        break;
        
      case 'ovulation':
        // Peak energy, ideal for high-intensity
        if (exercise.energyRequired === 'high') {
          recommendation = 'optimal';
          cycleNote = 'Perfect timing for high-intensity (ovulation phase)';
        }
        break;
        
      case 'luteal':
        // Energy declining, focus on steady-state
        if (exercise.energyRequired === 'medium') {
          recommendation = 'optimal';
          cycleNote = 'Steady-state work suits luteal phase energy';
        }
        if (exercise.energyRequired === 'high') {
          recommendation = 'reduce';
          cycleNote = 'Consider moderate intensity during luteal phase';
        }
        break;
    }
    
    return {
      ...exercise,
      menstrualRecommendation: recommendation,
      menstrualPhase: phase,
      cycleNote
    };
  });
}

// ===================================================================
// 5. BURNOUT DETECTION & RECOVERY MODE
// ===================================================================
// Monitors check-in history for burnout patterns
// Automatically activates recovery mode

export function detectBurnout(checkinHistory) {
  if (checkinHistory.length < 3) return false;
  
  const last7Days = checkinHistory.slice(-7);
  const last3Days = checkinHistory.slice(-3);
  
  // Pattern 1: Severe - Energy ≤3 for 3+ consecutive days
  const lowEnergyStreak = last3Days.every(day => day.energy <= 3);
  
  // Pattern 2: Severe - Mood ≤4 for 3+ consecutive days
  const lowMoodStreak = last3Days.every(day => day.mood <= 4);
  
  // Pattern 3: Chronic - Rolling 7-day average energy <4
  const avgEnergy = last7Days.reduce((sum, day) => sum + day.energy, 0) / last7Days.length;
  const chronicLowEnergy = avgEnergy < 4;
  
  // Pattern 4: Sleep disruption - Quality ≤2 for 3+ days
  const poorSleepStreak = last3Days.every(day => day.sleepQuality && day.sleepQuality <= 2);
  
  // Pattern 5: Pain flare - Any condition pain ≥8 for 2+ consecutive days
  const painFlare = last3Days.slice(-2).some(day => 
    day.conditions && day.conditions.some(c => c.pain >= 8)
  );
  
  // Trigger burnout if ANY severe pattern detected
  const severeTriggers = [lowEnergyStreak, lowMoodStreak, poorSleepStreak, painFlare];
  const chronicTriggers = [chronicLowEnergy];
  
  const severeCount = severeTriggers.filter(Boolean).length;
  const chronicCount = chronicTriggers.filter(Boolean).length;
  
  return severeCount >= 1 || (severeCount >= 1 && chronicCount >= 1);
}

// Recovery mode: Only show gentle, restorative exercises
export function filterForRecoveryMode(exercises) {
  return exercises.filter(exercise => {
    // Only low-energy exercises
    if (exercise.energyRequired !== 'low') return false;
    
    // Recovery categories only
    const recoveryCategories = ['recovery', 'mobility', 'stretching', 'breathing', 'yoga'];
    if (!recoveryCategories.includes(exercise.category)) return false;
    
    return true;
  });
}

// ===================================================================
// 6. MASTER FILTER FUNCTION
// ===================================================================
// Combines all filters in the correct order
// Returns exercises ready for workout generation

export async function getFilteredExercises(checkinData) {
  // Load user profile and check-in history
  const profile = store.get('profile');
  const checkinHistory = store.get('checkinHistory') || [];
  
  // Load all exercise databases
  const allExercises = await loadAllExercises();
  
  console.log(`📚 Loaded ${allExercises.length} total exercises`);
  
  // Check for burnout FIRST
  const burnoutDetected = detectBurnout(checkinHistory);
  
  if (burnoutDetected) {
    // Recovery Mode: Only gentle exercises
    console.log('🛡️ RECOVERY MODE ACTIVATED');
    const recoveryExercises = filterForRecoveryMode(allExercises);
    
    return {
      exercises: recoveryExercises,
      burnoutDetected: true,
      message: "You've been running on low energy lately. That's okay - we're focusing on gentle activities and rest. Take care of yourself."
    };
  }
  
  // Standard Filtering Pipeline
  let filtered = allExercises;
  
  // 1. Filter by equipment
  filtered = filterByEquipment(filtered, profile.equipment || []);
  console.log(`✅ Equipment filter: ${filtered.length} exercises available`);
  
  // 2. Filter by conditions (SAFETY CRITICAL)
  filtered = filterByConditions(filtered, checkinData.conditions || []);
  console.log(`✅ Condition safety filter: ${filtered.length} exercises safe`);
  
  // 3. Filter by energy level (IMPROVED - MORE FLEXIBLE)
  filtered = filterByEnergy(filtered, checkinData.energy);
  console.log(`✅ Energy match filter: ${filtered.length} exercises matched`);
  
  // 4. Adjust for menstrual cycle (if tracking)
  if (checkinData.menstrualDay) {
    filtered = adjustForMenstrualCycle(filtered, checkinData.menstrualDay);
    console.log(`✅ Menstrual cycle adjustment applied`);
  }
  
  return {
    exercises: filtered,
    burnoutDetected: false,
    message: null
  };
}

// ===================================================================
// 7. EXERCISE DATABASE LOADER
// ===================================================================
// Loads all exercise JSON files from organized structure

async function loadAllExercises() {
  const exercises = [];
  
  // Define all exercise files to load (matching user's folder structure)
  const files = [
    // Strength
    { path: 'data/library/exercises/strength/bodyweight.json', category: 'strength' },
    { path: 'data/library/exercises/strength/dumbbell.json', category: 'strength' },
    { path: 'data/library/exercises/strength/kettlebell.json', category: 'strength' },
    { path: 'data/library/exercises/strength/core.json', category: 'strength' },
    { path: 'data/library/exercises/strength/resistance-band.json', category: 'strength' },
    
    // Cardio
    { path: 'data/library/exercises/cardio/running.json', category: 'cardio' },
    { path: 'data/library/exercises/cardio/low-impact.json', category: 'cardio' },
    { path: 'data/library/exercises/cardio/hiit.json', category: 'cardio' },
    
    // Mobility
    { path: 'data/library/exercises/mobility/stretching.json', category: 'mobility' },
    { path: 'data/library/exercises/mobility/mobility-drills.json', category: 'mobility' },
    
    // Recovery
    { path: 'data/library/exercises/recovery/breathing.json', category: 'recovery' },
    { path: 'data/library/exercises/recovery/yoga-poses.json', category: 'recovery' }
  ];
  
  // Load each file and extract exercises
  for (const fileInfo of files) {
    try {
      const response = await fetch(fileInfo.path);
      if (!response.ok) {
        console.warn(`⚠️ Could not load ${fileInfo.path}`);
        continue;
      }
      
      const data = await response.json();
      
      // Extract exercises array from file and add category
      if (data.exercises && Array.isArray(data.exercises)) {
        // Add category to each exercise
        const exercisesWithCategory = data.exercises.map(ex => ({
          ...ex,
          category: fileInfo.category
        }));
        exercises.push(...exercisesWithCategory);
      }
    } catch (error) {
      console.warn(`⚠️ Error loading ${fileInfo.path}:`, error);
    }
  }
  
  return exercises;
}

// ===================================================================
// 8. HELPER FUNCTIONS
// ===================================================================

// Get exercises by category
export function getExercisesByCategory(exercises, category) {
  return exercises.filter(ex => ex.category === category);
}

// Get exercises by movement pattern
export function getExercisesByPattern(exercises, pattern) {
  return exercises.filter(ex => ex.movementPattern === pattern);
}

// Get exercises by muscle group
export function getExercisesByMuscleGroup(exercises, muscleGroup) {
  return exercises.filter(ex => ex.muscleGroups && ex.muscleGroups.includes(muscleGroup));
}

// Sort exercises by energy match (high priority first)
export function sortByEnergyMatch(exercises) {
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  return exercises.sort((a, b) => {
    return priorityOrder[a.energyMatch] - priorityOrder[b.energyMatch];
  });
}

// Sort exercises by credits (higher rewards first)
export function sortByCredits(exercises) {
  return exercises.sort((a, b) => b.credits - a.credits);
}

// ===================================================================
// EXPORT ALL FUNCTIONS
// ===================================================================

export default {
  filterByEquipment,
  filterByConditions,
  filterByEnergy,
  adjustForMenstrualCycle,
  detectBurnout,
  filterForRecoveryMode,
  getFilteredExercises,
  getExercisesByCategory,
  getExercisesByPattern,
  getExercisesByMuscleGroup,
  sortByEnergyMatch,
  sortByCredits
};
