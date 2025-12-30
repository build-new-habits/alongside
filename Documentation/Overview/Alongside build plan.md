# Alongside: Complete Build Plan
## "The Living Coach" - Version 1.0

---

## 🎯 VISION SUMMARY

Alongside is a compassionate AI coach that behaves like a **real personal trainer**:
- Understands your goal and target date
- Creates a periodized training plan (Base → Build → Peak → Taper)
- Adapts daily based on your energy, mood, life circumstances
- Tracks progress and adjusts the plan when needed
- Asks smart questions: "While your child swims, could you exercise?"
- Pushes when you need it, backs off when you don't

**Core Philosophy:** Neurodivergent-first, women-inclusive, evidence-based, compassionate.

---

## 🏗️ BUILD PHASES

### ✅ PHASE 1: FOUNDATION (COMPLETE)
- Basic onboarding
- Daily check-in (energy/mood)
- Exercise library (35+ exercises)
- Credit system with duplicate prevention
- Card-based UI

### 🚀 PHASE 2A: THE SMART COACH (CURRENT - 2 WEEKS)
**Priority 1:** Get the coaching intelligence working

#### Week 1: Enhanced Daily Check-In + 3-Option System
**Days 1-2: Rebuild Daily Check-In**
```javascript
// New check-in structure
{
  date: '2024-12-23',
  
  // Physical State
  sleepHours: 7,           // Slider: 4-10+ hours
  sleepQuality: 6,         // Slider: 1-10
  hydration: 6,            // Slider: 0-8 glasses (yesterday)
  energy: 5,               // Slider: 1-10
  mood: 6,                 // Slider: 1-10
  
  // Conditions (if any)
  conditions: [
    { area: 'lower_back', pain: 3, difficulty: 2 }
  ],
  
  // Menstrual cycle (if opted in)
  menstruating: false,     // Yes/No branch
  cycleImpact: null,       // "Heavy/Moderate/Light/None" if yes
  
  // Coaching aggression TODAY
  coachingIntensity: 'moderate', // 'gentle' | 'moderate' | 'aggressive'
  
  // Smart context questions
  opportunitySlots: [
    {
      context: 'kids_swimming',
      duration: 45,
      exerciseType: 'cardio' // user selected
    }
  ]
}
```

**Check-In Flow (Branching):**
1. "Good morning! How did you sleep?" → Hours + Quality sliders
2. "How much water did you drink yesterday?" → Hydration slider
3. "How's your energy today?" → Energy slider (1-10)
4. "How's your mood?" → Mood slider (1-10)
5. **[BRANCH: If female + opted in]** "Are you menstruating?" → Yes/No
   - If Yes: "How is it affecting you?" → Heavy/Moderate/Light/None
6. **[BRANCH: If conditions exist]** "Any pain or difficulty today?"
   - Show only active conditions, quick severity update
7. **[NEW]** "How hard should I push you today?"
   - 🌱 Gentle: "Listen to my body, prioritize recovery"
   - 💪 Moderate: "Balanced - I'll do what feels right"
   - 🔥 Aggressive: "Push me! I want to work hard today"
8. **[SMART CONTEXT]** "I see Thursday is your child's swimming lesson (4-5pm). Could you exercise during that time?"
   - Yes → "What type of exercise works? (Gym nearby / Walk / Bodyweight circuit)"
   - No → Store this in schedule as unavailable time

**Days 3-5: Build 3-Option System**

Each day presents **THREE complete workout options:**

```markdown
## 🏋️ OPTION A: STRENGTH
**Goal Alignment:** Building posterior chain strength for your parkrun goal

**WARM-UP (5-10min)**
• Cat-Cow Stretch - 2min
• Hip Circles - 2min  
• Dynamic leg swings - 3min

**MAIN SET (20-25min)**
• Glute Bridge - 3x15 reps
• Single-leg Romanian Deadlift - 3x10 each
• Bulgarian Split Squat - 3x12 each
• Plank Hold - 3x45sec

**COOL-DOWN (5min)**
• Hamstring stretch - 2min
• Hip flexor stretch - 2min
• Deep breathing - 1min

⏱️ Total: 35min | ⭐ 120 credits
```

```markdown
## 🧘 OPTION B: WELLBEING
**Coach Note:** You've pushed hard this week. Recovery protects progress.

**BREATHWORK (5min)**
• Box Breathing - 8 cycles
• Body scan meditation

**GENTLE MOVEMENT (15min)**
• Cat-Cow flow - 5min
• Child's pose - 3min
• Gentle spinal twists - 4min
• Hip openers - 3min

**RELAXATION (5min)**
• Progressive muscle relaxation
• Gratitude reflection

⏱️ Total: 25min | ⭐ 60 credits
```

