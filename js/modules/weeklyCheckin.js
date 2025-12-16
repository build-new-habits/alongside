/**
 * Alongside Weekly Check-In
 * The moment of reflection before spending treats
 */

import { store } from '../store.js';
import { economy } from './economy.js';

/**
 * Render the weekly check-in screen
 */
function render() {
  const stats = economy.getWeeklyStats();
  const tier = economy.getWeeklyTier(stats.totalMinutes);
  const tierDetails = economy.getTierDetails(tier);
  const treats = economy.getTreatsForTier(tier);
  const canSpend = economy.canSpendTreat();
  const bankedWeeks = economy.getBankedWeeks();
  
  // Get weight progress if available
  const currentWeight = store.get('profile.weight');
  const goalWeight = store.get('profile.goalWeight');
  const lastWeight = store.get('profile.lastWeight');
  
  // Format weight change
  let weightChange = '';
  if (currentWeight && lastWeight) {
    const diff = lastWeight - currentWeight;
    if (diff > 0) weightChange = `↓${diff.toFixed(1)}lb this week`;
    else if (diff < 0) weightChange = `↑${Math.abs(diff).toFixed(1)}lb this week`;
    else weightChange = 'No change this week';
  }
  
  return `
    <div class="screen screen--active weekly-checkin" id="weeklyCheckinScreen">
      
      <!-- Header -->
      <div class="weekly__header">
        <span class="weekly__icon">📊</span>
        <h1 class="weekly__title">Weekly Check-In</h1>
        <p class="weekly__subtitle">Let's see how you did</p>
      </div>
      
      <!-- Stats Summary -->
      <div class="weekly__stats">
        <div class="weekly__stat">
          <span class="weekly__stat-value">${stats.workoutCount}</span>
          <span class="weekly__stat-label">Workouts</span>
        </div>
        <div class="weekly__stat">
          <span class="weekly__stat-value">${Math.round(stats.totalMinutes)}</span>
          <span class="weekly__stat-label">Minutes</span>
        </div>
        <div class="weekly__stat">
          <span class="weekly__stat-value">${stats.totalCredits}</span>
          <span class="weekly__stat-label">Credits</span>
        </div>
      </div>
      
      <!-- Tier Badge -->
      <div class="weekly__tier" style="--tier-colour: ${tierDetails.colour}">
        <span class="weekly__tier-icon">${tierDetails.icon}</span>
        <div class="weekly__tier-info">
          <span class="weekly__tier-name">${tierDetails.name} Week</span>
          <span class="weekly__tier-message">${tierDetails.message}</span>
        </div>
      </div>
      
      ${weightChange ? `
        <div class="weekly__weight">
          <span class="weekly__weight-icon">⚖️</span>
          <span class="weekly__weight-text">${weightChange}</span>
        </div>
      ` : ''}
      
      ${bankedWeeks > 0 ? `
        <div class="weekly__banked">
          <span class="weekly__banked-icon">🏦</span>
          <span class="weekly__banked-text">${bankedWeeks} week${bankedWeeks > 1 ? 's' : ''} banked</span>
        </div>
      ` : ''}
      
      <!-- Treats Section -->
      ${tier === 'building' ? `
        <div class="weekly__building">
          <p>Keep going! Once you hit <strong>60 minutes</strong> of exercise this week, you'll unlock your first treat tier.</p>
          <div class="weekly__progress-bar">
            <div class="weekly__progress-fill" style="width: ${Math.min(100, (stats.totalMinutes / 60) * 100)}%"></div>
          </div>
          <p class="weekly__progress-text">${Math.round(stats.totalMinutes)} / 60 minutes</p>
        </div>
      ` : `
        <div class="weekly__treats-section">
          <h2 class="weekly__treats-title">Your Reward Options</h2>
          <p class="weekly__treats-subtitle">Choose <strong>ONE</strong> treat this week, or bank for something bigger</p>
          
          ${!canSpend.allowed ? `
            <div class="weekly__cooldown">
              <span class="weekly__cooldown-icon">⏳</span>
              <p>You had "${canSpend.lastTreat}" ${canSpend.daysSince} days ago.</p>
              <p>Next treat available in <strong>${canSpend.daysRemaining} days</strong>.</p>
            </div>
          ` : `
            <div class="weekly__treats-grid">
              ${treats.map(category => `
                <div class="weekly__treat-category">
                  <h3 class="weekly__treat-category-name">${category.categoryName}</h3>
                  ${category.treats.map(treat => `
                    <button class="weekly__treat-btn" onclick="window.alongside.confirmTreat('${treat.id}', '${treat.name}', '${treat.icon}')">
                      <span class="weekly__treat-icon">${treat.icon}</span>
                      <span class="weekly__treat-name">${treat.name}</span>
                      <span class="weekly__treat-desc">${treat.description}</span>
                    </button>
                  `).join('')}
                </div>
              `).join('')}
            </div>
            
            <button class="weekly__bank-btn" onclick="window.alongside.bankThisWeek()">
              <span class="weekly__bank-icon">🏦</span>
              <span class="weekly__bank-text">Bank this week</span>
              <span class="weekly__bank-desc">Save for a bigger reward later</span>
            </button>
          `}
        </div>
      `}
      
      <!-- Skip Button -->
      <button class="weekly__skip" onclick="window.alongside.closeWeeklyCheckin()">
        I'll decide later
      </button>
      
    </div>
  `;
}

/**
 * Render confirmation modal
 */
