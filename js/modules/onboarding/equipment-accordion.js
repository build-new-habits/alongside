/**
 * Equipment Accordion Module
 * Standalone module for equipment selection in onboarding
 * 
 * USAGE:
 * import equipmentModule from './onboarding/equipment-accordion.js';
 * const html = equipmentModule.render(data);
 */

// EQUIPMENT CATEGORIES DATA
const EQUIPMENT_CATEGORIES = [
  {
    id: 'weights',
    name: 'Weights & Strength',
    icon: '🏋️',
    description: 'Free weights, resistance equipment',
    items: [
      { id: 'dumbbells', name: 'Dumbbells', description: 'Any weight' },
      { id: 'kettlebell', name: 'Kettlebell', description: 'Any weight' },
      { id: 'barbell', name: 'Barbell', description: 'With or without plates' },
      { id: 'weight-plates', name: 'Weight Plates', description: 'For barbell/adjustable' },
      { id: 'ez-bar', name: 'EZ Bar', description: 'Curved barbell' },
      { id: 'medicine-ball', name: 'Medicine Ball', description: 'Weighted ball' },
      { id: 'slam-ball', name: 'Slam Ball', description: 'For throwing' },
      { id: 'resistance-bands', name: 'Resistance Bands', description: 'Any resistance' },
      { id: 'suspension-trainer', name: 'Suspension Trainer (TRX)', description: 'Bodyweight resistance' },
      { id: 'pull-up-bar', name: 'Pull-up Bar', description: 'Doorway or mounted' },
      { id: 'dip-station', name: 'Dip Station', description: 'For dips and L-sits' },
      { id: 'weight-vest', name: 'Weight Vest', description: 'Added resistance' },
      { id: 'ankle-weights', name: 'Ankle/Wrist Weights', description: 'Resistance training' }
    ]
  },
  {
    id: 'cardio',
    name: 'Cardio Machines',
    icon: '🏃',
    description: 'Running, cycling, rowing equipment',
    items: [
      { id: 'treadmill', name: 'Treadmill', description: 'Indoor running' },
      { id: 'exercise-bike', name: 'Exercise Bike', description: 'Stationary or spin' },
      { id: 'rowing-machine', name: 'Rowing Machine', description: 'Indoor rower' },
      { id: 'elliptical', name: 'Elliptical', description: 'Cross-trainer' },
      { id: 'stair-climber', name: 'Stair Climber', description: 'Vertical machine' },
      { id: 'assault-bike', name: 'Assault Bike', description: 'Fan-based bike' },
      { id: 'skipping-rope', name: 'Skipping Rope', description: 'Jump rope' },
      { id: 'battle-ropes', name: 'Battle Ropes', description: 'Heavy conditioning ropes' }
    ]
  },
  {
    id: 'flexibility',
    name: 'Flexibility & Recovery',
    icon: '🧘',
    description: 'Yoga, stretching, mobility tools',
    items: [
      { id: 'yoga-mat', name: 'Yoga Mat', description: 'For floor work' },
      { id: 'yoga-blocks', name: 'Yoga Blocks', description: 'Support and mods' },
      { id: 'yoga-strap', name: 'Yoga Strap', description: 'Assisted stretching' },
      { id: 'foam-roller', name: 'Foam Roller', description: 'Self-massage' },
      { id: 'massage-ball', name: 'Massage Ball', description: 'Trigger point work' },
      { id: 'massage-gun', name: 'Massage Gun', description: 'Percussive therapy' },
      { id: 'stretching-bands', name: 'Stretching Bands', description: 'Flexibility work' }
    ]
  },
  {
    id: 'functional',
    name: 'Functional Equipment',
    icon: '📦',
    description: 'Boxes, balance boards, agility tools',
    items: [
      { id: 'plyo-box', name: 'Plyo Box / Jump Box', description: 'For box jumps' },
      { id: 'step-platform', name: 'Step Platform', description: 'Aerobic step' },
      { id: 'balance-board', name: 'Balance Board', description: 'Stability training' },
      { id: 'bosu-ball', name: 'BOSU Ball', description: 'Half stability ball' },
      { id: 'ab-wheel', name: 'Ab Wheel', description: 'Core training' },
      { id: 'gliding-discs', name: 'Gliding Discs', description: 'Floor exercises' },
      { id: 'agility-ladder', name: 'Agility Ladder', description: 'Footwork drills' },
      { id: 'cones', name: 'Training Cones', description: 'Agility work' },
      { id: 'mini-bands', name: 'Mini Loop Bands', description: 'Hip activation' }
    ]
  },
  {
    id: 'combat',
    name: 'Combat Sports',
    icon: '🥊',
    description: 'Boxing, kickboxing equipment',
    items: [
      { id: 'punch-bag', name: 'Punch Bag / Heavy Bag', description: 'Boxing/kickboxing' },
      { id: 'free-standing-bag', name: 'Free-Standing Bag', description: 'No mounting needed' },
      { id: 'speed-bag', name: 'Speed Bag', description: 'Rhythm training' },
      { id: 'double-end-bag', name: 'Double-End Bag', description: 'Accuracy work' },
      { id: 'boxing-gloves', name: 'Boxing Gloves', description: 'For bag work' },
      { id: 'focus-pads', name: 'Focus Pads', description: 'Partner pad work' },
      { id: 'hand-wraps', name: 'Hand Wraps', description: 'Hand protection' }
    ]
  },
  {
    id: 'access',
    name: 'Access-Based',
    icon: '🏢',
    description: 'Gym, pool, track access',
    items: [
      { id: 'gym-access', name: 'Gym Membership', description: 'Full commercial gym' },
      { id: 'pool-access', name: 'Swimming Pool', description: 'Indoor or outdoor' },
      { id: 'track-access', name: 'Running Track', description: 'Athletics track' },
      { id: 'tennis-court', name: 'Tennis Courts', description: 'Racquet sports' },
      { id: 'climbing-wall', name: 'Climbing Wall', description: 'Indoor climbing' },
      { id: 'sports-field', name: 'Sports Field', description: 'Team sports pitch' }
    ]
  }
];

