# Alongside: Complete Technical Architecture & Implementation Specification

**Version:** 3.0  
**Date:** December 31, 2025  
**App Name:** Alongside (formerly AthleteOS)  
**Status:** ~40% Complete, Active Coach Development Phase  
**Developer:** Graeme Wright (Digital Coach, Weston College)

---

## 🎯 EXECUTIVE SUMMARY

Alongside is a **full-spectrum adaptive fitness coaching platform** designed specifically for neurodivergent adults (ADHD, autism, anxiety) and women managing complex life circumstances (menstrual cycles, menopause, parental duties, chronic conditions).

Unlike traditional fitness apps that prescribe rigid programs and shame users for missing workouts, Alongside **"listens first, prescribes second"** - adapting recommendations based on daily check-ins that capture energy, mood, sleep, pain levels, and life context.

**Core Differentiator:** The "Active Coach" - a transparent heuristic reasoning engine that generates personalized workout recommendations with visible rationale explaining why each exercise was suggested.

---

## 🏗️ SYSTEM ARCHITECTURE

### High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                    ALONGSIDE PLATFORM                    │
│                  "The Card Factory Engine"               │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  ┌──────────┐       ┌──────────┐       ┌──────────┐
  │ Alongside│       │ Student  │       │ Senior   │
  │  (B2C)   │       │Life Hub  │       │Tech Skills│
  │          │       │  (B2B)   │       │ (Grant)  │
  └──────────┘       └──────────┘       └──────────┘
   Fitness           University          Digital
   Coaching          Licensing           Inclusion
