/**
 * insightChains.js
 * Enables threading and linking of related insights.
 * Supports recursive lineage graphs or dependency maps.
 */

// Chain relationship types
export const CHAIN_TYPES = {
    BUILDS_ON: 'builds_on',
    CONTRADICTS: 'contradicts',
    SYNTHESIZES: 'synthesizes',
    REFINES: 'refines',
    EXTENDS: 'extends',
    CONNECTS: 'connects',
    CHALLENGES: 'challenges',
    EXEMPLIFIES: 'exemplifies'
};

// Chain strength indicators
export const CHAIN_STRENGTH = {
    WEAK: 1,
    MODERATE: 2,
    STRONG: 3,
    CRITICAL: 4
};

// Local storage key for insight chains
const CHAINS_STORAGE_KEY = 'insightChains';

// In-memory chain storage
let insightChains = [];
let chainIdCounter = 1;

/**
 * Initialize insight chains system
 */
export function initializeChainTracking() {
    const stored = localStorage.getItem(CHAINS_STORAGE_KEY);
    if (stored) {
        try {
            const data = JSON.parse(stored);
            insightChains = data.chains || [];
            chainIdCounter = data.nextId || 1;
        } catch (error) {
            console.warn('Error loading stored insight chains:', error);
            insightChains = [];
            chainIdCounter = 1;
        }
    }
    console.log('Insight chain tracking initialized');
}

/**
 * Save chains to localStorage
 */
function saveChains() {
    const data = {
        chains: insightChains,
        nextId: chainIdCounter,
        lastUpdated: Date.now()
    };
    localStorage.setItem(CHAINS_STORAGE_KEY, JSON.stringify(data));
}

/**
 * Create a chain link between insights
 * @param {string} sourceInsightId - ID of the source insight
 * @param {string} targetInsightId - ID of the target insight
 * @param {string} chainType - Type of relationship (from CHAIN_TYPES)
 * @param {number} strength - Strength of the relationship (from CHAIN_STRENGTH)
 * @param {string} description - Optional description of the relationship
 * @param {Object} metadata - Additional metadata about the chain
 * @returns {Object} The created chain link
 */
export function createChainLink(sourceInsightId, targetInsightId, chainType, strength = CHAIN_STRENGTH.MODERATE, description = '', metadata = {}) {
    const chainLink = {
        id: `chain_${chainIdCounter++}`,
        sourceInsightId,
        targetInsightId,
        chainType,
        strength,
        description,
        metadata,
        createdAt: Date.now(),
        createdBy: 'system' // Could be 'user' for manual links
    };

    insightChains.push(chainLink);
    saveChains();
    
    console.log(`Created chain link: ${sourceInsightId} -> ${targetInsightId} (${chainType})`);
    return chainLink;
}

/**
 * Auto-detect potential chain relationships based on insight content
 * @param {string} newInsightId - ID of the new insight to analyze
 * @param {string} newInsightContent - Content of the new insight
 * @param {Array} existingInsights - Array of existing insights to compare against
 * @returns {Array} Array of suggested chain links
 */
