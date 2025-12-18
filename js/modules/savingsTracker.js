/**
 * Alongside Savings Tracker
 * Track money saved through smart choices
 */

import { store } from '../store.js';
import { economy } from './economy.js';

// Default savings actions
const SAVINGS_ACTIONS = {
  saves: [
    { id: 'coffee-home', name: 'Home brewed coffee', amount: 3.50, icon: '☕' },
    { id: 'lunch-packed', name: 'Packed lunch', amount: 7.00, icon: '🥪' },
    { id: 'dinner-cooked', name: 'Cooked dinner', amount: 12.00, icon: '🍳' },
    { id: 'walked', name: 'Walked instead of taxi', amount: 8.00, icon: '🚶' },
    { id: 'no-snack', name: 'Skipped bought snack', amount: 2.50, icon: '🍫' },
    { id: 'free-workout', name: 'Home workout (not gym)', amount: 5.00, icon: '🏠' }
  ],
  spends: [
    { id: 'coffee-bought', name: 'Bought coffee', amount: 3.50, icon: '☕' },
    { id: 'lunch-bought', name: 'Bought lunch', amount: 7.00, icon: '🍱' },
    { id: 'dinner-takeaway', name: 'Takeaway dinner', amount: 15.00, icon: '🍕' },
    { id: 'taxi', name: 'Took taxi/Uber', amount: 8.00, icon: '🚕' },
    { id: 'snack-bought', name: 'Bought snack', amount: 2.50, icon: '🍫' }
  ]
};

/**
 * Render the savings tracker screen
 */
