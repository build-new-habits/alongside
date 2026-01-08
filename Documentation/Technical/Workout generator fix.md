# 🔧 WORKOUT GENERATOR FIX
## Add User Preference Filtering

Based on your console log showing:
- Line 212: High energy filter matching 33 exercises
- Line 257: Selected cardio exercises: Burpee, Mountain Climbers, Jumping Jacks

You need to add TWO filtering steps to your workout generation logic.

---

## 📍 STEP 1: Read User Preferences (Add at top of generation function)

**FIND where your workout generation function starts** (probably around line 150-180)

**ADD THIS CODE near the top:**

```javascript
// NEW: Read user preferences from store
const fitnessLevel = store.get('profile.fitnessLevel'); // 'beginner'|'intermediate'|'advanced'
const cardioType = store.get('profile.preferences.cardioType'); // 'running'|'hiit'|'mixed'|'low-impact'
const exerciseBlacklist = store.get('profile.preferences.exerciseBlacklist') || []; // ['burpee', 'mountain-climber']

console.log('👤 User preferences:', { fitnessLevel, cardioType, exerciseBlacklist });
```

---

## 📍 STEP 2: Filter Out Blacklisted Exercises

**FIND where you filter exercises by energy** (around line 200-212 based on your console)

The code probably looks like:
```javascript
// High energy filter
const highEnergyExercises = allExercises.filter(ex => 
  ex.energyRequired === 'high' && 
  ex.category === 'cardio'
);
console.log(`🔥 High energy filter matched: ${highEnergyExercises.length} exercises`);
```

**ADD THIS IMMEDIATELY AFTER:**

```javascript
// NEW: Filter out blacklisted exercises
let filteredExercises = highEnergyExercises.filter(ex => {
  const isBlacklisted = exerciseBlacklist.includes(ex.id);
  if (isBlacklisted) {
    console.log(`🚫 Filtered out blacklisted: ${ex.name}`);
  }
  return !isBlacklisted;
});

console.log(`✅ After blacklist filter: ${filteredExercises.length} exercises`);
```

---

## 📍 STEP 3: Prioritize by Cardio Type

**FIND where you select the final exercises** (around line 257 based on your console)

The code probably looks like:
```javascript
// Select 3 cardio exercises
const selectedCardio = filteredExercises.slice(0, 3);
```

**REPLACE WITH THIS:**

```javascript
// NEW: Prioritize exercises based on cardio type preference
let selectedCardio;

if (cardioType === 'running') {
  // Prioritize running exercises
  const runningExercises = filteredExercises.filter(ex => 
    ex.id.includes('run') || 
    ex.id.includes('jog') || 
    ex.id.includes('tempo') || 
    ex.id.includes('interval') ||
    ex.tags?.includes('running')
  );
  
  const otherCardio = filteredExercises.filter(ex => 
    !runningExercises.includes(ex)
  );
  
  // Take running exercises first, then fill with others if needed
  selectedCardio = [
    ...runningExercises.slice(0, 3),
    ...otherCardio.slice(0, Math.max(0, 3 - runningExercises.length))
  ].slice(0, 3);
  
  console.log(`🏃 Prioritized running exercises: ${selectedCardio.map(ex => ex.name).join(', ')}`);
  
} else if (cardioType === 'hiit') {
  // Prioritize HIIT exercises (burpees, mountain climbers, etc)
  const hiitExercises = filteredExercises.filter(ex => 
    ex.id.includes('burpee') || 
    ex.id.includes('mountain-climber') || 
    ex.id.includes('jumping') ||
    ex.tags?.includes('hiit')
  );
  
  const otherCardio = filteredExercises.filter(ex => 
    !hiitExercises.includes(ex)
  );
  
  selectedCardio = [
    ...hiitExercises.slice(0, 3),
    ...otherCardio.slice(0, Math.max(0, 3 - hiitExercises.length))
  ].slice(0, 3);
  
  console.log(`🔥 Prioritized HIIT exercises: ${selectedCardio.map(ex => ex.name).join(', ')}`);
  
} else if (cardioType === 'low-impact') {
  // Prioritize low-impact exercises (walking, cycling, swimming)
  const lowImpactExercises = filteredExercises.filter(ex => 
    ex.id.includes('walk') || 
    ex.id.includes('cycle') || 
    ex.id.includes('swim') ||
    ex.tags?.includes('low-impact')
  );
  
  const otherCardio = filteredExercises.filter(ex => 
    !lowImpactExercises.includes(ex)
  );
  
  selectedCardio = [
    ...lowImpactExercises.slice(0, 3),
    ...otherCardio.slice(0, Math.max(0, 3 - lowImpactExercises.length))
  ].slice(0, 3);
  
  console.log(`🚶 Prioritized low-impact exercises: ${selectedCardio.map(ex => ex.name).join(', ')}`);
  
} else {
  // Mixed or no preference - take first 3 after blacklist filtering
  selectedCardio = filteredExercises.slice(0, 3);
  console.log(`🌊 Mixed cardio: ${selectedCardio.map(ex => ex.name).join(', ')}`);
}

// Final selection
console.log(`✅ Selected cardio exercises: ${selectedCardio.map(ex => ex.name).join(', ')}`);
```

