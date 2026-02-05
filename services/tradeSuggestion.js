import mlBridge from './mlBridge.js';
import logger from '../utils/logger.js';
import notificationService from './notifications.js';

/**
 * Trade Suggestion Service
 * Generates ML-based trade suggestions and manages user decisions
 */
class TradeSuggestionService {
  constructor() {
    this.pendingSuggestions = new Map();
    this.suggestionTimeout = 5 * 60 * 1000; // 5 minutes
    this.suggestionHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Generate trade suggestion based on ML prediction
   * @param {Object} tokenData - Token market data
   * @param {Object} tradingConfig - Trading configuration
   * @returns {Promise<Object>} Trade suggestion with ID
   */
  async generateSuggestion(tokenData, tradingConfig) {
    try {
      logger.info('Generating trade suggestion', { token: tokenData.symbol });

      // Get ML prediction
      const prediction = await mlBridge.predictTrade(tokenData);

      if (prediction.error) {
        logger.warn('ML prediction failed, using conservative approach', prediction.error);
        return {
          error: prediction.error,
          suggestion: this._createConservativeSuggestion(tokenData, tradingConfig)
        };
      }

      // Filter out low-confidence predictions
      if (prediction.confidence < 0.6) {
        logger.debug('Low confidence prediction', {
          token: tokenData.symbol,
          confidence: prediction.confidence
        });
        return {
          success: false,
          reason: 'Low confidence prediction',
          confidence: prediction.confidence
        };
      }

      // Create suggestion
      const suggestion = {
        id: this._generateSuggestionId(),
        token: {
          symbol: tokenData.symbol,
          address: tokenData.address,
          name: tokenData.name
        },
        action: 'BUY',
        amount: this._calculateTradeAmount(tokenData, tradingConfig, prediction),
        confidence: prediction.confidence,
        probability: prediction.probability,
        reasoning: this._generateReasoning(tokenData, prediction),
        metrics: {
          volume: tokenData.volume,
          liquidity: tokenData.liquidity,
          holders: tokenData.holders,
          volatility: tokenData.volatility
        },
        timestamp: Date.now(),
        expiresAt: Date.now() + this.suggestionTimeout,
        status: 'pending'
      };

      // Store suggestion
      this.pendingSuggestions.set(suggestion.id, suggestion);
      this.suggestionHistory.push(suggestion);

      // Keep history size manageable
      if (this.suggestionHistory.length > this.maxHistorySize) {
        this.suggestionHistory.shift();
      }

      logger.info('Trade suggestion generated', {
        id: suggestion.id,
        token: suggestion.token.symbol,
        confidence: suggestion.confidence
      });

      // Send notification
      await notificationService.sendNotification(
        `Trade Suggestion: ${suggestion.token.symbol} at ${suggestion.confidence.toFixed(2)}% confidence`,
        'suggestion',
        suggestion
      );

      return {
        success: true,
        suggestion
      };
    } catch (error) {
      logger.error('Error generating trade suggestion', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * User accepts a trade suggestion
   * @param {string} suggestionId - ID of the suggestion
   * @returns {Promise<Object>} Execution result
   */
  async acceptSuggestion(suggestionId) {
    try {
      const suggestion = this.pendingSuggestions.get(suggestionId);

      if (!suggestion) {
        return {
          success: false,
          error: 'Suggestion not found or expired'
        };
      }

      if (suggestion.status !== 'pending') {
        return {
          success: false,
          error: `Suggestion already ${suggestion.status}`
        };
      }

      // Check if suggestion has expired
      if (Date.now() > suggestion.expiresAt) {
        suggestion.status = 'expired';
        return {
          success: false,
          error: 'Suggestion has expired'
        };
      }

      suggestion.status = 'accepted';
      suggestion.acceptedAt = Date.now();

      logger.info('Trade suggestion accepted', {
        id: suggestionId,
        token: suggestion.token.symbol,
        amount: suggestion.amount
      });

      // Notify about acceptance
      await notificationService.sendNotification(
        `Trade accepted: ${suggestion.token.symbol}`,
        'success',
        suggestion
      );

      return {
        success: true,
        suggestion,
        action: 'Execute trade',
        message: `Execute ${suggestion.amount} SOL trade on ${suggestion.token.symbol}`
      };
    } catch (error) {
      logger.error('Error accepting suggestion', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * User rejects a trade suggestion
   * @param {string} suggestionId - ID of the suggestion
   * @param {string} reason - Reason for rejection (optional)
   * @returns {Promise<Object>} Result
   */
  async rejectSuggestion(suggestionId, reason = null) {
    try {
      const suggestion = this.pendingSuggestions.get(suggestionId);

      if (!suggestion) {
        return {
          success: false,
          error: 'Suggestion not found'
        };
      }

      suggestion.status = 'rejected';
      suggestion.rejectedAt = Date.now();
      suggestion.rejectionReason = reason;

      logger.info('Trade suggestion rejected', {
        id: suggestionId,
        token: suggestion.token.symbol,
        reason
      });

      // Notify about rejection
      await notificationService.sendNotification(
        `Trade rejected: ${suggestion.token.symbol}`,
        'info',
        suggestion
      );

      return {
        success: true,
        suggestion
      };
    } catch (error) {
      logger.error('Error rejecting suggestion', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get suggestion by ID
   */
  getSuggestion(suggestionId) {
    return this.pendingSuggestions.get(suggestionId);
  }

  /**
   * Get all pending suggestions
   */
  getPendingSuggestions() {
    const pending = Array.from(this.pendingSuggestions.values()).filter(
      s => s.status === 'pending' && Date.now() <= s.expiresAt
    );
    return pending;
  }

  /**
   * Get suggestion history
   */
  getSuggestionHistory(limit = 20) {
    return this.suggestionHistory.slice(-limit).reverse();
  }

  /**
   * Clear expired suggestions
   */
  cleanupExpiredSuggestions() {
    const now = Date.now();
    for (const [id, suggestion] of this.pendingSuggestions.entries()) {
      if (now > suggestion.expiresAt) {
        this.pendingSuggestions.delete(id);
        suggestion.status = 'expired';
      }
    }
  }

  /**
   * Calculate trade amount based on prediction confidence
   * @private
   */
  _calculateTradeAmount(tokenData, config, prediction) {
    const baseAmount = config.trading.sniperAmount;
    const confidenceMultiplier = prediction.confidence;
    return Math.min(baseAmount * confidenceMultiplier, baseAmount * 1.5);
  }

  /**
   * Generate reasoning for the suggestion
   * @private
   */
  _generateReasoning(tokenData, prediction) {
    const reasons = [];

    if (prediction.probability > 0.7) {
      reasons.push('Strong buy signal from ML model');
    } else if (prediction.probability > 0.6) {
      reasons.push('Moderate buy signal');
    }

    if (tokenData.volume && tokenData.volume > 100000) {
      reasons.push('High trading volume detected');
    }

    if (tokenData.liquidity && tokenData.liquidity > 50000) {
      reasons.push('Good liquidity available');
    }

    if (tokenData.holders && tokenData.holders > 100) {
      reasons.push('Healthy holder distribution');
    }

    return reasons;
  }

  /**
   * Create conservative suggestion when ML fails
   * @private
   */
  _createConservativeSuggestion(tokenData, config) {
    return {
      id: this._generateSuggestionId(),
      token: {
        symbol: tokenData.symbol,
        address: tokenData.address,
        name: tokenData.name
      },
      action: 'HOLD',
      confidence: 0.3,
      reasoning: ['ML model unavailable - conservative approach'],
      timestamp: Date.now(),
      status: 'pending'
    };
  }

  /**
   * Generate unique suggestion ID
   * @private
   */
  _generateSuggestionId() {
    return `sug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get statistics on suggestions
   */
  getStatistics() {
    const history = this.suggestionHistory;
    const accepted = history.filter(s => s.status === 'accepted').length;
    const rejected = history.filter(s => s.status === 'rejected').length;
    const avgConfidence = history.length > 0
      ? history.reduce((sum, s) => sum + s.confidence, 0) / history.length
      : 0;

    return {
      totalSuggestions: history.length,
      accepted,
      rejected,
      pending: this.getPendingSuggestions().length,
      acceptanceRate: history.length > 0 ? (accepted / history.length) * 100 : 0,
      avgConfidence: avgConfidence.toFixed(2)
    };
  }
}

// Export singleton instance
const tradeSuggestionService = new TradeSuggestionService();

// Cleanup expired suggestions every minute
setInterval(() => {
  tradeSuggestionService.cleanupExpiredSuggestions();
}, 60 * 1000);

export default tradeSuggestionService;
