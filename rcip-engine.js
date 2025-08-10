/**
 * RCIP (Recursive Clarification, Integration, and Prompting) Engine
 * A state machine for intelligent conversation flow
 */

// Core states and moves
const STATES = {
  PROMPTING: 'PROMPTING',
  REFLECTION: 'REFLECTION', 
  CLARIFICATION: 'CLARIFICATION',
  SYNTHESIS: 'SYNTHESIS'
};

const MOVES = {
  PROMPTING: {
    ROLE_ANCHORED: 'ROLE_ANCHORED',
    OBSERVATION_DRIVEN: 'OBSERVATION_DRIVEN',
    CONSTRAINT_ANCHORED: 'CONSTRAINT_ANCHORED',
    STANCE_PRIMED: 'STANCE_PRIMED',
    DIAGNOSTIC_FLAG: 'DIAGNOSTIC_FLAG'
  },
  REFLECTION: {
    PRECEDENCE_SETTING: 'PRECEDENCE_SETTING',
    CONCRETE_ANCHOR: 'CONCRETE_ANCHOR',
    ASSOCIATIVE_BRANCH: 'ASSOCIATIVE_BRANCH',
    RESISTANCE_MIRROR: 'RESISTANCE_MIRROR'
  },
  CLARIFICATION: {
    ASSERT_TAXONOMIZE: 'ASSERT_TAXONOMIZE',
    BOUNDARY_REPLACE: 'BOUNDARY_REPLACE',
    ROLEBOX_CRITERIA: 'ROLEBOX_CRITERIA',
    SINGLE_NEEDLE: 'SINGLE_NEEDLE',
    CLARITY_RHYTHM: 'CLARITY_RHYTHM'
  },
  SYNTHESIS: {
    STRUCTURED_GRAY: 'STRUCTURED_GRAY',
    MEMORY_ANCHOR: 'MEMORY_ANCHOR',
    RHYTHM_TO_METHOD: 'RHYTHM_TO_METHOD',
    TRIANGULATION_ARC: 'TRIANGULATION_ARC',
    CONSTRAINT_TO_METHOD: 'CONSTRAINT_TO_METHOD',
    COLD_CORE: 'COLD_CORE'
  }
};

class RCIPEngine {
  constructor() {
    this.state = STATES.PROMPTING;
    this.turnCount = 0;
    this.maxTurns = 20;
    this.moveHistory = [];
    this.scratchpad = this.initScratchpad();
  }

  initScratchpad() {
    return {
      goal: "",
      assumptions: [],
      truths_in_tension: [],
      definitions: {},
      acceptance_criteria: {},
      throughline: "",
      open_questions: [],
      move_history: [],
      entities: [],
      recent_themes: []
    };
  }

  // Intent detection using heuristics with discretion
  detectIntent(userInput, conversationHistory) {
    const input = userInput.toLowerCase();
    const scores = {
      CLARIFICATION: 0,
      REFLECTION: 0,
      PROMPTING: 0,
      SYNTHESIS: 0
    };

    // Apply discretion penalty - reduce clarification if we've been asking too many questions
    const recentClarifications = this.moveHistory.slice(-3).filter(move => 
      move.state === 'CLARIFICATION'
    ).length;
    
    if (recentClarifications >= 2) {
      scores.CLARIFICATION -= 3; // Strong penalty
      scores.REFLECTION += 1; // Bias toward reflection instead
    }

    // Clarification signals
    const clarificationSignals = [
      /i'm not sure/i, /this is fuzzy/i, /what do (?:you|we) mean by/i,
      /define/i, /difference between/i, /unclear/i, /confused/i,
      /what exactly/i, /can you clarify/i
    ];
    clarificationSignals.forEach(regex => {
      if (regex.test(input)) scores.CLARIFICATION += 2;
    });

    // Reflection signals
    const reflectionSignals = [
      /two things can be true/i, /i feel/i, /this reminds me/i,
      /i keep circling/i, /on one hand.*on the other/i, /conflicted/i,
      /tension/i, /contradiction/i, /both.*and/i
    ];
    reflectionSignals.forEach(regex => {
      if (regex.test(input)) scores.REFLECTION += 2;
    });

    // Prompting signals  
    const promptingSignals = [
      /what's next/i, /where do i start/i, /propose options/i,
      /act as/i, /help me/i, /what should/i, /how do i/i,
      /ideas/i, /suggestions/i
    ];
    promptingSignals.forEach(regex => {
      if (regex.test(input)) scores.PROMPTING += 2;
    });

    // Synthesis signals
    const synthesisSignals = [
      /tie this together/i, /final core/i, /therefore/i,
      /step-by-step plan/i, /one-liner/i, /in conclusion/i,
      /to summarize/i, /bottom line/i, /core insight/i
    ];
    synthesisSignals.forEach(regex => {
      if (regex.test(input)) scores.SYNTHESIS += 2;
    });

    // Priority routing: Clarification > Reflection > Synthesis > Prompting
    const sortedStates = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .filter(([,score]) => score > 0);

    if (sortedStates.length === 0) {
      // Default to current state or prompting
      return this.state || STATES.PROMPTING;
    }

    // Apply priority routing if multiple states tie
    const maxScore = sortedStates[0][1];
    const tiedStates = sortedStates.filter(([,score]) => score === maxScore);
    
    if (tiedStates.length > 1) {
      const priorities = [STATES.CLARIFICATION, STATES.REFLECTION, STATES.SYNTHESIS, STATES.PROMPTING];
      for (const priority of priorities) {
        if (tiedStates.find(([state]) => state === priority)) {
          return priority;
        }
      }
    }

    return sortedStates[0][0];
  }