---

## 📍 STEP 4: Optional - Filter by Fitness Level

If you want to also filter exercises by fitness level difficulty, **ADD THIS** after the blacklist filter:

```javascript
// NEW: Filter by fitness level (optional)
if (fitnessLevel && filteredExercises.length > 10) {
  filteredExercises = filteredExercises.filter(ex => {
    // Beginner: Only 'low' and 'medium' difficulty
    if (fitnessLevel === 'beginner') {
      return ex.difficulty !== 'advanced' && ex.difficulty !== 'expert';
    }
    // Intermediate: Exclude 'expert' only
    if (fitnessLevel === 'intermediate') {
      return ex.difficulty !== 'expert';
    }
    // Advanced: All difficulties OK
    return true;
  });
  
  console.log(`💪 After fitness level filter (${fitnessLevel}): ${filteredExercises.length} exercises`);
}
```

---

## ✅ EXPECTED RESULTS

After these changes, your console should show:

```
👤 User preferences: {fitnessLevel: 'intermediate', cardioType: 'running', exerciseBlacklist: ['burpee', 'mountain-climber']}
🔥 High energy filter matched: 33 exercises
🚫 Filtered out blacklisted: Burpee
🚫 Filtered out blacklisted: Mountain Climbers
✅ After blacklist filter: 31 exercises
🏃 Prioritized running exercises: Tempo Run, Hill Repeats, Pyramid Intervals
✅ Selected cardio exercises: Tempo Run, Hill Repeats, Pyramid Intervals
```

And your workout cards should show:
- ✅ Running exercises (not HIIT)
- ✅ NO Burpees
- ✅ NO Mountain Climbers

---

## 🎯 WHAT IF I DON'T HAVE RUNNING EXERCISES YET?

If your exercise database doesn't have running exercises with IDs like:
- `tempo-run`
- `hill-repeats`
- `pyramid-intervals`

The filter will fall back to showing other cardio (jumping jacks, etc) BUT still exclude your blacklisted exercises.

You can verify what exercise IDs you have by checking your console for the "Loaded X total exercises" message and looking at the exercise IDs.

---

## 📝 TESTING CHECKLIST

1. Clear localStorage: `localStorage.clear()`
2. Go through onboarding again
3. Select "Intermediate" fitness level
4. Select "Running" cardio preference
5. Blacklist "Burpees" and "Mountain Climbers"
6. Complete onboarding
7. Do check-in with energy 7+
8. Generate workouts
9. Check console for preference logs
10. Verify cardio workout shows running exercises (or at least NOT burpees/mountain climbers)

---

## 🚨 IF YOU CAN'T FIND THE RIGHT LINES

Send me your `workoutGenerator.js` file content and I'll give you the exact updated file with all changes made.

OR

Tell me what your console shows around lines 200-260 and I can give more specific instructions.
