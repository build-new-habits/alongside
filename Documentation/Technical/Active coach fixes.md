# FIXES FOR ACTIVE COACH ISSUES

## 🐛 Issue 1: Can't Click Exercise Cards

**Problem:** Console shows "Workout not found: strength/wellbeing"

**Root Cause:** The workout data structure from `generateDailyWorkouts()` doesn't match what `selectWorkoutOption()` expects.

### FIX: Update app.js - Line ~200

**Find this function in app.js:**
```javascript
async function showWorkoutOptions(checkinData) {
  const main = document.getElementById('main');
  if (!main) return;
  
  // Show loading state
  main.innerHTML = `...`;
  
  // Generate 3 workout options using Active Coach
  const { options, burnoutMode, message } = await generateDailyWorkouts(checkinData);
  
  // Render workout options
  main.innerHTML = renderWorkoutOptions(options, burnoutMode, message, checkinData);
  
  currentScreen = 'workout-options';
  updateNav('today');
}
```

**Add this line AFTER generating workouts:**
```javascript
async function showWorkoutOptions(checkinData) {
  const main = document.getElementById('main');
  if (!main) return;
  
  // Show loading state
  main.innerHTML = `...`;
  
  // Generate 3 workout options using Active Coach
  const { options, burnoutMode, message } = await generateDailyWorkouts(checkinData);
  
  // SAVE TO STORE - ADD THIS LINE
  store.set('workout.todayWorkouts', options);
  
  // Render workout options
  main.innerHTML = renderWorkoutOptions(options, burnoutMode, message, checkinData);
  
  currentScreen = 'workout-options';
  updateNav('today');
}
```

---

## 🐛 Issue 2: Limited Exercise Variety

**Problem:** Only seeing 2-3 exercises per workout, and workouts are very similar

**Root Cause:** 
1. Some exercise files have syntax errors (resistance-band.json)
2. Workout generator is being too conservative with exercise selection

### FIX A: Fix resistance-band.json syntax error

**Action:** Check `/data/library/exercises/strength/resistance-band.json`

The file has a JSON syntax error. Either:
1. Fix the JSON syntax, OR
2. Remove it from `index.json` temporarily

### FIX B: Increase Exercise Variety in Workout Generator

**File:** `/js/modules/workoutGenerator.js`

**Find line ~60-80 (generateStrengthWorkout function):**

```javascript
// Current code - only selects 4 exercises
if (selected.length >= 4) break; // Max 4 main exercises
```

**Change to:**
```javascript
// Updated - select 5-6 exercises for more variety
if (selected.length >= 6) break; // Max 6 main exercises
```

**Find line ~120-140 (generateWellbeingWorkout function):**

```javascript
// Current code
const dynamicMobility = wellbeingExercises.filter(ex => 
  ex.movementPattern === 'dynamic' || ex.subcategory === 'dynamic'
).slice(0, 3);

const staticStretching = wellbeingExercises.filter(ex =>
  ex.movementPattern === 'stretch' || ex.subcategory === 'static'
).slice(0, 4);
```

**Change to:**
```javascript
// Updated - more exercises
const dynamicMobility = wellbeingExercises.filter(ex => 
  ex.movementPattern === 'dynamic' || ex.subcategory === 'dynamic'
).slice(0, 4);

const staticStretching = wellbeingExercises.filter(ex =>
  ex.movementPattern === 'stretch' || ex.subcategory === 'static'
).slice(0, 6);
```

---

## 🎯 QUICK FIX SUMMARY

### Step 1: Fix Exercise Clicking (CRITICAL)
In `app.js`, add this line to `showWorkoutOptions()`:
```javascript
store.set('workout.todayWorkouts', options);
```

### Step 2: Fix resistance-band.json
Either fix the JSON syntax or remove it from index.json temporarily

### Step 3: Add More Exercises (Optional)
In `workoutGenerator.js`:
- Change max strength exercises from 4 to 6
- Change wellbeing exercises from 3/4 to 4/6

---

## 🧪 After Fixing - Expected Behavior

1. **Click workout card** → Shows that specific workout
2. **Click exercise** → Shows exercise modal
3. **See 5-6 exercises** per workout (instead of 2-3)
4. **More variety** between workouts

---

## 📊 Why You're Seeing Limited Options

The Active Coach is working, but:
1. ✅ It's correctly filtering by equipment (you only have bodyweight selected)
2. ✅ It's correctly filtering by energy level (matching your check-in)
3. ❌ But it's being too conservative with how many exercises it selects
4. ❌ And one file has a syntax error blocking some exercises

Once you make these fixes, you'll see much more variety! 💪
