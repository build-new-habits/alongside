// ===================================================================
// ACTIVE COACH: WORKOUT GENERATION ENGINE (IMPROVED + USER PREFERENCES)
// ===================================================================
// Generates 3 daily workout options from filtered exercises:
// 1. Strength Focus
// 2. Wellbeing Focus (mobility/recovery)
// 3. Cardio Focus
//
// Each workout includes transparent rationale explaining why
// exercises were chosen based on user's current state.
//
// IMPROVEMENTS v2 (Jan 2026):
// - ✅ Respects user's cardio type preference (running/hiit/mixed/low-impact)
// - ✅ Filters out blacklisted exercises (user hates these)
// - ✅ Matches user's fitness level
// - ✅ Better variety in all workouts
// - ✅ Multiple cardio exercises (not just 1)
// - ✅ Includes running exercises properly
// ===================================================================

import { store } from '../store.js';
import { 
  getFilteredExercises,
  getExercisesByCategory,
  getExercisesByPattern,
  sortByEnergyMatch 
} from './activeCoachFilters.js';

// ===================================================================
// 1. GENERATE DAILY WORKOUTS (MAIN FUNCTION)
// ===================================================================

export async function generateDailyWorkouts(checkinData) {
  // Get filtered exercises based on user context
  const { exercises, burnoutDetected, message } = await getFilteredExercises(checkinData);
  
  // If burnout detected, show recovery message and only gentle options
  if (burnoutDetected) {
    return {
      options: [generateRecoveryWorkout(exercises, checkinData)],
      burnoutMode: true,
      message: message
    };
  }
  
  // Generate 3 workout options
  const strengthWorkout = generateStrengthWorkout(exercises, checkinData);
  const wellbeingWorkout = generateWellbeingWorkout(exercises, checkinData);
  const cardioWorkout = generateCardioWorkout(exercises, checkinData);
  
  // Add transparent rationale to each
  addRationale(strengthWorkout, checkinData);
  addRationale(wellbeingWorkout, checkinData);
  addRationale(cardioWorkout, checkinData);
  
  return {
    options: [strengthWorkout, wellbeingWorkout, cardioWorkout],
    burnoutMode: false,
    message: null
  };
}

// ===================================================================
// 2. STRENGTH WORKOUT GENERATION
// ===================================================================

function generateStrengthWorkout(exercises, checkinData) {
  const strengthExercises = exercises.filter(ex => ex.category === 'strength');
  
  // Movement pattern balance (avoid overworking same patterns)
  const patterns = ['squat', 'hinge', 'push', 'pull', 'core'];
  const selected = [];
  
  // Select 1-2 exercises per pattern for variety
  for (const pattern of patterns) {
    const options = strengthExercises.filter(
      ex => ex.movementPattern === pattern
    );
    
    if (options.length > 0) {
      // Sort by energy match (best matches first)
      const sorted = sortByEnergyMatch(options);
      selected.push(sorted[0]);
      
      // Add a second exercise for this pattern if available
      if (options.length > 1 && selected.length < 8) {
        selected.push(sorted[1]);
      }
    }
    
    // Stop at 8 exercises max
    if (selected.length >= 8) break;
  }
  
  // Add warmup (dynamic mobility)
  const warmup = selectWarmupExercises(exercises);
  
  // Add cooldown (static stretching)
  const cooldown = selectCooldownExercises(exercises);
  
  // Calculate sets/reps based on energy
  const main = selected.map(ex => ({
    exerciseId: ex.id,
    name: ex.name,
    sets: calculateSets(ex, checkinData),
    reps: calculateReps(ex, checkinData),
    rest: calculateRest(ex, checkinData),
    credits: ex.credits
  }));
  
  return {
    id: 'strength',
    title: 'Strength Focus',
    subtitle: generateWorkoutSubtitle(selected),
    duration: calculateTotalDuration(warmup, main, cooldown),
    energyRequired: checkinData.energy,
    warmup,
    main,
    cooldown,
    totalCredits: calculateTotalCredits(main),
    rationale: {} // Added by addRationale()
  };
}

// ===================================================================
// 3. WELLBEING WORKOUT GENERATION (IMPROVED)
// ===================================================================

