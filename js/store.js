{
  "welcome": {
    "messages": [
      "Hello! I'm so glad you're here. 👋",
      "I'm your coach at Alongside. Not ahead of you, not behind you — right here, alongside you.",
      "Before we start, I'd love to learn a little about you. Don't worry — we can always fill in details later."
    ],
    "type": "continue",
    "buttonText": "Let's begin",
    "next": "askName"
  },
  
  "askName": {
    "message": "First things first — what should I call you?",
    "type": "text",
    "dataKey": "name",
    "placeholder": "Your name",
    "autocomplete": "given-name",
    "buttonText": "That's me",
    "next": "greetName"
  },
  
  "greetName": {
    "message": "Lovely to meet you, {{name}}! 😊",
    "type": "continue",
    "buttonText": "Nice to meet you too",
    "next": "askWhy"
  },
  
  "askWhy": {
    "messages": [
      "So, {{name}}, what brought you to Alongside today?",
      "There's no wrong answer here — I just want to understand what matters to you."
    ],
    "type": "options",
    "dataKey": "motivation",
    "options": [
      {
        "value": "goal",
        "icon": "🎯",
        "label": "I have a specific goal",
        "description": "A race, an event, or a target I'm working towards",
        "next": "askGoalType"
      },
      {
        "value": "health",
        "icon": "💚",
        "label": "I want to feel better",
        "description": "More energy, less pain, better sleep",
        "next": "askHealthFocus"
      },
      {
        "value": "habit",
        "icon": "🔄",
        "label": "I need help building habits",
        "description": "I know what to do, I just struggle to do it consistently",
        "next": "askHabitChallenge"
      },
      {
        "value": "restart",
        "icon": "🌱",
        "label": "I'm starting again",
        "description": "Life got in the way, and I'm ready to try again",
        "next": "acknowledgeRestart"
      }
    ]
  },
  
  "askGoalType": {
    "message": "Brilliant! Having a goal gives us something to work towards together. What kind of goal is it?",
    "type": "options",
    "dataKey": "goalType",
    "options": [
      {
        "value": "running",
        "icon": "🏃",
        "label": "Running",
        "description": "5K, 10K, half marathon, or beyond",
        "next": "askRunningGoal"
      },
      {
        "value": "event",
        "icon": "🏅",
        "label": "An event or challenge",
        "description": "Triathlon, obstacle race, charity event",
        "next": "askEventGoal"
      },
      {
        "value": "strength",
        "icon": "💪",
        "label": "Get stronger",
        "description": "Build muscle, lift more, feel powerful",
        "next": "askStrengthGoal"
      },
      {
        "value": "weight",
        "icon": "⚖️",
        "label": "Change my body",
        "description": "Lose weight, tone up, feel confident",
        "next": "askWeightGoal"
      },
      {
        "value": "sport",
        "icon": "🎾",
        "label": "Improve at a sport",
        "description": "Tennis, golf, cycling, swimming, etc.",
        "next": "askSportGoal"
      }
    ]
  },
  
  "askRunningGoal": {
    "message": "Running! I love that. What's the target?",
    "type": "options",
    "dataKey": "primaryGoal",
    "options": [
      {
        "value": "first_5k",
        "icon": "🌟",
        "label": "Complete my first 5K",
        "description": "I'm new to running or coming back after a break",
        "next": "askConditions"
      },
      {
        "value": "faster_5k",
        "icon": "⏱️",
        "label": "Run a faster 5K",
        "description": "I can run 5K, now I want to get quicker",
        "next": "askConditions"
      },
      {
        "value": "10k",
        "icon": "🎯",
        "label": "Complete a 10K",
        "description": "Ready to go further",
        "next": "askConditions"
      },
      {
        "value": "half_marathon",
        "icon": "🏃‍♀️",
        "label": "Run a half marathon",
        "description": "13.1 miles of determination",
        "next": "askConditions"
      },
      {
        "value": "marathon",
        "icon": "🏆",
        "label": "Run a marathon (or beyond)",
        "description": "The big one",
        "next": "askConditions"
      }
    ]
  },
  
  "askHealthFocus": {
    "message": "Taking care of yourself is so important. What would make the biggest difference for you?",
    "type": "options",
    "dataKey": "primaryGoal",
    "options": [
      {
        "value": "more_energy",
        "icon": "⚡",
        "label": "More energy",
        "description": "I'm tired all the time",
        "next": "askConditions"
      },
      {
        "value": "less_pain",
        "icon": "🩹",
        "label": "Move without pain",
        "description": "Chronic pain or stiffness is limiting me",
        "next": "askConditions"
      },
      {
        "value": "better_sleep",
        "icon": "😴",
        "label": "Sleep better",
        "description": "I struggle to sleep or wake up tired",
        "next": "askConditions"
      },
      {
        "value": "reduce_stress",
        "icon": "🧘",
        "label": "Reduce stress",
        "description": "My mind needs as much help as my body",
        "next": "askConditions"
      },
      {
        "value": "stay_mobile",
        "icon": "🚶",
        "label": "Stay mobile and independent",
        "description": "I want to keep doing the things I love",
        "next": "askConditions"
      }
    ]
  },
  
  "askHabitChallenge": {
    "message": "You're definitely not alone there. What tends to get in the way?",
    "type": "options",
    "dataKey": "habitChallenge",
    "options": [
      {
        "value": "consistency",
        "icon": "📅",
        "label": "Staying consistent",
        "description": "I start strong but fade after a few weeks",
        "next": "acknowledgeConsistency"
      },
      {
        "value": "motivation",
        "icon": "🔋",
        "label": "Finding motivation",
        "description": "Some days I just can't get started",
        "next": "acknowledgeMotivation"
      },
      {
        "value": "time",
        "icon": "⏰",
        "label": "Finding time",
        "description": "Life is too busy and exercise gets squeezed out",
        "next": "acknowledgeTime"
      },
      {
        "value": "energy",
        "icon": "😴",
        "label": "Having enough energy",
        "description": "By the time I could exercise, I'm exhausted",
        "next": "acknowledgeEnergy"
      }
    ]
  },
  
  "acknowledgeConsistency": {
    "messages": [
      "Consistency is hard for everyone — and especially tough for certain brain types.",
      "That's exactly what Alongside is designed for. Every day, I'll meet you where you are. Even on a Level 2 energy day, showing up counts."
    ],
    "type": "continue",
    "buttonText": "That sounds helpful",
    "next": "askConditions"
  },
  
  "acknowledgeMotivation": {
    "messages": [
      "Motivation comes and goes — that's completely normal.",
      "The good news? We won't rely on motivation. We'll build systems that work even when motivation is low. And on those hard days, I'll be here with options that actually feel doable."
    ],
    "type": "continue",
    "buttonText": "I like that approach",
    "next": "askConditions"
  },
  
  "acknowledgeTime": {
    "messages": [
      "Time is the one thing we can't make more of.",
      "That's why every session I suggest will fit into the time you actually have — whether that's 5 minutes or 50. Something is always better than nothing."
    ],
    "type": "continue",
    "buttonText": "That's realistic",
    "next": "askConditions"
  },
  
  "acknowledgeEnergy": {
    "messages": [
      "When you're running on empty, the last thing you need is someone telling you to 'push harder'.",
      "Alongside works with your energy, not against it. Low energy day? Gentle movement. High energy day? Let's make it count."
    ],
    "type": "continue",
    "buttonText": "That makes sense",
    "next": "askConditions"
  },
  
  "acknowledgeRestart": {
    "messages": [
      "Welcome back, {{name}}. There's no judgment here — only a fresh start.",
      "Life gets in the way for everyone. What matters is that you're here now, ready to try again. That takes courage."
    ],
    "type": "continue",
    "buttonText": "Thank you",
    "next": "askConditions"
  },
  
  "askEventGoal": {
    "message": "How exciting! What kind of event are you training for?",
    "type": "options",
    "dataKey": "primaryGoal",
    "options": [
      {
        "value": "triathlon",
        "icon": "🏊",
        "label": "Triathlon",
        "description": "Swim, bike, run",
        "next": "askConditions"
      },
      {
        "value": "obstacle",
        "icon": "🧗",
        "label": "Obstacle course",
        "description": "Tough Mudder, Spartan, etc.",
        "next": "askConditions"
      },
      {
        "value": "charity",
        "icon": "❤️",
        "label": "Charity event",
        "description": "Walk, run, or cycle for a cause",
        "next": "askConditions"
      },
      {
        "value": "other_event",
        "icon": "🎯",
        "label": "Something else",
        "description": "Another type of challenge",
        "next": "askConditions"
      }
    ]
  },
  
  "askStrengthGoal": {
    "message": "Getting stronger is a brilliant goal. What does that look like for you?",
    "type": "options",
    "dataKey": "primaryGoal",
    "options": [
      {
        "value": "general_strength",
        "icon": "💪",
        "label": "General strength",
        "description": "Feel stronger in everyday life",
        "next": "askConditions"
      },
      {
        "value": "build_muscle",
        "icon": "🏋️",
        "label": "Build visible muscle",
        "description": "Look and feel more toned",
        "next": "askConditions"
      },
      {
        "value": "specific_lifts",
        "icon": "🎯",
        "label": "Hit specific lift targets",
        "description": "Squat, deadlift, bench goals",
        "next": "askConditions"
      }
    ]
  },
  
  "askWeightGoal": {
    "message": "I understand. What feels most important to you right now?",
    "type": "options",
    "dataKey": "primaryGoal",
    "options": [
      {
        "value": "lose_weight",
        "icon": "⚖️",
        "label": "Lose weight",
        "description": "Reduce body weight sustainably",
        "next": "askConditions"
      },
      {
        "value": "tone_up",
        "icon": "✨",
        "label": "Tone up",
        "description": "Look and feel more defined",
        "next": "askConditions"
      },
      {
        "value": "feel_confident",
        "icon": "💫",
        "label": "Feel confident in my body",
        "description": "It's about how I feel, not just how I look",
        "next": "askConditions"
      }
    ]
  },
  
  "askSportGoal": {
    "message": "Which sport are you focusing on?",
    "type": "options",
    "dataKey": "primaryGoal",
    "options": [
      {
        "value": "tennis",
        "icon": "🎾",
        "label": "Tennis",
        "next": "askConditions"
      },
      {
        "value": "golf",
        "icon": "⛳",
        "label": "Golf",
        "next": "askConditions"
      },
      {
        "value": "cycling",
        "icon": "🚴",
        "label": "Cycling",
        "next": "askConditions"
      },
      {
        "value": "swimming",
        "icon": "🏊",
        "label": "Swimming",
        "next": "askConditions"
      },
      {
        "value": "other_sport",
        "icon": "🏅",
        "label": "Something else",
        "next": "askConditions"
      }
    ]
  },
  
  "askConditions": {
    "messages": [
      "Thanks, {{name}}. Now, a really important question.",
      "Does your body have any conditions I should know about? Things like injuries, chronic pain, or health conditions that affect how you move?"
    ],
    "type": "options",
    "dataKey": "hasConditions",
    "options": [
      {
        "value": "yes",
        "icon": "🩹",
        "label": "Yes, I have some",
        "description": "I'll tell you about them",
        "next": "askConditionDetails"
      },
      {
        "value": "no",
        "icon": "✨",
        "label": "No, I'm good",
        "description": "Nothing significant right now",
        "next": "askEnergy"
      },
      {
        "value": "later",
        "icon": "⏭️",
        "label": "I'll add these later",
        "description": "Skip for now",
        "next": "askEnergy"
      }
    ]
  },
  
  "askConditionDetails": {
    "messages": [
      "Thank you for trusting me with this. I'll adapt every suggestion to work with your body, not against it.",
      "You can add specific conditions in your profile after we finish here. For now, just know that I'll always ask how things are feeling day-to-day."
    ],
    "type": "continue",
    "buttonText": "That sounds thoughtful",
    "next": "askEnergy"
  },
  
  "askEnergy": {
    "messages": [
      "One last thing before we get started.",
      "How's your energy right now? Be honest — there's no wrong answer."
    ],
    "type": "options",
    "dataKey": "currentEnergy",
    "options": [
      {
        "value": "low",
        "icon": "🔋",
        "label": "Pretty low",
        "description": "Running on empty",
        "next": "acknowledgeLowEnergy"
      },
      {
        "value": "moderate",
        "icon": "⚡",
        "label": "Moderate",
        "description": "I'm okay, not great",
        "next": "acknowledgeModerateEnergy"
      },
      {
        "value": "good",
        "icon": "💪",
        "label": "Feeling good",
        "description": "Ready to do something",
        "next": "acknowledgeGoodEnergy"
      },
      {
        "value": "high",
        "icon": "🔥",
        "label": "High energy",
        "description": "Let's go!",
        "next": "acknowledgeHighEnergy"
      }
    ]
  },
  
  "acknowledgeLowEnergy": {
    "messages": [
      "Thank you for being honest. Low energy days are completely valid.",
      "Here's the thing: on a low energy day, even putting on your trainers and doing 5 minutes of gentle movement counts. It keeps your identity as someone who moves.",
      "That's what Alongside is about. Meeting you where you are. Every single day."
    ],
    "type": "continue",
    "buttonText": "I needed to hear that",
    "next": "complete"
  },
  
  "acknowledgeModerateEnergy": {
    "messages": [
      "Moderate is real. It's where most of us live most of the time.",
      "On days like this, I'll suggest something sustainable — not too much, not too little. Something that leaves you feeling better than when you started."
    ],
    "type": "continue",
    "buttonText": "Sounds perfect",
    "next": "complete"
  },
  
  "acknowledgeGoodEnergy": {
    "messages": [
      "Brilliant! Good energy is a gift — let's use it wisely.",
      "When you're feeling good, that's the time to build. I'll suggest something that challenges you without burning you out."
    ],
    "type": "continue",
    "buttonText": "Let's do it",
    "next": "complete"
  },
  
  "acknowledgeHighEnergy": {
    "messages": [
      "Love that energy! 🔥",
      "High energy days are when we make real progress. I'll make sure we channel it well — pushing hard, but smart."
    ],
    "type": "continue",
    "buttonText": "I'm ready",
    "next": "complete"
  },
  
  "complete": {
    "messages": [
      "Perfect, {{name}}. We're all set.",
      "From now on, I'll check in with you each day. I'll ask how you're feeling, and I'll suggest two options that make sense for YOU — right then, right there.",
      "Remember: I'm not ahead of you, I'm not behind you. I'm alongside you. Always.",
      "Ready for your first check-in? 💪"
    ],
    "type": "complete"
  }
}