  // Detect specific move within a state
  detectMove(state, userInput, conversationHistory) {
    const input = userInput.toLowerCase();
    
    switch (state) {
      case STATES.CLARIFICATION:
        return this.detectClarificationMove(input);
      case STATES.REFLECTION:
        return this.detectReflectionMove(input);
      case STATES.PROMPTING:
        return this.detectPromptingMove(input);
      case STATES.SYNTHESIS:
        return this.detectSynthesisMove(input);
      default:
        return null;
    }
  }

  detectClarificationMove(input) {
    if (/\s+vs?\s+|\s+or\s+|versus/i.test(input)) {
      return MOVES.CLARIFICATION.ASSERT_TAXONOMIZE;
    }
    if (/can you remember|track|access|recall/i.test(input)) {
      return MOVES.CLARIFICATION.BOUNDARY_REPLACE;
    }
    if (/judge|evaluate|assess|rate/i.test(input)) {
      return MOVES.CLARIFICATION.ROLEBOX_CRITERIA;
    }
    if (/either.*or|this.*that|one.*other/i.test(input)) {
      return MOVES.CLARIFICATION.SINGLE_NEEDLE;
    }
    if (/scattered|many|threads|overwhelming|all over/i.test(input)) {
      return MOVES.CLARIFICATION.CLARITY_RHYTHM;
    }
    
    return MOVES.CLARIFICATION.SINGLE_NEEDLE; // Default
  }

  detectReflectionMove(input) {
    if (/both.*true|tension|conflict|competing/i.test(input)) {
      return MOVES.REFLECTION.PRECEDENCE_SETTING;
    }
    if (/when i|that time|specific|moment|instance/i.test(input)) {
      return MOVES.REFLECTION.CONCRETE_ANCHOR;
    }
    if (/reminds me|tangent|related|similar to/i.test(input)) {
      return MOVES.REFLECTION.ASSOCIATIVE_BRANCH;
    }
    if (/don't decide|just reflect|sit with|feel into/i.test(input)) {
      return MOVES.REFLECTION.RESISTANCE_MIRROR;
    }
    
    return MOVES.REFLECTION.PRECEDENCE_SETTING; // Default
  }

  detectPromptingMove(input) {
    if (/high stakes|critical|important|gatekeeper/i.test(input)) {
      return MOVES.PROMPTING.ROLE_ANCHORED;
    }
    if (/observation|notice|don't resolve|just observe/i.test(input)) {
      return MOVES.PROMPTING.OBSERVATION_DRIVEN;
    }
    if (/constraint|requirement|must|need to|have to/i.test(input)) {
      return MOVES.PROMPTING.CONSTRAINT_ANCHORED;
    }
    if (/tone|style|approach|manner|way/i.test(input)) {
      return MOVES.PROMPTING.STANCE_PRIMED;
    }
    if (/diagnose|phenomenon|what's happening|weird|strange/i.test(input)) {
      return MOVES.PROMPTING.DIAGNOSTIC_FLAG;
    }
    
    return MOVES.PROMPTING.ROLE_ANCHORED; // Default
  }

