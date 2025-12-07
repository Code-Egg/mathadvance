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
  // Slightly higher pitch (1.1) generally sounds more feminine and clearer
  utterance.pitch = 1.1;
  
  const voices = window.speechSynthesis.getVoices();
  
  // Robust Voice Selection Strategy to ensure a WOMAN/FEMALE voice is used:
  // 1. Google US English (High quality female voice in Chrome)
  // 2. Microsoft Zira (Standard female voice in Windows)
  // 3. Samantha (Standard female voice in macOS)
  // 4. Any voice containing "Female" in its name
  // 5. Victoria (Another female voice in macOS)
  // 6. Fallback to generic en-US
  const preferredVoice = 
    voices.find(v => v.name === 'Google US English') || 
    voices.find(v => v.name.includes('Zira')) ||
    voices.find(v => v.name === 'Samantha') || 
    voices.find(v => v.name.toLowerCase().includes('female')) ||
    voices.find(v => v.name.includes('Victoria')) ||
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