```markdown
## 🏃 OPTION C: CARDIO (RECOMMENDED ⭐)
**Goal Alignment:** Zone 2 running builds aerobic base essential for endurance

**WARM-UP (5min)**
• Dynamic stretches
• Leg swings, arm circles

**MAIN EFFORT (25min)**
Choose one:
• Easy 3km run (conversational pace)
• 20min bodyweight cardio circuit:
  - High knees - 1min
  - Mountain climbers - 1min
  - Jumping jacks - 1min
  - Rest - 1min
  - Repeat 5x

**COOL-DOWN (5min)**
• Walk 2min
• Light stretching

⏱️ Total: 35min | ⭐ 100 credits

---

💡 **COACH'S RECOMMENDATION: Option C**

"You've recovered well from Monday's strength session. Your energy is good (7/10) and mood is solid (6/10). 

We need 2 cardio sessions this week to stay on track for your March parkrun goal, and you've only done 1 so far. Tomorrow is busy with the school run and evening commitments, so today is ideal for cardio.

However, you selected 'Moderate' coaching today, so if you're not feeling it, Option B (Wellbeing) is perfectly valid. Trust your body."

**Progress Update:** Week 4 of 12 | On track 🎯
```

**Days 6-7: Adaptive Logic Engine**

```javascript
// Tracks user patterns and adjusts recommendations
const adaptiveState = {
  // Recent history
  last7Days: [
    { date: '2024-12-17', choice: 'strength', completed: true },
    { date: '2024-12-18', choice: 'cardio', completed: true },
    { date: '2024-12-19', choice: 'wellbeing', completed: true },
    { date: '2024-12-20', choice: 'wellbeing', completed: true },
    { date: '2024-12-21', choice: 'wellbeing', completed: true },
    { date: '2024-12-22', choice: 'rest', completed: true }
  ],
  
  // Pattern detection
  consecutiveWellbeingDays: 3,
  consecutiveRestDays: 0,
  weeklyCardioCount: 1,
  weeklyStrengthCount: 1,
  
  // Goal requirements (from periodized plan)
  weeklyCardioTarget: 2,
  weeklyStrengthTarget: 2,
  
  // Smart adjustments
  shouldNudgeCardio: true,
  nudgeReason: "Only 1/2 cardio sessions completed this week",
  allowanceForWellbeing: 1, // Can choose wellbeing 1 more time this week
  
  // Burnout detection
  avgEnergyLast7Days: 4.2,
  avgMoodLast7Days: 5.1,
  burnoutRisk: 'low' // low | moderate | high
};
```

**Adaptive Coach Messages:**
- 3+ wellbeing days: "I've noticed you've been prioritizing recovery. That's wise—your body needed it. If you're feeling better today, let's consider some movement."
- Behind on cardio: "To stay on track for your March goal, we need 2 cardio sessions this week. You've done 1. Today's a good opportunity."
- Burnout detected: "You've been running low for several days. Your goal matters, but your wellbeing matters more right now. Let's focus on gentle movement."

#### Week 2: Goal Engine + Periodization

**Days 8-10: Enhanced Onboarding**

New onboarding captures:

**Section 1: About You**
- Name
- Age (number)
- Gender: Male / Female / Non-binary / Prefer not to say
- **[BRANCH if Female]:** "Would you like to track your menstrual cycle?" Yes/No
  - "This helps me adjust intensity recommendations based on your cycle."

**Section 2: Your Goal**
- "What do you want to achieve?"
  - Run a 5K
  - Run a 10K  
  - Half marathon
  - Marathon
  - Build strength
  - Lose weight
  - General fitness
  - Rehab from injury
  - Play with grandkids
  - Custom: [text input]

- "Be specific. Instead of 'get fit', try 'Run Yeovil parkrun in under 30 minutes'"
  - Goal text: [input]

- "When do you want to achieve this by?"
  - Target date: [date picker]
  - "No deadline" option

- **[OPTIONAL]** "Want to do a baseline fitness test?"
  - If parkrun goal: "Do a timed 5K this week"
  - If strength: "Test your max push-ups/squats"
  - Skip for now

**Section 3: Your Week**
- "When can you realistically exercise?"
  - Mon-Sun grid
  - For each day: Available? Yes/No
  - If Yes: What times? [morning/lunch/afternoon/evening]
  - Duration available? [15min/30min/45min/60min]