```

### Technical Stack

**Current (Phase 1 - MVP):**
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **State Management:** Custom localStorage-backed reactive store
- **Module System:** ES6 modules with dynamic imports
- **Storage:** Browser localStorage (zero-server architecture)
- **Hosting:** GitHub Pages (static site)
- **Data Format:** JSON files organized by domain (exercises, meals, conditions)

**Future (Phase 2 - Commercial):**
- **Authentication:** Supabase Auth or Firebase Auth
- **Database:** PostgreSQL (Supabase) or Firestore
- **Payments:** Stripe subscription integration
- **Backend:** Serverless functions (Vercel/Netlify) for payment processing
- **Analytics:** Privacy-focused analytics (Plausible or Simple Analytics)

---

## 📊 DATA ARCHITECTURE

### Core Data Structures

#### 1. User Profile
```javascript
profile: {
  // Identity
  name: string,
  age: number,
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say',
  
  // Physical metrics
  weight: number,
  goalWeight: number,
  weightUnit: 'kg' | 'lbs',
  height: number,
  heightUnit: 'cm' | 'in',
  
  // Body metrics (for progress tracking)
  bodyMetrics: {
    waist: number,
    chest: number,
    biceps: number,
    thighs: number,
    // Add more as needed
  },
  
  // Tracking preferences
  menstrualTracking: boolean,
  
  // Equipment & conditions
  equipment: [string], // IDs from equipment cards
  conditions: [
    {
      id: string,              // e.g., 'lower_back_left_disc'
      region: string,          // e.g., 'lower_back'
      location: string,        // e.g., 'left_side'
      type: string,            // e.g., 'disc_bulge'
      severity: 1-10,          // User-defined severity
      chronicOrAcute: 'chronic' | 'acute',
      onsetDate: ISO string,
      notes: string
    }
  ],
  
  // Goals & targets
  goals: [
    {
      id: string,              // e.g., 'weight_loss'
      name: string,            // e.g., 'Lose weight by May'
      targetDate: ISO string,  // e.g., '2025-05-01'
      targetValue: number,     // e.g., target weight
      milestones: [
        {
          date: ISO string,
          target: number,
          achieved: boolean
        }
      ]
    }
  ],
  
  // Onboarding
  declarations: [string],      // Health declarations
  declarationNotes: string,    // Additional context
  onboardingComplete: boolean,
  onboardingDate: ISO string
}
```

#### 2. Daily Check-In
```javascript
checkin: {
  date: ISO string,            // Today's date
  timestamp: ISO string,       // Completion time
  
  // Core metrics (1-10 scales match Marc Brackett's mood meter)
  energy: 1-10,                // Physical energy level
  mood: 1-10,                  // Emotional state
  
  // Sleep tracking
  sleep: {
    hours: number,             // 4-10+ hours
    quality: 1-5               // Subjective rating
  },
  
  // Hydration
  hydration: 'low' | 'ok' | 'good',
  
  // Menstrual cycle (if tracking enabled)
  menstrualDay: number | null, // Day of cycle (1-28+)
  menstrualSymptoms: [string], // e.g., ['cramps', 'fatigue']
  
  // Condition updates (daily fluctuations)
  conditions: [
    {
      id: string,              // Matches profile condition ID
      pain: 1-10,              // Pain level today
      difficulty: 1-10         // Functional difficulty today
    }
  ],
  
  // Coaching preferences
  coachingIntensity: 'gentle' | 'moderate' | 'aggressive',
  
  // Flags
  completed: boolean,
  burnoutDetected: boolean     // Set by burnout detection algorithm
}
```

#### 3. Check-In History
```javascript
checkinHistory: [
  {
    date: ISO string,
    energy: 1-10,
    mood: 1-10,
    sleep: { hours: number, quality: 1-5 },
    conditions: [...],
    // Used for pattern detection (burnout, trends)
  }
]
```

#### 4. Workout Data
```javascript
workout: {
  date: ISO string,            // Today's date
  
  // Generated by Active Coach
  options: [
    {
      id: 'strength' | 'wellbeing' | 'cardio',
      title: string,           // e.g., "Lower Body Strength"
      duration: number,        // Minutes
      energyRequired: 1-10,    // Matches check-in scale
      
      warmup: [
        {
          exerciseId: string,
          duration: number,    // Seconds or minutes
        }
      ],
      
      main: [
        {
          exerciseId: string,
          sets: number,
          reps: number,
          duration: number,    // For time-based exercises
          rest: number,        // Seconds between sets
          weight: number,      // Optional
          modification: string // Exercise-specific modification
        }
      ],
      
      cooldown: [
        {
          exerciseId: string,
          duration: number
        }
      ],
      
      // Transparent rationale (core differentiator)
      rationale: {
        primary: string,       // e.g., "Your energy is 7/10 - perfect for strength"
        conditions: [string],  // e.g., "Avoiding lower back exercises (pain: 7/10)"
        goals: [string],       // e.g., "Building core strength for running"
        mood: string,          // e.g., "Endorphin-boosting movements for mood lift"
      },
      
      // Completion tracking
      selected: boolean,
      completed: boolean,
      completedExercises: [string], // Exercise IDs
      totalCredits: number
    }
  ],
  
  // User-added custom exercises (runs, cycling, swimming, sports)
  customExercises: [
    {
      id: string,
      type: 'run' | 'cycle' | 'swim' | 'sport' | 'other',
      name: string,            // e.g., "Morning run"
      duration: number,        // Minutes
      distance: number,        // Km or miles
      distanceUnit: 'km' | 'miles',
      calories: number,        // Manual or estimated
      notes: string,
      timestamp: ISO string,
      credits: number
    }
  ],
  
  // Meal tracking
  meals: [
    {
      id: string,
      type: 'breakfast' | 'lunch' | 'dinner' | 'snack',
      name: string,
      calories: number,
      time: ISO string,
      notes: string
    }
  ]
}
```

#### 5. Progress & Stats
```javascript
stats: {
  // Workout tracking
  totalWorkouts: number,
  totalWorkoutMinutes: number,
  workoutsByType: {
    strength: number,
    cardio: number,
    mobility: number,
    recovery: number
  },
  
  // Credits system (rewards without punishment)
  totalCredits: number,
  creditsHistory: [
    {
      amount: number,
      reason: string,
      date: ISO string
    }
  ],
  
  // Streaks (celebration, not pressure)
  currentStreak: number,       // Days with any activity
  longestStreak: number,
  totalActiveDays: number,
  
  // Body metrics over time
  bodyMetricsHistory: [
    {
      date: ISO string,
      weight: number,
      waist: number,
      chest: number,
      // ...other metrics
    }
  ],
  
  // Weekly reports
  weeklyReports: [
    {
      weekStarting: ISO string,
      totalWorkouts: number,
      averageEnergy: number,
      averageMood: number,
      goalsProgress: [...],
      insights: [string],      // Generated insights
      generated: boolean,
      dismissed: boolean       // User can opt out
    }
  ]
}
```

---

## 🧠 THE ACTIVE COACH: SMART REASONING ENGINE

### Philosophy: "Fake AI" (Heuristic Logic)

The Active Coach uses **transparent, rule-based logic** to mimic intelligent behavior without machine learning. This approach is:

1. **Cheaper** - No API costs or model training
2. **Faster** - Instant recommendations
3. **Controllable** - Predictable, debuggable logic
4. **Transparent** - Users see exactly why exercises were recommended
5. **Privacy-preserving** - All computation happens locally

### Core Algorithm Flow

```javascript
function generateDailyWorkouts(checkinData, profileData, exerciseDatabase) {
  // Step 1: Read user context
  const context = {
    energy: checkinData.energy,
    mood: checkinData.mood,
    sleep: checkinData.sleep,
    conditions: checkinData.conditions,
    burnoutDetected: checkinData.burnoutDetected,
    equipment: profileData.equipment,
    goals: profileData.goals,
    menstrualDay: checkinData.menstrualDay
  };
  
  // Step 2: Check for burnout override
  if (context.burnoutDetected) {
    return generateRecoveryOnlyWorkouts(context, exerciseDatabase);
  }
  
  // Step 3: Filter exercise database
  let availableExercises = exerciseDatabase;
  
  // Filter by equipment
  availableExercises = filterByEquipment(availableExercises, context.equipment);
  
  // Filter by conditions (CRITICAL SAFETY)
  availableExercises = filterByConditions(availableExercises, context.conditions);
  
  // Filter by energy level
  availableExercises = filterByEnergy(availableExercises, context.energy);
  
  // Adjust for menstrual cycle (if tracking)
  if (context.menstrualDay) {
    availableExercises = adjustForMenstrualCycle(
      availableExercises, 
      context.menstrualDay
    );
  }
  
  // Step 4: Generate 3 workout options
  const strengthWorkout = generateStrengthWorkout(availableExercises, context);
  const wellbeingWorkout = generateWellbeingWorkout(availableExercises, context);
  const cardioWorkout = generateCardioWorkout(availableExercises, context);
  
  // Step 5: Add transparent rationale to each
  addRationale(strengthWorkout, context);
  addRationale(wellbeingWorkout, context);
  addRationale(cardioWorkout, context);
  
  return {
    options: [strengthWorkout, wellbeingWorkout, cardioWorkout],
    context: context
  };
}
```

### Filtering Rules (Safety-First)

#### 1. Equipment Filtering
```javascript
function filterByEquipment(exercises, userEquipment) {
  return exercises.filter(exercise => {
    // Bodyweight exercises always available
    if (exercise.equipment.includes('bodyweight')) return true;
    
    // Check if user has ALL required equipment
    return exercise.equipment.every(eq => userEquipment.includes(eq));
  });
}
```

#### 2. Condition Safety Filtering (CRITICAL)
```javascript
function filterByConditions(exercises, activeConditions) {
  return exercises.map(exercise => {
    let safetyLevel = 'safe'; // 'safe' | 'caution' | 'blocked'
    let warnings = [];
    
    for (const condition of activeConditions) {
      const conditionId = condition.id;
      const pain = condition.pain;
      const difficulty = condition.difficulty;
      
      // BLOCK exercises if severe pain (8-10)
      if (pain >= 8 && exercise.conditions.avoid.includes(conditionId)) {
        safetyLevel = 'blocked';
        warnings.push(`Blocked: ${conditionId} pain too high (${pain}/10)`);
      }
      
      // CAUTION if moderate pain (5-7)
      else if (pain >= 5 && exercise.conditions.modify.includes(conditionId)) {
        safetyLevel = 'caution';
        warnings.push(`Caution: ${conditionId} pain level ${pain}/10`);
      }
      
      // RECOMMEND if beneficial for this condition
      else if (exercise.conditions.beneficial.includes(conditionId)) {
        warnings.push(`Recommended: Helps with ${conditionId}`);
      }
    }
    
    return { ...exercise, safetyLevel, warnings };
  }).filter(ex => ex.safetyLevel !== 'blocked');
}
```

#### 3. Energy Matching
```javascript
function filterByEnergy(exercises, energyLevel) {
  return exercises.map(exercise => {
    // Energy delta: how far from user's current energy
    const delta = Math.abs(exercise.energyRequired - energyLevel);
    
    // Prioritize exercises within ±2 of user's energy
    const priority = delta <= 2 ? 'high' : delta <= 4 ? 'medium' : 'low';
    
    return { ...exercise, energyMatch: priority, energyDelta: delta };
  }).filter(ex => ex.energyMatch !== 'low');
}
```

#### 4. Menstrual Cycle Adaptation (Women-First Design)
```javascript
function adjustForMenstrualCycle(exercises, menstrualDay) {
  // Cycle phases based on 28-day average
  let phase;
  if (menstrualDay >= 1 && menstrualDay <= 5) {
    phase = 'menstruation'; // Days 1-5
  } else if (menstrualDay >= 6 && menstrualDay <= 14) {
    phase = 'follicular'; // Days 6-14 (pre-ovulation)
  } else if (menstrualDay >= 15 && menstrualDay <= 17) {
    phase = 'ovulation'; // Days 15-17
  } else {
    phase = 'luteal'; // Days 18-28 (pre-menstruation)
  }
  
  return exercises.map(exercise => {
    let recommendation = 'neutral';
    
    switch (phase) {
      case 'menstruation':
        // Lower intensity, avoid core compression
        if (exercise.intensity === 'high') recommendation = 'reduce';
        if (exercise.movementPattern === 'core_compression') recommendation = 'avoid';
        break;
        
      case 'follicular':
        // Energy rising, great for strength building
        if (exercise.category === 'strength') recommendation = 'optimal';
        break;
        
      case 'ovulation':
        // Peak energy, ideal for high-intensity
        if (exercise.intensity === 'high') recommendation = 'optimal';
        break;
        
      case 'luteal':
        // Energy declining, focus on steady-state
        if (exercise.intensity === 'moderate') recommendation = 'optimal';
        if (exercise.intensity === 'high') recommendation = 'reduce';
        break;
    }
    
    return { ...exercise, menstrualRecommendation: recommendation, phase };
  });
}
```

### Burnout Detection Algorithm

Based on Dr. Claire Plumbly's research on nervous system dysregulation.

```javascript
function detectBurnout(checkinHistory) {
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
  const poorSleepStreak = last3Days.every(day => day.sleep.quality <= 2);
  
  // Pattern 5: Pain flare - Any condition pain ≥8 for 2+ consecutive days
  const painFlare = last3Days.slice(-2).some(day => 
    day.conditions.some(c => c.pain >= 8)
  );
  
  // Trigger burnout if ANY severe pattern OR multiple chronic patterns
  const severeTriggers = [lowEnergyStreak, lowMoodStreak, poorSleepStreak, painFlare];
  const chronicTriggers = [chronicLowEnergy];
  
  const severeCount = severeTriggers.filter(Boolean).length;
  const chronicCount = chronicTriggers.filter(Boolean).length;
  
  return severeCount >= 1 || (severeCount >= 1 && chronicCount >= 1);
}
```

### Workout Generation Logic

#### Strength Workout Structure
```javascript
function generateStrengthWorkout(availableExercises, context) {
  // Filter for strength exercises
  const strengthExercises = availableExercises.filter(
    ex => ex.category === 'strength'
  );
  
  // Movement pattern balance (avoid overworking same patterns)
  const patterns = ['push', 'pull', 'squat', 'hinge', 'core'];
  const selected = [];
  
  // Select 1 compound exercise per pattern (3-4 total)
  for (const pattern of patterns) {
    const options = strengthExercises.filter(
      ex => ex.movementPattern === pattern && ex.type === 'compound'
    );
    
    if (options.length > 0) {
      // Prioritize exercises aligned with user goals
      const goalAligned = options.filter(ex => 
        ex.benefits.some(b => context.goals.includes(b))
      );
      
      const exercise = goalAligned.length > 0 
        ? goalAligned[0] 
        : options[0];
        
      selected.push(exercise);
    }
    
    if (selected.length >= 4) break; // Max 4 main exercises
  }
  
  // Add warmup (dynamic stretching, mobility)
  const warmup = selectWarmupExercises(availableExercises, selected);
  
  // Add cooldown (static stretching)
  const cooldown = selectCooldownExercises(availableExercises, selected);
  
  // Calculate sets/reps based on energy and goals
  const main = selected.map(ex => ({
    exerciseId: ex.id,
    sets: calculateSets(ex, context),
    reps: calculateReps(ex, context),
    rest: calculateRest(ex, context),
    modification: selectModification(ex, context)
  }));
  
  return {
    id: 'strength',
    title: generateTitle(selected, context),
    duration: calculateDuration(warmup, main, cooldown),
    energyRequired: calculateEnergyRequired(main),
    warmup,
    main,
    cooldown
  };
}
```

#### Rationale Generation (Transparency = Trust)
```javascript
function generateRationale(workout, context) {
  const rationale = {
    primary: '',
    conditions: [],
    goals: [],
    mood: ''
  };
  
  // Primary rationale (energy-based)
  if (context.energy >= 8) {
    rationale.primary = `Your energy is ${context.energy}/10 - perfect for challenging work`;
  } else if (context.energy >= 5) {
    rationale.primary = `Your energy is ${context.energy}/10 - steady, sustainable pace`;
  } else {
    rationale.primary = `Your energy is ${context.energy}/10 - keeping it gentle today`;
  }
  
  // Condition considerations
  for (const condition of context.conditions) {
    if (condition.pain >= 5) {
      rationale.conditions.push(
        `Protecting your ${condition.id} (pain: ${condition.pain}/10)`
      );
    }
  }
  
  // Goal alignment
  const alignedGoals = context.goals.filter(goal => 
    workout.main.some(ex => ex.benefits.includes(goal))
  );
  
  if (alignedGoals.length > 0) {
    rationale.goals.push(
      `Building towards: ${alignedGoals.map(g => g.name).join(', ')}`
    );
  }
  
  // Mood considerations
  if (context.mood <= 4) {
    rationale.mood = 'Exercises chosen for endorphin boost and mood lift';
  } else if (context.mood >= 8) {
    rationale.mood = 'Great mood - perfect for pushing yourself';
  }
  
  return rationale;
}
```

---

## 🗂️ FILE STRUCTURE & MODULARITY

### Current Structure (Before Refactor)
```
alongside/
├── index.html                 # Entry point
├── css/
│   ├── main.css              # Core styles
│   └── components/           # Component-specific styles
├── js/
│   ├── app.js                # Orchestrator (1000+ lines)
│   ├── store.js              # State management
│   └── modules/
│       ├── checkin.js        # Check-in system
│       ├── coach.js          # Active Coach logic
│       ├── todayView.js      # Workout display
│       └── onboarding.js     # 1000+ lines (NEEDS REFACTOR)
└── data/
    └── exercises.json        # 30 exercises (needs expansion)
