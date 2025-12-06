import React, { useState, useEffect } from 'react';
import { GameState, Difficulty, Question } from './types';
import { generateGame } from './utils/mathUtils';
import { playSound } from './utils/soundUtils';
import { speak, cancelSpeech } from './utils/voiceUtils';
import { Button } from './components/Button';
import { X, Play, Brain, Calculator, Sigma, Flame, Baby, Volume2, VolumeX } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [encouragementMessage, setEncouragementMessage] = useState<string>('');
  
  // Sound Settings
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Reward States
  const [rewardImageUrl, setRewardImageUrl] = useState<string>('');
  const [pokemonName, setPokemonName] = useState<string>('');
  const [loadingReward, setLoadingReward] = useState(false);

  const getOfflineEncouragement = (score: number) => {
    if (score === 10) return "PERFECT! You are an absolute genius!";
    if (score >= 8) return "Awesome job! You are a Math Whiz in the making.";
    if (score >= 5) return "Good effort! Keep practicing to get even better.";
    return "Don't give up! Every mistake is a learning opportunity.";
  };

  const toggleSound = () => {
    if (isSoundEnabled) {
      cancelSpeech();
    }
    setIsSoundEnabled(!isSoundEnabled);
  };

  // Effect to read the question when it changes
  useEffect(() => {
    if (isSoundEnabled && gameState === 'PLAYING' && questions[currentIndex]) {
      // Small delay to allow transition sound to finish
      const timer = setTimeout(() => {
        speak(questions[currentIndex].displayText);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, gameState, questions, isSoundEnabled]);

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setQuestions(generateGame(diff, 10));
    setCurrentIndex(0);
    setScore(0);
    setGameState('PLAYING');
    setSelectedOption(null);
    setIsCorrect(null);
    setRewardImageUrl('');
    setPokemonName('');
  };

  const abortGame = () => {
    if (isSoundEnabled) playSound.click();
    if (confirm("Quit to Main Menu?")) {
      setGameState('START');
      cancelSpeech();
    }
  };

  const handleAnswer = (answer: number) => {
    if (selectedOption !== null) return; 

    const currentQ = questions[currentIndex];
    const correct = answer === currentQ.correctAnswer;
    
    setSelectedOption(answer);
    setIsCorrect(correct);

    if (correct) {
      if (isSoundEnabled) {
        playSound.correct();
        speak("Correct!");
      }
      setScore(prev => prev + 1);
    } else {
      if (isSoundEnabled) {
        playSound.wrong();
        speak("Wrong.");
      }
    }

    // Delay before next question
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        finishGame(correct ? score + 1 : score);
      }
    }, 1500); // Increased slightly to allow voice to finish
  };

  const fetchPokemonReward = async () => {
    setLoadingReward(true);
    try {
      // Random Pokemon ID (Gen 1-9 approx, up to 1000)
      const id = Math.floor(Math.random() * 1000) + 1;
      
      // 1. Get Species data for Chinese name
      const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
      if (!speciesRes.ok) throw new Error("Failed to fetch species");
      const speciesData = await speciesRes.json();
      
      const chineseEntry = speciesData.names.find((n: any) => n.language.name === 'zh-Hans');
      const name = chineseEntry ? chineseEntry.name : speciesData.name; // Fallback to English name
      
      setPokemonName(name);

      // 2. Set Image URL (Official Artwork)
      setRewardImageUrl(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`);
      
    } catch (error) {
      console.error("Error fetching pokemon:", error);
      // Fallback
      setRewardImageUrl(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png`);
      setPokemonName("皮卡丘 (Fallback)");
    } finally {
      setLoadingReward(false);
    }
  };

  const finishGame = (finalScore: number) => {
    setGameState('FINISHED');
    const msg = getOfflineEncouragement(finalScore);
    setEncouragementMessage(msg);
    
    if (isSoundEnabled) {
      speak(msg);
      if (finalScore === 10) playSound.win();
    }
    
    if (finalScore === 10) {
      fetchPokemonReward();
    }
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-100 to-indigo-100 flex items-center justify-center p-4 font-sans">
      
      {/* Decorative Background Elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
      <div className="fixed bottom-20 right-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
      <div className="fixed top-1/2 left-1/2 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '4s'}}></div>

      <div className="max-w-xl w-full bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 relative z-10 transition-all duration-500">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-brand-purple to-indigo-300 p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative z-10 flex justify-center items-center">
            <h1 className="text-3xl font-bold text-white drop-shadow-md flex items-center gap-2">
              <Brain className="w-8 h-8" />
              Math Challenge
            </h1>
            
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-4">
              <button
                onClick={toggleSound}
                className={`p-2 rounded-full transition-colors ${isSoundEnabled ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-red-500/80 text-white hover:bg-red-600/80'}`}
                title={isSoundEnabled ? "Mute Sound" : "Enable Sound"}
              >
                {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>

              {gameState === 'PLAYING' && (
                 <button 
                   onClick={abortGame}
                   className="bg-white/20 p-2 rounded-full hover:bg-red-500/80 hover:text-white transition-colors text-white"
                   title="Abort Game"
                 >
                   <X size={20} />
                 </button>
              )}
            </div>
          </div>

          {gameState === 'PLAYING' && (
            <div className="mt-4 flex justify-center gap-1.5">
               {questions.map((_, idx) => (
                 <div 
                  key={idx}
                  className={`h-2 transition-all duration-300 rounded-full ${
                    idx === currentIndex ? 'w-8 bg-white shadow-glow' : 
                    idx < currentIndex ? 'w-2 bg-green-400' : 'w-2 bg-white/30'
                  }`}
                 />
               ))}
            </div>
          )}
        </div>

        {/* CONTENT AREA */}
        <div className="p-6 sm:p-8 min-h-[500px] flex flex-col justify-center">
          
          {/* START SCREEN */}
          {gameState === 'START' && (
            <div className="space-y-8 animate-fade-in text-center">
              <div>
                 <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4 text-brand-purple animate-bounce-slow">
                   <Calculator size={48} />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-700">Select Difficulty</h2>
                 <p className="text-gray-500 mt-2">Choose your challenge level</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                    variant="difficulty" 
                    data-difficulty="EASY"
                    soundEnabled={isSoundEnabled}
                    onClick={() => startGame('EASY')}
                >
                   <Baby size={32} className="mb-1" />
                   <span>Easy</span>
                   <span className="text-xs font-normal opacity-70">+-×÷</span>
                </Button>

                <Button 
                    variant="difficulty" 
                    data-difficulty="MEDIUM"
                    soundEnabled={isSoundEnabled}
                    onClick={() => startGame('MEDIUM')}
                >
                   <Calculator size={32} className="mb-1" />
                   <span>Medium</span>
                   <span className="text-xs font-normal opacity-70">Basics + Quad</span>
                </Button>

                <Button 
                    variant="difficulty" 
                    data-difficulty="HARD"
                    soundEnabled={isSoundEnabled}
                    onClick={() => startGame('HARD')}
                >
                   <Sigma size={32} className="mb-1" />
                   <span>Hard</span>
                   <span className="text-xs font-normal opacity-70">Adv. Quadratic</span>
                </Button>

                <Button 
                    variant="difficulty" 
                    data-difficulty="HELL"
                    soundEnabled={isSoundEnabled}
                    onClick={() => startGame('HELL')}
                >
                   <Flame size={32} className="mb-1" />
                   <span>HELL</span>
                   <span className="text-xs font-normal opacity-70">Calculus & Quad</span>
                </Button>
              </div>
            </div>
          )}

          {/* GAME SCREEN */}
          {gameState === 'PLAYING' && questions[currentIndex] && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center px-4">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Question</span>
                    <span className="text-2xl font-bold text-gray-600">{currentIndex + 1}<span className="text-gray-300">/10</span></span>
                </div>
                <div className="bg-brand-yellow/50 px-4 py-2 rounded-xl text-brand-text font-bold">
                  Score: {score}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-10 text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border border-white">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-700 font-mono tracking-tight break-words">
                  {questions[currentIndex].displayText}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {questions[currentIndex].options.map((option, idx) => {
                  let variant: 'option' | 'correct' | 'wrong' = 'option';
                  if (selectedOption !== null) {
                    if (option === questions[currentIndex].correctAnswer) variant = 'correct';
                    else if (option === selectedOption) variant = 'wrong';
                  }

                  return (
                    <Button
                      key={idx}
                      variant={variant}
                      soundEnabled={isSoundEnabled}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedOption !== null}
                      withSound={false}
                      className="transition-all duration-300"
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* FINISHED SCREEN */}
          {gameState === 'FINISHED' && (
            <div className="text-center space-y-6 animate-fade-in-up">
              <div className="relative inline-block mt-4">
                {score === 10 ? (
                  <div className="text-9xl animate-bounce filter drop-shadow-2xl">🏆</div>
                ) : score > 5 ? (
                  <div className="text-9xl animate-pulse filter drop-shadow-2xl">🌟</div>
                ) : (
                  <div className="text-9xl filter drop-shadow-xl">📚</div>
                )}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-brand-text font-black px-6 py-2 rounded-full text-xl shadow-lg border-2 border-brand-purple">
                  {score} / 10
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h2 className="text-3xl font-bold text-gray-800">
                  {score === 10 ? 'Perfect Score!' : 'Challenge Complete!'}
                </h2>
                
                <div className="bg-white/50 rounded-2xl p-4 min-h-[60px] flex items-center justify-center">
                   <p className="text-gray-700 italic text-lg leading-relaxed">"{encouragementMessage}"</p>
                </div>
              </div>

              {/* REWARD SECTION */}
              {score === 10 && (
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-1 rounded-2xl shadow-inner mt-4">
                   <div className="bg-white/40 p-3 rounded-xl border border-white/50 min-h-[250px] flex flex-col items-center justify-center">
                      <p className="font-bold text-brand-text mb-3 flex items-center justify-center gap-2">
                        <span className="animate-pulse">🎁</span> Reward Unlocked!
                      </p>
                      
                      {loadingReward ? (
                        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin my-8"></div>
                      ) : rewardImageUrl ? (
                        <div className="flex flex-col items-center animate-fade-in w-full">
                          <div className="relative w-48 h-48 group">
                             <div className="absolute inset-0 bg-white/50 rounded-full filter blur-xl scale-75 group-hover:scale-100 transition-transform"></div>
                             <img 
                                src={rewardImageUrl} 
                                alt="Reward"
                                className="relative w-full h-full object-contain drop-shadow-lg transition-transform duration-700 group-hover:scale-110"
                             />
                          </div>
                          <p className="mt-2 text-2xl font-black text-gray-800 tracking-wide bg-white/60 px-6 py-1 rounded-full border border-white/50 shadow-sm">
                             {pokemonName}
                          </p>
                        </div>
                      ) : null}
                  </div>
                </div>
              )}

              <div className="pt-4">
                 <Button fullWidth soundEnabled={isSoundEnabled} onClick={() => setGameState('START')} className="flex items-center justify-center gap-2 text-lg py-4">
                  <Play size={24} fill="currentColor" /> Play Again
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Footer attribution */}
      <div className="absolute bottom-4 text-center text-indigo-300/80 text-xs font-medium">
        Math Challenge • Offline Ready
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
         @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .shadow-glow {
            box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.6);
        }
      `}</style>
    </div>
  );
};

export default App;