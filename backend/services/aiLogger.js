/**
 * Сервис для логирования AI-взаимодействий в таблицу ai_interactions
 */

const { query } = require('../config/database');

/**
 * Логирует взаимодействие с AI
 * @param {Object} params
 * @param {string} params.userId - ID пользователя
 * @param {string} params.messageType - 'user' или 'assistant'
 * @param {string} params.messageText - Текст сообщения
 * @param {Object} params.context - Контекст (профиль, итоги и т.д.)
 * @param {number} params.tokensUsed - Количество использованных токенов (опционально)
 */
const logInteraction = async ({ userId, messageType, messageText, context = null, tokensUsed = null }) => {
  try {
    await query(
      `INSERT INTO ai_interactions (user_id, message_type, message_text, context, tokens_used)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        messageType,
        messageText,
        context ? JSON.stringify(context) : null,
        tokensUsed,
      ]
    );
  } catch (error) {
    // Не прерываем выполнение, если логирование не удалось
    console.error('Failed to log AI interaction:', error.message);
  }
};

/**
 * Логирует запрос пользователя к AI
 */
const logUserMessage = async (userId, message, context = null) => {
  await logInteraction({
    userId,
    messageType: 'user',
    messageText: message,
    context,
  });
};

/**
 * Логирует ответ AI
 */
const logAssistantMessage = async (userId, reply, context = null, tokensUsed = null) => {
  await logInteraction({
    userId,
    messageType: 'assistant',
    messageText: reply,
    context,
    tokensUsed,
  });
};

/**
 * Извлекает количество токенов из ответа AI (если доступно)
 * Для OpenAI: data.usage?.total_tokens
 */
const extractTokensFromResponse = (aiResponse) => {
  if (aiResponse?.usage?.total_tokens) {
    return aiResponse.usage.total_tokens;
  }
  return null;
};

module.exports = {
  logInteraction,
  logUserMessage,
  logAssistantMessage,
  extractTokensFromResponse,
};

