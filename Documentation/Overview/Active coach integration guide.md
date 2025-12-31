# Active Coach Integration Guide

**Last Updated:** December 31, 2025  
**Status:** Ready for integration into app.js

---

## Overview

The Active Coach is now built in **two modular files**:

1. **`activeCoachFilters.js`** - Filtering engine (equipment, conditions, energy, menstrual cycle, burnout)
2. **`workoutGenerator.js`** - Workout generation (3 daily options + transparent rationale)

---

## How to Integrate

### Step 1: Import Modules in app.js

```javascript
import { generateDailyWorkouts } from './modules/workoutGenerator.js';
import { detectBurnout } from './modules/activeCoachFilters.js';
```

### Step 2: Call After Check-In Complete

```javascript
// In your check-in completion handler
async function onCheckInComplete(checkinData) {
  // Save check-in to store
  store.set('checkin', checkinData);
  
  // Add to check-in history for burnout detection
  const history = store.get('checkinHistory') || [];
  history.push({
    date: new Date().toISOString(),
    energy: checkinData.energy,
    mood: checkinData.mood,
    sleep: checkinData.sleep,
    conditions: checkinData.conditions
  });
  store.set('checkinHistory', history);
  
  // Generate today's workouts
  const workouts = await generateDailyWorkouts(checkinData);
  
  // Save to store
  store.set('todayWorkouts', workouts);
  
  // Navigate to today view
  navigateTo('today');
}
```

### Step 3: Display Workouts in Today View

```javascript
// In todayView.js
function renderTodayView() {
  const workouts = store.get('todayWorkouts');
  
  if (!workouts) {
    return showNoWorkoutsMessage();
  }
  
  if (workouts.burnoutMode) {
    renderBurnoutMessage(workouts.message);
  }
  
  renderWorkoutOptions(workouts.options);
}
```

---

## Usage Examples

### Example 1: Normal Day (Energy 7/10)

```javascript
const checkinData = {
  energy: 7,
  mood: 7,
  sleep: { hours: 7, quality: 4 },
  hydration: 'good',
  conditions: [
    { id: 'lower_back', pain: 3, difficulty: 2 }
  ],
  menstrualDay: null
};

const workouts = await generateDailyWorkouts(checkinData);
// Returns:
// {
//   options: [
//     { id: 'strength', title: 'Strength Focus', ... },
//     { id: 'wellbeing', title: 'Wellbeing Focus', ... },
//     { id: 'cardio', title: 'Cardio Focus', ... }
//   ],
//   burnoutMode: false,
//   message: null
// }
```

**Rationale Generated:**
- Primary: "Your energy is 7/10 - perfect for challenging work"
- Conditions: "Protecting your lower_back (pain: 3/10)"
- Mood: "Great mood - perfect for pushing yourself"

---

### Example 2: Low Energy Day (Energy 2/10)

```javascript
const checkinData = {
  energy: 2,
  mood: 3,
  sleep: { hours: 5, quality: 2 },
  hydration: 'low',
  conditions: [],
  menstrualDay: null
};

const workouts = await generateDailyWorkouts(checkinData);
// Returns filtered to low-energy exercises only:
// - Gentle walking
// - Stretching
// - Breathwork
// - Restorative yoga
```

**Rationale Generated:**
- Primary: "Your energy is 2/10 - rest and recovery are the priority"
- Sleep: "Poor sleep - taking it easier today"
- Mood: "Exercises chosen for endorphin boost and mood lift"

---

### Example 3: Burnout Detected

```javascript
// User has had energy ≤3 for 3 consecutive days
const checkinData = {
  energy: 2,
  mood: 3,
  sleep: { hours: 5, quality: 1 },
  hydration: 'low',
  conditions: [],
  menstrualDay: null
};

const workouts = await generateDailyWorkouts(checkinData);
// Returns:
// {
//   options: [
//     { id: 'recovery', title: '🛡️ Recovery Mode', ... }
//   ],
//   burnoutMode: true,
//   message: "You've been running on low energy lately. That's okay - we're focusing on gentle activities and rest. Take care of yourself."
// }
```