// Module state
let expandedCategories = [];

/**
 * Render equipment accordion
 */
function render(data, currentStep, totalSteps) {
  const hasNoEquipment = data.equipment.includes('none');
  
  return `
    <div class="screen screen--active onboarding">
      <div class="onboarding__header">
        <button class="onboarding__back" onclick="window.alongside.onboardingBack()">← Back</button>
        <span class="onboarding__step">Step ${currentStep} of ${totalSteps}</span>
      </div>
      
      <div class="onboarding__content">
        <h2 class="onboarding__title">What equipment do you have?</h2>
        <p class="onboarding__subtitle">Click categories to select items</p>
        
        <!-- No Equipment Checkbox - MOVED TO TOP -->
        <div class="onboarding__field" style="margin-bottom: var(--space-4); padding: var(--space-4); background: var(--color-bg-secondary); border-radius: var(--radius-lg); border: 2px solid var(--color-border);">
          <label class="onboarding__checkbox-label" style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer; margin: 0;">
            <input type="checkbox" 
                   id="noEquipmentCheckbox"
                   ${hasNoEquipment ? 'checked' : ''}
                   onchange="window.alongside.equipment.toggleNoEquipment()">
            <span style="font-weight: 500;">I have no equipment (bodyweight only)</span>
          </label>
        </div>
        
        <div class="onboarding__equipment-accordion">
          ${EQUIPMENT_CATEGORIES.map(category => {
            const isExpanded = expandedCategories.includes(category.id);
            const itemCount = data.equipment.filter(eq => 
              category.items.some(item => item.id === eq)
            ).length;
            const hasItems = itemCount > 0;
            
            return `
              <div class="onboarding__category-accordion" id="category-${category.id}">
                <!-- Category Header (clickable) -->
                <button class="onboarding__category-header ${hasItems ? 'onboarding__category-header--has-items' : ''}"
                        onclick="window.alongside.equipment.toggleCategory('${category.id}')"
                        ${hasNoEquipment ? 'disabled' : ''}>
                  <span class="onboarding__category-icon">${category.icon}</span>
                  <div class="onboarding__category-info">
                    <span class="onboarding__category-name">${category.name}</span>
                    <span class="onboarding__category-desc">${category.description}</span>
                  </div>
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
                      <div class="onboarding__equipment-item">
                        <label class="onboarding__equipment-label">
                          <input type="checkbox" 
                                 class="onboarding__equipment-input"
                                 ${data.equipment.includes(item.id) ? 'checked' : ''}
                                 onchange="window.alongside.equipment.toggleItem('${item.id}')">
                          <div class="onboarding__equipment-content">
                            <span class="onboarding__equipment-name">${item.name}</span>
                            <span class="onboarding__equipment-desc">${item.description}</span>
                          </div>
                        </label>
                      </div>
                    `).join('')}
                    
                    <div class="onboarding__equipment-item onboarding__equipment-item--none">
                      <label class="onboarding__equipment-label">
                        <input type="checkbox" 
                               class="onboarding__equipment-input"
                               onchange="window.alongside.equipment.noneInCategory('${category.id}')">
                        <div class="onboarding__equipment-content">
                          <span class="onboarding__equipment-name" style="font-style: italic; color: var(--color-text-muted);">None in this category</span>
                        </div>
                      </label>
                    </div>
                    
                    <button class="onboarding__category-done-btn" 
                            onclick="window.alongside.equipment.doneWithCategory('${category.id}')">
                      ✓ Done with ${category.name}
                    </button>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="onboarding__field" style="margin-top: var(--space-4);">
          <label class="onboarding__label">Any other equipment? <span class="onboarding__optional">(optional)</span></label>
          <textarea id="equipmentOther" 
                    class="onboarding__textarea"
                    placeholder="e.g., gymnastic rings, sandbag, adjustable bench..."
                    rows="2"
                    maxlength="200">${data.equipmentOther || ''}</textarea>
          <p class="onboarding__hint">This helps us improve our equipment list</p>
        </div>
        
        <button class="onboarding__btn onboarding__btn--primary" onclick="window.alongside.onboardingNext()">
          Continue →
        </button>
      </div>
      
      <div class="onboarding__progress">
        <div class="onboarding__progress-bar" style="width: ${(currentStep / totalSteps) * 100}%"></div>
      </div>
    </div>
  `;
}

