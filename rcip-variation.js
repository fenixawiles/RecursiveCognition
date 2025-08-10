/**
 * RCIP Variation and Anti-Repetition System
 * Prevents robotic patterns and adds natural conversation flow
 */

import { STATES, MOVES } from './rcip-engine.js';

class RCIPVariationSystem {
  constructor() {
    this.patternHistory = [];
    this.toneHistory = [];
    this.lastFramings = [];
    this.maxHistoryLength = 5;
  }

  /**
   * Detect and prevent structural repetition
   */
  detectRepetition(currentTemplate, templateKey) {
    // Extract structural patterns from templates
    const pattern = this.extractStructuralPattern(currentTemplate);
    
    // Check for repetition in recent history
    const recentPatterns = this.patternHistory.slice(-2);
    const repetitionCount = recentPatterns.filter(p => p === pattern).length;
    
    // Track this pattern
    this.patternHistory.push(pattern);
    if (this.patternHistory.length > this.maxHistoryLength) {
      this.patternHistory.shift();
    }
    
    return {
      isRepetitive: repetitionCount >= 2,
      pattern,
      repetitionCount,
      shouldBreakPattern: repetitionCount >= 2
    };
  }

  /**
   * Extract structural patterns from templates
   */
  extractStructuralPattern(template) {
    // Common repetitive patterns to detect
    const patterns = [
      { name: 'tension_choice', regex: /tension.*choose.*both/i },
      { name: 'most_people', regex: /most people.*feel.*have to/i },
      { name: 'what_if', regex: /what if.*both.*true/i },
      { name: 'sounds_like', regex: /sounds like.*intersection/i },
      { name: 'notice_framing', regex: /notice.*framing.*versus/i },
      { name: 'powerful_holding', regex: /powerful.*holding.*same time/i },
      { name: 'resistance_wisdom', regex: /resistance.*wisdom.*protective/i }
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(template)) {
        return pattern.name;
      }
    }

