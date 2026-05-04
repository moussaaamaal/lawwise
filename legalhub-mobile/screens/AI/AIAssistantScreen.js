// Ajoute cet import en haut
import { aiAPI } from '../../services/api';

// Remplace la fonction sendMessage par :
const sendMessage = async (text) => {
  const msg = text || input.trim();
  if (!msg) return;
  setInput('');
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  setMessages(prev => [...prev, { role: 'user', text: msg, time: now }]);
  setIsTyping(true);

  try {
    // Appel réel au backend
    const result = await aiAPI.caseAssistant(null, msg);
    setMessages(prev => [...prev, {
      role: 'ai',
      text: result.answer || result.summary || result.suggestions || 'Here is my analysis...',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  } catch (err) {
    setMessages(prev => [...prev, {
      role: 'ai',
      text: `I couldn't process your request: ${err.message}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  } finally {
    setIsTyping(false);
  }
};