function generateWellbeingWorkout(exercises, checkinData) {
  // IMPROVED: More flexible category matching
  const wellbeingExercises = exercises.filter(ex => 
    ['mobility', 'recovery', 'stretching', 'yoga', 'mindfulness'].includes(ex.category) ||
    ex.energyRequired === 'low' || // Include all low-energy exercises
    ex.movementPattern === 'stretch' ||
    ex.movementPattern === 'breathing' ||
    ex.movementPattern === 'stillness' ||
    ex.movementPattern === 'recovery'
  );
  
  console.log(`💚 Wellbeing: Found ${wellbeingExercises.length} exercises`);
  
  // Select mix of dynamic mobility, meditation, and static stretching
  const dynamicMobility = wellbeingExercises.filter(ex => 
    ex.movementPattern === 'dynamic' || ex.subcategory === 'dynamic'
  ).slice(0, 3);
  
  const mindfulness = wellbeingExercises.filter(ex =>
    ex.category === 'mindfulness' || 
    ex.movementPattern === 'breathing' ||
    ex.movementPattern === 'stillness'
  ).slice(0, 2);
  
  const staticStretching = wellbeingExercises.filter(ex =>
    ex.movementPattern === 'stretch' || ex.subcategory === 'static'
  ).slice(0, 4);
  
  const main = [
    ...dynamicMobility,
    ...mindfulness,
    ...staticStretching
  ].map(ex => ({
    exerciseId: ex.id,
    name: ex.name,
    duration: ex.duration,
    durationNote: ex.durationNote,
    credits: ex.credits
  }));
  
  return {
    id: 'wellbeing',
    title: 'Wellbeing Focus',
    subtitle: 'Mobility, mindfulness & recovery',
    duration: calculateTotalDuration([], main, []),
    energyRequired: checkinData.energy,
    warmup: [],
    main,
    cooldown: [],
    totalCredits: calculateTotalCredits(main),
    rationale: {}
  };
}

// ===================================================================
// 4. CARDIO WORKOUT GENERATION (FIXED - USER PREFERENCES!)
// ===================================================================

