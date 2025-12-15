/**
 * Alongside Conversation Engine
 * Handles chat-style interactions for onboarding and coach dialogue
 */

/**
 * Conversation state machine
 */
class ConversationEngine {
  constructor(options = {}) {
    this.container = null;
    this.messagesEl = null;
    this.optionsEl = null;
    this.state = {
      currentStep: null,
      history: [],
      data: {}
    };
    this.scripts = {};
    this.onComplete = options.onComplete || (() => {});
    this.onStepChange = options.onStepChange || (() => {});
    this.typingDelay = options.typingDelay ?? 800;
    this.messageDelay = options.messageDelay ?? 400;
  }
  
  /**
   * Initialize the conversation engine
   */
  init(container, scripts) {
    this.container = container;
    this.scripts = scripts;
    this.render();
    return this;
  }
  
  /**
   * Render the base conversation UI
   */
  render() {
    this.container.innerHTML = `
      <div class="conversation">
        <header class="conversation__header">
          <div class="conversation__logo">🤝</div>
          <h1 class="conversation__title">Alongside</h1>
          <p class="conversation__tagline">Building Habits Together</p>
        </header>
        
        <div class="conversation__messages" id="conv-messages"></div>
        
        <div class="conversation__options" id="conv-options"></div>
        
        <div class="conversation__continue" id="conv-continue"></div>
      </div>
    `;
    
    this.messagesEl = document.getElementById('conv-messages');
    this.optionsEl = document.getElementById('conv-options');
    this.continueEl = document.getElementById('conv-continue');
  }
  
  /**
   * Start conversation from a specific step
   */
  async start(stepId = 'welcome') {
    this.state.currentStep = stepId;
    await this.processStep(stepId);
  }
  
  /**
   * Process a conversation step
   */
  async processStep(stepId) {
    const step = this.scripts[stepId];
    if (!step) {
      console.error(`Step not found: ${stepId}`);
      return;
    }
    
    this.state.currentStep = stepId;
    this.onStepChange(stepId, this.state.data);
    
    // Clear options
    this.optionsEl.innerHTML = '';
    this.continueEl.innerHTML = '';
    
    // Show typing indicator
    this.showTyping();
    
    // Wait for typing effect
    await this.delay(this.typingDelay);
    
    // Remove typing, show message(s)
    this.hideTyping();
    
    // Handle multiple messages
    const messages = Array.isArray(step.messages) ? step.messages : [step.message];
    
    for (const msg of messages) {
      await this.addCoachMessage(this.interpolate(msg));
      if (messages.length > 1) {
        await this.delay(this.messageDelay);
      }
    }
    
    // Show input based on step type
    await this.delay(300);
    
    switch (step.type) {
      case 'options':
        this.showOptions(step.options);
        break;
      case 'text':
        this.showTextInput(step);
        break;
      case 'continue':
        this.showContinueButton(step);
        break;
      case 'complete':
        this.handleComplete();
        break;
      default:
        if (step.options) {
          this.showOptions(step.options);
        } else if (step.next) {
          this.showContinueButton(step);
        }
    }
  }
  
