# ACTIVE COACH INTEGRATION - COMPLETE GUIDE

## 📋 Overview
This guide will integrate the Active Coach (3 workout options + rationale) into your existing Alongside app.

---

## 🔧 STEP 1: Update app.js

**File:** `/js/app.js`

**Action:** Replace entire file with `app-with-active-coach.js`

**What changed:**
- Added import: `import { generateDailyWorkouts } from './modules/workoutGenerator.js';`
- Added `showWorkoutOptions()` function - displays 3 workout cards
- Added `renderWorkoutOptions()` - builds workout selection UI
- Added `renderWorkoutCard()` - individual workout card with rationale
- Added `toggleRationale()` - show/hide rationale button
- Added `selectWorkoutOption()` - handles workout selection
- Updated `showToday()` - now shows selected workout from store
- Added `renderWorkoutExecution()` - converts Active Coach format to execution view
- Added functions to `window.alongside` object

---

## 🔧 STEP 2: Update checkin-enhanced.js

**File:** `/js/modules/checkin-enhanced.js`

**Action:** Update the `handleSubmit()` function (around line 540-560)

**Find this function:**
```javascript
async function handleSubmit() {
  // Existing code that saves check-in
  // and calls showToday()
}
```

**Replace with:**
```javascript
async function handleSubmit() {
  // Gather all check-in data
  const checkinData = {
    energy: state.energy,
    mood: state.mood,
    sleepHours: state.sleepHours,
    sleepQuality: state.sleepQuality,
    hydration: state.hydration,
    conditions: activeConditions.map(c => ({
      id: c.id,
      pain: c.pain,
      impact: c.impact
    })),
    menstrualDay: state.menstrualDay,
    skipped: false
  };
  
  // Save to store
  store.saveCheckinEnhanced(checkinData);
  
  // Add to history for burnout detection
  store.addCheckinToHistory(checkinData);
  
  console.log('✅ Check-in saved, generating workout options...');
  
  // Show workout options screen (will call generateDailyWorkouts internally)
  await window.alongside.showWorkoutOptions(checkinData);
}
```

**Alternative:** If you can't find handleSubmit, search for where `showToday()` is called after check-in completes and replace that call with `showWorkoutOptions(checkinData)`.

---

## 🔧 STEP 3: Verify Required Files Exist

Make sure these files exist in your `/js/modules/` folder:

✅ `activeCoachFilters.js` (you already have this)
✅ `workoutGenerator.js` (you already have this)

---

## 🔧 STEP 4: Update Store (Already Done)

Your `store.js` already has these functions:
- ✅ `saveCheckinEnhanced()`
- ✅ `addCheckinToHistory()`
- ✅ `detectBurnout()`
- ✅ `getBurnoutAdaptation()`

**No changes needed to store.js!**

---

## 🔧 STEP 5: Fix Import in workoutGenerator.js

**File:** `/js/modules/workoutGenerator.js`

**Check line 12-19** - Make sure the import statement is correct:

```javascript
import { store } from '../store.js';
import { 
  getFilteredExercises,
  getExercisesByCategory,
  getExercisesByPattern,
  sortByEnergyMatch 
} from './activeCoachFilters.js';
```

**Important:** The path should be `'./activeCoachFilters.js'` (same folder) not `'../activeCoachFilters.js'`

---

## 🔧 STEP 6: Test the Integration

### Test Plan:

1. **Hard refresh** browser (`Ctrl+Shift+R` or `Cmd+Shift+R`)
2. **Complete check-in** with any values
3. **You should see:** 3 workout option cards
4. **Click** "Why this workout?" to see rationale
5. **Click** a workout card to select it
6. **You should see:** The workout execution view
7. **Complete** an exercise to verify credits work

### Expected Flow:

```
Enhanced Check-In
    ↓
[Generates 3 Options]
    ↓
Workout Selection Screen
 ├─ 💪 Strength Focus (clickable)
 ├─ 🧘 Wellbeing Focus (clickable)
 └─ 🏃 Cardio Focus (clickable)
    ↓
[User Clicks One]
    ↓
Workout Execution View
 ├─ Warm-Up Section
 ├─ Main Set Section
 └─ Cool Down Section
```

---

## 🐛 Troubleshooting

### Issue: "generateDailyWorkouts is not a function"
**Fix:** Make sure `workoutGenerator.js` exports the function:
```javascript
export async function generateDailyWorkouts(checkinData) { ... }
```

### Issue: "getFilteredExercises is not defined"
**Fix:** Check import path in `workoutGenerator.js` line 13-19

### Issue: No workout cards appear
**Fix:** Open console (F12) and check for errors. Likely an import path issue.

### Issue: Workouts appear but can't select them
**Fix:** Make sure `window.alongside.selectWorkoutOption` is defined in app.js (line ~500)

### Issue: CSS looks broken
**Fix:** The workout card styles already exist in your `app.css` file (from earlier) - no changes needed!

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] `app.js` has been replaced with new version
- [ ] `checkin-enhanced.js` handleSubmit() has been updated
- [ ] `activeCoachFilters.js` exists in `/js/modules/`
- [ ] `workoutGenerator.js` exists in `/js/modules/`
- [ ] `workoutGenerator.js` imports are correct (same folder)
- [ ] Browser hard refreshed
- [ ] Check-in completed successfully
- [ ] 3 workout cards appear
- [ ] Rationale toggle works
- [ ] Can select a workout
- [ ] Workout execution view appears
- [ ] Exercises are clickable
- [ ] Credits are awarded

---

## 📊 What You Built

You now have:
✅ Enhanced Check-In (Phase 1A) - Complete
✅ Active Coach with 3 Options (Phase 1B) - Complete
✅ Transparent Rationale - Complete
✅ Burnout Detection - Complete
✅ Condition Safety Filtering - Complete
✅ Energy Matching - Complete
✅ Menstrual Cycle Awareness - Complete
✅ Workout Execution - Complete

**Congratulations! You've built a sophisticated adaptive fitness coach!** 🎉

---

## 🚀 Next Steps (Future)

After testing and confirming everything works:
1. Add more exercises to reach 150 total
2. Implement post-workout difficulty feedback
3. Add progressive plans (Phase 2)
4. Build goal setting and milestone tracking
5. Create strategic rationale system

But for now - **test what you've built!** It's already incredibly powerful. 💪
