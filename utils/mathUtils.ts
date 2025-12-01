import { Question, OperationType, Difficulty } from '../types';

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const generateDistractors = (correct: number, count: number = 3): number[] => {
  const distractors = new Set<number>();
  while (distractors.size < count) {
    const offset = getRandomInt(-5, 5);
    const val = correct + offset;
    if (val !== correct) {
      distractors.add(val);
    }
  }
  return Array.from(distractors);
};

export const generateQuestion = (type: OperationType): Question => {
  let a, b, answer, displayText;
  let options: number[] = [];

  switch (type) {
    case 'ADD':
      // Number under 100
      a = getRandomInt(1, 80);
      b = getRandomInt(1, 100 - a);
      answer = a + b;
      displayText = `${a} + ${b} = ?`;
      break;
    case 'SUBTRACT':
      // Number under 100
      a = getRandomInt(10, 99);
      b = getRandomInt(1, a);
      answer = a - b;
      displayText = `${a} - ${b} = ?`;
      break;
    case 'MULTIPLY':
      // 9x9
      a = getRandomInt(1, 9);
      b = getRandomInt(1, 9);
      answer = a * b;
      displayText = `${a} × ${b} = ?`;
      break;
    case 'DIVIDE':
      b = getRandomInt(2, 9);
      answer = getRandomInt(2, 9);
      a = b * answer;
      displayText = `${a} ÷ ${b} = ?`;
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
      
      options = [r1, r2];
      while(options.length < 4) {
         let d = getRandomInt(1, 15);
         if(!options.includes(d)) options.push(d);
      }
      options = Array.from(new Set(options));
      while(options.length < 4) {
         let d = getRandomInt(1, 15);
         if(!options.includes(d)) options.push(d);
      }
      break;

    case 'QUADRATIC_ADVANCED':
      // Non-monic: Ax^2 + Bx + C = 0.
      // (x - root1)(nx - k) = nx^2 - (k + n*root1)x + (root1*k)
      const root_adv = getRandomInt(-5, 5); // Integer root we want them to find
      const n_adv = getRandomInt(2, 4); // coefficient for x^2
      const k_adv = getRandomInt(-5, 5); // other param
      
      const CoeffA = n_adv;
      const CoeffB = -(k_adv + n_adv * root_adv);
      const CoeffC = root_adv * k_adv;

      if (CoeffA === 0) return generateQuestion('QUADRATIC_BASIC');

      answer = root_adv; 
      
      const sB_adv = CoeffB >= 0 ? `+ ${CoeffB}` : `- ${Math.abs(CoeffB)}`;
      const sC_adv = CoeffC >= 0 ? `+ ${CoeffC}` : `- ${Math.abs(CoeffC)}`;
      
      displayText = `Find integer x: ${CoeffA}x² ${sB_adv}x ${sC_adv} = 0`;
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
      a = 0; b= 0; answer = 0; displayText = 'Error';
  }

  if (options.length === 0) {
    const dists = generateDistractors(answer);
    options = shuffleArray([...dists, answer]);
  } else {
    options = shuffleArray(options);
  }

  return {
    id: crypto.randomUUID(),
    type,
    displayText,
    correctAnswer: answer,
    options
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
        // Easy + Basic Quadratic
        if (r < 0.2) type = 'ADD';
        else if (r < 0.4) type = 'SUBTRACT';
        else if (r < 0.6) type = 'MULTIPLY';
        else if (r < 0.8) type = 'DIVIDE';
        else type = 'QUADRATIC_BASIC';
        break;
        
      case 'HARD':
        // Advanced Quadratic
        type = 'QUADRATIC_ADVANCED';
        break;
        
      case 'HELL':
        // Advanced Quadratic + Calculus
        if (r < 0.5) type = 'QUADRATIC_ADVANCED';
        else type = 'CALCULUS';
        break;
    }

    questions.push(generateQuestion(type));
  }
  return questions;
};