  detectSynthesisMove(input) {
    if (/contradiction.*decision|choose between|resolve/i.test(input)) {
      return MOVES.SYNTHESIS.STRUCTURED_GRAY;
    }
    if (/memory.*linked|connected|relationship/i.test(input)) {
      return MOVES.SYNTHESIS.MEMORY_ANCHOR;
    }
    if (/repeated|loop|pattern|cycle/i.test(input)) {
      return MOVES.SYNTHESIS.RHYTHM_TO_METHOD;
    }
    if (/critique.*example|proposal|three/i.test(input)) {
      return MOVES.SYNTHESIS.TRIANGULATION_ARC;
    }
    if (/external.*requirement|satisfy|meet/i.test(input)) {
      return MOVES.SYNTHESIS.CONSTRAINT_TO_METHOD;
    }
    if (/final|tighten|core|essence/i.test(input)) {
      return MOVES.SYNTHESIS.COLD_CORE;
    }
    
    return MOVES.SYNTHESIS.STRUCTURED_GRAY; // Default
  }

  // Check if conversation should end
  isDone() {
    return (
      (this.scratchpad.throughline && Object.keys(this.scratchpad.acceptance_criteria).length > 0) ||
      this.turnCount >= this.maxTurns ||
      this.scratchpad.explicitly_satisfied
    );
  }

  // Main processing function
  processUserInput(userInput, conversationHistory = []) {
    this.turnCount++;
    
    // 1) Detect step intent
    const detectedState = this.detectIntent(userInput, conversationHistory);
    this.state = detectedState;
    
    // 2) Select sub-move
    const move = this.detectMove(this.state, userInput, conversationHistory);
    
    // 3) Update move history
    this.moveHistory.push({
      turn: this.turnCount,
      state: this.state,
      move: move,
      input: userInput.substring(0, 100) // Truncated for privacy
    });
    
    this.scratchpad.move_history = this.moveHistory;
    
    // 4) Extract entities and themes
    this.updateScratchpadEntities(userInput);
    
    return {
      state: this.state,
      move: move,
      turnCount: this.turnCount,
      isDone: this.isDone(),
      scratchpad: { ...this.scratchpad },
      nextStateHint: this.getNextStateHint(this.state, move)
    };
  }

  updateScratchpadEntities(userInput) {
    // Simple entity extraction (can be enhanced with NLP)
    const words = userInput.toLowerCase().split(/\s+/);
    const importantWords = words.filter(word => 
      word.length > 3 && 
      !['this', 'that', 'with', 'from', 'they', 'them', 'were', 'been', 'have'].includes(word)
    );
    
    // Update entities (keep recent 20)
    this.scratchpad.entities = [...new Set([...importantWords, ...this.scratchpad.entities])].slice(0, 20);
  }

  getNextStateHint(currentState, currentMove) {
    // Provide hints for next likely transitions
    const hints = {
      [`${STATES.CLARIFICATION}.${MOVES.CLARIFICATION.SINGLE_NEEDLE}`]: 
        "If user picks one decisively → SYNTHESIS.STRUCTURED_GRAY, if still fuzzy → CLARIFICATION.CLARITY_RHYTHM",
      [`${STATES.REFLECTION}.${MOVES.REFLECTION.PRECEDENCE_SETTING}`]: 
        "If tension is clear → CLARIFICATION for terms, if resolved → SYNTHESIS",
      [`${STATES.PROMPTING}.${MOVES.PROMPTING.OBSERVATION_DRIVEN}`]: 
        "Must not auto-synthesize, wait for user reflection or clarification request",
      [`${STATES.SYNTHESIS}.${MOVES.SYNTHESIS.COLD_CORE}`]: 
        "Likely endpoint - deliver throughline and criteria"
    };
    
    return hints[`${currentState}.${currentMove}`] || "Continue with natural flow";
  }

  // Update scratchpad with specific insights
  updateScratchpad(updates) {
    Object.assign(this.scratchpad, updates);
  }

  // Reset for new session
  reset() {
    this.state = STATES.PROMPTING;
    this.turnCount = 0;
    this.moveHistory = [];
    this.scratchpad = this.initScratchpad();
  }
}

export { RCIPEngine, STATES, MOVES };
