/**
 * RCIP Response Templates and Generation System
 * Templates for each move type with guardrails and slot-filling
 */

import { STATES, MOVES } from './rcip-engine.js';
import { variationSystem } from './rcip-variation.js';

const RESPONSE_TEMPLATES = {
  // CLARIFICATION MOVES
  [`${STATES.CLARIFICATION}.${MOVES.CLARIFICATION.SINGLE_NEEDLE}`]: {
    template: "It sounds like this sits at the intersection of {{A}} and {{B}}. Often when we're pulled between these, it's because each one serves a different need.",
    guardrail: "Offer perspective first, then gentle inquiry; avoid binary framing",
    slot_hints: ["A", "B"],
    post_hooks: ["maybe_transition_to_synthesis_if_decision"]
  },
  
  [`${STATES.CLARIFICATION}.${MOVES.CLARIFICATION.ASSERT_TAXONOMIZE}`]: {
    template: "I notice you're framing this as {{concept1}} versus {{concept2}}. Sometimes what feels like opposing forces are actually different facets of the same underlying need.",
    guardrail: "Offer reframe first; avoid interrogating the distinction",
    slot_hints: ["concept1", "concept2"],
    post_hooks: ["capture_definitions"]
  },
  
  [`${STATES.CLARIFICATION}.${MOVES.CLARIFICATION.BOUNDARY_REPLACE}`]: {
    template: "The word '{{term}}' seems to carry a lot of weight here. Often when a concept feels both important and slippery, it's because it represents something we haven't fully named yet.",
    guardrail: "Acknowledge the importance before seeking clarity; avoid direct definition requests",
    slot_hints: ["term"],
    post_hooks: ["update_definitions"]
  },
  
  [`${STATES.CLARIFICATION}.${MOVES.CLARIFICATION.ROLEBOX_CRITERIA}`]: {
    template: "If you were {{role}}, how would you evaluate this? What criteria would matter most?",
    guardrail: "Pick a specific, relevant role; avoid generic advisor roles",
    slot_hints: ["role"],
    post_hooks: ["capture_criteria"]
  },
  
  [`${STATES.CLARIFICATION}.${MOVES.CLARIFICATION.CLARITY_RHYTHM}`]: {
    template: "I'm noticing several threads here: {{thread1}}, {{thread2}}, {{thread3}}. Which one feels most urgent to untangle first?",
    guardrail: "List max 3 threads; let user choose priority",
    slot_hints: ["thread1", "thread2", "thread3"],
    post_hooks: ["prioritize_threads"]
  },

  // REFLECTION MOVES
  [`${STATES.REFLECTION}.${MOVES.REFLECTION.PRECEDENCE_SETTING}`]: {
    template: "There's something powerful about holding {{truth1}} and {{truth2}} at the same time. Most people feel they have to choose, but the tension itself might be telling you something important about what you actually need.",
    guardrail: "Honor both truths; suggest the tension contains wisdom rather than requiring resolution",
    slot_hints: ["truth1", "truth2"],
    post_hooks: ["capture_tension"]
  },
  
  [`${STATES.REFLECTION}.${MOVES.REFLECTION.CONCRETE_ANCHOR}`]: {
    template: "When you describe {{specific_moment}}, there's something about the way you tell it that suggests this moment was inevitable given everything that came before.",
    guardrail: "Reflect the weight of the moment; avoid probing for more details",
    slot_hints: ["specific_moment"],
    post_hooks: ["capture_context"]
  },
  
  [`${STATES.REFLECTION}.${MOVES.REFLECTION.ASSOCIATIVE_BRANCH}`]: {
    template: "Your mind connecting this to {{connection}} isn't random—there's usually a deep pattern our intuition picks up before our conscious mind does.",
    guardrail: "Trust their unconscious wisdom; don't force the connection to be explicit",
    slot_hints: ["connection"],
    post_hooks: ["track_associations"]
  },
  
  [`${STATES.REFLECTION}.${MOVES.REFLECTION.RESISTANCE_MIRROR}`]: {
    template: "That resistance to {{action}} might be protective wisdom rather than something to overcome. Sometimes our hesitation knows something we don't yet.",
    guardrail: "Reframe resistance as potentially useful information, not an obstacle",
    slot_hints: ["action"],
    post_hooks: ["honor_resistance"]
  },

  // PROMPTING MOVES
  [`${STATES.PROMPTING}.${MOVES.PROMPTING.ROLE_ANCHORED}`]: {
    template: "As someone who needs to {{critical_outcome}}, what would you never compromise on? What's your non-negotiable?",
    guardrail: "Anchor to high-stakes reality; avoid hypotheticals",
    slot_hints: ["critical_outcome"],
    post_hooks: ["identify_constraints"]
  },
  
  [`${STATES.PROMPTING}.${MOVES.PROMPTING.OBSERVATION_DRIVEN}`]: {
    template: "Observation: {{pattern}}. Don't try to fix this right now—just notice what comes up when you see that pattern.",
    guardrail: "Present observation neutrally; resist urge to immediately problem-solve",
    slot_hints: ["pattern"],
    post_hooks: ["capture_observations"]
  },
  
  [`${STATES.PROMPTING}.${MOVES.PROMPTING.CONSTRAINT_ANCHORED}`]: {
    template: "Given that you need to {{constraint}}, what's the smallest possible step that honors that requirement?",
    guardrail: "Keep constraints real and specific; focus on minimal viable action",
    slot_hints: ["constraint"],
    post_hooks: ["define_next_action"]
  },
  
  [`${STATES.PROMPTING}.${MOVES.PROMPTING.STANCE_PRIMED}`]: {
    template: "What if you approached this with {{stance}}? How would that change your first move?",
    guardrail: "Suggest stance, don't prescribe; let them feel into it",
    slot_hints: ["stance"],
    post_hooks: ["explore_approach"]
  },
  
  [`${STATES.PROMPTING}.${MOVES.PROMPTING.DIAGNOSTIC_FLAG}`]: {
    template: "There's something about {{phenomenon}} that doesn't fit the usual pattern. What are three possible explanations for what's really going on?",
    guardrail: "Present as diagnostic puzzle; encourage multiple hypotheses",
    slot_hints: ["phenomenon"],
    post_hooks: ["generate_hypotheses"]
  },

  // SYNTHESIS MOVES
  [`${STATES.SYNTHESIS}.${MOVES.SYNTHESIS.STRUCTURED_GRAY}`]: {
    template: "So the core tension is {{tension}}. If you had to live with both being true, what does that actually look like in practice?",
    guardrail: "Don't resolve to either/or; find the both/and structure",
    slot_hints: ["tension"],
    post_hooks: ["define_integration"]
  },
  
  [`${STATES.SYNTHESIS}.${MOVES.SYNTHESIS.MEMORY_ANCHOR}`]: {
    template: "This connects back to {{memory}}. What's the throughline from then to now that you're just seeing?",
    guardrail: "Help them see the pattern, not just the connection",
    slot_hints: ["memory"],
    post_hooks: ["capture_throughline"]
  },
  
  [`${STATES.SYNTHESIS}.${MOVES.SYNTHESIS.RHYTHM_TO_METHOD}`]: {
    template: "I notice you keep coming back to {{pattern}}. What if that's not a bug but a feature—what method is your system trying to tell you about?",
    guardrail: "Reframe repetition as information, not failure",
    slot_hints: ["pattern"],
    post_hooks: ["extract_method"]
  },
  
  [`${STATES.SYNTHESIS}.${MOVES.SYNTHESIS.TRIANGULATION_ARC}`]: {
    template: "Here's what I see: {{critique}}, {{example}}, {{proposal}}. What's the one thing that connects all three?",
    guardrail: "Present three concrete elements; let them find the connection",
    slot_hints: ["critique", "example", "proposal"],
    post_hooks: ["find_connection"]
  },
  
  [`${STATES.SYNTHESIS}.${MOVES.SYNTHESIS.CONSTRAINT_TO_METHOD}`]: {
    template: "To satisfy {{requirement}}, you'd need to {{method}}. What would success look like in 30 days?",
    guardrail: "Make the method concrete and time-bound",
    slot_hints: ["requirement", "method"],
    post_hooks: ["define_success_criteria"]
  },
  
  [`${STATES.SYNTHESIS}.${MOVES.SYNTHESIS.COLD_CORE}`]: {
    template: "Bottom line: {{throughline}}. The next right step is {{action}}. What would make you confident in taking that step?",
    guardrail: "Be decisive but check for confidence; deliver crisp conclusion",
    slot_hints: ["throughline", "action"],
    post_hooks: ["deliver_handoff"]
  }
};