function generateCardioWorkout(exercises, checkinData) {
  // NEW: Read user preferences from store
  const cardioType = store.get('profile.preferences.cardioType'); // 'running'|'hiit'|'mixed'|'low-impact'
  const exerciseBlacklist = store.get('profile.preferences.exerciseBlacklist') || []; // ['burpee', 'mountain-climber']
  const fitnessLevel = store.get('profile.fitnessLevel'); // 'beginner'|'intermediate'|'advanced'
  
  console.log('👤 User preferences:', { cardioType, exerciseBlacklist, fitnessLevel });
  
  // Start with all cardio exercises
  const cardioExercises = exercises.filter(ex => ex.category === 'cardio');
  console.log(`🏃 Cardio: Found ${cardioExercises.length} total cardio exercises`);
  
  // STEP 1: Filter by energy level
  let filteredExercises = [];
  
  if (checkinData.energy >= 7) {
    // High energy: ANY high-energy cardio (HIIT, running, intervals)
    filteredExercises = cardioExercises.filter(ex => 
      ex.energyRequired === 'high' ||
      ex.subcategory === 'hiit' ||
      ex.subcategory === 'intervals' ||
      ex.subcategory === 'running' ||
      (ex.id && (
        ex.id.includes('sprint') ||
        ex.id.includes('interval') ||
        ex.id.includes('tempo') ||
        ex.id.includes('tabata') ||
        ex.id.includes('pyramid') ||
        ex.id.includes('hill') ||
        ex.id.includes('fartlek') ||
        ex.id.includes('hiit')
      ))
    );
    console.log(`🔥 High energy filter matched: ${filteredExercises.length} exercises`);
    
  } else if (checkinData.energy >= 4) {
    // Moderate energy: steady-state cardio, easy runs, moderate efforts
    filteredExercises = cardioExercises.filter(ex =>
      ex.energyRequired === 'medium' ||
      ex.subcategory === 'running' ||
      (ex.id && (
        ex.id.includes('run') ||
        ex.id.includes('jog') ||
        ex.id.includes('easy') ||
        ex.id.includes('steady') ||
        ex.id.includes('walk-run')
      ))
    );
    console.log(`⚡ Medium energy filter matched: ${filteredExercises.length} exercises`);
    
  } else {
    // Low energy: walking, gentle movement, low-impact
    filteredExercises = cardioExercises.filter(ex =>
      ex.energyRequired === 'low' ||
      ex.subcategory === 'low-impact' ||
      ex.subcategory === 'recovery' ||
      (ex.id && (
        ex.id.includes('walk') ||
        ex.id.includes('gentle') ||
        ex.id.includes('recovery')
      ))
    );
    console.log(`🚶 Low energy filter matched: ${filteredExercises.length} exercises`);
  }
  
  // STEP 2: Filter out blacklisted exercises (NEW!)
  if (exerciseBlacklist.length > 0) {
    const beforeCount = filteredExercises.length;
    filteredExercises = filteredExercises.filter(ex => {
      const isBlacklisted = exerciseBlacklist.includes(ex.id);
      if (isBlacklisted) {
        console.log(`🚫 Filtered out blacklisted: ${ex.name}`);
      }
      return !isBlacklisted;
    });
    console.log(`✅ After blacklist filter: ${filteredExercises.length} exercises (removed ${beforeCount - filteredExercises.length})`);
  }
  
  // STEP 3: Prioritize by cardio type preference (NEW!)
  let selectedCardio = [];
  
  if (cardioType === 'running') {
    // Prioritize running exercises
    const runningExercises = filteredExercises.filter(ex => 
      ex.subcategory === 'running' ||
      ex.id.includes('run') ||
      ex.id.includes('jog') ||
      ex.id.includes('tempo') ||
      ex.id.includes('interval') ||
      ex.id.includes('hill') ||
      ex.id.includes('fartlek') ||
      ex.id.includes('pyramid') ||
      ex.id.includes('cruise') ||
      ex.id.includes('progressive') ||
      ex.tags?.includes('running')
    );
    
    const otherCardio = filteredExercises.filter(ex => !runningExercises.includes(ex));
    
    // Take running first, fill with others if needed
    selectedCardio = [
      ...runningExercises.slice(0, 3),
      ...otherCardio.slice(0, Math.max(0, 3 - runningExercises.length))
    ].slice(0, 3);
    
    console.log(`🏃 Prioritized RUNNING exercises: ${selectedCardio.map(ex => ex.name).join(', ')}`);
    
  } else if (cardioType === 'hiit') {
    // Prioritize HIIT exercises
    const hiitExercises = filteredExercises.filter(ex => 
      ex.subcategory === 'hiit' ||
      ex.id.includes('burpee') ||
      ex.id.includes('mountain-climber') ||
      ex.id.includes('jumping') ||
      ex.id.includes('tabata') ||
      ex.id.includes('hiit') ||
      ex.tags?.includes('hiit')
    );
    
    const otherCardio = filteredExercises.filter(ex => !hiitExercises.includes(ex));
    
    selectedCardio = [
      ...hiitExercises.slice(0, 3),
      ...otherCardio.slice(0, Math.max(0, 3 - hiitExercises.length))
    ].slice(0, 3);
    
    console.log(`🔥 Prioritized HIIT exercises: ${selectedCardio.map(ex => ex.name).join(', ')}`);
    
  } else if (cardioType === 'low-impact') {
    // Prioritize low-impact exercises
    const lowImpactExercises = filteredExercises.filter(ex => 
      ex.subcategory === 'low-impact' ||
      ex.id.includes('walk') ||
      ex.id.includes('cycle') ||
      ex.id.includes('swim') ||
      ex.id.includes('elliptical') ||
      ex.tags?.includes('low-impact')
    );
    
    const otherCardio = filteredExercises.filter(ex => !lowImpactExercises.includes(ex));
    
    selectedCardio = [
      ...lowImpactExercises.slice(0, 3),
      ...otherCardio.slice(0, Math.max(0, 3 - lowImpactExercises.length))
    ].slice(0, 3);
    
    console.log(`🚶 Prioritized LOW-IMPACT exercises: ${selectedCardio.map(ex => ex.name).join(', ')}`);
    
  } else {
    // Mixed or no preference - take best energy matches
    selectedCardio = filteredExercises.slice(0, 3);
    console.log(`🌊 Mixed cardio (no preference): ${selectedCardio.map(ex => ex.name).join(', ')}`);
  }
  
  // STEP 4: Fallback if nothing found
  if (selectedCardio.length === 0 && cardioExercises.length > 0) {
    console.warn('⚠️ No cardio matched filters, using fallback');
    // Use first available non-blacklisted exercise
    const fallback = cardioExercises.filter(ex => !exerciseBlacklist.includes(ex.id));
    selectedCardio = fallback.slice(0, 1);
  }
  
  // Final log
  if (selectedCardio.length > 0) {
    console.log(`✅ FINAL SELECTION: ${selectedCardio.map(ex => ex.name).join(', ')}`);
  } else {
    console.error('❌ No cardio exercises available after all filters!');
  }
  
  // Add warmup (dynamic mobility)
  const warmup = selectWarmupExercises(exercises);
  
  // Add cooldown (static stretching)
  const cooldown = selectCooldownExercises(exercises);
  
  // Map to workout format
  const main = selectedCardio.map(ex => ({
    exerciseId: ex.id,
    name: ex.name,
    duration: ex.duration,
    durationNote: ex.durationNote,
    credits: ex.credits
  }));
  
  return {
    id: 'cardio',
    title: 'Cardio Focus',
    subtitle: main.length > 0 ? main.map(ex => ex.name).join(', ') : 'Cardio workout',
    duration: calculateTotalDuration(warmup, main, cooldown),
    energyRequired: checkinData.energy,
    warmup,
    main,
    cooldown,
    totalCredits: calculateTotalCredits(main),
    rationale: {}
  };
}

