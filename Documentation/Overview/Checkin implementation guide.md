# Enhanced Daily Check-In - Implementation Guide

## ✅ What's Been Built

### New Check-In Features

1. **Sleep Tracking**
   - Hours slider (4-11+ hours)
   - Quality slider (1-10) with descriptive labels
   - "Terrible - barely slept" → "Perfect - refreshed"

2. **Hydration Tracking**
   - Yesterday's water intake (0-12+ glasses)
   - Simple slider interface

3. **Energy & Mood** (Enhanced)
   - Compassionate descriptive labels
   - Energy: "Exhausted - rest is priority" → "Peak energy - make it count!"
   - Mood: "Really struggling - be gentle" → "Amazing - thriving!"

4. **Menstrual Tracking** (Conditional - Female users who opted in)
   - "Are you menstruating today?" Yes/No
   - If Yes → "How is it affecting you?" None/Light/Moderate/Heavy
   - Smart branching - only shows if relevant

5. **Conditions Update** (Conditional - Users with existing conditions)
   - Shows only active conditions from profile
   - Pain slider (0-10)
   - Difficulty slider (0-10)
   - Daily updates for accurate filtering

6. **Coaching Intensity Selector** ⭐ NEW
   - 🌱 **Gentle:** "Listen to my body, prioritize recovery"
   - 💪 **Moderate:** "Balanced approach with gentle nudges"
   - 🔥 **Aggressive:** "Push me! Keep me accountable"
   - User chooses DAILY how hard the coach should push

## 📊 Data Structure

### What Gets Saved
```javascript
{
  date: '2024-12-23',
  
  // Physical state
  sleepHours: 7,
  sleepQuality: 6,
  hydration: 4,
  energy: 7,
  mood: 6,
  
  // Menstrual (if applicable)
  menstruating: false,
  menstrualImpact: null, // or 'none'/'light'/'moderate'/'heavy'
  
  // Conditions (if any)
  conditions: [
    { id: 'lower_back_chronic', pain: 3, difficulty: 2 }
  ],
  
  // Coaching preference TODAY
  coachingIntensity: 'moderate', // 'gentle' | 'moderate' | 'aggressive'
  
  completed: true
}
```

### Historical Tracking
Check-in data is stored in `checkinHistory` array:
```javascript
{
  checkinHistory: [
    { date: '2024-12-16', energy: 5, mood: 6, ... },
    { date: '2024-12-17', energy: 4, mood: 5, ... },
    { date: '2024-12-18', energy: 3, mood: 4, ... },
    // Last 90 days
  ]
}
```

## 🧠 Burnout Detection

The system automatically detects burnout patterns:

**Triggers:**
- 3+ consecutive days with energy ≤ 3
- Rolling 7-day average energy < 4
- Combined low energy (≤4) AND low mood (≤4) for 3+ days

**Response:**
```javascript
if (burnoutDetected) {
  store.set('burnoutDetected', true);
  // Coach will override plan and show only recovery options
  // Message: "You've been running low. Your wellbeing matters more than the goal right now."
}
```

## 🎯 How Coach Uses This Data

### Energy Level → Exercise Filtering
```javascript
if (energy <= 3) {
  // Show only: Breathing, Gentle Walk, Cat-Cow, Child's Pose
  energyLevel = 'low';
}
else if (energy <= 6) {
  // Show: Bodyweight work, Stability, Light cardio
  energyLevel = 'medium';
}
else {
  // Show: Full intensity, Strength, HIIT, Sports
  energyLevel = 'high';
}
```

### Coaching Intensity → Tone & Options

**Gentle (🌱) + Low Energy:**
```
Coach: "You're running low and asked for gentle coaching. 
Let's focus purely on restoration today. No pressure."

Options shown: ONLY Wellbeing
```

**Moderate (💪) + Low Energy:**
```
Coach: "Your energy is low (3/10). I'm giving you options, 
but wellbeing is probably the right call today."

Options shown: All 3, but Wellbeing STRONGLY recommended
```

**Aggressive (🔥) + Low Energy:**
```
Coach: "You asked me to push you, but your energy is very low. 
I'll show you options, but please listen to your body."

Options shown: All 3, with warnings about low energy
```

### Sleep Quality → Recovery Recommendations