```

### Target Structure (Card-Based Modular)
```
alongside/
├── index.html
├── css/
│   ├── main.css
│   └── components/
│       ├── cards.css
│       ├── buttons.css
│       └── forms.css
├── js/
│   ├── app.js                # Orchestrator (<300 lines)
│   ├── store.js              # State management
│   ├── router.js             # View routing
│   └── modules/
│       ├── checkin/
│       │   ├── index.js
│       │   ├── energySlider.js
│       │   ├── moodSlider.js
│       │   └── conditionRating.js
│       ├── coach/
│       │   ├── index.js
│       │   ├── filters.js
│       │   ├── generator.js
│       │   └── rationale.js
│       ├── onboarding/
│       │   ├── index.js
│       │   ├── steps/
│       │   │   ├── welcome.js
│       │   │   ├── profile.js
│       │   │   ├── conditions.js
│       │   │   ├── equipment.js
│       │   │   └── goals.js
│       │   └── navigation.js
│       └── todayView/
│           ├── index.js
│           ├── workoutCard.js
│           └── exerciseTimer.js
└── data/
    ├── library/              # CARD-BASED SYSTEM
    │   ├── exercises/
    │   │   ├── index.json    # Master index
    │   │   ├── strength/
    │   │   │   ├── compound/
    │   │   │   │   ├── goblet-squat.json
    │   │   │   │   ├── deadlift.json
    │   │   │   │   └── ...
    │   │   │   └── isolation/
    │   │   │       ├── bicep-curl.json
    │   │   │       └── ...
    │   │   ├── cardio/
    │   │   │   ├── running/
    │   │   │   │   ├── easy-run.json
    │   │   │   │   ├── intervals.json
    │   │   │   │   └── ...
    │   │   │   └── low-impact/
    │   │   │       └── ...
    │   │   ├── mobility/
    │   │   └── recovery/
    │   ├── conditions/
    │   │   ├── index.json
    │   │   ├── lower-back/
    │   │   │   ├── disc-bulge.json
    │   │   │   ├── muscle-strain.json
    │   │   │   └── ...
    │   │   ├── knee/
    │   │   └── shoulder/
    │   ├── equipment/
    │   │   ├── index.json
    │   │   ├── dumbbells.json
    │   │   ├── kettlebell.json
    │   │   └── ...
    │   └── meals/              # Future: meal cards
    │       └── ...
    └── config/
        ├── constants.json
        └── settings.json