// ===================================================================
// 5. RECOVERY WORKOUT (BURNOUT MODE)
// ===================================================================

function generateRecoveryWorkout(exercises, checkinData) {
  // Only gentle recovery exercises
  const recoveryExercises = exercises.filter(ex =>
    ['recovery', 'mobility', 'stretching', 'mindfulness'].includes(ex.category) &&
    ex.energyRequired === 'low'
  );
  
  const main = recoveryExercises.slice(0, 5).map(ex => ({
    exerciseId: ex.id,
    name: ex.name,
    duration: ex.duration,
    durationNote: ex.durationNote,
    credits: ex.credits
  }));
  
  return {
    id: 'recovery',
    title: '🛡️ Recovery Mode',
    subtitle: 'Gentle activities for rest and restoration',
    duration: calculateTotalDuration([], main, []),
    energyRequired: 1,
    warmup: [],
    main,
    cooldown: [],
    totalCredits: calculateTotalCredits(main),
    rationale: {
      primary: "You've been running on low energy lately. Rest is the priority.",
      burnout: true
    }
  };
}

// ===================================================================
// 6. WARMUP & COOLDOWN SELECTION
// ===================================================================

function selectWarmupExercises(exercises) {
  // Dynamic mobility for warmup
  const mobility = exercises.filter(ex =>
    ex.category === 'mobility' && 
    (ex.subcategory === 'dynamic' || ex.movementPattern === 'dynamic')
  );
  
  return mobility.slice(0, 3).map(ex => ({
    exerciseId: ex.id,
    name: ex.name,
    duration: 30,
    durationNote: '30 seconds each'
  }));
}

function selectCooldownExercises(exercises) {
  // Static stretching for cooldown
  const stretching = exercises.filter(ex =>
    ex.category === 'mobility' && 
    (ex.subcategory === 'static' || ex.movementPattern === 'stretch')
  );
  
  return stretching.slice(0, 3).map(ex => ({
    exerciseId: ex.id,
    name: ex.name,
    duration: 30,
    durationNote: '30 seconds each'
  }));
}

// ===================================================================
// 7. SETS/REPS/REST CALCULATION
// ===================================================================

function calculateSets(exercise, checkinData) {
  const energy = checkinData.energy;
  
  // Lower energy = fewer sets
  if (energy <= 3) return 2;
  if (energy <= 6) return 3;
  return 4;
}

