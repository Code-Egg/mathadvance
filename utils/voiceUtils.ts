export const speak = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel previous speech to avoid queue buildup
  window.speechSynthesis.cancel();

  // Clean text for better speech flow and pronunciation
  const speechText = text
    .replace(/-/g, " minus ")
    .replace(/×/g, " times ")
    .replace(/÷/g, " divided by ")
    .replace(/=/g, " equals ")
    .replace(/∫/g, " integral ")
    .replace(/²/g, " squared ")
    .replace(/sin/g, " sine ")
    .replace(/cos/g, " cosine ")
    .replace(/tan/g, " tangent ")
    .replace(/°/g, " degrees ");

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = 'en-US';
  utterance.rate = 1.0;
  
  const voices = window.speechSynthesis.getVoices();
  
  // Robust Voice Selection Strategy to ensure ENGLISH is spoken:
  // 1. Google US English (Best for Chrome)
  // 2. Samantha (Best for Mac)
  // 3. Microsoft Zira (Best for Windows)
  // 4. Any voice strictly marked as en-US
  // 5. Any voice starting with 'en' (e.g., en-GB)
  const preferredVoice = 
    voices.find(v => v.name === 'Google US English') || 
    voices.find(v => v.name === 'Samantha') || 
    voices.find(v => v.name.includes('Zira')) ||
    voices.find(v => v.lang === 'en-US') ||
    voices.find(v => v.lang.startsWith('en'));
  
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