/**
 * RCIP Session-Close Pipeline
 * Processes full conversation transcript through all 4 RCIP phases to generate insights
 */

import { RCIPEngine, STATES, MOVES } from './rcip-engine.js';
import { RCIPResponseGenerator } from './rcip-templates.js';

class RCIPPipeline {
  constructor() {
    this.engine = new RCIPEngine();
    this.responseGenerator = new RCIPResponseGenerator();
  }

  /**
   * Main pipeline function - processes full conversation transcript
   * @param {Array} conversationHistory - Full conversation messages
   * @param {Object} sessionMetadata - Session insights and metadata
   * @returns {Object} RCIP analysis with throughline, breakthrough, and next steps
   */
  async runRCIPPipeline(conversationHistory, sessionMetadata = {}) {
    console.log(`🧠 Running RCIP Pipeline on ${conversationHistory.length} messages...`);

    // Extract user messages only for analysis
    const userMessages = conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ');

    if (!userMessages.trim()) {
      return this.generateEmptyAnalysis();
    }

    // Phase 1: Prompting Analysis - What are they trying to explore?
    const promptingAnalysis = await this.runPromptingPhase(userMessages, conversationHistory);
    
    // Phase 2: Reflection Analysis - What tensions and patterns emerge?
    const reflectionAnalysis = await this.runReflectionPhase(userMessages, conversationHistory);
    
    // Phase 3: Clarification Analysis - What needs to be defined or distinguished?
    const clarificationAnalysis = await this.runClarificationPhase(userMessages, conversationHistory);
    
    // Phase 4: Synthesis Analysis - What's the throughline and breakthrough?
    const synthesisAnalysis = await this.runSynthesisPhase(
      userMessages, 
      conversationHistory,
      {
        prompting: promptingAnalysis,
        reflection: reflectionAnalysis,
        clarification: clarificationAnalysis,
        metadata: sessionMetadata
      }
    );

    return {
      phases: {
        prompting: promptingAnalysis,
        reflection: reflectionAnalysis,
        clarification: clarificationAnalysis,
        synthesis: synthesisAnalysis
      },
      throughline: synthesisAnalysis.throughline,
      breakthrough: synthesisAnalysis.breakthrough,
      nextStep: synthesisAnalysis.nextStep,
      keyInsights: this.extractKeyInsights(promptingAnalysis, reflectionAnalysis, clarificationAnalysis),
      conversationArc: this.analyzeConversationArc(conversationHistory)
    };
  }

  /**
   * Phase 1: Prompting - What's the core exploration?
   */
  async runPromptingPhase(userText, conversationHistory) {
    const promptingPrompt = `
RCIP PROMPTING PHASE ANALYSIS

Conversation Text: "${userText}"

Analyze this conversation through the PROMPTING lens. Focus on:
- What is the person fundamentally trying to explore or resolve?
- What constraints or requirements are shaping their situation?
- What role or identity are they operating from?
- What stance or approach might be most helpful?

Identify the PRIMARY EXPLORATION (one sentence) and KEY CONSTRAINTS (2-3 items).

Return JSON format:
{
  "primaryExploration": "One sentence describing what they're fundamentally trying to explore",
  "keyConstraints": ["constraint1", "constraint2", "constraint3"],
  "operatingRole": "The role/identity they're primarily speaking from",
  "suggestedStance": "The approach that might be most helpful"
}`;

    return await this.callLLMForAnalysis(promptingPrompt, 'prompting');
  }

  /**
   * Phase 2: Reflection - What tensions and patterns?
   */
  async runReflectionPhase(userText, conversationHistory) {
    const reflectionPrompt = `
RCIP REFLECTION PHASE ANALYSIS

Conversation Text: "${userText}"

Analyze this conversation through the REFLECTION lens. Focus on:
- What competing truths or tensions are present?
- What patterns or rhythms are repeating?
- What resistance or hesitation is showing up?
- What associations or connections are being made?

Identify the CORE TENSION (both sides) and RECURRING PATTERNS.

Return JSON format:
{
  "coreTension": {
    "side1": "First truth or force",
    "side2": "Second truth or force"
  },
  "recurringPatterns": ["pattern1", "pattern2"],
  "resistancePoints": ["What they're hesitant about"],
  "hiddenWisdom": "What the resistance or tension might be protecting or revealing"
}`;

    return await this.callLLMForAnalysis(reflectionPrompt, 'reflection');
  }

