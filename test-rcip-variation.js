import { RCIPEngine } from './rcip-engine.js';
import { RCIPResponseGenerator } from './rcip-templates.js';

console.log('🔄 Testing RCIP Variation System...\n');

// Initialize components
const engine = new RCIPEngine();
const responseGenerator = new RCIPResponseGenerator();

// Test repetitive inputs to trigger pattern breaking
const testCases = [
  "I'm torn between security and growth",
  "I feel pulled between stability and freedom", 
  "There's tension between safety and change",
  "I'm struggling with this same choice",
  "This keeps coming up for me"
];

console.log('=== Pattern Breaking Test ===\n');

let conversationHistory = [];

testCases.forEach((input, index) => {
  console.log(`Turn ${index + 1}: "${input}"`);
  
  // Process input through RCIP
  const result = engine.processUserInput(input, conversationHistory);
  
  // Add to conversation history 
  conversationHistory.push({
    role: 'user', 
    content: input,
    timestamp: new Date().toISOString()
  });
  
  // Generate response with variation processing
  const responseData = responseGenerator.generateResponse(
    result.state,
    result.move,
    result.scratchpad,
    input,
    conversationHistory
  );
  
  console.log(`  State: ${result.state}.${result.move}`);
  console.log(`  Response: "${responseData.response}"`);
  console.log(`  Guardrail: ${responseData.guardrail}`);
  
  if (responseData.metadata.variations_applied) {
    console.log(`  🎨 Variations Applied: ${responseData.metadata.variations_applied.join(', ')}`);
  }
  
  console.log('');
  
  // Add AI response to history for next iteration
  conversationHistory.push({
    role: 'assistant',
    content: responseData.response,
    timestamp: new Date().toISOString()
  });
});

console.log('=== Final Conversation Summary ===');
console.log(`Total turns: ${engine.turnCount}`);
console.log(`Move history: ${engine.moveHistory.map(m => `${m.state}.${m.move}`).join(' → ')}`);

console.log('\n✅ RCIP Variation test completed!');

// Test specific variation features
console.log('\n=== Testing Specific Variation Features ===\n');

// Test mirroring detection
const highMirroringInput = "I want to explore security and growth and freedom and stability";
console.log(`High mirroring test: "${highMirroringInput}"`);

const mirrorResult = engine.processUserInput(highMirroringInput, []);
const mirrorResponse = responseGenerator.generateResponse(
  mirrorResult.state,
  mirrorResult.move,
  mirrorResult.scratchpad,
  highMirroringInput,
  []
);

console.log(`Response: "${mirrorResponse.response}"`);
if (mirrorResponse.metadata.variations_applied?.includes('mirroring_reduced')) {
  console.log('✅ Mirroring reduction applied');
} else {
  console.log('ℹ️ No mirroring reduction needed');
}

console.log('\n🎉 All variation features tested!');
