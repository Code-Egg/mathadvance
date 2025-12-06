import { Question, OperationType, Difficulty } from '../types';

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const generateId = () => Math.random().toString(36).substring(2, 9);

// Pre-defined trig problems to ensure "nice" answers
const trigProblems = [
  { text: 'sin(0°)', ans: 0 },
  { text: 'sin(30°)', ans: 0.5 },
  { text: 'sin(90°)', ans: 1 },
  { text: 'sin(270°)', ans: -1 },
  { text: 'cos(0°)', ans: 1 },
  { text: 'cos(60°)', ans: 0.5 },
  { text: 'cos(90°)', ans: 0 },
  { text: 'cos(180°)', ans: -1 },
  { text: 'tan(0°)', ans: 0 },
  { text: 'tan(45°)', ans: 1 },
  { text: 'sin(180°)', ans: 0 },
  { text: 'cos(360°)', ans: 1 },
];

export const generateQuestion = (type: OperationType): Question => {
  let answer: number = 0;
  let displayText = '';
  // Used to store other valid-looking answers (like the other root in a quadratic)
  // that we definitely want as distractors.
  const preFilledOptions: number[] = [];

  switch (type) {
    case 'ADD':
      const a_add = getRandomInt(1, 80);
      const b_add = getRandomInt(1, 100 - a_add);
      answer = a_add + b_add;
      displayText = `${a_add} + ${b_add} = ?`;
      break;

    case 'SUBTRACT':
      const a_sub = getRandomInt(10, 99);
      const b_sub = getRandomInt(1, a_sub);
      answer = a_sub - b_sub;
      displayText = `${a_sub} - ${b_sub} = ?`;
      break;

    case 'MULTIPLY':
      const a_mul = getRandomInt(1, 9);
      const b_mul = getRandomInt(1, 9);
      answer = a_mul * b_mul;
      displayText = `${a_mul} × ${b_mul} = ?`;
      break;

    case 'DIVIDE':
      const b_div = getRandomInt(2, 9);
      const res_div = getRandomInt(2, 9);
      const a_div = b_div * res_div;
      answer = res_div;
      displayText = `${a_div} ÷ ${b_div} = ?`;
      break;

    case 'QUADRATIC_BASIC':
      // Monic: x^2 + Bx + C = 0.
      const r1 = getRandomInt(1, 9);
      const r2 = getRandomInt(1, 9);
      const B = -(r1 + r2);
      const C = r1 * r2;
      answer = Math.random() > 0.5 ? r1 : r2;
      
      const signB = B >= 0 ? '+' : '-';
      const absB = Math.abs(B);
      displayText = `x² ${signB} ${absB}x + ${C} = 0`;
      displayText = `Solve for x: ${displayText}`;
      
      preFilledOptions.push(r1, r2);
      break;

    case 'QUADRATIC_ADVANCED':
      // Non-monic: Ax^2 + Bx + C = 0.
      const root_adv = getRandomInt(-5, 5); 
      const n_adv = getRandomInt(2, 4); 
      const k_adv = getRandomInt(-5, 5); 
      
      const CoeffA = n_adv;
      const CoeffB = -(k_adv + n_adv * root_adv);
      const CoeffC = root_adv * k_adv;

      if (CoeffA === 0) return generateQuestion('QUADRATIC_BASIC');

      answer = root_adv; 
      
      const sB_adv = CoeffB >= 0 ? `+ ${CoeffB}` : `- ${Math.abs(CoeffB)}`;
      const sC_adv = CoeffC >= 0 ? `+ ${CoeffC}` : `- ${Math.abs(CoeffC)}`;
      
      displayText = `Find integer x: ${CoeffA}x² ${sB_adv}x ${sC_adv} = 0`;
      break;

    case 'TRIGONOMETRY':
      const problem = trigProblems[Math.floor(Math.random() * trigProblems.length)];
      answer = problem.ans;
      displayText = problem.text;
      break;

    case 'CALCULUS':
      const mode = Math.random();
      if (mode > 0.5) {
        // Derivative f(x) = Ax^2 + Bx. Find f'(k)
        const A_cal = getRandomInt(2, 5);
        const B_cal = getRandomInt(1, 9);
        const k_cal = getRandomInt(1, 4);
        answer = 2 * A_cal * k_cal + B_cal;
        displayText = `f(x) = ${A_cal}x² + ${B_cal}x. Find f'(${k_cal})`;
      } else {
        // Definite Integral
        const A_int = getRandomInt(1, 4) * 2;
        const limit = getRandomInt(1, 5);
        answer = (A_int / 2) * (limit * limit);
        displayText = `∫ from 0 to ${limit} of (${A_int}x) dx`;
      }
      break;
      
    default:
      displayText = 'Error';
  }

  // ROBUST OPTION GENERATION
  const optionsSet = new Set<number>();
  optionsSet.add(answer);

  preFilledOptions.forEach(opt => optionsSet.add(opt));

  let safetyCounter = 0;
  while (optionsSet.size < 4 && safetyCounter < 100) {
    let distractor: number;
    safetyCounter++;

    if (type === 'TRIGONOMETRY') {
      // Special pool for trig answers to keep them "clean"
      const pool = [0, 0.5, 1, -1, -0.5, 2];
      distractor = pool[Math.floor(Math.random() * pool.length)];
    } else if (type === 'QUADRATIC_BASIC') {
       distractor = getRandomInt(1, 15);
    } else {
       const offset = getRandomInt(-5, 5);
       if (offset === 0) continue;
       distractor = answer + offset;
    }
    
    optionsSet.add(distractor);
  }

  return {
    id: generateId(),
    type,
    displayText,
    correctAnswer: answer,
    options: shuffleArray(Array.from(optionsSet))
  };
};

export const generateGame = (difficulty: Difficulty, count: number = 10): Question[] => {
  const questions: Question[] = [];
  
  for (let i = 0; i < count; i++) {
    let type: OperationType = 'MULTIPLY';
    const r = Math.random();

    switch (difficulty) {
      case 'EASY':
        // 9x9, +, -, /
        if (r < 0.25) type = 'ADD';
        else if (r < 0.5) type = 'SUBTRACT';
        else if (r < 0.75) type = 'MULTIPLY';
        else type = 'DIVIDE';
        break;
        
      case 'MEDIUM':
        // Quadratic Only (Mix Basic and Advanced)
        if (r < 0.5) type = 'QUADRATIC_BASIC';
        else type = 'QUADRATIC_ADVANCED';
        break;
        
      case 'HARD':
        // Trigonometric Only
        type = 'TRIGONOMETRY';
        break;
        
      case 'HELL':
        // Trig + Calculus
        if (r < 0.5) type = 'TRIGONOMETRY';
        else type = 'CALCULUS';
        break;
    }

    questions.push(generateQuestion(type));
  }
  return questions;
};