/**
 * RCIP Integration with Sonder Chat System
 * Bridges the RCIP state machine with existing conversation flow
 */

import { RCIPEngine } from './rcip-engine.js';
import { RCIPResponseGenerator } from './rcip-templates.js';
import { rcipPipeline } from './rcip-pipeline.js';

class RCIPSonderBridge {
  constructor() {
    this.engine = new RCIPEngine();
    this.responseGenerator = new RCIPResponseGenerator();
    this.sessionData = new Map(); // Store per-session RCIP state
    this.scratchpadUI = null; // Reference to UI component
  }

  // Initialize RCIP for a new session
  initializeSession(sessionId) {
    this.engine.reset();
    this.sessionData.set(sessionId, {
      engine: new RCIPEngine(),
      responseGenerator: new RCIPResponseGenerator(),
      conversationHistory: []
    });
    
    console.log(`🧠 RCIP Engine initialized for session ${sessionId}`);
    return this.getSessionState(sessionId);
  }

  // Process user input through RCIP
  processUserMessage(sessionId, userInput, conversationHistory = []) {
    const session = this.sessionData.get(sessionId);
    if (!session) {
      return this.initializeSession(sessionId);
    }

    // Update conversation history
    session.conversationHistory.push({
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    });

    // Process through RCIP engine
    const rcipResult = session.engine.processUserInput(userInput, session.conversationHistory);
    
    // Generate appropriate response with conversation history for variation processing
    const responseData = session.responseGenerator.generateResponse(
      rcipResult.state,
      rcipResult.move,
      rcipResult.scratchpad,
      userInput,
      session.conversationHistory
    );

    // Create system message with RCIP guidance
    const systemMessage = this.createSystemMessage(rcipResult, responseData);
    
    // Update conversation history with RCIP metadata
    session.conversationHistory.push({
      role: 'system',
      content: systemMessage,
      rcip_metadata: {
        state: rcipResult.state,
        move: rcipResult.move,
        template_used: responseData.metadata.template_used,
        guardrail: responseData.guardrail,
        scratchpad_update: this.getScratchpadUpdate(rcipResult.scratchpad)
      },
      timestamp: new Date().toISOString()
    });

    return {
      systemMessage,
      rcipState: rcipResult,
      responseGuide: responseData,
      shouldUpdateUI: true,
      isDone: rcipResult.isDone
    };
  }

  // Create system message that guides the AI response
  createSystemMessage(rcipResult, responseData) {
    const { state, move, scratchpad } = rcipResult;
    
    const systemMessage = `
RCIP State: ${state}.${move} (Turn ${rcipResult.turnCount})

Response Template: "${responseData.response}"
Guardrail: ${responseData.guardrail}

Current Scratchpad:
- Goal: ${scratchpad.goal || 'Not yet defined'}
- Truths in Tension: ${scratchpad.truths_in_tension.join(', ') || 'None identified'}
- Definitions: ${Object.keys(scratchpad.definitions).length} defined terms
- Open Questions: ${scratchpad.open_questions.length} pending
- Throughline: ${scratchpad.throughline || 'Not yet synthesized'}

Instructions for Response:
1. Use the template as inspiration but make it conversational and natural
2. Follow the guardrail strictly - ${responseData.guardrail}
3. If this is a SYNTHESIS move and throughline exists, prepare for handoff
4. Stay focused on the current RCIP state purpose
5. Don't reference RCIP mechanics directly to the user

Next State Hint: ${rcipResult.nextStateHint}

Respond naturally as Sonder, incorporating the RCIP guidance above.`;

    return systemMessage;
  }

  // Extract meaningful scratchpad updates
  getScratchpadUpdate(scratchpad) {
    return {
      hasGoal: Boolean(scratchpad.goal),
      tensionCount: scratchpad.truths_in_tension.length,
      definitionCount: Object.keys(scratchpad.definitions).length,
      questionCount: scratchpad.open_questions.length,
      hasThroughline: Boolean(scratchpad.throughline),
      entityCount: scratchpad.entities.length
    };
  }

