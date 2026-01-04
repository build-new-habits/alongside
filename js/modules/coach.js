/**
 * Alongside - Smart Coach Module
 * Builds personalized workouts based on user context
 */

import { library } from './libraryLoader.js';

// Energy-based workout configurations
const WORKOUT_CONFIGS = {
  low: {
    name: "Gentle Recovery",
    maxDuration: 15,
    maxExercises: 5,
    preferredPatterns: ['recovery', 'mobility', 'stability'],
    avoidPatterns: ['locomotion', 'hinge'],
    energyLevels: ['low']
  },
  medium: {
    name: "Balanced Session",
    maxDuration: 25,
    maxExercises: 8,
    preferredPatterns: ['stability', 'squat', 'push', 'pull', 'mobility'],
    avoidPatterns: [],
    energyLevels: ['low', 'medium']
  },
  high: {
    name: "Full Energy",
    maxDuration: 35,
    maxExercises: 10,
    preferredPatterns: ['locomotion', 'squat', 'hinge', 'push', 'pull', 'lunge'],
    avoidPatterns: [],
    energyLevels: ['low', 'medium', 'high']
  }
};

// Coach messages based on context
const COACH_MESSAGES = {
  lowEnergy: [
    "Low energy today? Let's focus on gentle movement that will leave you feeling better, not depleted.",
    "Your body is asking for rest. These exercises will help without draining you further.",
    "Being kind to yourself on low-energy days is part of the process. Let's keep it gentle."
  ],
  lowMood: [
    "I hear you. Movement can help shift things, so we're keeping it light and achievable.",
    "Tough day? Small wins matter most right now. Every exercise you complete is a victory.",
    "Let's focus on feeling slightly better, not perfect. That's enough today."
  ],
  balanced: [
    "Good foundation to work with today. Let's build something solid.",
    "Steady energy is perfect for a balanced session. Ready when you are.",
    "Not too high, not too low — a great day for consistent progress."
  ],
  highEnergy: [
    "Great energy today! Let's use it wisely with some solid work.",
    "You're feeling it today — let's channel that into some good movement.",
    "High energy day! Perfect for pushing a little further than usual."
  ],
  recovery: [
    "Recovery mode activated. Your body needs this — rest is productive.",
    "You've been running low for a while. Let's prioritise restoration today.",
    "Taking care of yourself isn't weakness — it's what makes everything else possible."
  ]
};

/**
 * Get energy tier from numeric value
 */
function getEnergyTier(energy) {
  if (energy <= 3) return 'low';
  if (energy <= 6) return 'medium';
  return 'high';
}

/**
 * Get appropriate coach message
 */
function getCoachMessage(energy, mood) {
  // Check for recovery mode (both low)
  if (energy <= 3 && mood <= 3) {
    return randomFrom(COACH_MESSAGES.recovery);
  }
  
  // Low mood takes priority
  if (mood <= 4) {
    return randomFrom(COACH_MESSAGES.lowMood);
  }
  
  // Then energy level
  if (energy <= 3) {
    return randomFrom(COACH_MESSAGES.lowEnergy);
  }
  
  if (energy >= 7) {
    return randomFrom(COACH_MESSAGES.highEnergy);
  }
  
  return randomFrom(COACH_MESSAGES.balanced);
}

/**
 * Build a daily workout based on user context
 */
