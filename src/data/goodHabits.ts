export type HabitChoice = { emoji: string; label: string; next: number | 'win' | 'retry' };
export type HabitPage = { text: string; emoji: string; choices: HabitChoice[] };

export type GoodHabit = {
  id: string;
  title: string;
  cover: string;
  blurb: string;
  color: string;
  pages: HabitPage[];
};

export const GOOD_HABITS: GoodHabit[] = [
  {
    id: 'morning',
    title: 'Morning Brush',
    cover: '🪥',
    blurb: 'Wake up & brush teeth',
    color: '#FFD93D',
    pages: [
      {
        text: 'Good morning! What do we do first when we wake up?',
        emoji: '🛏️☀️',
        choices: [
          { emoji: '📺', label: 'Watch TV', next: 'retry' },
          { emoji: '🪥', label: 'Brush teeth', next: 1 },
          { emoji: '🍭', label: 'Eat candy', next: 'retry' },
        ],
      },
      {
        text: 'Sparkly teeth! Next — wash your face with water.',
        emoji: '😊💦',
        choices: [
          { emoji: '🧼', label: 'Wash face', next: 2 },
          { emoji: '🐷', label: 'Play in mud', next: 'retry' },
        ],
      },
      {
        text: 'Yum — a healthy breakfast gives energy for the day!',
        emoji: '🥣🍌',
        choices: [
          { emoji: '🍪', label: 'Only cookies', next: 'retry' },
          { emoji: '🥣', label: 'Eat breakfast', next: 3 },
        ],
      },
      {
        text: 'You are ready! Have a wonderful day!',
        emoji: '🌟🧒🎒',
        choices: [{ emoji: '⭐', label: 'Great habit!', next: 'win' }],
      },
    ],
  },
  {
    id: 'sleep',
    title: 'Sleepy Time',
    cover: '😴',
    blurb: 'Brush & sleep well',
    color: '#9B7BFF',
    pages: [
      {
        text: 'Night time! What helps us get ready for bed?',
        emoji: '🌙🛏️',
        choices: [
          { emoji: '🪥', label: 'Brush teeth', next: 1 },
          { emoji: '🎮', label: 'Play games late', next: 'retry' },
        ],
      },
      {
        text: 'Clean teeth! Put on cozy pajamas.',
        emoji: '👕✨',
        choices: [
          { emoji: '🥾', label: 'Keep shoes on', next: 'retry' },
          { emoji: '🛌', label: 'Pajamas on', next: 2 },
        ],
      },
      {
        text: 'A short story, then lights out. Sleep helps you grow!',
        emoji: '📖💡',
        choices: [
          { emoji: '😴', label: 'Sleep now', next: 3 },
          { emoji: '📱', label: 'Phone all night', next: 'retry' },
        ],
      },
      {
        text: 'Sweet dreams, superstar. See you in the morning!',
        emoji: '🌟😴💤',
        choices: [{ emoji: '⭐', label: 'Good night!', next: 'win' }],
      },
    ],
  },
  {
    id: 'hands',
    title: 'Wash Hands',
    cover: '🧼',
    blurb: 'Soap before eating',
    color: '#4BA3FF',
    pages: [
      {
        text: 'Before eating, what should we do?',
        emoji: '🍽️❓',
        choices: [
          { emoji: '🧼', label: 'Wash hands', next: 1 },
          { emoji: '🤏', label: 'Eat with dirty hands', next: 'retry' },
        ],
      },
      {
        text: 'Soap and water — rub, rub, rub! How long?',
        emoji: '🧼💦',
        choices: [
          { emoji: '1️⃣', label: 'One second', next: 'retry' },
          { emoji: '🎵', label: 'Sing a short song', next: 2 },
        ],
      },
      {
        text: 'Clean hands keep germs away. You are a Clean Hands Hero!',
        emoji: '🦸🙌',
        choices: [{ emoji: '⭐', label: 'I did it!', next: 'win' }],
      },
    ],
  },
  {
    id: 'share',
    title: 'Kind Share',
    cover: '🤝',
    blurb: 'Share with friends',
    color: '#FF7AB8',
    pages: [
      {
        text: 'A friend wants a turn with your toy. What is kind?',
        emoji: '🧒🧸',
        choices: [
          { emoji: '🙅', label: 'Never share', next: 'retry' },
          { emoji: '🤝', label: 'Share a turn', next: 1 },
        ],
      },
      {
        text: 'Your friend says thank you! What do you say?',
        emoji: '😊💬',
        choices: [
          { emoji: '👍', label: "You're welcome!", next: 2 },
          { emoji: '😠', label: 'Go away', next: 'retry' },
        ],
      },
      {
        text: 'Sharing makes more friends. Kindness feels great!',
        emoji: '💖🤝',
        choices: [{ emoji: '⭐', label: 'Be kind!', next: 'win' }],
      },
    ],
  },
  {
    id: 'water',
    title: 'Drink Water',
    cover: '💧',
    blurb: 'Stay healthy & strong',
    color: '#5ECF5A',
    pages: [
      {
        text: 'You feel thirsty after playing. What helps most?',
        emoji: '🏃💦',
        choices: [
          { emoji: '💧', label: 'Drink water', next: 1 },
          { emoji: '🥤', label: 'Only soda', next: 'retry' },
        ],
      },
      {
        text: 'Water keeps your body happy. Want a fruit too?',
        emoji: '🍎💧',
        choices: [
          { emoji: '🍎', label: 'Yes, fruit!', next: 2 },
          { emoji: '🍬', label: 'Only candy', next: 'retry' },
        ],
      },
      {
        text: 'Healthy choices help you play longer. Awesome!',
        emoji: '💪⭐',
        choices: [{ emoji: '⭐', label: 'Feel great!', next: 'win' }],
      },
    ],
  },
];

export const GOOD_HABITS_INTRO = 'Tap a habit to learn and play!';
