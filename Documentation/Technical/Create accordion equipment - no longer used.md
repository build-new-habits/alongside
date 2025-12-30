# Implementation Guide: Accordion Equipment System

## 🎯 Overview
Replace the multi-screen equipment flow with a single-page accordion system.

## Step 1: Replace EQUIPMENT with EQUIPMENT_CATEGORIES

**Location:** Around line 30 in onboarding.js

**DELETE:**
```javascript
const EQUIPMENT = [
  { id: 'none', name: 'No equipment', icon: '🏠', description: 'Bodyweight only' },
  // ... all the flat equipment items
];
```

**REPLACE WITH:** See equipment-categories-data.js file

## Step 2: Add State Variables

**Location:** After `const TOTAL_STEPS = 7;` (around line 104)

**ADD:**
```javascript
// Equipment accordion state
let expandedCategories = []; // Track which categories are open: ['weights', 'cardio']
```

## Step 3: Update onboardingData

**Location:** Around line 110

**ADD equipmentOther field:**
```javascript
let onboardingData = {
  name: '',
  age: null,
  gender: null,
  menstrualTracking: false,
  weight: null,
  goalWeight: null,
  weightUnit: 'kg',
  conditions: [],
  conditionType: 'chronic',
  declarations: [],
  declarationNotes: '',
  equipment: ['none'],
  equipmentOther: '',  // ADD THIS
  goals: []
};
```

## Step 4: Update start() function

**Location:** Around line 130

**ADD expandedCategories reset:**
```javascript
function start() {
  currentStep = 1;
  expandedCategories = [];  // ADD THIS
  onboardingData = {
    // ... existing fields ...
    equipmentOther: '',  // ADD THIS
  };
  renderCurrentStep();
}
```

## Step 5: Replace renderEquipment() with renderEquipmentAccordion()

**DELETE:** The entire `renderEquipment()` function

**REPLACE WITH:** See equipment-accordion-render.js file

## Step 6: Add Equipment Functions

**ADD these new functions:** See equipment-accordion-functions.js file

## Step 7: Update renderCoachSummary()

**Location:** Around line 850

**FIND the equipment section:**
```javascript
// Equipment
if (equipment.length > 0) {
  const equipNames = equipment.map(e => {
    const info = EQUIPMENT.find(eq => eq.id === e);  // OLD
    return info?.name || e;
  });
```

**REPLACE WITH:**
```javascript
// Equipment
if (equipment.length > 0) {
  const equipNames = equipment.map(e => {
    // Search through all categories
    let itemName = e;
    EQUIPMENT_CATEGORIES.forEach(category => {
      const item = category.items.find(item => item.id === e);
      if (item) itemName = item.name;
    });
    return itemName;
  });
```

## Step 8: Update completeOnboarding()

**Location:** Around line 900

**ADD:**
```javascript
store.set('profile.equipment', onboardingData.equipment);
store.set('profile.equipmentOther', onboardingData.equipmentOther);  // ADD THIS
```

## Step 9: Update exports

**Location:** Around line 950

**ADD to exports:**
```javascript
export const onboarding = {
  // ... existing exports ...
  
  // NEW: Accordion functions
  toggleCategoryExpanded,
  doneWithCategory,
  noneInCategory,
  toggleEquipmentItem,
  toggleNoEquipment,
  
  // ... rest of exports ...
  EQUIPMENT_CATEGORIES,  // CHANGED from EQUIPMENT
};
```

## Step 10: Update app.js

**ADD to window.alongside:**
```javascript
window.alongside = {
  // ... existing ...
  
  // Equipment accordion
  toggleCategoryExpanded: onboarding.toggleCategoryExpanded,
  doneWithCategory: onboarding.doneWithCategory,
  noneInCategory: onboarding.noneInCategory,
  toggleEquipmentItem: onboarding.toggleEquipmentItem,
  
  // ... rest ...
};
```

## Step 11: Add CSS

**Create or update:** `/css/equipment-accordion.css`

**See:** equipment-accordion.css file

**Add to index.html:**
```html
<link rel="stylesheet" href="css/equipment-accordion.css">
```

## Files Provided:
1. equipment-categories-data.js - Category structure
2. equipment-accordion-render.js - Render function
3. equipment-accordion-functions.js - All handler functions  
4. equipment-accordion.css - Styling

**Total implementation time: 45-60 minutes**