async function buildDailyWorkout(context) {
  const { 
    energy = 5, 
    mood = 5, 
    conditions = [], 
    equipment = [],
    goals = []
  } = context;
  
  // Determine workout configuration
  const tier = getEnergyTier(energy);
  const config = WORKOUT_CONFIGS[tier];
  
  // Get all available exercises
const allExercises = [];
const sources = [  
  // Cardio exercises
  'cardio/easy-run',
  'cardio/hiit',
  'cardio/low-impact',
  'cardio/running',
  'cardio/walk-run-intervals',
  
  // Mindfulness exercises
  'mindfulness/box-breathing',
  
  // Mobility exercises
  'mobility/mobility-drills',
  'mobility/morning-mobility',
  'mobility/stretching',
  
  // Recovery exercises
  'recovery/breathing', 
  'recovery/gentle-stretch',
  'recovery/yoga-poses', 
  
  // Strength exercises
  'strength/bodyweight',
  'strength/core',
  'strength/dumbbell',
  'strength/kettlebell',
  
  // Workouts
  'workouts/quick-home-7min',
  
  // Yoga exercises
  'yoga/morning-flow'
];
  
  for (const sourceId of sources) {
    const source = await library.loadExerciseSource(sourceId);
    if (source && source.exercises) {
      allExercises.push(...source.exercises);
    }
  }
  
  if (allExercises.length === 0) {
    console.error('No exercises available');
    return null;
  }
  
  // Filter exercises based on energy level and contraindications
  const availableExercises = allExercises.filter(exercise => {
    // Check energy requirement
    if (!config.energyLevels.includes(exercise.energyRequired)) {
      return false;
    }
    
    // Check contraindications
    if (exercise.contraindications && conditions.length > 0) {
      const blocked = exercise.contraindications.some(contra => {
        return conditions.some(cond => {
          const condKey = `${cond.area}_${cond.severity >= 7 ? 'high' : 'moderate'}`;
          return contra.includes(cond.area) && cond.severity >= 5;
        });
      });
      if (blocked) return false;
    }
    
    return true;
  });
  
  // Sort by preference
  const scored = availableExercises.map(ex => {
    let score = 0;
    
    // Prefer exercises matching config patterns
    if (config.preferredPatterns.includes(ex.movementPattern)) {
      score += 10;
    }
    
    // Avoid certain patterns for low energy
    if (config.avoidPatterns.includes(ex.movementPattern)) {
      score -= 20;
    }
    
    // Low mood? Prefer gentler options
    if (mood <= 4 && ex.energyRequired === 'low') {
      score += 5;
    }
    
    // Add some randomness for variety
    score += Math.random() * 5;
    
    return { exercise: ex, score };
  });
  
  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  
  // Build workout structure
  const workout = {
    name: config.name,
    coachMessage: getCoachMessage(energy, mood),
    energy,
    mood,
    sections: []
  };
  
  // Create sections based on workout type
  if (tier === 'low') {
    // Recovery workout: breathing + gentle movement
    workout.sections = [
      {
        name: '🌬️ Breathwork',
        exercises: selectExercises(scored, ['recovery'], 1)
      },
      {
        name: '🧘 Gentle Movement',
        exercises: selectExercises(scored, ['mobility', 'stability'], 3)
      }
    ];
  } else if (tier === 'medium') {
    // Balanced workout
    workout.sections = [
      {
        name: '🔥 Warm-Up',
        exercises: selectExercises(scored, ['mobility'], 2)
      },
      {
        name: '💪 Main Set',
        exercises: selectExercises(scored, ['squat', 'push', 'pull', 'lunge', 'stability'], 4)
      },
      {
        name: '🧘 Cool Down',
        exercises: selectExercises(scored, ['mobility', 'recovery'], 2)
      }
    ];
  } else {
    // High energy workout
    workout.sections = [
      {
        name: '🔥 Warm-Up',
        exercises: selectExercises(scored, ['mobility', 'locomotion'], 2)
      },
      {
        name: '💪 Strength',
        exercises: selectExercises(scored, ['squat', 'hinge', 'push', 'pull', 'lunge'], 5)
      },
      {
        name: '🏃 Cardio Burst',
        exercises: selectExercises(scored, ['locomotion'], 2)
      },
      {
        name: '🧘 Cool Down',
        exercises: selectExercises(scored, ['mobility', 'recovery'], 2)
      }
    ];
  }
  
  // Filter out empty sections
  workout.sections = workout.sections.filter(s => s.exercises.length > 0);
  
  return workout;
}

/**
 * Select exercises from scored list matching patterns
 */
function selectExercises(scored, patterns, count) {
  const matching = scored.filter(s => patterns.includes(s.exercise.movementPattern));
  const selected = [];
  const usedIds = new Set();
  
  for (const item of matching) {
    if (selected.length >= count) break;
    if (usedIds.has(item.exercise.id)) continue;
    
    selected.push(item.exercise);
    usedIds.add(item.exercise.id);
  }
  
  return selected;
}

/**
 * Get random item from array
 */
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const coach = {
  buildDailyWorkout,
  getCoachMessage,
  getEnergyTier,
  WORKOUT_CONFIGS,
  COACH_MESSAGES
};

export default coach;
