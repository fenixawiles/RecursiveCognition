/**
 * More accurate token counting using GPT-3.5/4 estimation
 * This is still an approximation but much more accurate than word count
 */
export function countTokens(messages) {
  return messages.reduce((total, msg) => {
    if (!msg.content) return total;
    
    // More accurate token estimation:
    // - Average 4 characters per token
    // - Add overhead for message structure
    const charCount = msg.content.length;
    const estimatedTokens = Math.ceil(charCount / 4) + 3; // +3 for role overhead
    
    return total + estimatedTokens;
  }, 0);
}

/**
 * Get token usage statistics
 */
export function getTokenStats(messages) {
  const totalTokens = countTokens(messages);
  const messageCount = messages.length;
  const avgTokensPerMessage = messageCount > 0 ? Math.round(totalTokens / messageCount) : 0;
  
  return {
    totalTokens,
    messageCount,
    avgTokensPerMessage,
    percentOfLimit: Math.round((totalTokens / 4096) * 100) // For GPT-3.5-turbo
  };
}
