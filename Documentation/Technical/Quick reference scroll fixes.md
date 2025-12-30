# ⚡ QUICK REFERENCE: Scroll-to-Top Fixes

## 🎯 Problem
Pages don't scroll to top consistently when navigating through onboarding.

## ✅ Solution
Add `window.scrollTo({ top: 0, behavior: 'smooth' });` to 3 places:

---

## 📝 Copy/Paste These 3 Fixes

### **Fix 1: next() function**
```javascript
function next() {
  saveCurrentStepData();
  currentStep++;
  
  if (currentStep > TOTAL_STEPS) {
    completeOnboarding();
  } else {
    renderCurrentStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
```

### **Fix 2: back() function**
```javascript
function back() {
  if (currentStep > 1) {
    currentStep--;
    renderCurrentStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
```

### **Fix 3: renderCurrentStep() function (add at end)**
```javascript
function renderCurrentStep() {
  const main = document.getElementById('main');
  if (!main) return;
  
  const nav = document.getElementById('nav');
  if (nav) nav.style.display = 'none';
  
  switch (currentStep) {
    // ... all your cases ...
  }
  
  // ADD THIS LINE AT THE END:
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
```

---

## 📍 Where to Find These Functions

All in `/js/modules/onboarding.js`:
- `next()` - around line 735
- `back()` - around line 750
- `renderCurrentStep()` - around line 150

---

**Time:** 2 minutes to add these 3 lines
**Impact:** Consistent scroll behavior throughout app ✅