/**
 * Toggle category expanded/collapsed
 */
function toggleCategory(categoryId, onRenderCallback) {
  const index = expandedCategories.indexOf(categoryId);
  if (index > -1) {
    expandedCategories.splice(index, 1);
  } else {
    expandedCategories.push(categoryId);
  }
  
  if (onRenderCallback) onRenderCallback();
  
  // Auto-scroll after render
  if (index === -1) {
    setTimeout(() => {
      const element = document.getElementById(`category-${categoryId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }
}

/**
 * Close category
 */
function doneWithCategory(categoryId, onRenderCallback) {
  const index = expandedCategories.indexOf(categoryId);
  if (index > -1) {
    expandedCategories.splice(index, 1);
  }
  if (onRenderCallback) onRenderCallback();
}

/**
 * Deselect all items in category and close
 */
function noneInCategory(categoryId, data, onRenderCallback) {
  const category = EQUIPMENT_CATEGORIES.find(c => c.id === categoryId);
  if (category) {
    category.items.forEach(item => {
      const index = data.equipment.indexOf(item.id);
      if (index > -1) {
        data.equipment.splice(index, 1);
      }
    });
  }
  doneWithCategory(categoryId, onRenderCallback);
}

/**
 * Toggle individual equipment item
 */
function toggleItem(itemId, data, onRenderCallback) {
  const index = data.equipment.indexOf(itemId);
  if (index > -1) {
    data.equipment.splice(index, 1);
  } else {
    data.equipment.push(itemId);
    
    // Remove 'none' if present
    const noneIndex = data.equipment.indexOf('none');
    if (noneIndex > -1) {
      data.equipment.splice(noneIndex, 1);
    }
  }
  if (onRenderCallback) onRenderCallback();
}

/**
 * Toggle "no equipment" checkbox
 */
function toggleNoEquipment(data, onRenderCallback) {
  const checkbox = document.getElementById('noEquipmentCheckbox');
  if (checkbox && checkbox.checked) {
    data.equipment = ['none'];
    expandedCategories = [];
  } else {
    data.equipment = [];
  }
  if (onRenderCallback) onRenderCallback();
}

/**
 * Save equipment data when leaving step
 */
function onExit(data) {
  const equipmentOtherEl = document.getElementById('equipmentOther');
  if (equipmentOtherEl) {
    data.equipmentOther = equipmentOtherEl.value.trim();
  }
}

/**
 * Reset state when starting fresh
 */
function reset() {
  expandedCategories = [];
}

/**
 * Get equipment names for summary display
 */
function getEquipmentNames(equipmentIds) {
  return equipmentIds.map(id => {
    let itemName = id;
    EQUIPMENT_CATEGORIES.forEach(category => {
      const item = category.items.find(item => item.id === id);
      if (item) itemName = item.name;
    });
    return itemName;
  });
}

// Export module
export default {
  render,
  toggleCategory,
  doneWithCategory,
  noneInCategory,
  toggleItem,
  toggleNoEquipment,
  onExit,
  reset,
  getEquipmentNames,
  EQUIPMENT_CATEGORIES
};