class RCIPResponseGenerator {
  constructor() {
    this.templates = RESPONSE_TEMPLATES;
  }

  generateResponse(state, move, scratchpad, userInput, conversationHistory = []) {
    const templateKey = `${state}.${move}`;
    const template = this.templates[templateKey];
    
    if (!template) {
      return this.generateFallbackResponse(state, move, userInput);
    }
    
    // Fill template slots
    const filledTemplate = this.fillTemplateSlots(template, scratchpad, userInput);
    
    const baseResponse = {
      template: filledTemplate.text,
      guardrail: template.guardrail,
      post_hooks: template.post_hooks,
      metadata: {
        state,
        move,
        template_used: templateKey
      }
    };
    
    // Apply variation processing to prevent repetition and add dynamism
    const turnCount = scratchpad.move_history ? scratchpad.move_history.length : 0;
    const variedResponse = variationSystem.processVariation(
      baseResponse, 
      state, 
      move, 
      scratchpad, 
      userInput, 
      turnCount,
      conversationHistory
    );
    
    return {
      response: variedResponse.template,
      guardrail: variedResponse.guardrail,
      post_hooks: variedResponse.post_hooks,
      metadata: {
        ...variedResponse.metadata,
        variations_applied: variedResponse.variation_applied
      }
    };
  }