  /**
   * Show typing indicator
   */
  showTyping() {
    const typing = document.createElement('div');
    typing.className = 'message message--coach message--typing';
    typing.id = 'typing-indicator';
    typing.innerHTML = `
      <div class="message__avatar">🤝</div>
      <div class="message__content">
        <div class="message__bubble">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    this.messagesEl.appendChild(typing);
    this.scrollToBottom();
  }
  
  /**
   * Hide typing indicator
   */
  hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }
  
  /**
   * Add a coach message to the conversation
   */
  async addCoachMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'message message--coach';
    msg.innerHTML = `
      <div class="message__avatar">🤝</div>
      <div class="message__content">
        <span class="message__name">Alongside</span>
        <div class="message__bubble">${text}</div>
      </div>
    `;
    this.messagesEl.appendChild(msg);
    this.scrollToBottom();
    this.state.history.push({ role: 'coach', text, timestamp: Date.now() });
  }
  
  /**
   * Add a user message to the conversation
   */
  addUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'message message--user';
    msg.innerHTML = `
      <div class="message__avatar">👤</div>
      <div class="message__content">
        <span class="message__name">You</span>
        <div class="message__bubble">${text}</div>
      </div>
    `;
    this.messagesEl.appendChild(msg);
    this.scrollToBottom();
    this.state.history.push({ role: 'user', text, timestamp: Date.now() });
  }
  
  /**
   * Show options for user to select
   */
  showOptions(options) {
    this.optionsEl.innerHTML = options.map((opt, i) => `
      <button class="option-btn" data-value="${opt.value}" data-index="${i}">
        ${opt.icon ? `<span class="option-btn__icon">${opt.icon}</span>` : ''}
        <div class="option-btn__text">
          <div class="option-btn__title">${opt.label}</div>
          ${opt.description ? `<div class="option-btn__desc">${opt.description}</div>` : ''}
        </div>
      </button>
    `).join('');
    
    // Add click handlers
    this.optionsEl.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handleOptionSelect(btn, options));
    });
  }
  
  /**
   * Handle option selection
   */
  async handleOptionSelect(btn, options) {
    const value = btn.dataset.value;
    const option = options.find(o => o.value === value);
    
    if (!option) return;
    
    // Visual feedback
    this.optionsEl.querySelectorAll('.option-btn').forEach(b => {
      b.classList.remove('option-btn--selected');
      b.disabled = true;
    });
    btn.classList.add('option-btn--selected');
    
    // Store data
    const step = this.scripts[this.state.currentStep];
    if (step.dataKey) {
      this.state.data[step.dataKey] = value;
    }
    
    // Show user's selection as message
    await this.delay(200);
    this.addUserMessage(option.label);
    
    // Move to next step
    await this.delay(500);
    const nextStep = option.next || step.next;
    if (nextStep) {
      await this.processStep(nextStep);
    }
  }
  
  /**
   * Show text input
   */
  showTextInput(step) {
    this.optionsEl.innerHTML = `
      <div class="name-input-group">
        <input 
          type="${step.inputType || 'text'}" 
          class="input" 
          id="text-input"
          placeholder="${step.placeholder || ''}"
          autocomplete="${step.autocomplete || 'off'}"
          ${step.maxLength ? `maxlength="${step.maxLength}"` : ''}
        >
        <button class="btn btn--primary btn--full" id="submit-text" disabled>
          ${step.buttonText || 'Continue'}
        </button>
      </div>
    `;
    
    const input = document.getElementById('text-input');
    const submitBtn = document.getElementById('submit-text');
    
    // Enable button when input has value
    input.addEventListener('input', () => {
      submitBtn.disabled = !input.value.trim();
    });
    
    // Handle submission
    const handleSubmit = async () => {
      const value = input.value.trim();
      if (!value) return;
      
      // Disable input
      input.disabled = true;
      submitBtn.disabled = true;
      
      // Store data
      if (step.dataKey) {
        this.state.data[step.dataKey] = value;
      }
      
      // Show user message
      this.addUserMessage(value);
      
      // Process validation if any
      if (step.validate) {
        const isValid = step.validate(value);
        if (!isValid) {
          // Handle validation failure
          return;
        }
      }
      
      // Move to next step
      await this.delay(500);
      if (step.next) {
        await this.processStep(step.next);
      }
    };
    
    submitBtn.addEventListener('click', handleSubmit);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !submitBtn.disabled) {
        handleSubmit();
      }
    });
    
    // Focus input
    setTimeout(() => input.focus(), 100);
  }
  
  /**
   * Show continue button
   */
  showContinueButton(step) {
    this.continueEl.innerHTML = `
      <button class="btn btn--primary btn--full btn--lg" id="continue-btn">
        ${step.buttonText || 'Continue'}
      </button>
    `;
    
    document.getElementById('continue-btn').addEventListener('click', async () => {
      document.getElementById('continue-btn').disabled = true;
      
      if (step.next) {
        await this.processStep(step.next);
      }
    });
  }
  
  /**
   * Handle conversation complete
   */
  handleComplete() {
    this.onComplete(this.state.data);
  }
  
  /**
   * Interpolate variables in text
   */
  interpolate(text) {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return this.state.data[key] || match;
    });
  }
  
  /**
   * Scroll messages to bottom
   */
  scrollToBottom() {
    if (this.messagesEl) {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }
  }
  
  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get collected data
   */
  getData() {
    return { ...this.state.data };
  }
  
  /**
   * Set initial data
   */
  setData(data) {
    this.state.data = { ...this.state.data, ...data };
  }
}

export default ConversationEngine;

