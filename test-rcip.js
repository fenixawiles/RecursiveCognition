import { RCIPEngine } from './rcip-engine.js';
import { RCIPResponseGenerator } from './rcip-templates.js';

console.log('🧠 Testing RCIP System...\n');

// Initialize components
const engine = new RCIPEngine();
const responseGenerator = new RCIPResponseGenerator();

// Test cases
const testCases = [
  "I'm confused about whether I should quit my job or stay",
  "I feel torn between freedom and security",
  "What do you mean by 'career satisfaction'?",
  "So the core issue is work-life balance vs financial stability"
];

console.log('=== RCIP Processing Test ===\n');

testCases.forEach((input, index) => {
  console.log(`Test ${index + 1}: "${input}"`);
  
  // Process input through RCIP
  const result = engine.processUserInput(input, []);
  
  // Generate response
  const responseData = responseGenerator.generateResponse(
    result.state,
    result.move,
    result.scratchpad,
    input
  );
  
  console.log(`  State: ${result.state}`);
  console.log(`  Move: ${result.move}`);
  console.log(`  Response Template: "${responseData.response}"`);
  console.log(`  Guardrail: ${responseData.guardrail}`);
  console.log(`  Turn: ${result.turnCount}/${engine.maxTurns}`);
  console.log('');
});

console.log('=== Scratchpad State ===');
console.log(JSON.stringify(engine.scratchpad, null, 2));

console.log('\n✅ RCIP System test completed successfully!');