function renderConfirmation(treatId, treatName, treatIcon) {
  const stats = economy.getWeeklyStats();
  const canSpend = economy.canSpendTreat();
  const bankedWeeks = economy.getBankedWeeks();
  
  // Get last treat info
  const lastTreat = store.get('economy.lastTreat');
  const daysSinceLastTreat = lastTreat 
    ? Math.floor((new Date() - new Date(lastTreat.date)) / (1000 * 60 * 60 * 24))
    : null;
  
  // Weight context
  const currentWeight = store.get('profile.weight');
  const goalWeight = store.get('profile.goalWeight');
  const weightToGo = currentWeight && goalWeight ? currentWeight - goalWeight : null;
  
  return `
    <div class="modal-overlay" id="treatConfirmModal" onclick="window.alongside.closeTreatConfirm(event)">
      <div class="modal-content weekly__confirm" onclick="event.stopPropagation()">
        
        <div class="weekly__confirm-header">
          <span class="weekly__confirm-icon">${treatIcon}</span>
          <h2 class="weekly__confirm-title">${treatName}</h2>
        </div>
        
        <div class="weekly__confirm-body">
          <p class="weekly__confirm-earned">You've worked hard this week.</p>
          
          <div class="weekly__confirm-context">
            ${daysSinceLastTreat !== null ? `
              <p>• Last treat: <strong>${daysSinceLastTreat} days ago</strong></p>
            ` : ''}
            
            ${weightToGo !== null && weightToGo > 0 ? `
              <p>• You're <strong>${weightToGo.toFixed(1)}lb</strong> away from your goal</p>
            ` : ''}
            
            ${bankedWeeks > 0 ? `
              <p>• Banking would give you <strong>${bankedWeeks + 1} weeks</strong> saved</p>
            ` : `
              <p>• Banking this week starts your streak for bigger rewards</p>
            `}
          </div>
          
          <p class="weekly__confirm-question">Still want to spend on this treat?</p>
        </div>
        
        <div class="weekly__confirm-actions">
          <button class="weekly__confirm-no" onclick="window.alongside.closeTreatConfirm()">
            No, I'll bank it
          </button>
          <button class="weekly__confirm-yes" onclick="window.alongside.spendOnTreat('${treatId}', '${treatName}', '${treatIcon}')">
            Yes, I've earned this
          </button>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Show treat confirmation
 */
function confirmTreat(treatId, treatName, treatIcon) {
  const modal = document.createElement('div');
  modal.innerHTML = renderConfirmation(treatId, treatName, treatIcon);
  document.body.appendChild(modal.firstElementChild);
}

/**
 * Close treat confirmation
 */
function closeTreatConfirm(event) {
  if (event && event.target !== event.currentTarget) return;
  const modal = document.getElementById('treatConfirmModal');
  if (modal) modal.remove();
}

/**
 * Spend on a treat
 */
function spendOnTreat(treatId, treatName, treatIcon) {
  economy.spendTreat({ id: treatId, name: treatName, icon: treatIcon });
  closeTreatConfirm();
  
  // Show success message
  showTreatSuccess(treatName, treatIcon);
}

/**
 * Show treat success
 */
function showTreatSuccess(treatName, treatIcon) {
  const main = document.getElementById('main');
  if (!main) return;
  
  main.innerHTML = `
    <div class="screen screen--active weekly-checkin">
      <div class="weekly__success">
        <span class="weekly__success-icon">${treatIcon}</span>
        <h2 class="weekly__success-title">Enjoy your ${treatName}!</h2>
        <p class="weekly__success-message">You've earned it. No guilt, no regret.</p>
        <p class="weekly__success-note">Next treat available in 7 days.</p>
        <button class="checkin__submit" onclick="window.alongside.showToday()">
          Back to Today
        </button>
      </div>
    </div>
  `;
}

/**
 * Bank this week
 */
function bankThisWeek() {
  const newTotal = economy.bankWeek();
  
  const main = document.getElementById('main');
  if (!main) return;
  
  let unlockMessage = '';
  if (newTotal >= 4) {
    unlockMessage = "You've unlocked a <strong>Cheat Day</strong>! Use it whenever you want.";
  } else if (newTotal >= 2) {
    unlockMessage = "You've unlocked a <strong>Restaurant Meal</strong>! Claim it in your next weekly check-in.";
  } else {
    unlockMessage = `${4 - newTotal} more weeks to unlock a Cheat Day.`;
  }
  
  main.innerHTML = `
    <div class="screen screen--active weekly-checkin">
      <div class="weekly__success">
        <span class="weekly__success-icon">🏦</span>
        <h2 class="weekly__success-title">Week Banked!</h2>
        <p class="weekly__success-message">You now have <strong>${newTotal} week${newTotal > 1 ? 's' : ''}</strong> banked.</p>
        <p class="weekly__success-note">${unlockMessage}</p>
        <button class="checkin__submit" onclick="window.alongside.showToday()">
          Back to Today
        </button>
      </div>
    </div>
  `;
}

/**
 * Close weekly check-in
 */
function closeWeeklyCheckin() {
  if (window.alongside?.showToday) {
    const checkinData = store.get('checkin');
    window.alongside.showToday(checkinData?.energy || 5, checkinData?.mood || 5);
  }
}

/**
 * Initialize weekly check-in (add to global)
 */
function init() {
  window.alongside = window.alongside || {};
  window.alongside.confirmTreat = confirmTreat;
  window.alongside.closeTreatConfirm = closeTreatConfirm;
  window.alongside.spendOnTreat = spendOnTreat;
  window.alongside.bankThisWeek = bankThisWeek;
  window.alongside.closeWeeklyCheckin = closeWeeklyCheckin;
}

export const weeklyCheckin = {
  render,
  confirmTreat,
  closeTreatConfirm,
  spendOnTreat,
  bankThisWeek,
  closeWeeklyCheckin,
  init
};

export default weeklyCheckin;
