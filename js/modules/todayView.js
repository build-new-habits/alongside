/* ============================================
   Workout Execution - Stage 2
   ============================================ */

/* Execution Screen */
workout-execution {
  padding: var(--space-4);
  max-width: var(--max-width);
  margin: 0 auto;
}

/* Execution Header */
.execution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-5);
}

.execution-progress {
  flex: 1;
}

.execution-progress__text {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

.execution-progress__bar {
  height: 8px;
  background: var(--color-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.execution-progress__fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.execution-quit {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  padding: var(--space-2);
  cursor: pointer;
  margin-left: var(--space-4);
}

.execution-quit:hover {
  color: var(--color-danger);
}

/* Section Badge */
.execution-section-badge {
  display: inline-block;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.execution-section-badge.warmup {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.execution-section-badge.main {
  background: var(--color-primary);
  color: white;
}

.execution-section-badge.cooldown {
  background: var(--color-success-bg);
  color: var(--color-success);
}

/* Exercise Info */
.execution-exercise {
  text-align: center;
  margin-bottom: var(--space-6);
}

.execution-exercise__name {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin-bottom: var(--space-5);
  line-height: 1.2;
}

/* Timer Display */
.execution-timer {
  margin: var(--space-6) 0;
}

.execution-timer__display {
  font-size: 5rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--color-primary);
  line-height: 1;
  margin-bottom: var(--space-2);
}

.execution-timer__label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

/* Reps Display */
.execution-reps {
  margin: var(--space-6) 0;
}

.execution-reps__target {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.execution-reps__sets,
.execution-reps__count {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-primary);
  font-family: var(--font-mono);
}

.execution-reps__times {
  font-size: var(--text-2xl);
  color: var(--color-text-muted);
}

.execution-reps__label {
  font-size: var(--text-base);
  color: var(--color-text-muted);
}

.execution-reps__rest {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-2);
}

/* Set Tracker */
.execution-sets {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: var(--space-5) 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.execution-set {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border);
  transition: all 0.2s;
  cursor: pointer;
  min-height: 64px; /* Larger tap target */
  user-select: none;
}

.execution-set:hover {
  border-color: var(--color-success);
  background: var(--color-success-bg);
  transform: scale(1.02);
}

.execution-set:active {
  transform: scale(0.98);
}

.execution-set--completed {
  background: var(--color-success-bg);
  border-color: var(--color-success);
}

.execution-set__number {
  font-weight: 600;
  font-size: var(--text-lg);
}

.execution-set__check {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: none;
  color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 1.5rem;
  pointer-events: none; /* Box handles clicks */
}

.execution-set:hover .execution-set__check {
  border-color: var(--color-success);
  background: var(--color-success-bg);
}

.execution-set--completed .execution-set__check {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

/* Action Buttons */
.execution-actions {
  margin: var(--space-6) 0;
}

.execution-button {
  width: 100%;
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-lg);
  font-size: var(--text-lg);
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 56px;
}

.execution-button--start {
  background: var(--color-success);
  color: white;
}

.execution-button--start:hover {
  background: #16a34a;
  transform: scale(1.02);
}

.execution-button--primary {
  background: var(--color-primary);
  color: white;
}

.execution-button--primary:hover {
  background: var(--color-primary-hover);
}

.execution-button--secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border: 2px solid var(--color-border);
  margin-top: var(--space-3);
}

/* Credits Preview */
.execution-credits {
  text-align: center;
  font-size: var(--text-lg);
  color: var(--color-success);
  font-weight: 600;
  margin-top: var(--space-4);
}

/* Workout Complete Screen */
.workout-complete {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: var(--space-6);
}

.workout-complete__content {
  max-width: 500px;
}

.workout-complete__emoji {
  font-size: 5rem;
  margin-bottom: var(--space-4);
  animation: bounce 0.6s ease-out;
}

.workout-complete__title {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin-bottom: var(--space-5);
}

.workout-complete__stats {
  display: flex;
  justify-content: center;
  gap: var(--space-5);
  margin-bottom: var(--space-6);
}

.workout-complete__stat {
  text-align: center;
}

.workout-complete__stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-1);
}

.workout-complete__stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* ============================================
   Difficulty Feedback Screens
   ============================================ */

.feedback-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: var(--space-6);
}

.feedback-content {
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.feedback-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.feedback-subtitle {
  color: var(--color-text-muted);
  margin-bottom: var(--space-6);
}

.feedback-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

@media (min-width: 600px) {
  .feedback-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

.feedback-option {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  min-height: 100px;
  justify-content: center;
}

.feedback-option:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.feedback-option:active {
  transform: translateY(0);
}

.feedback-option__emoji {
  font-size: 2.5rem;
}

.feedback-option__text {
  font-weight: 600;
  font-size: var(--text-lg);
}

.feedback-skip {
  background: none;
  border: none;
  color: var(--color-text-muted);
  padding: var(--space-3);
  cursor: pointer;
  font-size: var(--text-base);
  margin-top: var(--space-2);
}

.feedback-skip:hover {
  color: var(--color-text);
  text-decoration: underline;
}

/* Reason buttons */
.feedback-reasons {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.feedback-reason {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  cursor: pointer;
  transition: all 0.2s;
  font-size: var(--text-lg);
  text-align: left;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 64px; /* Larger tap target */
}

.feedback-reason:hover {
  border-color: var(--color-primary);
  background: var(--color-surface-raised);
  transform: translateX(4px);
}

.feedback-reason:active {
  transform: translateX(2px);
}