- **[SMART QUESTIONS]**
  - "Do you have any regular commitments?" (e.g., kids' activities)
  - Example: "Thursdays 4-5pm - Kids swimming"
    - "Could you exercise during this time?" Yes/No
    - "What would work?" Gym nearby / Walk / Bodyweight

**Section 4: Current State**
- Conditions (existing flow)
- Equipment available
- Current fitness level (beginner/intermediate/advanced)

**Section 5: Coaching Style**
- "How should I coach you by default?"
  - 🌱 Gentle: "Encouraging, never pushy. Lots of recovery options."
  - 💪 Balanced: "Supportive with gentle nudges toward the goal."
  - 🔥 Driven: "Keep me accountable. Push me when I need it."
  - Note: "You can change this anytime, including daily."

**Days 11-12: Periodization Engine**

```javascript
// Goal: Run 5K in under 30min by March 15, 2025
// Current: 35min baseline (from test or estimate)
// Weeks available: 12

const periodizedPlan = {
  goal: {
    type: 'parkrun_5k',
    targetMetric: { time: '30:00' },
    baselineMetric: { time: '35:30' },
    targetDate: '2025-03-15',
    weeksAvailable: 12
  },
  
  phases: [
    {
      name: 'Base Building',
      weeks: [1, 2, 3, 4],
      focus: 'Aerobic base + movement quality',
      weeklyStructure: {
        cardio: 2,      // Easy runs, Zone 2
        strength: 2,    // Posterior chain, stability
        wellbeing: 1,   // Active recovery
        rest: 2
      },
      keyWorkouts: [
        { day: 'tuesday', type: 'easy_run', duration: '20min', intensity: 'zone2' },
        { day: 'thursday', type: 'strength', focus: 'posterior_chain' },
        { day: 'saturday', type: 'long_run', duration: '25min', intensity: 'zone2' }
      ]
    },
    {
      name: 'Build Phase',
      weeks: [5, 6, 7, 8],
      focus: 'Add intensity + volume',
      weeklyStructure: {
        cardio: 3,
        strength: 2,
        wellbeing: 1,
        rest: 1
      },
      keyWorkouts: [
        { day: 'tuesday', type: 'interval_run', duration: '25min', intensity: 'mixed' },
        { day: 'thursday', type: 'easy_run', duration: '30min', intensity: 'zone2' },
        { day: 'saturday', type: 'long_run', duration: '35min', intensity: 'zone2' }
      ]
    },
    {
      name: 'Peak Phase',
      weeks: [9, 10],
      focus: 'Race-specific efforts',
      weeklyStructure: {
        cardio: 3,
        strength: 1,
        wellbeing: 1,
        rest: 2
      },
      keyWorkouts: [
        { day: 'tuesday', type: 'tempo_run', duration: '20min', intensity: 'threshold' },
        { day: 'saturday', type: 'race_pace_run', duration: '25min', intensity: 'race_pace' }
      ]
    },
    {
      name: 'Taper',
      weeks: [11, 12],
      focus: 'Reduce volume, maintain intensity',
      weeklyStructure: {
        cardio: 2,
        strength: 1,
        wellbeing: 2,
        rest: 2
      },
      keyWorkouts: [
        { day: 'tuesday', type: 'short_intervals', duration: '15min', intensity: 'mixed' },
        { day: 'saturday', type: 'shakeout_run', duration: '15min', intensity: 'easy' }
      ]
    }
  ],
  
  currentWeek: 4,
  currentPhase: 'Base Building',
  progressStatus: 'on_track' // on_track | ahead | behind | needs_adjustment
};
```

**Days 13-14: Progress Tracking Dashboard**

Visual progress view:
- Weight chart (if goal involves weight)
- Estimated current 5K time (based on recent workouts)
- Weekly compliance: "3/4 workouts completed"
- Phase progression: "Week 4 of 12 - Base Building"
- Milestone alerts: "Halfway to your goal! 🎉"

---

### 🏃 PHASE 2B: ACTIVITY TRACKING (WEEK 3-4)

**External Activity Logger:**

User completes a run outside the app:
```javascript
{
  date: '2024-12-23',
  activityType: 'run',
  distance: 5.2,
  distanceUnit: 'km',
  duration: 32, // minutes
  caloriesBurned: 450, // optional
  
  // Auto-calculated
  averagePace: '6:09/km',
  averageSpeed: '9.75 km/h',
  
  // User feeling
  perceivedEffort: 7, // 1-10
  notes: 'Felt good, slightly faster than usual'
}
```

**Supported Activities:**
- Run, Walk, Cycle, Swim, Gym session
- Sports: Tennis, Squash, Badminton, Football, Rugby, Hockey, Netball, Cricket, Bowls, Rounders
- Other: Yoga class, Pilates, Dance

**Coach Response:**
"Great 5K run yesterday! That pace is improving—you're trending toward your goal. I've adjusted today's plan to include more recovery since you pushed hard."

---

### 🍽️ PHASE 3: NUTRITION & LIFE INTEGRATION (WEEK 5-8)

**Meal Tracking:**
- Log meals with ingredients
- Auto-calculate calories + macros
- Dietary warnings: "Low protein this week" for vegetarians
- Nutrient recommendations based on training phase

**Weekly Planning View:**
- Calendar showing planned workouts + life commitments
- Drag-and-drop workout scheduling
- Smart suggestions: "Thursday 4-5pm is free while kids swim—perfect for gym session"

**Comprehensive Analysis:**
- Weekly review: "3/4 workouts, 2400 avg calories, good sleep"
- Monthly summary: "Improved 5K pace by 45sec, lost 2kg"
- Goal milestone review: "6 weeks until parkrun—on track!"

---

## 📊 DATA STRUCTURES

### User Profile
```javascript
{
  profile: {
    name: 'Graeme',
    age: 45,
    gender: 'male',
    
    // Life context
    lifeStage: {
      caringForChildren: true,
      childAges: [8, 10],
      shiftWork: false
    },
    
    // Female-specific (optional)
    menstrualTracking: false,
    
    // Neurodivergent support
    adhd: true,
    needsExecutiveFunctionSupport: true
  },
  
  goal: {
    type: 'parkrun_5k',
    description: 'Run Yeovil parkrun in under 30 minutes',
    targetDate: '2025-03-15',
    baseline: { time: '35:30', date: '2024-12-10' },
    current: { time: '34:15', date: '2024-12-20' }
  },
  
  weeklySchedule: {
    monday: { available: true, times: ['morning'], duration: 30 },
    tuesday: { available: true, times: ['evening'], duration: 45 },
    wednesday: { available: false },
    thursday: { 
      available: true, 
      times: ['afternoon'], 
      duration: 45,
      context: 'Kids swimming 4-5pm - gym nearby'
    },
    friday: { available: true, times: ['morning'], duration: 30 },
    saturday: { available: true, times: ['morning'], duration: 60 },
    sunday: { available: true, times: ['morning'], duration: 60 }
  },
  
  coachingPreferences: {
    defaultIntensity: 'balanced', // gentle | balanced | driven
    currentPhase: 'base_building',
    pushWhenBehind: true
  },
  
  conditions: [
    {
      id: 'lower_back_chronic',
      area: 'lower_back',
      type: 'chronic',
      severity: 3,
      lastUpdated: '2024-12-23'
    }
  ]
}
```

### Daily Check-In
```javascript
{
  date: '2024-12-23',
  physical: {
    sleepHours: 7,
    sleepQuality: 6,
    hydration: 6,
    energy: 7,
    mood: 6
  },
  menstrual: {
    menstruating: false,
    impact: null
  },
  conditions: [
    { area: 'lower_back', pain: 3, difficulty: 2 }
  ],
  coaching: {
    intensityToday: 'moderate'
  },
  opportunitySlots: []
}
```

### Workout History
```javascript
{
  date: '2024-12-23',
  planned: {
    option: 'cardio',
    exercises: [...],
    estimatedDuration: 35,
    estimatedCredits: 100
  },
  completed: {
    option: 'cardio',
    exercises: [
      { id: 'dynamic-warmup', completed: true, credits: 20 },
      { id: 'easy-run-3k', completed: true, credits: 80, actual: { distance: 3.2, time: 21 } }
    ],
    totalCredits: 100,
    totalDuration: 32
  },
  coachFeedback: "Solid cardio session! Pace is improving."
}
```

---

## 🎯 IMMEDIATE NEXT STEPS (This Week)

### Day 1-2: Enhanced Check-In
1. Add sleep hours/quality sliders
2. Add hydration slider (yesterday)
3. Add coaching intensity selector
4. Add menstrual tracking branch (if opted in)
5. Add smart context questions

### Day 3-5: 3-Option System
1. Build option card UI
2. Create strength/wellbeing/cardio templates
3. Add warm-up/cool-down structure
4. Implement coach recommendation logic

### Day 6-7: Adaptive Logic
1. Track user choice history
2. Detect patterns (consecutive wellbeing days)
3. Generate contextual coach messages
4. Build burnout override

---

## ✅ SUCCESS CRITERIA

User should feel:
- "This coach knows me"
- "The plan makes sense"
- "I'm making progress toward my goal"
- "I'm supported, not judged"
- "The recommendations are smart and contextual"

---

## 📝 NOTES FROM GRAEME

1. ✅ Check-in asks about coaching intensity daily
2. ✅ Check-in tracks sleep + hydration
3. ✅ Coach asks smart contextual questions ("While your child swims...")
4. ✅ Periodization (Base → Build → Peak → Taper)
5. ✅ Menstrual tracking opt-in for females
6. ✅ External activity tracking with auto-calculation
7. ✅ Progress analysis (weekly/monthly/goal)
8. ✅ Burnout detection overrides plan
9. ✅ Coach explains "why" for every recommendation

---

**Ready to build. Starting with Days 1-2: Enhanced Check-In.**
