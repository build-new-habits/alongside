# IMPROVED EQUIPMENT UX - Click to Open Design

## 🎯 New User Flow

**One Screen - Categories Open Inline**

```
┌─────────────────────────────────────────┐
│ What equipment do you have?             │
│ Click categories to select items        │
├─────────────────────────────────────────┤
│                                         │
│ 🏋️ Weights & Strength          [>]    │  ← Click opens
│                                         │
│ 🏃 Cardio Machines ✓           [v]    │  ← Open, showing items
│   ☑ Treadmill                          │
│   ☐ Exercise Bike                      │
│   ☑ Rowing Machine                     │
│   ☐ Skipping Rope                      │
│   [✓ Done with Cardio]                 │
│                                         │
│ 🧘 Flexibility & Recovery      [>]    │
│                                         │
│ 📦 Functional Equipment        [>]    │
│                                         │
│ 🥊 Combat Sports               [>]    │
│                                         │
│ 🏢 Access-Based                [>]    │
│                                         │
├─────────────────────────────────────────┤
│ ☐ I have no equipment (bodyweight)     │
│                                         │
│ [Continue →]                            │
└─────────────────────────────────────────┘
```

## ✨ Key Features

1. **Click category → expands inline** (accordion style)
2. **Green checkmark** when category has items selected
3. **"None in this category"** checkbox to close without selections
4. **"Done with [Category]"** button collapses the section
5. **All on one page** - no navigation between screens
6. **Auto-scrolls** to opened category

## 🎨 Visual States

**Unopened Category:**
```
🏋️ Weights & Strength [>]
```

**Open Category (with selections):**
```
🏋️ Weights & Strength ✓ [v]
  ☑ Dumbbells
  ☑ Kettlebell
  ☐ Barbell
  ☐ None in this category
  [✓ Done with Weights]
```

**Completed Category (collapsed):**
```
🏋️ Weights & Strength ✓ [>]
  2 items selected
```

## 💻 Implementation Changes

### State Management
```javascript
let expandedCategories = []; // Track which are open: ['weights', 'cardio']
let selectedItems = {
  weights: ['dumbbells', 'kettlebell'],
  cardio: ['treadmill']
};
```

### Click Handlers
```javascript
// Click category header → toggle open/closed
function toggleCategoryExpanded(categoryId) {
  const index = expandedCategories.indexOf(categoryId);
  if (index > -1) {
    expandedCategories.splice(index, 1); // Close
  } else {
    expandedCategories.push(categoryId); // Open
    // Auto-scroll to category
    setTimeout(() => {
      document.getElementById(`category-${categoryId}`)?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }, 100);
  }
  renderCurrentStep();
}

// "Done" button → close category
function donWithCategory(categoryId) {
  const index = expandedCategories.indexOf(categoryId);
  if (index > -1) {
    expandedCategories.splice(index, 1);
  }
  renderCurrentStep();
}

// "None in this category" → deselect all, close
function noneInCategory(categoryId) {
  // Remove all items from this category
  const category = EQUIPMENT_CATEGORIES.find(c => c.id === categoryId);
  if (category) {
    category.items.forEach(item => {
      const index = onboardingData.equipment.indexOf(item.id);
      if (index > -1) {
        onboardingData.equipment.splice(index, 1);
      }
    });
  }
  // Close category
  doneWithCategory(categoryId);
}
```

