# 🔧 APP.JS FIX - Add 3 New Functions

## FIND THIS SECTION (around line 545):

```javascript
  toggleEquipmentItem: onboarding.toggleEquipmentItem,
  equipmentOtherDone: onboarding.equipmentOtherDone,
  // Modules
  store,
```

## CHANGE IT TO:

```javascript
  toggleEquipmentItem: onboarding.toggleEquipmentItem,
  equipmentOtherDone: onboarding.equipmentOtherDone,
  // NEW: Fitness level and cardio preference functions
  selectFitnessLevel: onboarding.selectFitnessLevel,
  selectCardioType: onboarding.selectCardioType,
  toggleBlacklistExercise: onboarding.toggleBlacklistExercise,
  // Modules
  store,
```

## OR FULL REPLACEMENT

Replace lines 520-550 with this complete block:

```javascript
  resetApp,
  // Savings functions
  logSaving: savingsTracker.logSaving,
  logSpend: savingsTracker.logSpend,
  showAddGoal: savingsTracker.showAddGoal,
  closeAddGoal: savingsTracker.closeAddGoal,
  saveGoal: savingsTracker.saveGoal,
  removeGoal: savingsTracker.removeGoal,
  // Onboarding functions
  onboardingNext: onboarding.next,
  onboardingBack: onboarding.back,
  toggleCondition: onboarding.toggleCondition,
  toggleEquipment: onboarding.toggleEquipment,
  updateConditionSeverity: onboarding.updateConditionSeverity,
  setConditionType: onboarding.setConditionType,
  syncWeightUnit: onboarding.syncWeightUnit,
  toggleDeclaration: onboarding.toggleDeclaration,
  toggleGoal: onboarding.toggleGoal,
  skipOnboarding: onboarding.skip,
  onGenderChange: onboarding.onGenderChange,
  onMenstrualTrackingChange: onboarding.onMenstrualTrackingChange,
  // Equipment functions
  toggleEquipmentCategory: onboarding.toggleEquipmentCategory,
  toggleNoEquipment: onboarding.toggleNoEquipment,
  equipmentCategoriesNext: onboarding.equipmentCategoriesNext,
  equipmentCategoryNext: onboarding.equipmentCategoryNext,
  equipmentCategoryBack: onboarding.equipmentCategoryBack,
  toggleEquipmentItem: onboarding.toggleEquipmentItem,
  equipmentOtherDone: onboarding.equipmentOtherDone,
  // NEW: Fitness level and cardio preference functions
  selectFitnessLevel: onboarding.selectFitnessLevel,
  selectCardioType: onboarding.selectCardioType,
  toggleBlacklistExercise: onboarding.toggleBlacklistExercise,
  // Modules
  store,
  library,
  economy
};
