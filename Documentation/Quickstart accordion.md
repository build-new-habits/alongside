# 🚀 QUICK START: Accordion Equipment Implementation

## ✅ Files Ready

You have **6 files** downloaded:

1. **CREATE_ACCORDION_EQUIPMENT.md** - Step-by-step guide (11 steps)
2. **equipment-categories-data.js** - Category structure (60+ items)
3. **equipment-accordion-render.js** - Main render function
4. **equipment-accordion-functions.js** - 5 handler functions
5. **equipment-accordion.css** - Complete styling
6. **saveCurrentStepData-update.js** - Save equipment "other" field

---

## 📋 Implementation Checklist

### **Step 1: Update onboarding.js** (30 min)

Open `/js/modules/onboarding.js`:

- [ ] **Line 30:** Replace `EQUIPMENT` array → Copy from `equipment-categories-data.js`
- [ ] **Line 104:** Add `let expandedCategories = [];`
- [ ] **Line 110:** Add `equipmentOther: ''` to onboardingData
- [ ] **Line 130:** Add `expandedCategories = [];` to start()
- [ ] **Line 500:** Delete old `renderEquipment()` function
- [ ] **Line 500:** Paste `renderEquipmentAccordion()` from `equipment-accordion-render.js`
- [ ] **Line 600:** Paste 5 functions from `equipment-accordion-functions.js`
- [ ] **Line 750:** Update `saveCurrentStepData()` - add case 5 from `saveCurrentStepData-update.js`
- [ ] **Line 850:** Update `renderCoachSummary()` equipment section (search through categories)
- [ ] **Line 900:** Add `store.set('profile.equipmentOther', ...)`
- [ ] **Line 950:** Update exports - add 5 new functions + change EQUIPMENT → EQUIPMENT_CATEGORIES

### **Step 2: Update app.js** (5 min)

Open `/js/app.js`:

- [ ] **Line 500:** Add to `window.alongside`:
```javascript
toggleCategoryExpanded: onboarding.toggleCategoryExpanded,
doneWithCategory: onboarding.doneWithCategory,
noneInCategory: onboarding.noneInCategory,
toggleEquipmentItem: onboarding.toggleEquipmentItem,
```

### **Step 3: Add CSS** (2 min)

- [ ] Save `equipment-accordion.css` to `/css/equipment-accordion.css`
- [ ] Add to `index.html`: `<link rel="stylesheet" href="css/equipment-accordion.css">`

### **Step 4: Test** (15 min)

- [ ] Commit and push to GitHub
- [ ] Wait for deployment
- [ ] Reset app: `window.alongside.resetApp()`
- [ ] Go through onboarding to equipment step
- [ ] Test:
  - Click category → opens inline ✓
  - Select items → checkboxes work ✓
  - "Done" button → closes category ✓
  - "None in category" → deselects all ✓
  - Green checkmark appears ✓
  - Item count shows when collapsed ✓
  - "No equipment" checkbox disables categories ✓

---

## 🎨 What You'll See

**Before (multi-screen):**
```
Screen 1: Category cards
  ↓ Click category
Screen 2: Items in that category
  ↓ Continue
Screen 3: Next category
  ↓ Continue
Screen 4: "Other equipment"
```

**After (accordion):**
```
Single Screen:
🏋️ Weights & Strength [>]  ← Click opens
🏃 Cardio Machines ✓ [v]   ← Open with items
  ☑ Treadmill
  ☐ Exercise Bike
  [✓ Done with Cardio]
🧘 Flexibility [>]
📦 Functional [>]
🥊 Combat Sports [>]
🏢 Access-Based [>]

☐ No equipment (bodyweight)
[Other equipment text field]
[Continue →]
```

---

## 🐛 Troubleshooting

**"EQUIPMENT_CATEGORIES is not defined"**
→ Make sure you replaced the EQUIPMENT array with EQUIPMENT_CATEGORIES

**Categories don't expand**
→ Check app.js exports `toggleCategoryExpanded`

**Styling looks broken**
→ Make sure CSS file is saved and linked in index.html

**"equipmentOther is not defined"**
→ Add to onboardingData object (Step 1, line 110)

---

## ✨ Benefits

- **60% faster:** One screen vs 4+ screens
- **Clearer:** See all categories at once
- **Flexible:** Open multiple at once
- **Fewer mistakes:** "None in category" option
- **Better mobile:** Less scrolling

---

**Estimated time:** 45-60 minutes total

Ready? Start with **CREATE_ACCORDION_EQUIPMENT.md** for detailed steps! 🌱
