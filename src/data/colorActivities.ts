import { learningColors } from '../theme/colors';

export type FindColorOption = {
  id: string;
  emoji: string;
  colorId: string;
};

export type FindColorActivity = {
  id: string;
  title: string;
  prompt: string;
  targetColor: string;
  targetHex: string;
  options: FindColorOption[];
};

/** Data-driven find-color rounds — easy to add Find Blue / Yellow / etc. */
export const FIND_COLOR_ACTIVITIES: FindColorActivity[] = [
  {
    id: 'find_red',
    title: 'Find Red',
    prompt: '🔎 Find Red',
    targetColor: 'red',
    targetHex: '#FF5252',
    options: [
      { id: 'heart', emoji: '❤️', colorId: 'red' },
      { id: 'frog', emoji: '🐸', colorId: 'green' },
      { id: 'butterfly', emoji: '🦋', colorId: 'blue' },
      { id: 'tree', emoji: '🌳', colorId: 'green' },
      { id: 'sun', emoji: '☀️', colorId: 'yellow' },
      { id: 'grapes', emoji: '🍇', colorId: 'purple' },
      { id: 'banana', emoji: '🍌', colorId: 'yellow' },
      { id: 'orange', emoji: '🍊', colorId: 'orange' },
      { id: 'car', emoji: '🚗', colorId: 'red' },
    ],
  },
  {
    id: 'find_blue',
    title: 'Find Blue',
    prompt: '🔎 Find Blue',
    targetColor: 'blue',
    targetHex: '#4DA3FF',
    options: [
      { id: 'water', emoji: '💧', colorId: 'blue' },
      { id: 'apple', emoji: '🍎', colorId: 'red' },
      { id: 'butterfly', emoji: '🦋', colorId: 'blue' },
      { id: 'sun', emoji: '☀️', colorId: 'yellow' },
      { id: 'cap', emoji: '🧢', colorId: 'blue' },
      { id: 'frog', emoji: '🐸', colorId: 'green' },
      { id: 'banana', emoji: '🍌', colorId: 'yellow' },
      { id: 'fish', emoji: '🐟', colorId: 'blue' },
      { id: 'tree', emoji: '🌳', colorId: 'green' },
    ],
  },
  {
    id: 'find_yellow',
    title: 'Find Yellow',
    prompt: '🔎 Find Yellow',
    targetColor: 'yellow',
    targetHex: '#FFD93D',
    options: [
      { id: 'sun', emoji: '☀️', colorId: 'yellow' },
      { id: 'heart', emoji: '❤️', colorId: 'red' },
      { id: 'banana', emoji: '🍌', colorId: 'yellow' },
      { id: 'frog', emoji: '🐸', colorId: 'green' },
      { id: 'star', emoji: '⭐', colorId: 'yellow' },
      { id: 'grapes', emoji: '🍇', colorId: 'purple' },
      { id: 'chick', emoji: '🐥', colorId: 'yellow' },
      { id: 'water', emoji: '💧', colorId: 'blue' },
      { id: 'tree', emoji: '🌳', colorId: 'green' },
    ],
  },
];

export type LearnColorStep = {
  colorId: string;
  name: string;
  hex: string;
  heroEmoji: string;
  choices: string[];
};

export const LEARN_COLOR_STEPS: LearnColorStep[] = learningColors.slice(0, 6).map((c) => ({
  colorId: c.id,
  name: c.name,
  hex: c.hex,
  heroEmoji: c.emoji,
  choices:
    c.id === 'red'
      ? ['❤️', '🚗', '🎈']
      : c.id === 'blue'
        ? ['💧', '🦋', '🧢']
        : c.id === 'yellow'
          ? ['☀️', '🍌', '⭐']
          : c.id === 'green'
            ? ['🌳', '🐸', '🍏']
            : c.id === 'orange'
              ? ['🍊', '🦊', '🎃']
              : ['🍇', '🦄', '☂️'],
}));

export const BACKGROUNDS = {
  myWorld: require('../../assets/backgrounds/bg_my_world.png'),
  colorWorld: require('../../assets/backgrounds/bg_color_world.png'),
  findRed: require('../../assets/backgrounds/bg_find_red.png'),
  learnColors: require('../../assets/backgrounds/bg_learn_colors.png'),
} as const;