  /**
   * Phase 3: Clarification - What needs definition?
   */
  async runClarificationPhase(userText, conversationHistory) {
    const clarificationPrompt = `
RCIP CLARIFICATION PHASE ANALYSIS

Conversation Text: "${userText}"

Analyze this conversation through the CLARIFICATION lens. Focus on:
- What key terms or concepts are being used without clear definition?
- What distinctions are important but unclear?
- What boundaries need to be drawn?
- What criteria matter for evaluation?

Identify KEY TERMS that need definition and IMPORTANT DISTINCTIONS.

Return JSON format:
{
  "keyTerms": {
    "term1": "operational definition",
    "term2": "operational definition"
  },
  "importantDistinctions": ["A vs B", "X vs Y"],
  "evaluationCriteria": ["What matters most for judging success"],
  "boundariesToDraw": ["What's in scope vs out of scope"]
}`;

    return await this.callLLMForAnalysis(clarificationPrompt, 'clarification');
  }

  /**
   * Phase 4: Synthesis - Generate throughline and breakthrough
   */
  async runSynthesisPhase(userText, conversationHistory, priorAnalysis) {
    const synthesisPrompt = `
RCIP SYNTHESIS PHASE - BREAKTHROUGH GENERATION

Original Conversation: "${userText}"

Prior RCIP Analysis:
- Primary Exploration: ${priorAnalysis.prompting.primaryExploration}
- Core Tension: ${priorAnalysis.prompting.keyConstraints?.join(', ')}
- Key Patterns: ${priorAnalysis.reflection.recurringPatterns?.join(', ')}
- Hidden Wisdom: ${priorAnalysis.reflection.hiddenWisdom}

Now synthesize everything into:

1. THROUGHLINE (1 sentence): The deepest insight that connects everything
2. BREAKTHROUGH (1 paragraph): The key realization or shift in perspective
3. NEXT STEP (1 concrete action): What they should do next, given this understanding

Use COLD CORE synthesis mode: Be decisive, crisp, and actionable.

Return JSON format:
{
  "throughline": "One sentence that captures the deepest connecting insight",
  "breakthrough": "One paragraph describing the key realization or perspective shift",
  "nextStep": "One concrete, actionable next step",
  "integrationPath": "How to live with any tensions rather than resolve them"
}`;

    return await this.callLLMForAnalysis(synthesisPrompt, 'synthesis');
  }

  /**
   * Call LLM for analysis - will use OpenAI if available, otherwise placeholders
   */
  async callLLMForAnalysis(prompt, phase) {
    // Try OpenAI first if available
    if (this.openaiClient) {
      try {
        return await this.callOpenAIForAnalysis(prompt, phase);
      } catch (error) {
        console.error(`OpenAI call failed for ${phase}, falling back to template:`, error);
        // Fall through to placeholder logic
      }
    }
    
    try {
      // Placeholder data structure for each phase
      const placeholders = {
        prompting: {
          primaryExploration: "Navigating a complex decision with competing values",
          keyConstraints: ["Time pressure", "Financial considerations", "Relationship impact"],
          operatingRole: "Someone weighing life changes",
          suggestedStance: "Patient exploration of underlying needs"
        },
        reflection: {
          coreTension: {
            side1: "Security and stability",
            side2: "Growth and freedom"
          },
          recurringPatterns: ["Circling back to same concerns", "Seeking external validation"],
          resistancePoints: ["Fear of making wrong choice"],
          hiddenWisdom: "The hesitation contains important information about what truly matters"
        },
        clarification: {
          keyTerms: {
            "success": "Living in alignment with core values",
            "security": "Having enough resources to handle uncertainty"
          },
          importantDistinctions: ["Security vs Safety", "Growth vs Change"],
          evaluationCriteria: ["Long-term fulfillment", "Impact on relationships"],
          boundariesToDraw: ["What's negotiable vs non-negotiable"]
        },
        synthesis: {
          throughline: "The tension between security and growth is pointing toward a need for sustainable change that honors both stability and evolution.",
          breakthrough: "This isn't about choosing between security and growth—it's about recognizing that true security comes from building the capacity to navigate change skillfully. The resistance to making a quick decision is actually wisdom, suggesting that the right path involves gradual, intentional steps that build confidence rather than dramatic leaps that create anxiety.",
          nextStep: "Identify one small, reversible step that moves toward growth while maintaining current stability",
          integrationPath: "Hold both security and growth as ongoing needs rather than competing forces"
        }
      };

      return placeholders[phase] || {};
      
    } catch (error) {
      console.error(`Error in ${phase} analysis:`, error);
      return {};
    }
  }