export function detectPotentialChains(newInsightId, newInsightContent, existingInsights) {
    const suggestions = [];
    const content = newInsightContent.toLowerCase();

    // Keywords that suggest different relationship types
    const relationshipKeywords = {
        [CHAIN_TYPES.BUILDS_ON]: ['building on', 'based on', 'extending', 'following from', 'as mentioned'],
        [CHAIN_TYPES.CONTRADICTS]: ['however', 'but', 'contradicts', 'opposes', 'challenges', 'disputes'],
        [CHAIN_TYPES.SYNTHESIZES]: ['combining', 'synthesizing', 'merging', 'bringing together', 'unifying'],
        [CHAIN_TYPES.REFINES]: ['refining', 'clarifying', 'improving', 'enhancing', 'polishing'],
        [CHAIN_TYPES.EXTENDS]: ['further', 'additionally', 'moreover', 'expanding', 'broadening'],
        [CHAIN_TYPES.CONNECTS]: ['relates to', 'connects', 'links', 'similar to', 'parallels'],
        [CHAIN_TYPES.CHALLENGES]: ['questions', 'doubts', 'challenges', 'problematic', 'issues with'],
        [CHAIN_TYPES.EXEMPLIFIES]: ['for example', 'illustrates', 'demonstrates', 'shows', 'exemplifies']
    };

    existingInsights.forEach(insight => {
        const insightContent = insight.content ? insight.content.toLowerCase() : '';
        
        // Check for keyword-based relationships
        Object.entries(relationshipKeywords).forEach(([chainType, keywords]) => {
            const hasKeyword = keywords.some(keyword => content.includes(keyword));
            
            if (hasKeyword) {
                // Calculate content similarity for strength
                const similarity = calculateContentSimilarity(content, insightContent);
                const strength = similarity > 0.7 ? CHAIN_STRENGTH.STRONG : 
                               similarity > 0.4 ? CHAIN_STRENGTH.MODERATE : CHAIN_STRENGTH.WEAK;

                suggestions.push({
                    sourceInsightId: newInsightId,
                    targetInsightId: insight.id,
                    chainType,
                    strength,
                    confidence: similarity,
                    reason: `Detected "${keywords.find(k => content.includes(k))}" pattern`
                });
            }
        });

        // Check for direct content overlap
        const commonWords = findCommonWords(content, insightContent);
        if (commonWords.length > 2) {
            suggestions.push({
                sourceInsightId: newInsightId,
                targetInsightId: insight.id,
                chainType: CHAIN_TYPES.CONNECTS,
                strength: CHAIN_STRENGTH.MODERATE,
                confidence: commonWords.length / 10,
                reason: `Shared concepts: ${commonWords.slice(0, 3).join(', ')}`
            });
        }
    });

    return suggestions;
}

/**
 * Calculate simple content similarity between two texts
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} Similarity score between 0 and 1
 */
function calculateContentSimilarity(text1, text2) {
    const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 3));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Find common meaningful words between two texts
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {Array} Array of common words
 */
function findCommonWords(text1, text2) {
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    const words1 = text1.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
    const words2 = text2.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
    
    return words1.filter(w => words2.includes(w));
}

/**
 * Get all chains involving a specific insight
 * @param {string} insightId - ID of the insight
 * @returns {Object} Object with incoming and outgoing chains
 */
export function getChainsForInsight(insightId) {
    const incoming = insightChains.filter(chain => chain.targetInsightId === insightId);
    const outgoing = insightChains.filter(chain => chain.sourceInsightId === insightId);
    
    return { incoming, outgoing };
}

/**
 * Get the full lineage tree for an insight
 * @param {string} insightId - ID of the root insight
 * @param {number} maxDepth - Maximum depth to traverse (default: 10)
 * @returns {Object} Lineage tree structure
 */
export function getInsightLineage(insightId, maxDepth = 10) {
    const visited = new Set();
    
    function buildLineage(currentId, depth = 0) {
        if (depth >= maxDepth || visited.has(currentId)) {
            return { id: currentId, depth, chains: [], truncated: true };
        }
        
        visited.add(currentId);
        const chains = getChainsForInsight(currentId);
        
        const node = {
            id: currentId,
            depth,
            incoming: chains.incoming.map(chain => ({
                ...chain,
                source: buildLineage(chain.sourceInsightId, depth + 1)
            })),
            outgoing: chains.outgoing.map(chain => ({
                ...chain,
                target: buildLineage(chain.targetInsightId, depth + 1)
            }))
        };
        
        return node;
    }
    
    return buildLineage(insightId);
}

/**
 * Find chain paths between two insights
 * @param {string} sourceInsightId - Starting insight ID
 * @param {string} targetInsightId - Target insight ID
 * @param {number} maxDepth - Maximum path length to search
 * @returns {Array} Array of path objects
 */