  fillTemplateSlots(template, scratchpad, userInput) {
    let text = template.template;
    const slots = {};
    
    // Extract slot placeholders
    const slotMatches = text.match(/\{\{(\w+)\}\}/g);
    if (!slotMatches) {
      return { text, slots };
    }
    
    // Fill each slot
    slotMatches.forEach(match => {
      const slotName = match.replace(/[{}]/g, '');
      const value = this.getSlotValue(slotName, template.slot_hints, scratchpad, userInput);
      if (value) {
        text = text.replace(match, value);
        slots[slotName] = value;
      }
    });
    
    return { text, slots };
  }

  getSlotValue(slotName, slotHints, scratchpad, userInput) {
    // Try to extract meaningful values based on slot name and available data
    const input = userInput.toLowerCase();
    
    // Common slot patterns
    if (slotName === 'A' || slotName === 'B') {
      return this.extractBinaryChoices(input, slotName);
    }
    
    if (slotName.includes('concept') || slotName.includes('truth')) {
      return this.extractConcepts(input, scratchpad);
    }
    
    if (slotName.includes('term')) {
      return this.extractTerms(input);
    }
    
    if (slotName.includes('role')) {
      return this.extractRole(input, scratchpad);
    }
    
    if (slotName.includes('thread')) {
      return this.extractThreads(input, scratchpad, slotName);
    }
    
    if (slotName.includes('tension')) {
      return this.extractTension(input, scratchpad);
    }
    
    if (slotName.includes('pattern')) {
      return this.extractPattern(input, scratchpad);
    }
    
    if (slotName.includes('constraint') || slotName.includes('requirement')) {
      return this.extractConstraints(input);
    }
    
    // Fallback: use entities from scratchpad
    if (scratchpad.entities.length > 0) {
      return scratchpad.entities[0];
    }
    
    return slotName; // Last resort: return the slot name itself
  }

  extractBinaryChoices(input, slotName) {
    // Look for A vs B patterns
    const patterns = [
      /(\w+)\s+(?:vs?|or|versus)\s+(\w+)/i,
      /either\s+(\w+)\s+or\s+(\w+)/i,
      /(\w+)\s+and\s+(\w+)/i
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return slotName === 'A' ? match[1] : match[2];
      }
    }
    