  /**
   * Extract key insights from all phases
   */
  extractKeyInsights(prompting, reflection, clarification) {
    const insights = [];
    
    if (prompting.primaryExploration) {
      insights.push(`Core exploration: ${prompting.primaryExploration}`);
    }
    
    if (reflection.coreTension) {
      insights.push(`Key tension: ${reflection.coreTension.side1} ↔ ${reflection.coreTension.side2}`);
    }
    
    if (reflection.hiddenWisdom) {
      insights.push(`Hidden wisdom: ${reflection.hiddenWisdom}`);
    }
    
    if (clarification.keyTerms && Object.keys(clarification.keyTerms).length > 0) {
      const terms = Object.keys(clarification.keyTerms);
      insights.push(`Important concepts: ${terms.join(', ')}`);
    }
    
    return insights;
  }

  /**
   * Analyze the arc of the conversation
   */
  analyzeConversationArc(conversationHistory) {
    const userMessages = conversationHistory.filter(msg => msg.role === 'user');
    
    return {
      messageCount: userMessages.length,
      conversationLength: userMessages.reduce((total, msg) => total + msg.content.length, 0),
      evolutionPattern: userMessages.length > 3 ? "Deepening exploration" : "Initial exploration",
      engagementLevel: userMessages.length > 5 ? "High" : userMessages.length > 2 ? "Medium" : "Low"
    };
  }

  /**
   * Generate empty analysis for sessions with no content
   */
  generateEmptyAnalysis() {
    return {
      phases: {
        prompting: { primaryExploration: "No significant exploration detected" },
        reflection: { coreTension: null },
        clarification: { keyTerms: {} },
        synthesis: { 
          throughline: "Session was too brief for meaningful synthesis",
          breakthrough: "No breakthrough insights generated",
          nextStep: "Continue exploring in future sessions"
        }
      },
      throughline: "Session was too brief for meaningful synthesis",
      breakthrough: "No breakthrough insights generated",
      nextStep: "Continue exploring in future sessions",
      keyInsights: [],
      conversationArc: { messageCount: 0, evolutionPattern: "Minimal", engagementLevel: "Low" }
    };
  }

  /**
   * Integration with OpenAI client (to be implemented)
   */
  setOpenAIClient(openaiClient) {
    this.openaiClient = openaiClient;
  }

  /**
   * Actually call OpenAI for analysis when client is available
   */
  async callOpenAIForAnalysis(prompt, phase) {
    if (!this.openaiClient) {
      return this.callLLMForAnalysis(prompt, phase);
    }

    try {
      const completion = await this.openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in conversation analysis. Respond only with valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
      
    } catch (error) {
      console.error(`Error calling OpenAI for ${phase}:`, error);
      return this.callLLMForAnalysis(prompt, phase); // Fallback to placeholder
    }
  }
}

// Global instance
const rcipPipeline = new RCIPPipeline();

export { RCIPPipeline, rcipPipeline };