  // Update scratchpad with new insights (called after AI response)
  updateScratchpadFromResponse(sessionId, aiResponse, detectedInsights = {}) {
    const session = this.sessionData.get(sessionId);
    if (!session) return;

    const updates = {};

    // Extract and update based on AI response content
    if (detectedInsights.newTension) {
      updates.truths_in_tension = [
        ...session.engine.scratchpad.truths_in_tension,
        detectedInsights.newTension
      ].slice(-3); // Keep most recent 3
    }

    if (detectedInsights.newDefinition) {
      updates.definitions = {
        ...session.engine.scratchpad.definitions,
        [detectedInsights.newDefinition.term]: detectedInsights.newDefinition.definition
      };
    }

    if (detectedInsights.newQuestion) {
      updates.open_questions = [
        ...session.engine.scratchpad.open_questions,
        detectedInsights.newQuestion
      ].slice(-5); // Keep most recent 5
    }

    if (detectedInsights.throughline) {
      updates.throughline = detectedInsights.throughline;
    }

    if (detectedInsights.goal) {
      updates.goal = detectedInsights.goal;
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      session.engine.updateScratchpad(updates);
      
      // Trigger UI update if scratchpad panel is active
      if (this.scratchpadUI) {
        this.scratchpadUI.update(session.engine.scratchpad);
      }
    }
  }

  // Get current session state for UI display
  getSessionState(sessionId) {
    const session = this.sessionData.get(sessionId);
    if (!session) return null;

    return {
      currentState: session.engine.state,
      turnCount: session.engine.turnCount,
      maxTurns: session.engine.maxTurns,
      scratchpad: { ...session.engine.scratchpad },
      recentMoves: session.engine.moveHistory.slice(-3),
      isDone: session.engine.isDone()
    };
  }

  // Generate summary for completed sessions
  generateSessionSummary(sessionId) {
    const session = this.sessionData.get(sessionId);
    if (!session) return null;

    const scratchpad = session.engine.scratchpad;
    
    return {
      sessionId,
      totalTurns: session.engine.turnCount,
      finalState: session.engine.state,
      summary: {
        goal: scratchpad.goal,
        throughline: scratchpad.throughline,
        keyTensions: scratchpad.truths_in_tension,
        definitions: scratchpad.definitions,
        acceptanceCriteria: scratchpad.acceptance_criteria,
        openQuestions: scratchpad.open_questions
      },
      stateDistribution: this.calculateStateDistribution(session.engine.moveHistory),
      completionStatus: session.engine.isDone() ? 'complete' : 'incomplete'
    };
  }

  calculateStateDistribution(moveHistory) {
    const distribution = {
      PROMPTING: 0,
      REFLECTION: 0,
      CLARIFICATION: 0,
      SYNTHESIS: 0
    };

    moveHistory.forEach(move => {
      if (distribution[move.state] !== undefined) {
        distribution[move.state]++;
      }
    });

    return distribution;
  }

  // Integration with existing Sonder session export
  enhanceExportData(sessionId, existingExportData) {
    const rcipSummary = this.generateSessionSummary(sessionId);
    if (!rcipSummary) return existingExportData;

    return {
      ...existingExportData,
      rcip_analysis: rcipSummary,
      conversation_flow: {
        state_transitions: rcipSummary.stateDistribution,
        final_insights: {
          throughline: rcipSummary.summary.throughline,
          key_tensions: rcipSummary.summary.keyTensions,
          open_questions: rcipSummary.summary.openQuestions
        }
      }
    };
  }

  // Run comprehensive RCIP pipeline analysis on session close
  async generateRCIPBreakthroughReport(sessionId, openaiClient = null) {
    const session = this.sessionData.get(sessionId);
    if (!session) {
      console.warn(`No session found for ${sessionId}`);
      return null;
    }

    console.log(`🧠 Running comprehensive RCIP analysis for session ${sessionId}...`);
    
    // Set OpenAI client for real analysis
    if (openaiClient) {
      rcipPipeline.setOpenAIClient(openaiClient);
    }

    try {
      // Get full conversation history
      const conversationHistory = session.conversationHistory;
      
      // Get session metadata from current engine state
      const sessionMetadata = {
        totalTurns: session.engine.turnCount,
        finalState: session.engine.state,
        scratchpadData: session.engine.scratchpad,
        stateDistribution: this.calculateStateDistribution(session.engine.moveHistory)
      };

      // Run the full RCIP pipeline
      const pipelineResults = await rcipPipeline.runRCIPPipeline(
        conversationHistory,
        sessionMetadata
      );

      console.log(`✅ RCIP pipeline completed:`, {
        throughline: pipelineResults.throughline,
        breakthroughLength: pipelineResults.breakthrough?.length || 0,
        keyInsightsCount: pipelineResults.keyInsights?.length || 0
      });

      return {
        ...pipelineResults,
        sessionId,
        generatedAt: new Date().toISOString(),
        processingMode: openaiClient ? 'ai-powered' : 'template-based'
      };
      
    } catch (error) {
      console.error('Error running RCIP pipeline:', error);
      return {
        sessionId,
        error: 'Failed to generate RCIP breakthrough report',
        throughline: 'Analysis could not be completed',
        breakthrough: 'Technical error prevented breakthrough analysis',
        nextStep: 'Try running the analysis again',
        keyInsights: [],
        generatedAt: new Date().toISOString(),
        processingMode: 'error'
      };
    }
  }