```

### Card-Based Data Structure

Each exercise is a **self-contained JSON card**:

```json
// data/library/exercises/strength/compound/goblet-squat.json
{
  "id": "goblet_squat",
  "name": "Goblet Squat",
  "category": "strength",
  "subcategory": "compound",
  "movementPattern": "squat",
  
  "equipment": ["dumbbells", "kettlebell"],
  "difficulty": 2,
  "energyRequired": 6,
  "intensity": "moderate",
  
  "benefits": [
    "lower_body_strength",
    "core_stability",
    "hip_mobility",
    "functional_movement"
  ],
  
  "conditions": {
    "safe": ["none"],
    "avoid": ["severe_knee_pain", "severe_hip_pain"],
    "modify": ["knee_issues", "hip_issues", "lower_back"],
    "beneficial": ["hip_mobility", "core_weakness"]
  },
  
  "menstrualCycleRecommendation": {
    "menstruation": "neutral",
    "follicular": "optimal",
    "ovulation": "optimal",
    "luteal": "neutral"
  },
  
  "description": "A foundational squat pattern holding a weight at chest height. Builds lower body strength while teaching proper squat mechanics.",
  
  "instructions": [
    "Hold dumbbell/kettlebell at chest height",
    "Feet shoulder-width apart, toes slightly out",
    "Squat down, keeping chest up and weight in heels",
    "Descend until thighs parallel or slightly below",
    "Drive through heels to stand"
  ],
  
  "cues": [
    "Chest proud, shoulders back",
    "Knees track over toes",
    "Drive through heels",
    "Exhale on the way up"
  ],
  
  "modifications": {
    "easier": [
      "Reduce weight",
      "Limit depth to comfortable range",
      "Use chair for balance"
    ],
    "harder": [
      "Increase weight",
      "Pause at bottom",
      "Tempo slow on descent"
    ],
    "knee_issues": "Limit depth, focus on control",
    "lower_back": "Keep torso upright, lighter weight"
  },
  
  "rationale": {
    "primary": "Builds functional lower body strength for everyday movements",
    "injury_prevention": "Strengthens muscles that protect knees and hips",
    "goal_alignment": {
      "strength": "Compound movement for maximum strength gains",
      "weight_loss": "High calorie burn from large muscle groups",
      "running": "Builds leg power and stability for running"
    }
  },
  
  "videoSearch": "goblet squat form",
  
  "progressions": {
    "before": ["bodyweight_squat", "box_squat"],
    "after": ["barbell_back_squat", "bulgarian_split_squat"]
  },
  
  "sets": {
    "default": { "sets": 3, "reps": 10, "rest": 60 },
    "beginner": { "sets": 2, "reps": 8, "rest": 90 },
    "advanced": { "sets": 4, "reps": 12, "rest": 45 }
  },
  
  "tags": ["beginner_friendly", "compound", "full_body", "functional"],
  
  "credits": 60,
  
  "lastUpdated": "2024-12-31"
}
```

### Benefits of Card-Based System

1. **Scalability** - Add 500+ exercises without code changes
2. **Maintainability** - Each card is independent, easy to debug
3. **Extensibility** - Add new fields without breaking existing cards
4. **Collaboration** - Non-developers can add/edit cards
5. **Reusability** - Same engine powers Student Life Hub, Senior Tech Skills
6. **Version Control** - Git tracks changes to individual cards

---

## 🎨 DESIGN SYSTEM & UX PRINCIPLES

### Core Design Principles

1. **Compassionate, Not Coddling** - Supportive without being patronizing
2. **Transparent** - Always explain why (builds trust with neurodivergent users)
3. **User Autonomy** - Suggest, don't dictate
4. **Evidence-Based** - Grounded in psychology research
5. **Accessible** - WCAG AAA compliance, screen reader support
6. **Mobile-First** - Touch targets >44px, thumb-zone optimization

### Color Psychology

```css
:root {
  /* Action & Health (Green) */
  --color-primary: #10B981;      /* Success, completion */
  --color-primary-dark: #059669;
  
  /* Logic & Planning (Blue) */
  --color-secondary: #3B82F6;    /* Neutral, information */
  --color-secondary-dark: #2563EB;
  
  /* Caution (Amber) */
  --color-warning: #F59E0B;      /* Warnings, conditions */
  
  /* Danger (Red) */
  --color-danger: #EF4444;       /* Blocked exercises, severe pain */
  
  /* Wisdom & Mind (Purple) */
  --color-wisdom: #8B5CF6;       /* Mental health, recovery mode */
  
  /* Neutral (Gray) */
  --color-neutral: #6B7280;      /* Disabled, secondary text */
  
  /* Background (Dark Mode) */
  --bg-primary: #111827;
  --bg-secondary: #1F2937;
  --bg-tertiary: #374151;
}
```

### Component Library

#### 1. Cards
- **Standard Card:** Exercises, meals, tips
- **Workout Option Card:** 3 daily options (Strength/Wellbeing/Cardio)
- **Rationale Card:** Transparent "Why This?" explanations
- **Progress Card:** Stats, streaks, achievements

#### 2. Forms
- **Dual Slider:** Energy & Mood (check-in)
- **Condition Rating:** Pain + Difficulty (dual sliders)
- **Multi-Select Grid:** Equipment, goals, conditions (tile-based)

#### 3. Navigation
- **Bottom Tab Bar:** Today / Check-In / Progress / Settings
- **Contextual Actions:** Floating action button for quick actions

---

## 🔐 PRIVACY & DATA HANDLING

### Current Approach (Phase 1)
- **Zero-server architecture:** All data in localStorage
- **No accounts:** No registration, email, or identifiers
- **Complete control:** User can export/delete data anytime
- **No tracking:** No analytics, no third-party scripts

**Rationale:** Neurodivergent users often have heightened privacy concerns. Zero-server eliminates data anxiety entirely.

### Future Approach (Phase 2 - Commercial)
When moving to subscription model:
- **Opt-in cloud sync:** Users choose to create account
- **End-to-end encryption:** User data encrypted at rest
- **Data portability:** Export to JSON anytime
- **Deletion:** One-click permanent deletion
- **Transparency:** Clear privacy policy, no dark patterns

---

## 📈 DEVELOPMENT ROADMAP

### Current Status: ~40% Complete

**✅ Completed (40%)**
- Store system with localStorage persistence
- Enhanced check-in (energy, mood, sleep, conditions)
- Onboarding flow (7 steps, 95% complete)
- Burnout detection algorithm
- Module loading architecture

**🚧 In Progress (20%)**
- Equipment selection (small bug, 95% done)
- Exercise database (30 exercises → need 150-200)

**⏳ Not Started (40%)**
- Active Coach reasoning engine (CRITICAL)
- Workout generation logic
- Rationale system
- Today view (workout display)
- Exercise execution UI
- Progress tracking & reports
- Meal logging
- Custom exercise logging (runs, cycling, swimming)
- Body metrics tracking

### Development Timeline

**Week 0 (Current):** Equipment bug fix
**Weeks 1-2:** Exercise database expansion (150-200 cards)
**Weeks 3-6:** Active Coach reasoning engine
**Weeks 7-8:** Today view + workout execution
**Week 9-10:** Progress tracking, reports, polish
**Week 11+:** Beta testing, revenue infrastructure

**MVP Ready:** ~10 weeks (March 2025)

---

## 💡 STRATEGIC CONTEXT

### Market Position

**Problem:** Traditional fitness apps fail neurodivergent users and people with complex life circumstances because they:
- Prescribe rigid programs that don't adapt
- Shame users for missing workouts (broken streaks)
- Ignore injuries and chronic conditions
- Use manipulative dark patterns (social comparison, FOMO)
- Assume unlimited time and energy

**Solution:** Alongside is fundamentally different:
- Adapts daily to user context (energy, mood, pain)
- Never punishes missed days
- Filters exercises by conditions for safety
- Transparent rationale builds trust
- Respects autonomy (suggests, doesn't dictate)

### Target Users

**Primary:** Neurodivergent adults (35-55) managing careers, families, chronic conditions
- ADHD (diagnosed or suspected)
- Anxiety, depression
- Chronic injuries (back, knee, shoulder)
- Executive function challenges
- History of failed fitness attempts

**Secondary:** Women managing hormonal changes
- Menstrual cycle tracking
- Perimenopause/menopause support
- Pregnancy & postpartum (future)

**Tertiary:** Anyone who traditional fitness culture has failed
- Busy parents
- Chronic illness
- Injury recovery
- Mental health challenges

### Revenue Model

**Phase 1 (Current):** Free, no accounts (build trust)
**Phase 2 (Q2 2025):** Freemium with premium subscription
- **Free:** Basic features, local-only storage
- **Premium:** £4.99/month or £49.99/year
  - Cloud sync
  - Advanced analytics
  - Custom workout builder
  - Meal planning (future)
  - Priority support

**Target:** 500-1000 paid users (£25K-50K/year)

**Phase 3 (Q3 2025):** Institutional licensing
- Weston College pilot (insider access)
- University mental health services
- Corporate wellness programs
- White-label licensing

---

## 🧬 TECHNICAL DEBT & FUTURE REFACTORING

### Known Issues

1. **Onboarding.js:** 1000+ lines, needs modularization
2. **Equipment bug:** Duplicate `toggleEquipment` function
3. **Exercise database:** Only 30 exercises (need 150-200)
4. **No backend:** Need payment infrastructure for subscriptions
5. **No analytics:** Can't measure user behavior (privacy trade-off)

### Refactoring Strategy

**Timing:** AFTER Active Coach is built (core differentiator first)

**Approach:**
1. Extract onboarding steps into `/js/modules/onboarding/steps/`
2. Convert exercise database to card-based system
3. Create component library for reusable UI elements
4. Add TypeScript for type safety (optional)
5. Implement automated testing (Jest)

---

## 📚 KEY REFERENCES & RESEARCH

### Psychological Frameworks

1. **Self-Determination Theory** (Deci & Ryan)
   - Autonomy, competence, relatedness
   - Intrinsic motivation over external pressure

2. **SOLO Taxonomy** (Biggs & Collis)
   - Scaffolded progression from simple to complex
   - Applied to exercise recommendations

3. **Mood Meter** (Marc Brackett, Yale RULER)
   - Two-dimensional emotional check-in
   - Energy × pleasantness scales

4. **Burnout Research** (Dr. Claire Plumbly)
   - *Burnout: How to Manage Your Nervous System Before It Manages You*
   - Yellow Kite 2024, ISBN 978-1-399-73342-7
   - Pattern detection for nervous system dysregulation

5. **Acceptance and Commitment Therapy** (ACT)
   - Psychological flexibility
   - Values-based action

### Neurodivergent Design Principles

1. **ADHD Considerations:**
   - Executive function support (minimal steps)
   - Immediate feedback (dopamine hits without exploitation)
   - Visual clarity (high contrast, clear hierarchy)
   - Transparent reasoning (need to understand "why")

2. **Autism Considerations:**
   - Predictable patterns (consistent UI)
   - No sudden changes (gentle transitions)
   - Clear language (no ambiguity)
   - Sensory-friendly design (no flashing, harsh colors)

3. **Anxiety Considerations:**
   - No pressure or urgency (no timers, deadlines)
   - User control (pause, skip, exit anytime)
   - Reassurance (validating language)
   - No social comparison (private, personal)

---

## 🎯 SUCCESS METRICS

### User Engagement (Compassionate Tracking)
- **Daily check-in completion rate** (NOT streak pressure)
- **Workout completion rate** (celebrate any movement)
- **Feature usage** (which workouts most popular?)
- **Time to first workout** (onboarding friction)

### Health Outcomes (Self-Reported)
- **Energy trends** (7-day rolling average)
- **Mood trends** (pattern detection)
- **Condition improvements** (pain/difficulty over time)
- **Goal progress** (weight, strength, wellbeing)

### Business Metrics (Future)
- **User retention** (30-day, 90-day)
- **Premium conversion rate**
- **Monthly recurring revenue (MRR)**
- **Churn rate**
- **Customer lifetime value (LTV)**

---

## 🚨 CRITICAL REMINDERS FOR FUTURE DEVELOPERS

1. **Psychological Safety First** - This app must never shame or punish users
2. **Transparent Rationale** - Always explain why (builds trust with ADHD users)
3. **Condition Safety** - NEVER recommend exercises that could cause injury
4. **User Autonomy** - Suggest, don't dictate (respect user agency)
5. **Evidence-Based** - Decisions grounded in research, not assumptions
6. **Compassionate Language** - "Exhausted - rest is the priority" not "You failed"
7. **No Dark Patterns** - No streak pressure, FOMO, social comparison
8. **Accessibility** - WCAG AAA, screen reader support, high contrast
9. **Privacy-First** - Minimize data collection, maximize user control
10. **Modular Design** - Card-based system for scalability

---

## 📞 CONTACT & HANDOFF

**Developer:** Graeme Wright  
**Role:** Digital Coach, Weston College  
**Background:** 18 years teaching, Instructional Design, CMI Level 5 Operational Management  
**Project Status:** Personal prototype with commercial licensing potential  
**Live Demo:** https://build-new-habits.github.io/alongside/

**For Future Claude Sessions:**
This document captures the complete technical architecture and psychological design principles. Refer to this document before making ANY changes to the codebase to ensure alignment with the core vision: **compassionate, adaptive fitness coaching for neurodivergent adults.**

---

**Document Version:** 3.0  
**Last Updated:** December 31, 2025  
**Next Review:** After Active Coach completion (March 2025)

---

*End of Technical Architecture Specification*