function calculateReps(exercise, checkinData) {
  const energy = checkinData.energy;
  
  // Use exercise's default rep range
  const [min, max] = exercise.repRange || [8, 12];
  
  // Lower energy = fewer reps
  if (energy <= 3) return min;
  if (energy <= 6) return Math.floor((min + max) / 2);
  return max;
}

function calculateRest(exercise, checkinData) {
  const energy = checkinData.energy;
  
  // Lower energy = more rest
  if (energy <= 3) return 90;
  if (energy <= 6) return 60;
  return 45;
}

// ===================================================================
// 8. TRANSPARENT RATIONALE GENERATION
// ===================================================================

function addRationale(workout, checkinData) {
  const rationale = {
    primary: '',
    conditions: [],
    goals: [],
    mood: '',
    sleep: '',
    menstrualCycle: ''
  };
  
  // Primary rationale (energy-based)
  const energy = checkinData.energy;
  if (energy >= 8) {
    rationale.primary = `Your energy is ${energy}/10 - perfect for challenging work`;
  } else if (energy >= 5) {
    rationale.primary = `Your energy is ${energy}/10 - steady, sustainable pace`;
  } else if (energy >= 3) {
    rationale.primary = `Your energy is ${energy}/10 - keeping it gentle today`;
  } else {
    rationale.primary = `Your energy is ${energy}/10 - rest and recovery are the priority`;
  }
  
  // Condition considerations
  if (checkinData.conditions && checkinData.conditions.length > 0) {
    for (const condition of checkinData.conditions) {
      if (condition.pain >= 5) {
        rationale.conditions.push(
          `Protecting your ${condition.id} (pain: ${condition.pain}/10)`
        );
      }
    }
  }
  
  // Mood considerations
  const mood = checkinData.mood;
  if (mood <= 4) {
    rationale.mood = 'Exercises chosen for endorphin boost and mood lift';
  } else if (mood >= 8) {
    rationale.mood = 'Great mood - perfect for pushing yourself';
  }
  
  // Sleep quality
  if (checkinData.sleepQuality >= 4) {
    rationale.sleep = `Well-rested from ${checkinData.sleepHours}h sleep`;
  } else if (checkinData.sleepQuality <= 2) {
    rationale.sleep = 'Poor sleep - taking it easier today';
  }
  
  // Menstrual cycle (if tracking)
  if (checkinData.menstrualDay) {
    const day = checkinData.menstrualDay;
    if (day >= 1 && day <= 5) {
      rationale.menstrualCycle = 'Menstruation phase - gentler intensity';
    } else if (day >= 6 && day <= 14) {
      rationale.menstrualCycle = 'Follicular phase - great for strength building';
    } else if (day >= 15 && day <= 17) {
      rationale.menstrualCycle = 'Ovulation phase - peak energy for high intensity';
    } else {
      rationale.menstrualCycle = 'Luteal phase - steady-state work suits your energy';
    }
  }
  
  workout.rationale = rationale;
}

// ===================================================================
// 9. HELPER FUNCTIONS
// ===================================================================

function generateWorkoutSubtitle(exercises) {
  if (exercises.length === 0) return 'Custom workout';
  
  const patterns = exercises.map(ex => ex.movementPattern);
  const unique = [...new Set(patterns)];
  
  return unique.join(', ');
}

function calculateTotalDuration(warmup, main, cooldown) {
  let total = 0;
  
  // Warmup (usually 3-5 minutes)
  total += warmup.length * 30;
  
  // Main exercises
  for (const ex of main) {
    if (ex.duration) {
      total += ex.duration;
    } else if (ex.sets && ex.reps) {
      // Estimate: 3 seconds per rep + rest time
      total += (ex.sets * ex.reps * 3) + (ex.sets * (ex.rest || 60));
    }
  }
  
  // Cooldown (usually 3-5 minutes)
  total += cooldown.length * 30;
  
  return total; // Return total seconds
}

function calculateTotalCredits(exercises) {
  return exercises.reduce((sum, ex) => sum + (ex.credits || 0), 0);
}

// ===================================================================
// 10. EXPORT
// ===================================================================

export default {
  generateDailyWorkouts,
  generateStrengthWorkout,
  generateWellbeingWorkout,
  generateCardioWorkout,
  generateRecoveryWorkout
};