    return slotName === 'A' ? 'this' : 'that';
  }

  extractConcepts(input, scratchpad) {
    // Use entities or key nouns
    if (scratchpad.entities.length > 0) {
      return scratchpad.entities[0];
    }
    
    // Simple noun extraction
    const words = input.split(/\s+/);
    const concepts = words.filter(word => 
      word.length > 3 && 
      /^[a-zA-Z]+$/.test(word) &&
      !['this', 'that', 'with', 'from', 'they', 'them', 'were', 'been', 'have', 'will', 'would', 'could', 'should'].includes(word.toLowerCase())
    );
    
    return concepts[0] || 'this situation';
  }

  extractTerms(input) {
    // Look for quoted terms or emphasized words
    const quotedMatch = input.match(/["'](.*?)["']/);
    if (quotedMatch) return quotedMatch[1];
    
    const emphasizedMatch = input.match(/\*(\w+)\*|_(\w+)_/);
    if (emphasizedMatch) return emphasizedMatch[1] || emphasizedMatch[2];
    
    return 'this';
  }

  extractRole(input, scratchpad) {
    const roleKeywords = [
      'manager', 'leader', 'parent', 'partner', 'friend', 'colleague',
      'student', 'teacher', 'doctor', 'client', 'customer', 'advisor'
    ];
    
    for (const role of roleKeywords) {
      if (input.includes(role)) return role;
    }
    
    return 'someone in your position';
  }

  extractThreads(input, scratchpad, slotName) {
    if (scratchpad.entities.length === 0) {
      return `thread ${slotName.slice(-1)}`;
    }
    
    const index = parseInt(slotName.slice(-1)) - 1;
    return scratchpad.entities[index] || scratchpad.entities[0];
  }

  extractTension(input, scratchpad) {
    // Look for tension words
    const tensionWords = ['but', 'however', 'although', 'yet', 'while'];
    for (const word of tensionWords) {
      if (input.includes(word)) {
        const parts = input.split(word);
        if (parts.length >= 2) {
          return `${parts[0].trim()} vs ${parts[1].trim()}`;
        }
      }
    }
    
    if (scratchpad.truths_in_tension.length > 0) {
      return scratchpad.truths_in_tension[0];
    }
    
    return 'the competing forces you described';
  }

  extractPattern(input, scratchpad) {
    // Look for pattern words
    const patternWords = ['always', 'never', 'usually', 'often', 'tend to', 'keep'];
    for (const word of patternWords) {
      if (input.includes(word)) {
        return `the way you ${word}`;
      }
    }
    
    return 'this recurring theme';
  }

  extractConstraints(input) {
    // Look for constraint words
    const constraintWords = ['must', 'need to', 'have to', 'required', 'deadline'];
    for (const word of constraintWords) {
      if (input.includes(word)) {
        const index = input.indexOf(word);
        const following = input.substring(index).split(/\s+/).slice(0, 5).join(' ');
        return following;
      }
    }
    
    return 'meet your requirements';
  }

  generateFallbackResponse(state, move, userInput) {
    const fallbacks = {
      [STATES.CLARIFICATION]: "There's something important trying to surface here, something that needs space to be seen more clearly.",
      [STATES.REFLECTION]: "I sense layers in what you're sharing—the kind of complexity that doesn't resolve quickly but deserves patient attention.",
      [STATES.PROMPTING]: "Sometimes the next step becomes clearer when we stop trying to force it and let the situation show us what it needs.",
      [STATES.SYNTHESIS]: "The threads you've shared seem to be weaving together into something larger than their individual parts."
    };
    
    return {
      response: fallbacks[state] || "There's weight in what you're sharing. Sometimes the most important things need time to unfold.",
      guardrail: "Offer presence and acknowledgment rather than probing questions",
      post_hooks: [],
      metadata: {
        state,
        move,
        template_used: 'fallback'
      }
    };
  }
}

export { RCIPResponseGenerator, RESPONSE_TEMPLATES };
