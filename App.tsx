import React, { useState, useEffect } from 'react';
import { GameState, Difficulty, Question } from './types';
import { generateGame } from './utils/mathUtils';
import { playSound } from './utils/soundUtils';
import { speak, cancelSpeech } from './utils/voiceUtils';
import { Button } from './components/Button';
import { X, Play, Brain, Calculator, Sigma, Flame, Baby, Volume2, VolumeX } from 'lucide-react';

const POKEMON_SPECIES_API = "https://pokeapi.co/api/v2/pokemon-species";
const ARTWORK_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

let cachedPokemonIds: number[] = [];

async function loadPokemonIds() {
  if (cachedPokemonIds.length > 0) return cachedPokemonIds;
  const res = await fetch(`${POKEMON_SPECIES_API}?limit=2000`);
  const data = await res.json();
  cachedPokemonIds = data.results.map((_: any, idx: number) => idx + 1);
  return cachedPokemonIds;
}

async function generatePokemonReward() {
  await loadPokemonIds();
  const id = cachedPokemonIds[Math.floor(Math.random() * cachedPokemonIds.length)];
  const imageUrl = `${ARTWORK_URL}/${id}.png`;
  let name = `寶可夢 #${id}`;

  try {
    const res = await fetch(`${POKEMON_SPECIES_API}/${id}`);
    const data = await res.json();
    const zh =
      data.names.find((n: any) => n.language.name === "zh-Hant") ||
      data.names.find((n: any) => n.language.name === "zh-Hans") ||
      data.names.find((n: any) => n.language.name === "en");
    if (zh) name = zh.name;
  } catch (e) {
    console.error("Failed to load Pokémon:", e);
  }

  return { imageUrl, displayName: name };
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [encouragementMessage, setEncouragementMessage] = useState<string>('');
  const [rewardImageUrl, setRewardImageUrl] = useState<string>('');
  const [pokemonName, setPokemonName] = useState<string>('');
  const [loadingReward, setLoadingReward] = useState(false);

  // Voice / Sound toggle
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const toggleSound = () => {
    if (isSoundEnabled) cancelSpeech();
    setIsSoundEnabled(!isSoundEnabled);
  };

  const getOfflineEncouragement = (score: number) => {
    if (score === 10) return "PERFECT! You are an absolute genius!";
    if (score >= 8) return "Awesome job! You are a Math Whiz in the making.";
    if (score >= 5) return "Good effort! Keep practicing to get even better.";
    return "Don't give up! Every mistake is a learning opportunity.";
  };

  useEffect(() => {
    if (isSoundEnabled && gameState === 'PLAYING' && questions[currentIndex]) {
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

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        finishGame(correct ? score + 1 : score);
      }
    }, 1500);
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
      setLoadingReward(true);
      generatePokemonReward()
        .then(reward => {
          setRewardImageUrl(reward.imageUrl);
          setPokemonName(reward.displayName);
        })
        .catch(err => {
          console.error(err);
          setRewardImageUrl(`${ARTWORK_URL}/25.png`);
          setPokemonName("皮卡丘 (Fallback)");
        })
        .finally(() => setLoadingReward(false));
    } else {
      setRewardImageUrl('');
    }
  };

  // --- UI RENDERING (simplified version, full code is same as your previous App.tsx) ---
  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl flex items-center gap-2">
          <Brain /> Math Challenge
          <button onClick={toggleSound}>
            {isSoundEnabled ? <Volume2 /> : <VolumeX />}
          </button>
        </h1>
      </div>

      {/* FINISHED SCREEN with reward */}
      {gameState === 'FINISHED' && score === 10 && rewardImageUrl && (
        <div>
          <img src={rewardImageUrl} alt="Reward" />
          <p>{pokemonName}</p>
        </div>
      )}

    </div>
  );
};

export default App;