    return 'generic';
  }

  /**
   * Generate pattern-breaking alternatives when repetition is detected
   */
  generatePatternBreaker(state, move, scratchpad, userInput, repetitionInfo) {
    const breakers = {
      // Direct challenges
      direct_challenge: [
        "I think the deeper issue might be that you're not questioning the premise itself.",
        "Here's what I suspect is really happening: you're solving the wrong problem.",
        "The real challenge isn't the choice—it's the assumption that this choice defines you."
      ],
      
      // Pattern naming
      pattern_naming: [
        "This fits the pattern of 'false dilemma thinking'—where complex situations get reduced to binary choices.",
        "I'm seeing the classic 'security vs. growth' archetype playing out here.",
        "This has the shape of what psychologists call 'approach-avoidance conflict.'"
      ],
      
      // Hypothesis testing
      hypothesis_testing: [
        "If security is what you really value, then what happens when you test that assumption?",
        "If the fear disappeared tomorrow, what would your decision look like?",
        "If you had to explain this to your future self in 5 years, what would matter most?"
      ],
      
      // Analogy reframes
      analogy_reframe: [
        "It's like you're standing at the edge of a pool, spending all your time debating whether the water is cold instead of just dipping your toe in.",
        "This reminds me of someone trying to plan the perfect route while sitting in the parking lot—at some point, you have to start driving.",
        "You're like an artist staring at a blank canvas, paralyzed by all the possible paintings instead of making the first brushstroke."
      ]
    };

    // Select breaker type based on state and context
    const breakerType = this.selectBreakerType(state, repetitionInfo.pattern);
    const options = breakers[breakerType] || breakers.direct_challenge;
    
    return {
      template: options[Math.floor(Math.random() * options.length)],
      breakerType,
      guardrail: "Break the pattern; provide fresh perspective without falling into repetitive structures"
    };
  }

  /**
   * Select appropriate pattern breaker based on context
   */
  selectBreakerType(state, repeatedPattern) {
    const breakerMap = {
      'tension_choice': 'direct_challenge',
      'most_people': 'pattern_naming',
      'what_if': 'hypothesis_testing',
      'sounds_like': 'analogy_reframe',
      'powerful_holding': 'direct_challenge',
      'resistance_wisdom': 'hypothesis_testing'
    };

    return breakerMap[repeatedPattern] || 'direct_challenge';
  }

  /**
   * Generate tonal variations to prevent flat delivery
   */
  generateTonalVariation(baseTemplate, turn) {
    const tones = ['empathetic', 'pragmatic', 'provocative', 'metaphorical'];
    const currentTone = tones[turn % tones.length];
    
    // Track tone history
    this.toneHistory.push(currentTone);
    if (this.toneHistory.length > 4) {
      this.toneHistory.shift();
    }
    
    return this.applyTone(baseTemplate, currentTone);
  }

  /**
   * Apply specific tonal modifications
   */
  applyTone(template, tone) {
    const toneModifiers = {
      empathetic: {
        prefix: "I can feel the weight of this decision. ",
        softeners: ["might", "perhaps", "it sounds like"],
        endings: ["And that's completely understandable."]
      },
      
      pragmatic: {
        prefix: "Let's get concrete. ",
        directifiers: ["Here's what matters:", "The key question is:", "Bottom line:"],
        endings: ["What's the smallest step you could take tomorrow?"]
      },
      
      provocative: {
        prefix: "I'm going to push back a little. ",
        challengers: ["But what if", "Here's what I notice", "The real question might be"],
        endings: ["What would change if you stopped needing permission?"]
      },
      
      metaphorical: {
        prefix: "Think of this like ",
        analogies: ["navigating in fog", "tending a garden", "building a bridge"],
        endings: ["What does that metaphor tell you about your next step?"]
      }
    };

    const modifier = toneModifiers[tone];
    if (!modifier) return template;

    // Apply tone-specific modifications (simplified for demo)
    return `${modifier.prefix || ''}${template}`;
  }

  /**
   * Check for insight escalation triggers
   */
  shouldEscalateInsight(recentResponses) {
    const lastTwoHadNewFraming = recentResponses.slice(-2).every(response => 
      this.hasNewFraming(response) || this.hasConcreteNextStep(response)
    );
    
    return !lastTwoHadNewFraming;
  }

  /**
   * Check if response contains new framing
   */
  hasNewFraming(response) {
    const framingIndicators = [
      /what if.*instead/i,
      /real.*question/i,
      /deeper.*issue/i,
      /pattern.*of/i,
      /reframe/i
    ];
    
    return framingIndicators.some(indicator => indicator.test(response));
  }

  /**
   * Check if response contains concrete next step
   */
  hasConcreteNextStep(response) {
    const actionIndicators = [
      /next step/i,
      /try.*this/i,
      /start.*with/i,
      /tomorrow/i,
      /first.*thing/i
    ];
    
    return actionIndicators.some(indicator => indicator.test(response));
  }

  /**
   * Generate insight escalation response
   */
  generateInsightEscalation(state, scratchpad, conversationHistory) {
    const escalationTypes = [
      'synthesis_push',
      'throughline_attempt',
      'meta_observation'
    ];

    const type = escalationTypes[Math.floor(Math.random() * escalationTypes.length)];
    
    return this.createEscalationResponse(type, state, scratchpad, conversationHistory);
  }

  /**
   * Create specific escalation responses
   */
  createEscalationResponse(type, state, scratchpad, conversationHistory) {
    switch (type) {
      case 'synthesis_push':
        return {
          template: "Let me tie some threads together. What I'm hearing is a core tension between [X] and [Y], but the real issue seems to be [Z]. What if we approached this from that angle?",
          type: 'synthesis_push',
          guardrail: "Synthesize the conversation so far and propose a new angle"
        };
        
      case 'throughline_attempt':
        return {
          template: "Here's what I think is really going on: you're not just deciding between options—you're trying to figure out who you want to become. Does that resonate?",
          type: 'throughline_attempt',
          guardrail: "Offer a throughline interpretation of their deeper struggle"
        };
        
      case 'meta_observation':
        return {
          template: "I notice we've been circling around this question, which itself might be the answer. What is it about this decision that keeps bringing you back to the same place?",
          type: 'meta_observation',
          guardrail: "Make a meta-observation about the conversation pattern itself"
        };
        
      default:
        return {
          template: "What's the one thing you haven't said yet that might be the key to all of this?",
          type: 'direct_probe',
          guardrail: "Ask for the unexpressed core issue"
        };
    }
  }

  /**
   * Reduce over-mirroring by adding new frames
   */
  reduceMirroring(userInput, proposedResponse) {
    const mirroringScore = this.calculateMirroringScore(userInput, proposedResponse);
    
    if (mirroringScore > 0.7) { // High mirroring detected
      return this.addNewFraming(proposedResponse);
    }
    
    return proposedResponse;
  }

  /**
   * Calculate how much the response mirrors the user input
   */
  calculateMirroringScore(userInput, response) {
    const userWords = new Set(userInput.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    const responseWords = new Set(response.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    
    const intersection = new Set([...userWords].filter(x => responseWords.has(x)));
    return intersection.size / Math.max(userWords.size, 1);
  }

  /**
   * Add new framing to reduce mirroring
   */
  addNewFraming(response) {
    const framingAdditions = [
      "Here's another way to think about it: ",
      "What if we zoom out and consider ",
      "I'm wondering if this is really about ",
      "From a different angle, this looks like ",
      "The underlying question might be "
    ];
    
    const addition = framingAdditions[Math.floor(Math.random() * framingAdditions.length)];
    return `${addition}${response}`;
  }

  /**
   * Main variation processing function
   */
  processVariation(templateData, state, move, scratchpad, userInput, turn, conversationHistory) {
    let result = {
      template: templateData.template,
      guardrail: templateData.guardrail,
      variation_applied: [],
      metadata: templateData.metadata
    };

    // 1. Check for structural repetition
    const repetitionInfo = this.detectRepetition(result.template, `${state}.${move}`);
    
    if (repetitionInfo.shouldBreakPattern) {
      const patternBreaker = this.generatePatternBreaker(state, move, scratchpad, userInput, repetitionInfo);
      result.template = patternBreaker.template;
      result.guardrail = patternBreaker.guardrail;
      result.variation_applied.push('pattern_breaker');
    }

    // 2. Apply tonal variation
    if (turn % 3 === 0) {  // Every 3-4 turns
      result.template = this.generateTonalVariation(result.template, turn);
      result.variation_applied.push('tonal_variation');
    }

    // 3. Check for insight escalation
    if (this.shouldEscalateInsight(conversationHistory.slice(-2))) {
      const escalation = this.generateInsightEscalation(state, scratchpad, conversationHistory);
      result.template = escalation.template;
      result.guardrail = escalation.guardrail;
      result.variation_applied.push('insight_escalation');
    }

    // 4. Reduce over-mirroring
    result.template = this.reduceMirroring(userInput, result.template);
    if (this.calculateMirroringScore(userInput, result.template) < 0.5) {
      result.variation_applied.push('mirroring_reduced');
    }

    return result;
  }

  /**
   * Reset variation system for new session
   */
  reset() {
    this.patternHistory = [];
    this.toneHistory = [];
    this.lastFramings = [];
  }
}

// Global instance
const variationSystem = new RCIPVariationSystem();

export { RCIPVariationSystem, variationSystem };