function render() {
  const stats = economy.getSavingsStats();
  const goals = store.get('savings.goals') || [];
  const history = store.get('savings.history') || [];
  
  // Get recent history (last 5)
  const recentHistory = history.slice(-5).reverse();
  
  return `
    <div class="screen screen--active savings" id="savingsScreen">
      
      <!-- Total Saved -->
      <div class="savings__total">
        <span class="savings__total-label">Total Saved</span>
        <span class="savings__total-value">£${stats.total.toFixed(2)}</span>
        <span class="savings__week">
          ${stats.weekTotal >= 0 ? '+' : ''}£${stats.weekTotal.toFixed(2)} this week
        </span>
      </div>
      
      <!-- Goals Section -->
      <div class="savings__section">
        <div class="savings__section-header">
          <h2 class="savings__section-title">🎯 Saving For</h2>
          <button class="savings__add-goal-btn" onclick="window.alongside.showAddGoal()">
            + Add Goal
          </button>
        </div>
        
        ${goals.length === 0 ? `
          <div class="savings__empty">
            <p>No goals yet. Add something to save towards!</p>
          </div>
        ` : `
          <div class="savings__goals">
            ${goals.map(goal => {
              const progress = Math.min(100, (stats.total / goal.targetAmount) * 100);
              const remaining = Math.max(0, goal.targetAmount - stats.total);
              const isComplete = stats.total >= goal.targetAmount;
              
              return `
                <div class="savings__goal ${isComplete ? 'savings__goal--complete' : ''}">
                  <div class="savings__goal-header">
                    <span class="savings__goal-name">
                      ${goal.icon || '🎯'} ${goal.name}
                    </span>
                    <span class="savings__goal-amount">£${goal.targetAmount.toFixed(0)}</span>
                  </div>
                  <div class="savings__goal-progress">
                    <div class="savings__goal-fill" style="width: ${progress}%"></div>
                  </div>
                  <div class="savings__goal-status">
                    ${isComplete 
                      ? '✓ Goal reached! You\'ve earned this.' 
                      : `£${remaining.toFixed(2)} to go`
                    }
                  </div>
                  <button class="savings__goal-remove" 
                          onclick="window.alongside.removeGoal('${goal.id}')"
                          aria-label="Remove goal">
                    ✕
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
      
      <!-- Log a Win -->
      <div class="savings__section">
        <h2 class="savings__section-title">💚 Log a Smart Choice</h2>
        <p class="savings__section-subtitle">Every good decision adds up</p>
        
        <div class="savings__actions">
          ${SAVINGS_ACTIONS.saves.map(action => `
            <button class="savings__action" onclick="window.alongside.logSaving('${action.id}')">
              <span class="savings__action-icon">${action.icon}</span>
              <span class="savings__action-name">${action.name}</span>
              <span class="savings__action-amount">+£${action.amount.toFixed(2)}</span>
            </button>
          `).join('')}
        </div>
      </div>
      
      <!-- Log a Spend -->
      <div class="savings__section">
        <h2 class="savings__section-title">💸 Log a Spend</h2>
        <p class="savings__section-subtitle">Be honest — it helps you see patterns</p>
        
        <div class="savings__actions">
          ${SAVINGS_ACTIONS.spends.map(action => `
            <button class="savings__action savings__action--negative" onclick="window.alongside.logSpend('${action.id}')">
              <span class="savings__action-icon">${action.icon}</span>
              <span class="savings__action-name">${action.name}</span>
              <span class="savings__action-amount">-£${action.amount.toFixed(2)}</span>
            </button>
          `).join('')}
        </div>
      </div>
      
      <!-- Recent History -->
      ${recentHistory.length > 0 ? `
        <div class="savings__section">
          <h2 class="savings__section-title">📋 Recent</h2>
          <div class="savings__history">
            ${recentHistory.map(entry => {
              const isPositive = entry.amount > 0;
              const date = new Date(entry.date);
              const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
              const dayStr = isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : date.toLocaleDateString('en-GB', { weekday: 'short' });
              
              return `
                <div class="savings__history-item ${isPositive ? '' : 'savings__history-item--negative'}">
                  <span class="savings__history-icon">${entry.icon}</span>
                  <span class="savings__history-name">${entry.name}</span>
                  <span class="savings__history-meta">${dayStr} ${timeStr}</span>
                  <span class="savings__history-amount">
                    ${isPositive ? '+' : ''}£${entry.amount.toFixed(2)}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
      
    </div>
  `;
}

/**
 * Check if date is today
 */
function isToday(date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if date is yesterday
 */
function isYesterday(date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

/**
 * Log a saving (smart choice)
 */
function logSaving(actionId) {
  const action = SAVINGS_ACTIONS.saves.find(a => a.id === actionId);
  if (!action) return;
  
  // Add to history
  const history = store.get('savings.history') || [];
  history.push({
    ...action,
    date: new Date().toISOString()
  });
  store.set('savings.history', history);
  
  // Update total
  const total = store.get('savings.total') || 0;
  store.set('savings.total', total + action.amount);
  
  // Show confirmation
  showSavingConfirmation(action, true);
}

/**
 * Log a spend
 */
function logSpend(actionId) {
  const action = SAVINGS_ACTIONS.spends.find(a => a.id === actionId);
  if (!action) return;
  
  // Add to history (negative amount)
  const history = store.get('savings.history') || [];
  history.push({
    ...action,
    amount: -action.amount,
    date: new Date().toISOString()
  });
  store.set('savings.history', history);
  
  // Update total
  const total = store.get('savings.total') || 0;
  store.set('savings.total', total - action.amount);
  
  // Show confirmation
  showSavingConfirmation(action, false);
}

/**
 * Show confirmation toast
 */
function showSavingConfirmation(action, isSaving) {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `savings__toast ${isSaving ? 'savings__toast--positive' : 'savings__toast--negative'}`;
  toast.innerHTML = `
    <span class="savings__toast-icon">${action.icon}</span>
    <span class="savings__toast-text">
      ${isSaving ? '+' : '-'}£${action.amount.toFixed(2)} ${isSaving ? 'saved' : 'spent'}
    </span>
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('savings__toast--visible');
  });
  
  // Remove after delay
  setTimeout(() => {
    toast.classList.remove('savings__toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
  
  // Refresh the view
  refreshSavings();
}

/**
 * Refresh the savings display
 */
function refreshSavings() {
  const main = document.getElementById('main');
  if (main && document.getElementById('savingsScreen')) {
    main.innerHTML = render();
  }
}

/**
 * Show add goal modal
 */
function showAddGoal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'addGoalModal';
  modal.onclick = (e) => {
    if (e.target === modal) closeAddGoal();
  };
  
  modal.innerHTML = `
    <div class="modal-content savings__add-goal-modal" onclick="event.stopPropagation()">
      <h2 class="savings__modal-title">Add Savings Goal</h2>
      
      <div class="savings__form-group">
        <label class="savings__form-label">What are you saving for?</label>
        <input type="text" 
               id="goalName" 
               class="savings__form-input" 
               placeholder="e.g., Running trainers"
               maxlength="50">
      </div>
      
      <div class="savings__form-group">
        <label class="savings__form-label">How much does it cost?</label>
        <div class="savings__form-input-row">
          <span class="savings__form-currency">£</span>
          <input type="number" 
                 id="goalAmount" 
                 class="savings__form-input savings__form-input--amount" 
                 placeholder="0"
                 min="1"
                 max="10000"
                 step="1">
        </div>
      </div>
      
      <div class="savings__form-group">
        <label class="savings__form-label">Pick an icon</label>
        <div class="savings__icon-picker" id="iconPicker">
          <button type="button" class="savings__icon-btn savings__icon-btn--active" data-icon="🎯">🎯</button>
          <button type="button" class="savings__icon-btn" data-icon="👟">👟</button>
          <button type="button" class="savings__icon-btn" data-icon="⌚">⌚</button>
          <button type="button" class="savings__icon-btn" data-icon="🎾">🎾</button>
          <button type="button" class="savings__icon-btn" data-icon="🎧">🎧</button>
          <button type="button" class="savings__icon-btn" data-icon="📱">📱</button>
          <button type="button" class="savings__icon-btn" data-icon="✈️">✈️</button>
          <button type="button" class="savings__icon-btn" data-icon="🎁">🎁</button>
        </div>
      </div>
      
      <div class="savings__modal-actions">
        <button class="savings__modal-cancel" onclick="window.alongside.closeAddGoal()">
          Cancel
        </button>
        <button class="savings__modal-save" onclick="window.alongside.saveGoal()">
          Add Goal
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Focus the name input
  document.getElementById('goalName').focus();
  
  // Setup icon picker
  const iconBtns = modal.querySelectorAll('.savings__icon-btn');
  iconBtns.forEach(btn => {
    btn.onclick = () => {
      iconBtns.forEach(b => b.classList.remove('savings__icon-btn--active'));
      btn.classList.add('savings__icon-btn--active');
    };
  });
}

/**
 * Close add goal modal
 */
function closeAddGoal() {
  const modal = document.getElementById('addGoalModal');
  if (modal) modal.remove();
}

/**
 * Save a new goal
 */
function saveGoal() {
  const name = document.getElementById('goalName').value.trim();
  const amount = parseFloat(document.getElementById('goalAmount').value);
  const activeIcon = document.querySelector('.savings__icon-btn--active');
  const icon = activeIcon ? activeIcon.dataset.icon : '🎯';
  
  if (!name) {
    alert('Please enter a goal name');
    return;
  }
  
  if (!amount || amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }
  
  // Add goal to store
  const goals = store.get('savings.goals') || [];
  goals.push({
    id: Date.now().toString(),
    name,
    targetAmount: amount,
    icon,
    createdAt: new Date().toISOString()
  });
  store.set('savings.goals', goals);
  
  // Close modal and refresh
  closeAddGoal();
  refreshSavings();
}

/**
 * Remove a goal
 */
function removeGoal(goalId) {
  if (!confirm('Remove this goal?')) return;
  
  const goals = store.get('savings.goals') || [];
  const filtered = goals.filter(g => g.id !== goalId);
  store.set('savings.goals', filtered);
  
  refreshSavings();
}

/**
 * Initialize savings tracker
 */
function init() {
  // Ensure savings object exists in store
  if (!store.get('savings.total')) {
    store.set('savings.total', 0);
  }
  if (!store.get('savings.history')) {
    store.set('savings.history', []);
  }
  if (!store.get('savings.goals')) {
    store.set('savings.goals', []);
  }
}

// Export
export const savingsTracker = {
  render,
  init,
  logSaving,
  logSpend,
  showAddGoal,
  closeAddGoal,
  saveGoal,
  removeGoal,
  refreshSavings,
  SAVINGS_ACTIONS
};

export default savingsTracker;
