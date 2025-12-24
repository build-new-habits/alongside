# Fix for checkin-enhanced.js - Bug #3: Condition Names Show "undefined"

## THE PROBLEM
**Line 329:** `${condition.name}` 
- Stored conditions don't have a `name` property
- They only have: `id`, `area`, `severity`, `type`

## THE FIX
Add the CONDITIONS array at the top of the file, then look up names by ID.

---

## STEP 1: Add CONDITIONS array after imports (around line 6)

```javascript
import { store } from '../store.js';

// CONDITIONS array - matches onboarding.js
const CONDITIONS = [
  { id: 'lower-back', name: 'Lower Back', icon: '🔙', area: 'back' },
  { id: 'upper-back', name: 'Upper Back', icon: '🔙', area: 'back' },
  { id: 'neck', name: 'Neck', icon: '🧣', area: 'neck' },
  { id: 'shoulder', name: 'Shoulder', icon: '💪', area: 'shoulder' },
  { id: 'elbow', name: 'Elbow', icon: '💪', area: 'elbow' },
  { id: 'wrist', name: 'Wrist', icon: '✋', area: 'wrist' },
  { id: 'hip', name: 'Hip', icon: '🦴', area: 'hip' },
  { id: 'knee', name: 'Knee', icon: '🦵', area: 'knee' },
  { id: 'ankle', name: 'Ankle', icon: '🦶', area: 'ankle' },
  { id: 'hamstring', name: 'Hamstring', icon: '🦵', area: 'hamstring' },
  { id: 'calf', name: 'Calf', icon: '🦵', area: 'calf' },
  { id: 'shin', name: 'Shin Splints', icon: '🦵', area: 'shin' },
  { id: 'foot', name: 'Foot / Plantar', icon: '🦶', area: 'foot' }
];
```

---

## STEP 2: Replace renderConditionsSection() function (around line 316)

**FIND THIS:**
```javascript
function renderConditionsSection() {
  const conditions = store.get('profile.conditions') || [];
  
  return `
    <div class="checkin__section">
      <div class="checkin__section-header">
        <span class="checkin__section-icon">🩹</span>
        <h2 class="checkin__section-title">How are your conditions today?</h2>
      </div>
      
      ${conditions.map(condition => `
        <div class="checkin__condition" data-condition-id="${condition.id}">
          <div class="checkin__condition-header">
            <span class="checkin__condition-name">${condition.name}</span>  <-- BUG HERE
            <span class="checkin__condition-area">${formatArea(condition.area)}</span>
          </div>
```

**REPLACE WITH THIS:**
```javascript
function renderConditionsSection() {
  const conditions = store.get('profile.conditions') || [];
  
  return `
    <div class="checkin__section">
      <div class="checkin__section-header">
        <span class="checkin__section-icon">🩹</span>
        <h2 class="checkin__section-title">How are your conditions today?</h2>
      </div>
      
      ${conditions.map(condition => {
        // FIX: Look up the condition name from CONDITIONS array
        const conditionInfo = CONDITIONS.find(c => c.id === condition.id);
        const conditionName = conditionInfo?.name || condition.id;
        const conditionIcon = conditionInfo?.icon || '🩹';
        
        return `
        <div class="checkin__condition" data-condition-id="${condition.id}">
          <div class="checkin__condition-header">
            <span class="checkin__condition-icon">${conditionIcon}</span>
            <span class="checkin__condition-name">${conditionName}</span>
            <span class="checkin__condition-area">${formatArea(condition.area)}</span>
          </div>
```

---

## SUMMARY

**What changed:**
1. Added CONDITIONS array at top of file (same as onboarding.js)
2. In `renderConditionsSection()`, look up each condition's name using:
   ```javascript
   const conditionInfo = CONDITIONS.find(c => c.id === condition.id);
   const conditionName = conditionInfo?.name || condition.id;
   ```

**Result:**
- "Lower Back" instead of "undefined"
- "Hamstring" instead of "undefined"

This fix works because:
- Onboarding saves: `{ id: 'lower-back', area: 'back', severity: 5, type: 'chronic' }`
- Check-in looks up: `CONDITIONS.find(c => c.id === 'lower-back')` → gets `{ id: 'lower-back', name: 'Lower Back', ... }`
- Displays: "Lower Back" ✅