### Render Function
```javascript
function renderEquipmentCategories() {
  const hasNoEquipment = onboardingData.equipment.includes('none');
  
  return `
    <div class="onboarding__equipment-accordion">
      ${EQUIPMENT_CATEGORIES.map(category => {
        const isExpanded = expandedCategories.includes(category.id);
        const itemCount = onboardingData.equipment.filter(eq => 
          category.items.some(item => item.id === eq)
        ).length;
        const hasItems = itemCount > 0;
        
        return `
          <div class="onboarding__category-accordion" id="category-${category.id}">
            <!-- Category Header (clickable) -->
            <button class="onboarding__category-header ${hasItems ? 'has-items' : ''}"
                    onclick="window.alongside.toggleCategoryExpanded('${category.id}')"
                    ${hasNoEquipment ? 'disabled' : ''}>
              <span class="onboarding__category-icon">${category.icon}</span>
              <span class="onboarding__category-name">${category.name}</span>
              ${hasItems ? `<span class="onboarding__category-badge">✓</span>` : ''}
              <span class="onboarding__category-chevron">${isExpanded ? '▼' : '▶'}</span>
            </button>
            
            ${hasItems && !isExpanded ? `
              <div class="onboarding__category-summary">
                ${itemCount} item${itemCount > 1 ? 's' : ''} selected
              </div>
            ` : ''}
            
            <!-- Category Items (expanded) -->
            ${isExpanded ? `
              <div class="onboarding__category-items">
                ${category.items.map(item => `
                  <label class="onboarding__equipment-checkbox">
                    <input type="checkbox" 
                           ${onboardingData.equipment.includes(item.id) ? 'checked' : ''}
                           onchange="window.alongside.toggleEquipmentItem('${item.id}')">
                    <span class="onboarding__equipment-name">${item.name}</span>
                    <span class="onboarding__equipment-desc">${item.description}</span>
                  </label>
                `).join('')}
                
                <label class="onboarding__equipment-checkbox onboarding__equipment-checkbox--none">
                  <input type="checkbox" 
                         onchange="window.alongside.noneInCategory('${category.id}')">
                  <span>None in this category</span>
                </label>
                
                <button class="onboarding__category-done-btn" 
                        onclick="window.alongside.doneWithCategory('${category.id}')">
                  ✓ Done with ${category.name}
                </button>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
    
    <div class="onboarding__no-equipment">
      <label class="onboarding__checkbox-label">
        <input type="checkbox" 
               id="noEquipmentCheckbox"
               ${hasNoEquipment ? 'checked' : ''}
               onchange="window.alongside.toggleNoEquipment()">
        <span>I have no equipment (bodyweight only)</span>
      </label>
    </div>
    
    <button class="onboarding__btn onboarding__btn--primary" 
            onclick="window.alongside.onboardingNext()">
      Continue →
    </button>
  `;
}
```

## 📝 CSS Additions

```css
/* Accordion Category */
.onboarding__category-accordion {
  margin-bottom: var(--space-2);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s ease;
}

/* Category Header (clickable) */
.onboarding__category-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
}

.onboarding__category-header:hover:not(:disabled) {
  background: var(--color-bg-tertiary);
}

.onboarding__category-header.has-items {
  background: rgba(59, 130, 246, 0.05);
}

.onboarding__category-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.onboarding__category-name {
  flex: 1;
  font-size: var(--text-lg);
  font-weight: 600;
}

.onboarding__category-badge {
  color: var(--color-success);
  font-size: 1.2rem;
}

.onboarding__category-chevron {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

/* Category Summary */
.onboarding__category-summary {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-primary);
  background: rgba(59, 130, 246, 0.02);
  border-top: 1px solid var(--color-border);
}

/* Category Items (expanded) */
.onboarding__category-items {
  padding: var(--space-3);
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
}

/* Equipment Checkbox */
.onboarding__equipment-checkbox {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s ease;
}

.onboarding__equipment-checkbox:hover {
  background: var(--color-bg-secondary);
}

.onboarding__equipment-checkbox input[type="checkbox"] {
  margin-top: 2px;
  cursor: pointer;
}

.onboarding__equipment-name {
  font-weight: 500;
  display: block;
}

.onboarding__equipment-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  display: block;
}

.onboarding__equipment-checkbox--none {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

/* Done Button */
.onboarding__category-done-btn {
  width: 100%;
  margin-top: var(--space-3);
  padding: var(--space-3);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.onboarding__category-done-btn:hover {
  background: var(--color-primary-dark);
}
```

## ✅ Benefits

1. **Faster:** One screen, no navigation
2. **Clearer:** See all categories at once
3. **Flexible:** Open multiple categories at once
4. **Forgiving:** "None in this category" prevents mistakes
5. **Progress visible:** Checkmarks show completion
6. **Less overwhelming:** Only see details when you click

## 🎯 Next Steps

Would you like me to create the complete implementation of this design? It will replace the multi-screen equipment flow with this cleaner accordion approach.