**UI Display:**
- Show gentle banner with recovery mode message
- Only show recovery workout option
- "I'm feeling better" button to exit recovery mode

---

### Example 4: Menstrual Cycle Tracking

```javascript
const checkinData = {
  energy: 6,
  mood: 6,
  sleep: { hours: 7, quality: 3 },
  hydration: 'ok',
  conditions: [],
  menstrualDay: 3 // Day 3 of menstruation
};

const workouts = await generateDailyWorkouts(checkinData);
```

**Filtering Applied:**
- Reduces high-intensity exercises
- Avoids core compression movements
- Prioritizes moderate-intensity options

**Rationale Generated:**
- Primary: "Your energy is 6/10 - steady, sustainable pace"
- Menstrual Cycle: "Menstruation phase - gentler intensity"

---

### Example 5: Injury Management

```javascript
const checkinData = {
  energy: 7,
  mood: 8,
  sleep: { hours: 8, quality: 5 },
  hydration: 'good',
  conditions: [
    { id: 'knee', pain: 7, difficulty: 5 },
    { id: 'lower_back', pain: 2, difficulty: 1 }
  ],
  menstrualDay: null
};

const workouts = await generateDailyWorkouts(checkinData);
```

**Filtering Applied:**
- BLOCKS exercises with knee_high contraindication (pain ≥8 blocks, ≥5 cautions)
- Shows caution warnings for knee exercises
- Prioritizes upper body and core exercises
- Suggests modifications for exercises that could work

**Rationale Generated:**
- Primary: "Your energy is 7/10 - perfect for challenging work"
- Conditions: "Protecting your knee (pain: 7/10)"
- Mood: "Great mood - perfect for pushing yourself"

---

## UI Components to Build

### 1. Workout Card Component

```html
<div class="workout-card" data-workout-id="strength">
  <div class="workout-header">
    <h3>💪 Strength Focus</h3>
    <span class="workout-duration">~35 minutes</span>
  </div>
  
  <div class="workout-subtitle">
    squat, hinge, push, pull, core
  </div>
  
  <!-- Transparent Rationale -->
  <div class="workout-rationale">
    <button class="rationale-toggle">Why this workout?</button>
    <div class="rationale-content hidden">
      <p><strong>✅ Your energy is 7/10</strong> - perfect for challenging work</p>
      <p><strong>⚠️ Protecting your lower back</strong> (pain: 3/10)</p>
      <p><strong>💤 Well-rested</strong> from 7h sleep</p>
    </div>
  </div>
  
  <div class="workout-stats">
    <span>🏋️ 4 exercises</span>
    <span>⭐ 240 credits</span>
  </div>
  
  <button class="btn-primary">Start Workout</button>
</div>
```

### 2. Burnout Banner Component

```html
<div class="burnout-banner">
  <div class="icon">🛡️</div>
  <div class="content">
    <h3>Recovery Mode Activated</h3>
    <p>You've been running on low energy lately. That's okay - we're focusing on gentle activities and rest. Take care of yourself.</p>
  </div>
  <button class="btn-secondary">I'm feeling better</button>
</div>
```

### 3. Exercise List Component

```html
<div class="exercise-list">
  <h4>Warmup (5 min)</h4>
  <ul>
    <li>Hip Circles - 30 sec</li>
    <li>Leg Swings - 30 sec</li>
    <li>Arm Circles - 30 sec</li>
  </ul>
  
  <h4>Main Workout</h4>
  <ul>
    <li>
      <div class="exercise-item">
        <span class="exercise-name">Goblet Squat</span>
        <span class="exercise-details">3 sets × 10 reps (60s rest)</span>
        <span class="exercise-credits">⭐ 60 credits</span>
      </div>
    </li>
    <!-- More exercises... -->
  </ul>
  
  <h4>Cooldown (5 min)</h4>
  <ul>
    <li>Hamstring Stretch - 30 sec</li>
    <li>Quad Stretch - 30 sec</li>
    <li>Child's Pose - 30 sec</li>
  </ul>
</div>
```

