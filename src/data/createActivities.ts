export type BuilderPack = 'shapes' | 'faces' | 'food';

export const CREATE_BUILDERS: {
  title: string;
  emoji: string;
  pack: BuilderPack;
  color: string;
  blurb: string;
}[] = [
  {
    title: 'Build a Picture',
    emoji: '🧱',
    pack: 'shapes',
    color: '#4DA3FF',
    blurb: 'Pick the missing shape',
  },
  {
    title: 'Happy Face',
    emoji: '😊',
    pack: 'faces',
    color: '#FFD93D',
    blurb: 'Build a smile',
  },
  {
    title: 'Yummy Plate',
    emoji: '🍽️',
    pack: 'food',
    color: '#7ED957',
    blurb: 'Build a healthy meal',
  },
];

export const CREATE_INTRO = 'Tap to finish the picture — just like Shape Builder!';
