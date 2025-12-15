/**
 * Alongside Library Loader
 * Dynamically loads exercise and workout content from modular JSON files
 */

const LIBRARY_BASE = 'data/library/';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// In-memory cache
const cache = {
  index: null,
  exercises: {},
  workouts: {},
  lastFetch: {}
};

/**
 * Load the master library index
 */
async function loadIndex() {
  if (cache.index && !isStale('index')) {
    return cache.index;
  }
  
  try {
    const response = await fetch(`${LIBRARY_BASE}index.json`);
    if (!response.ok) throw new Error('Failed to load library index');
    cache.index = await response.json();
    cache.lastFetch['index'] = Date.now();
    return cache.index;
  } catch (error) {
    console.error('Library loader error:', error);
    return null;
  }
}

/**
 * Load exercises from a specific source file
 */
async function loadExerciseSource(sourceId) {
  if (cache.exercises[sourceId] && !isStale(`exercises_${sourceId}`)) {
    return cache.exercises[sourceId];
  }
  
  const index = await loadIndex();
  if (!index) return null;
  
  const source = index.exerciseSources.find(s => s.id === sourceId);
  if (!source) {
    console.error(`Exercise source not found: ${sourceId}`);
    return null;
  }
  
  try {
    const response = await fetch(`${LIBRARY_BASE}${source.path}`);
    if (!response.ok) throw new Error(`Failed to load exercises: ${sourceId}`);
    const data = await response.json();
    cache.exercises[sourceId] = data;
    cache.lastFetch[`exercises_${sourceId}`] = Date.now();
    return data;
  } catch (error) {
    console.error('Exercise loader error:', error);
    return null;
  }
}

/**
 * Load a specific workout by category and ID
 */
async function loadWorkout(category, workoutId) {
  const cacheKey = `${category}/${workoutId}`;
  
  if (cache.workouts[cacheKey] && !isStale(`workout_${cacheKey}`)) {
    return cache.workouts[cacheKey];
  }
  
  try {
    const response = await fetch(`${LIBRARY_BASE}${category}/${workoutId}.json`);
    if (!response.ok) throw new Error(`Failed to load workout: ${cacheKey}`);
    const data = await response.json();
    cache.workouts[cacheKey] = data;
    cache.lastFetch[`workout_${cacheKey}`] = Date.now();
    return data;
  } catch (error) {
    console.error('Workout loader error:', error);
    return null;
  }
}

/**
 * Get a single exercise by reference (e.g., "bodyweight/jumping-jacks")
 */
async function getExercise(ref) {
  const [sourceId, exerciseId] = ref.split('/');
  const source = await loadExerciseSource(sourceId);
  
  if (!source || !source.exercises) return null;
  
  return source.exercises.find(e => e.id === exerciseId) || null;
}

/**
 * Get all exercises from a source
 */
async function getExercisesFromSource(sourceId) {
  const source = await loadExerciseSource(sourceId);
  return source?.exercises || [];
}

/**
 * Get all available categories
 */
async function getCategories() {
  const index = await loadIndex();
  return index?.categories || [];
}

/**
 * Get categories suitable for a given energy level
 */
async function getCategoriesForEnergy(energy) {
  const categories = await getCategories();
  return categories.filter(cat => {
    const [min, max] = cat.energyRange;
    return energy >= min && energy <= max;
  });
}

/**
 * Get all workouts in a category
 */
async function getWorkoutsInCategory(categoryId) {
  const index = await loadIndex();
  if (!index) return [];
  
  const category = index.categories.find(c => c.id === categoryId);
  if (!category) return [];
  
  const workouts = [];
  for (const file of category.files) {
    const workoutId = file.replace('.json', '');
    const workout = await loadWorkout(categoryId, workoutId);
    if (workout) {
      workouts.push(workout);
    }
  }
  
  return workouts;
}

/**
 * Find workouts matching criteria
 */
async function findWorkouts(criteria = {}) {
  const { energy, duration, goals, equipment, excludeContraindications } = criteria;
  const index = await loadIndex();
  if (!index) return [];
  
  const results = [];
  
  for (const category of index.categories) {
    // Filter by energy range
    if (energy !== undefined) {
      const [min, max] = category.energyRange;
      if (energy < min || energy > max) continue;
    }
    
    // Load workouts in this category
    for (const file of category.files) {
      const workoutId = file.replace('.json', '');
      const workout = await loadWorkout(category.id, workoutId);
      
      if (!workout) continue;
      
      // Filter by energy requirement
      if (energy !== undefined) {
        const [minReq, maxReq] = workout.energyRequired;
        if (energy < minReq || energy > maxReq) continue;
      }
      
      // Filter by duration
      if (duration !== undefined && workout.duration > duration) continue;
      
      // Filter by goals
      if (goals && goals.length > 0) {
        const hasMatchingGoal = goals.some(g => workout.goals?.includes(g));
        if (!hasMatchingGoal) continue;
      }
      
      // Filter by equipment (user must have all required equipment)
      if (equipment !== undefined) {
        const missingEquipment = workout.equipment?.some(e => !equipment.includes(e));
        if (missingEquipment) continue;
      }
      
      // Filter by contraindications
      if (excludeContraindications && excludeContraindications.length > 0) {
        const hasContraindication = excludeContraindications.some(c => 
          workout.contraindications?.includes(c)
        );
        if (hasContraindication) continue;
      }
      
      results.push({
        ...workout,
        category: category.id,
        categoryName: category.name,
        categoryIcon: category.icon,
        categoryColour: category.colour
      });
    }
  }
  
  return results;
}

/**
 * Resolve a workout's exercise references to full exercise objects
 */
async function resolveWorkoutExercises(workout) {
  if (!workout || !workout.structure) return workout;
  
  const resolved = { ...workout, structure: [] };
  
  for (const item of workout.structure) {
    if (item.type === 'exercise' && item.ref) {
      const exercise = await getExercise(item.ref);
      resolved.structure.push({
        ...item,
        exercise: exercise || { name: 'Unknown Exercise', id: item.ref }
      });
    } else {
      resolved.structure.push(item);
    }
  }
  
  return resolved;
}

/**
 * Check if cached data is stale
 */
function isStale(key) {
  const lastFetch = cache.lastFetch[key];
  if (!lastFetch) return true;
  return Date.now() - lastFetch > CACHE_DURATION;
}

/**
 * Clear the cache (useful for development)
 */
function clearCache() {
  cache.index = null;
  cache.exercises = {};
  cache.workouts = {};
  cache.lastFetch = {};
}

/**
 * Generate YouTube search URL for an exercise
 */
function getVideoSearchUrl(exercise) {
  if (!exercise || !exercise.videoSearch) return null;
  const query = encodeURIComponent(exercise.videoSearch);
  return `https://www.youtube.com/results?search_query=${query}`;
}

// Export the library API
export const library = {
  loadIndex,
  loadWorkout,
  getExercise,
  getExercisesFromSource,
  getCategories,
  getCategoriesForEnergy,
  getWorkoutsInCategory,
  findWorkouts,
  resolveWorkoutExercises,
  getVideoSearchUrl,
  clearCache
};

export default library;
