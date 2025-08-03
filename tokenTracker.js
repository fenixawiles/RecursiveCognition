export function countTokens(messages) {
    return messages.reduce((total, msg) => {
      const words = msg.content.trim().split(/\s+/).filter(Boolean);
      return total + words.length;
    }, 0);
  }