---

## Testing Checklist

### Manual Testing Scenarios

- [ ] **Normal day (energy 7):** Should show 3 workout options
- [ ] **Low energy (energy 2):** Should show gentle exercises only
- [ ] **Burnout (3 days energy ≤3):** Should activate recovery mode
- [ ] **Injury (knee pain 8):** Should block knee exercises
- [ ] **Menstruation (day 3):** Should reduce intensity recommendations
- [ ] **No equipment:** Should show bodyweight exercises only
- [ ] **High energy (energy 9):** Should prioritize HIIT and intense cardio

### Edge Cases

- [ ] **No exercises match filters:** Handle gracefully (suggest equipment purchase or condition management)
- [ ] **Empty exercise database:** Handle loading errors
- [ ] **Missing check-in data:** Validate before generating workouts
- [ ] **First-time user (no history):** Burnout detection should not trigger

---

## Performance Optimization

### Caching Strategy

```javascript
// Cache loaded exercises to avoid repeated fetches
let exerciseCache = null;

export async function getFilteredExercises(checkinData) {
  // Load exercises only once per session
  if (!exerciseCache) {
    exerciseCache = await loadAllExercises();
  }
  
  // Use cached exercises
  let filtered = exerciseCache;
  // ... rest of filtering logic
}
```

### Lazy Loading

```javascript
// Load exercise files on-demand
const exerciseModules = {
  strength: () => import('/data/library/exercises/strength/dumbbell.json'),
  cardio: () => import('/data/library/exercises/cardio/running.json'),
  // etc.
};
```

---

## Future Enhancements

### Phase 2: Goal Alignment

```javascript
// Prioritize exercises aligned with user goals
function filterByGoals(exercises, userGoals) {
  return exercises.map(exercise => {
    const goalAlignment = exercise.benefits.filter(benefit => 
      userGoals.includes(benefit)
    ).length;
    
    return { ...exercise, goalAlignment };
  }).sort((a, b) => b.goalAlignment - a.goalAlignment);
}
```

### Phase 3: Progressive Overload

```javascript
// Track performance over time, gradually increase difficulty
function adjustForProgress(exercise, performanceHistory) {
  const lastPerformance = performanceHistory[exercise.id];
  
  if (lastPerformance && lastPerformance.completed >= 3) {
    // Increase sets/reps/weight after 3 successful completions
    return {
      ...exercise,
      sets: exercise.sets + 1,
      reps: exercise.reps + 2
    };
  }
  
  return exercise;
}
```

### Phase 4: AI-Enhanced Recommendations

```javascript
// Use actual AI (Claude API) for complex personalization
async function enhanceWithAI(workouts, userContext) {
  const prompt = `Given user context: ${JSON.stringify(userContext)}
  Suggest specific coaching cues and motivation for these workouts.`;
  
  const response = await callClaudeAPI(prompt);
  // Enhance workouts with AI-generated coaching
}
```

---

## Status: Ready for Integration

✅ **Filtering logic complete** - Equipment, conditions, energy, menstrual cycle, burnout  
✅ **Workout generation complete** - 3 daily options with transparent rationale  
✅ **Modular architecture** - Easy to test, debug, extend  
✅ **Safety-first design** - Never recommends unsafe exercises  
✅ **Neurodivergent-friendly** - Transparent "why", no shame, fresh start daily

**Next Steps:**
1. Integrate into app.js check-in flow
2. Build Today View UI components
3. Create workout execution UI
4. Add exercise completion tracking
5. Test with real user scenarios

---

**Ready to Build the Today View?** 🚀
