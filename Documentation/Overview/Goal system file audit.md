# 🔍 COMPLETE FILE AUDIT: Goal Setting System

## FILES THAT NEED UPDATES

### 1. DATA MODEL (store.js)
**Location:** `/js/store.js`
**Changes:** Add goals, fitnessLevel, preferences to profile
**Impact:** CRITICAL - Foundation for everything
**Method:** REPLACE ENTIRE FILE (clean data structure)

### 2. ONBOARDING (onboarding.js)
**Location:** `/js/modules/onboarding.js`
**Changes:** Add 3 new screens (goals, fitness level, preferences)
**Impact:** HIGH - User captures preferences
**Method:** REPLACE ENTIRE FILE (major additions)

### 3. ACTIVE COACH FILTERS (activeCoachFilters.js)
**Location:** `/js/modules/activeCoachFilters.js`
**Changes:** Use fitnessLevel to filter exercises by level
**Impact:** MEDIUM - Better exercise matching
**Method:** UPDATE SECTIONS (add level filter function, update loadAllExercises)

### 4. WORKOUT GENERATOR (workoutGenerator.js)
**Location:** `/js/modules/workoutGenerator.js`
**Changes:** Use goals + preferences to prioritize exercise selection
**Impact:** HIGH - Fixes running exercise problem
**Method:** REPLACE ENTIRE FILE (major logic changes)

### 5. COACH MODULE (coach.js)
**Location:** `/js/modules/coach.js`
**Changes:** Update rationale to reference goals
**Impact:** MEDIUM - Strategic rationale
**Method:** UPDATE SECTIONS (modify addRationale function)

### 6. TODAY VIEW (todayView.js)
**Location:** `/js/modules/todayView.js`
**Changes:** Display goal progress banner
**Impact:** LOW - Nice to have
**Method:** UPDATE SECTIONS (add goal progress component)

### 7. INDEX.HTML (index.html)
**Location:** `/index.html`
**Changes:** Possibly add goal progress UI elements
**Impact:** LOW - Visual polish
**Method:** SKIP FOR NOW (can add later)

---

## RECOMMENDED APPROACH

### PHASE 1: DATA + ONBOARDING (Session 1)
**Files to REPLACE:**
1. ✅ store.js - Add goals/fitness/preferences data model
2. ✅ onboarding.js - Add goal/fitness/preference screens

**Result:** Users can now set goals and preferences

---

### PHASE 2: USE THE DATA (Session 2)
**Files to UPDATE/REPLACE:**
3. ✅ activeCoachFilters.js - Add fitness level filtering
4. ✅ workoutGenerator.js - Use goals + preferences for selection

**Result:** Running exercises prioritized, workouts match fitness level

---

### PHASE 3: STRATEGIC RATIONALE (Session 3 - Optional)
**Files to UPDATE:**
5. ⏳ coach.js - Link rationale to goals
6. ⏳ todayView.js - Show goal progress

**Result:** Strategic context ("Week 3 of your 5K plan")

---

## FILE COMPLEXITY ASSESSMENT

| File | Lines | Complexity | Method | Time |
|------|-------|------------|--------|------|
| store.js | 200 | Low | REPLACE | 5 min |
| onboarding.js | 800 | High | REPLACE | 15 min |
| activeCoachFilters.js | 450 | Medium | UPDATE | 10 min |
| workoutGenerator.js | 550 | High | REPLACE | 10 min |
| coach.js | 250 | Low | UPDATE | 5 min |
| todayView.js | 300 | Low | UPDATE | 5 min |

**Total estimated: 50 minutes of work**

---

## CREDIT OPTIMIZATION STRATEGY

### Option A: REPLACE ALL FILES (Higher Credits, Faster)
- I create 4 complete files
- You download and replace
- No manual editing needed
- **Credits:** ~40-50K tokens
- **Your time:** 10 minutes

### Option B: UPDATE SECTIONS (Lower Credits, Slower)
- I give you line numbers and code snippets
- You manually edit 4 files
- Risk of copy-paste errors
- **Credits:** ~20-25K tokens
- **Your time:** 30-40 minutes

### Option C: HYBRID (Balanced)
- REPLACE: store.js, onboarding.js, workoutGenerator.js (complex)
- UPDATE: activeCoachFilters.js (simple additions)
- **Credits:** ~35K tokens
- **Your time:** 15 minutes

---

## MY RECOMMENDATION: OPTION C (HYBRID)

**WHY:**
1. **store.js** - Clean data model, no existing complex logic
2. **onboarding.js** - Adding 3 new screens, easier to replace than patch
3. **workoutGenerator.js** - Major selection logic overhaul
4. **activeCoachFilters.js** - Just adding ONE new filter function

**This gives you:**
- ✅ Clean, working code
- ✅ Minimal manual editing
- ✅ Reasonable credit usage
- ✅ Fast deployment

---

## DEPENDENCIES & ORDER

### MUST DO IN ORDER:
```
1. store.js (data model)
   ↓
2. onboarding.js (captures the data)
   ↓
3. activeCoachFilters.js (uses fitnessLevel)
   ↓
4. workoutGenerator.js (uses goals + preferences)
```

**You CANNOT deploy them out of order** - each depends on the previous.

---

## SESSION BREAKDOWN

### THIS SESSION (Now):
**Goal:** Get data model + onboarding working
**Files:** store.js, onboarding.js
**Deliverables:** 2 complete files
**Result:** Users can set goals and preferences (stored in localStorage)

### NEXT SESSION:
**Goal:** Use the captured data
**Files:** activeCoachFilters.js (update), workoutGenerator.js (replace)
**Deliverables:** 1 complete file + code snippets
**Result:** Running exercises prioritized, workouts match fitness level

---

## DATA STRUCTURES TO BUILD

### Goals Structure:
```javascript
goals: [
  {
    id: 'run-5k',
    type: 'endurance',
    title: 'Run my first 5K',
    description: 'Complete a 5K run without stopping',
    target: { distance: 5000, unit: 'meters' },
    deadline: '2025-03-15',
    category: 'running'
  }
]
```

### Fitness Level:
```javascript
fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
```

### Preferences:
```javascript
preferences: {
  cardioType: 'running' | 'hiit' | 'mixed' | 'low-impact',
  exerciseBlacklist: ['burpee', 'mountain-climber'],
  yogaStyle: 'power' | 'restorative' | 'mixed'
}
```

---

## VALIDATION CHECKLIST

After deployment, verify:
- [ ] localStorage shows goals array
- [ ] localStorage shows fitnessLevel
- [ ] localStorage shows preferences object
- [ ] Onboarding shows new screens
- [ ] Console shows "User goals: run-5k"
- [ ] Workouts prioritize running exercises
- [ ] Console shows fitness level filtering