  // Clean up session data
  clearSession(sessionId) {
    this.sessionData.delete(sessionId);
    console.log(`🗑️ RCIP session ${sessionId} cleared`);
  }

  // UI Integration Methods
  createScratchpadPanel() {
    const panel = document.createElement('div');
    panel.id = 'rcip-scratchpad';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      max-height: 400px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(79, 70, 229, 0.4);
      border-radius: 12px;
      padding: 16px;
      color: #e5e7eb;
      font-size: 0.8rem;
      z-index: 1000;
      overflow-y: auto;
      display: none;
    `;
    
    panel.innerHTML = `
      <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 12px;">
        <h4 style="margin: 0; color: #60a5fa;">RCIP Scratchpad</h4>
        <button id="toggle-scratchpad" style="background: none; border: none; color: #60a5fa; cursor: pointer;">×</button>
      </div>
      <div id="scratchpad-content"></div>
    `;

    document.body.appendChild(panel);
    
    // Toggle functionality
    document.getElementById('toggle-scratchpad').addEventListener('click', () => {
      panel.style.display = 'none';
    });

    this.scratchpadUI = {
      panel,
      update: (scratchpad) => this.updateScratchpadUI(scratchpad)
    };

    return panel;
  }

  updateScratchpadUI(scratchpad) {
    if (!this.scratchpadUI) return;

    const content = document.getElementById('scratchpad-content');
    if (!content) return;

    content.innerHTML = `
      <div style="margin-bottom: 8px;">
        <strong>State:</strong> ${this.engine.state}
      </div>
      <div style="margin-bottom: 8px;">
        <strong>Turn:</strong> ${this.engine.turnCount}/${this.engine.maxTurns}
      </div>
      ${scratchpad.goal ? `
        <div style="margin-bottom: 8px;">
          <strong>Goal:</strong><br>
          <span style="font-size: 0.7rem; opacity: 0.8;">${scratchpad.goal}</span>
        </div>
      ` : ''}
      ${scratchpad.truths_in_tension.length > 0 ? `
        <div style="margin-bottom: 8px;">
          <strong>Tensions:</strong><br>
          ${scratchpad.truths_in_tension.map(t => 
            `<span style="font-size: 0.7rem; opacity: 0.8;">• ${t}</span>`
          ).join('<br>')}
        </div>
      ` : ''}
      ${Object.keys(scratchpad.definitions).length > 0 ? `
        <div style="margin-bottom: 8px;">
          <strong>Definitions:</strong><br>
          ${Object.entries(scratchpad.definitions).map(([term, def]) => 
            `<span style="font-size: 0.7rem; opacity: 0.8;"><em>${term}:</em> ${def}</span>`
          ).join('<br>')}
        </div>
      ` : ''}
      ${scratchpad.throughline ? `
        <div style="margin-bottom: 8px;">
          <strong>Throughline:</strong><br>
          <span style="font-size: 0.7rem; opacity: 0.8; color: #34d399;">${scratchpad.throughline}</span>
        </div>
      ` : ''}
    `;
  }

  showScratchpadPanel() {
    if (this.scratchpadUI) {
      this.scratchpadUI.panel.style.display = 'block';
    }
  }

  hideScratchpadPanel() {
    if (this.scratchpadUI) {
      this.scratchpadUI.panel.style.display = 'none';
    }
  }
}

// Create global instance
const rcipBridge = new RCIPSonderBridge();

export { RCIPSonderBridge, rcipBridge };
