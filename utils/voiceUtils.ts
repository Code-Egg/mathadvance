export const speak = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel previous speech to avoid queue buildup
  window.speechSynthesis.cancel();

  // Clean text for better speech flow
  const speechText = text
    .replace(/-/g, " minus ")
    .replace(/×/g, " times ")
    .replace(/÷/g, " divided by ")
    .replace(/=/g, " equals ")
    .replace(/∫/g, " integral ")
    .replace(/²/g, " squared ");

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = 'en-US';
  utterance.rate = 1.0;
  
  // Try to pick a pleasant voice
  const voices = window.speechSynthesis.getVoices();
  // Prefer Google US English or a generic Female voice if available
  const preferredVoice = voices.find(v => v.name.includes('Google US English')) || 
                         voices.find(v => v.lang === 'en-US' && v.name.includes('Female'));
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
};

export const cancelSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};