export function findChainPaths(sourceInsightId, targetInsightId, maxDepth = 5) {
    const paths = [];
    const visited = new Set();
    
    function searchPaths(currentId, targetId, currentPath, depth) {
        if (depth >= maxDepth || visited.has(currentId)) {
            return;
        }
        
        if (currentId === targetId && currentPath.length > 0) {
            paths.push([...currentPath]);
            return;
        }
        
        visited.add(currentId);
        
        const outgoingChains = insightChains.filter(chain => chain.sourceInsightId === currentId);
        
        for (const chain of outgoingChains) {
            currentPath.push(chain);
            searchPaths(chain.targetInsightId, targetId, currentPath, depth + 1);
            currentPath.pop();
        }
        
        visited.delete(currentId);
    }
    
    searchPaths(sourceInsightId, targetInsightId, [], 0);
    return paths;
}

/**
 * Get chain statistics and analytics
 * @returns {Object} Statistics about the chain network
 */
export function getChainAnalytics() {
    const totalChains = insightChains.length;
    const uniqueInsights = new Set([
        ...insightChains.map(c => c.sourceInsightId),
        ...insightChains.map(c => c.targetInsightId)
    ]).size;
    
    const chainTypeCounts = Object.values(CHAIN_TYPES).reduce((acc, type) => {
        acc[type] = insightChains.filter(c => c.chainType === type).length;
        return acc;
    }, {});
    
    const strengthCounts = Object.values(CHAIN_STRENGTH).reduce((acc, strength) => {
        acc[strength] = insightChains.filter(c => c.strength === strength).length;
        return acc;
    }, {});
    
    // Find most connected insights
    const connectionCounts = {};
    insightChains.forEach(chain => {
        connectionCounts[chain.sourceInsightId] = (connectionCounts[chain.sourceInsightId] || 0) + 1;
        connectionCounts[chain.targetInsightId] = (connectionCounts[chain.targetInsightId] || 0) + 1;
    });
    
    const mostConnected = Object.entries(connectionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([id, count]) => ({ insightId: id, connections: count }));
    
    return {
        totalChains,
        uniqueInsights,
        averageConnectionsPerInsight: uniqueInsights > 0 ? totalChains * 2 / uniqueInsights : 0,
        chainTypeCounts,
        strengthCounts,
        mostConnected,
        networkDensity: uniqueInsights > 1 ? totalChains / (uniqueInsights * (uniqueInsights - 1) / 2) : 0
    };
}

/**
 * Remove a chain link
 * @param {string} chainId - ID of the chain to remove
 * @returns {boolean} Success status
 */
export function removeChainLink(chainId) {
    const initialLength = insightChains.length;
    insightChains = insightChains.filter(chain => chain.id !== chainId);
    
    if (insightChains.length < initialLength) {
        saveChains();
        console.log(`Removed chain link: ${chainId}`);
        return true;
    }
    
    return false;
}

/**
 * Update chain link properties
 * @param {string} chainId - ID of the chain to update
 * @param {Object} updates - Properties to update
 * @returns {boolean} Success status
 */
export function updateChainLink(chainId, updates) {
    const chain = insightChains.find(c => c.id === chainId);
    
    if (chain) {
        Object.assign(chain, updates, { updatedAt: Date.now() });
        saveChains();
        console.log(`Updated chain link: ${chainId}`);
        return true;
    }
    
    return false;
}

/**
 * Export all chain data
 * @returns {Object} Complete chain data for export
 */
export function exportChainData() {
    return {
        chains: insightChains,
        analytics: getChainAnalytics(),
        metadata: {
            totalChains: insightChains.length,
            exportedAt: Date.now(),
            nextChainId: chainIdCounter
        }
    };
}

/**
 * Clear all chain data
 */
export function clearChainData() {
    insightChains = [];
    chainIdCounter = 1;
    localStorage.removeItem(CHAINS_STORAGE_KEY);
    console.log('Insight chain data cleared');
}

/**
 * Import chain data (for session restoration)
 * @param {Object} chainData - Chain data to import
 */
export function importChainData(chainData) {
    if (chainData && chainData.chains) {
        insightChains = chainData.chains;
        chainIdCounter = chainData.metadata?.nextChainId || chainIdCounter;
        saveChains();
        console.log(`Imported ${insightChains.length} chain links`);
    }
}

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
    initializeChainTracking();
}