```javascript
if (sleepHours < 6 || sleepQuality <= 3) {
  coachNote = "Poor sleep affects recovery. Consider lighter work today.";
  // Deprioritize high-intensity options
}

if (sleepHours >= 8 && sleepQuality >= 7) {
  coachNote = "Well-rested! Your body is ready for solid work.";
  // Prioritize challenging options
}
```

### Menstrual Impact → Intensity Adjustment

```javascript
if (menstruating && menstrualImpact === 'heavy') {
  coachNote = "Your body is working hard right now. Let's keep intensity moderate.";
  // Filter out high-impact exercises
  // Prioritize strength over cardio
}

if (menstruating && menstrualImpact === 'none') {
  // No adjustment needed
  coachNote = "Feeling good despite your cycle. Great!";
}
```

### Conditions → Exercise Blocking

```javascript
if (condition.pain >= 8) {
  // BLOCK all exercises affecting that area
  message = "Resting your lower back (pain: 8/10)";
}

if (condition.pain >= 5 && condition.pain < 8) {
  // CAUTION - show exercises with warning
  message = "Being gentle with your lower back (pain: 6/10)";
}
```

## 🔄 Integration with App Flow

### Updated app.js
```javascript
// In showCheckin()
import { checkin } from './modules/checkin-enhanced.js';

function showCheckin() {
  const main = document.getElementById('main');
  main.innerHTML = checkin.render();
  checkin.init();
}

// Global functions
window.alongside = {
  ...window.alongside,
  selectMenstrual: checkin.selectMenstrual,
  selectMenstrualImpact: checkin.selectMenstrualImpact,
  selectCoachingIntensity: checkin.selectCoachingIntensity,
  submitCheckin: checkin.submitCheckin
};
```

### Updated store.js
Make sure store has:
```javascript
{
  profile: {
    gender: 'female', // or 'male' / 'non-binary'
    menstrualTracking: true, // opt-in during onboarding
    conditions: [
      {
        id: 'lower_back_chronic',
        name: 'Chronic Lower Back',
        area: 'lower_back',
        type: 'chronic'
      }
    ]
  },
  
  checkin: {
    date: 'Mon Dec 23 2024',
    sleepHours: 7,
    sleepQuality: 6,
    // ... rest of check-in data
    completed: true
  },
  
  checkinHistory: [
    // Last 90 days of check-ins
  ],
  
  burnoutDetected: false
}
```

## 🎨 Visual Flow

```
┌─────────────────────────────────────┐
│  😴 HOW DID YOU SLEEP?              │
│  ────────────────────────────────   │
│  Sleep Hours:     [====•====] 7h    │
│  Sleep Quality:   [===•=====] 6/10  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  💧 YESTERDAY'S HYDRATION           │
│  ────────────────────────────────   │
│  Water Intake:    [===•=====] 4     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ⚡ HOW ARE YOU FEELING?            │
│  ────────────────────────────────   │
│  Energy:  [=====•===] 7/10          │
│  Strong - feeling capable            │
│                                      │
│  Mood:    [====•====] 6/10          │
│  Pretty good - stable                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🌸 MENSTRUAL CYCLE                 │
│  ────────────────────────────────   │
│  Are you menstruating today?         │
│  [ No ]  [ Yes ]                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🎯 HOW HARD SHOULD I PUSH YOU?     │
│  ────────────────────────────────   │
│  ┌─────────────────────────────┐   │
│  │ 🌱 Gentle                   │   │
│  │ Listen to my body,          │   │
│  │ prioritize recovery         │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 💪 Moderate         [SELECTED] │
│  │ Balanced approach with      │   │
│  │ gentle nudges               │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 🔥 Aggressive               │   │
│  │ Push me! Keep me            │   │
│  │ accountable                 │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  [  Continue to Today's Plan  ]     │
└─────────────────────────────────────┘
```

## 🚀 Next Steps

With this enhanced check-in complete, the Coach now has rich data to make intelligent decisions:

1. ✅ Sleep quality → Recovery needs
2. ✅ Hydration → Physical readiness
3. ✅ Energy/Mood → Intensity matching
4. ✅ Menstrual status → Cycle-aware coaching
5. ✅ Conditions → Safe exercise filtering
6. ✅ Coaching intensity → Tone & push level

**Next:** Build the 3-Option Workout System that uses this data intelligently.

## 📦 Files to Replace

1. `/js/modules/checkin.js` → Replace with `checkin-enhanced.js`
2. `/css/checkin.css` → Replace with `checkin-enhanced.css`
3. Update `/js/app.js` to import new functions

Ready to test! 🌱
