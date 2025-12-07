import React, { useState, useEffect } from 'react';
import { GameState, Difficulty, Question } from './types';
import { generateGame } from './utils/mathUtils';
import { playSound } from './utils/soundUtils';
import { speak, cancelSpeech } from './utils/voiceUtils';
import { Button } from './components/Button';
import { X, Play, Brain, Calculator, Sigma, Flame, Baby, Volume2, VolumeX, Triangle, Download } from 'lucide-react';

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
  const [pokemonId, setPokemonId] = useState<number>(0);
  const [pokemonStats, setPokemonStats] = useState<{name: string, value: number, max: number}[]>([]);
  const [pokemonTypes, setPokemonTypes] = useState<string[]>([]);
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
    
    // Reset Reward
    setRewardImageUrl('');
    setPokemonName('');
    setPokemonId(0);
    setPokemonStats([]);
    setPokemonTypes([]);
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

  // Static maps for translation and colors
  const typeTranslations: Record<string, string> = {
    normal: '一般', fighting: '格鬥', flying: '飛行', poison: '毒', ground: '地面', rock: '岩石', bug: '蟲',
    ghost: '幽靈', steel: '鋼', fire: '火', water: '水', grass: '草', electric: '電', psychic: '超能',
    ice: '冰', dragon: '龍', dark: '惡', fairy: '妖精'
  };

  const typeColors: Record<string, string> = {
    normal: '#A8A77A', fighting: '#C22E28', flying: '#A98FF3', poison: '#A33EA1', ground: '#E2BF65',
    rock: '#B6A136', bug: '#A6B91A', ghost: '#735797', steel: '#B7B7CE', fire: '#EE8130',
    water: '#6390F0', grass: '#7AC74C', electric: '#F7D02C', psychic: '#F95587', ice: '#96D9D6',
    dragon: '#6F35FC', dark: '#705746', fairy: '#D685AD'
  };

  const statTranslations: Record<string, string> = {
    'hp': 'HP',
    'attack': '攻擊',
    'defense': '防禦',
    'special-attack': '特攻',
    'special-defense': '特防',
    'speed': '速度'
  };

  const fetchPokemonReward = async () => {
    setLoadingReward(true);
    try {
      // Random Pokemon ID (Gen 1-9 approx, up to 1000)
      const id = Math.floor(Math.random() * 1000) + 1;
      setPokemonId(id);

      // Parallel Fetch: Species (Name) AND Main Data (Stats/Types)
      const [speciesRes, mainRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      ]);

      if (!speciesRes.ok || !mainRes.ok) throw new Error("Failed to fetch pokemon data");
      
      const speciesData = await speciesRes.json();
      const mainData = await mainRes.json();
      
      // 1. Name Logic: Try Traditional Chinese (zh-Hant) first, then Simplified, then default
      const tradChineseEntry = speciesData.names.find((n: any) => n.language.name === 'zh-Hant');
      const simpChineseEntry = speciesData.names.find((n: any) => n.language.name === 'zh-Hans');
      const name = tradChineseEntry ? tradChineseEntry.name : (simpChineseEntry ? simpChineseEntry.name : speciesData.name);
      setPokemonName(name);

      // 2. Types Logic
      const types = mainData.types.map((t: any) => t.type.name);
      setPokemonTypes(types);

      // 3. Stats Logic
      // Max stats for bar scaling (approximate max for base stats)
      const stats = mainData.stats.map((s: any) => ({
        name: statTranslations[s.stat.name] || s.stat.name,
        value: s.base_stat,
        max: 200 // Visual max cap for the bar
      }));
      setPokemonStats(stats);

      // 4. Image Logic
      setRewardImageUrl(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`);
      
    } catch (error) {
      console.error("Error fetching pokemon:", error);
      // Fallback
      setPokemonId(25);
      setRewardImageUrl(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png`);
      setPokemonName("皮卡丘 (Fallback)");
      setPokemonTypes(['electric']);
      setPokemonStats([
        {name: 'HP', value: 35, max: 200},
        {name: '攻擊', value: 55, max: 200},
        {name: '防禦', value: 40, max: 200},
        {name: '特攻', value: 50, max: 200},
        {name: '特防', value: 50, max: 200},
        {name: '速度', value: 90, max: 200},
      ]);
    } finally {
      setLoadingReward(false);
    }
  };

  const handleDownloadReward = async () => {
    if (!rewardImageUrl) return;
    
    try {
      const response = await fetch(rewardImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `${pokemonName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_reward.png`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(rewardImageUrl, '_blank');
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
        <div className="bg-gradient-to-r from-brand-purple to-indigo-300 p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative z-10 flex justify-between items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md flex items-center gap-2">
              <Brain className="w-8 h-8 flex-shrink-0" />
              <span className="truncate">Math Challenge</span>
            </h1>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={toggleSound}
                className={`p-3 rounded-full transition-all border-2 ${
                  isSoundEnabled 
                    ? 'bg-white/20 border-white/40 text-white hover:bg-white/30' 
                    : 'bg-red-500/80 border-red-400 text-white hover:bg-red-600/80'
                }`}
                title={isSoundEnabled ? "Mute Sound" : "Enable Sound"}
                aria-label="Toggle Sound"
              >
                {isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
              </button>

              {gameState === 'PLAYING' && (
                 <button 
                   onClick={abortGame}
                   className="bg-white/20 p-3 rounded-full hover:bg-red-500/80 hover:text-white transition-colors text-white border-2 border-transparent hover:border-red-400"
                   title="Abort Game"
                   aria-label="Abort Game"
                 >
                   <X size={24} />
                 </button>
              )}
            </div>
          </div>

          {gameState === 'PLAYING' && (
            <div className="mt-6 flex justify-center gap-1.5 px-2">
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
                   <Sigma size={32} className="mb-1" />
                   <span>Medium</span>
                   <span className="text-xs font-normal opacity-70">Quadratics</span>
                </Button>

                <Button 
                    variant="difficulty" 
                    data-difficulty="HARD"
                    soundEnabled={isSoundEnabled}
                    onClick={() => startGame('HARD')}
                >
                   <Triangle size={32} className="mb-1" />
                   <span>Hard</span>
                   <span className="text-xs font-normal opacity-70">Trigonometry</span>
                </Button>

                <Button 
                    variant="difficulty" 
                    data-difficulty="HELL"
                    soundEnabled={isSoundEnabled}
                    onClick={() => startGame('HELL')}
                >
                   <Flame size={32} className="mb-1" />
                   <span>HELL</span>
                   <span className="text-xs font-normal opacity-70">Calc + Trig</span>
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
                   <div className="bg-white/40 p-4 rounded-xl border border-white/50 min-h-[300px] flex items-center justify-center">
                      
                      {loadingReward ? (
                        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin my-8"></div>
                      ) : rewardImageUrl ? (
                        <div className="flex flex-col sm:flex-row items-center justify-center animate-fade-in w-full gap-6 p-2">
                          {/* Left Side: Image (Larger) */}
                          <div className="relative w-48 h-48 sm:w-64 sm:h-64 shrink-0 group">
                             <div className="absolute inset-0 bg-white/50 rounded-full filter blur-xl scale-75 group-hover:scale-100 transition-transform"></div>
                             <img 
                                src={rewardImageUrl} 
                                alt="Reward"
                                className="relative w-full h-full object-contain drop-shadow-xl transition-transform duration-700 group-hover:scale-110"
                             />
                          </div>

                          {/* Right Side: Attributes */}
                          <div className="flex flex-col w-full sm:w-auto sm:flex-1 sm:max-w-xs space-y-3">
                             {/* Name Header */}
                             <div className="flex flex-wrap items-baseline gap-2 border-b border-gray-200 pb-2">
                                <h3 className="text-2xl font-black text-gray-800 tracking-wide">
                                   {pokemonName}
                                </h3>
                                <span className="text-gray-400 text-lg font-bold">
                                  #{pokemonId.toString().padStart(3, '0')}
                                </span>
                             </div>

                             {/* Types */}
                             <div className="flex flex-wrap gap-2">
                                {pokemonTypes.map((t) => (
                                  <span 
                                    key={t} 
                                    style={{ backgroundColor: typeColors[t] || '#999' }}
                                    className="px-2 py-0.5 rounded-md text-white text-[10px] font-bold uppercase shadow-sm tracking-wider"
                                  >
                                    {typeTranslations[t] || t}
                                  </span>
                                ))}
                             </div>

                             {/* Stats Compact Grid */}
                             <div className="w-full bg-white/40 rounded-lg p-2 text-[10px] gap-y-1 flex flex-col shadow-sm border border-white/60">
                                {pokemonStats.map((stat) => (
                                  <div key={stat.name} className="flex items-center gap-2">
                                    <span className="w-8 font-bold text-gray-500 text-right shrink-0">{stat.name}</span>
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-brand-blue rounded-full"
                                        style={{ width: `${Math.min((stat.value / stat.max) * 100, 100)}%` }}
                                      />
                                    </div>
                                    <span className="w-6 text-right font-mono text-gray-500">{stat.value}</span>
                                  </div>
                                ))}
                             </div>

                             {/* Download Button */}
                              <Button 
                                variant="secondary" 
                                soundEnabled={isSoundEnabled}
                                onClick={handleDownloadReward}
                                className="self-start flex items-center gap-2 text-xs py-2 px-4 rounded-xl shadow-sm hover:shadow-md transition-all mt-2"
                                title="Save Reward"
                              >
                                <Download size={14} className="text-brand-purple" /> 
                                <span className="text-gray-600 font-bold">Save</span>
                              </Button>
                          </div>
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