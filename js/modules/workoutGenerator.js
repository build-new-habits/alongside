// ===================================================================
// ACTIVE COACH: WORKOUT GENERATION ENGINE
// ===================================================================
// Generates 3 daily workout options from filtered exercises:
// 1. Strength Focus
// 2. Wellbeing Focus (mobility/recovery)
// 3. Cardio Focus
//
// Each workout includes transparent rationale explaining why
// exercises were chosen based on user's current state.
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
  
  // Select 1 exercise per pattern (3-4 total main exercises)
  for (const pattern of patterns) {
    const options = strengthExercises.filter(
      ex => ex.movementPattern === pattern
    );
    
    if (options.length > 0) {
      // Sort by energy match (best matches first)
      const sorted = sortByEnergyMatch(options);
      selected.push(sorted[0]);
    }
    
  // Updated - select 5-6 exercises for more variety
  if (selected.length >= 8) break; // Max 8 main exercises
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
// 3. WELLBEING WORKOUT GENERATION
// ===================================================================

  // Select mix of dynamic mobility and static stretching
  const dynamicMobility = wellbeingExercises.filter(ex => 
    ex.movementPattern === 'dynamic' || ex.subcategory === 'dynamic'
  ).slice(0, 4);  // CHANGED: from 3 to 4

  const staticStretching = wellbeingExercises.filter(ex =>
    ex.movementPattern === 'stretch' || ex.subcategory === 'static'
  ).slice(0, 6);  // CHANGED: from 4 to 6

  const breathwork = wellbeingExercises.filter(ex =>
    ex.subcategory === 'breathwork' || ex.movementPattern === 'breathing'
  ).slice(0, 2);  // CHANGED: from 1 to 2

  const main = [
    ...dynamicMobility,
    ...staticStretching,
    ...breathwork
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
    subtitle: 'Mobility, stretching & recovery',
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
// 4. CARDIO WORKOUT GENERATION
// ===================================================================

function generateCardioWorkout(exercises, checkinData) {
  const cardioExercises = exercises.filter(ex => ex.category === 'cardio');
  
  // Select main cardio based on energy level
  let mainCardio;
  if (checkinData.energy >= 7) {
    // High energy: HIIT or running intervals
    mainCardio = cardioExercises.find(ex => 
      ex.subcategory === 'hiit' || ex.id === 'tempo-run' || ex.id === 'hill-repeats'
    );
  } else if (checkinData.energy >= 4) {
    // Moderate energy: Steady-state cardio
    mainCardio = cardioExercises.find(ex =>
      ex.id === 'easy-run' || ex.subcategory === 'running'
    );
  } else {
    // Low energy: Gentle walking or low-impact
    mainCardio = cardioExercises.find(ex =>
      ex.subcategory === 'low-impact' || ex.id === 'gentle-walk'
    );
  }
  
  // Fallback if no match
  if (!mainCardio && cardioExercises.length > 0) {
    mainCardio = cardioExercises[0];
  }
  
  // Add warmup (dynamic mobility)
  const warmup = selectWarmupExercises(exercises);
  
  // Add cooldown (static stretching)
  const cooldown = selectCooldownExercises(exercises);
  
  const main = mainCardio ? [{
    exerciseId: mainCardio.id,
    name: mainCardio.name,
    duration: mainCardio.duration,
    durationNote: mainCardio.durationNote,
    credits: mainCardio.credits
  }] : [];
  
  return {
    id: 'cardio',
    title: 'Cardio Focus',
    subtitle: mainCardio ? mainCardio.name : 'Cardio workout',
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
    ['recovery', 'mobility', 'stretching'].includes(ex.category) &&
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
  if (checkinData.sleep && checkinData.sleep.quality >= 4) {
    rationale.sleep = `Well-rested from ${checkinData.sleep.hours}h sleep`;
  } else if (checkinData.sleep && checkinData.sleep.quality <= 2) {
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
