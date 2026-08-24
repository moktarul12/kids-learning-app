export type WorldId = 'color' | 'number' | 'shape' | 'thinking' | 'creative' | 'story';

export type GameKind = 'learn' | 'quiz';

export type GameDef = {
  id: string;
  title: string;
  emoji: string;
  world: WorldId;
  route: string;
  blurb: string;
  kind: GameKind;
  /** Optional stack params (e.g. ShapeBuilder pack) */
  params?: Record<string, string>;
};

export const WORLDS: {
  id: WorldId;
  title: string;
  emoji: string;
  color: string;
  subtitle: string;
}[] = [
  { id: 'color', title: 'Color', emoji: '🌈', color: '#FF5A5A', subtitle: 'Paint & find colors' },
  { id: 'number', title: 'Number', emoji: '🔢', color: '#4BA3FF', subtitle: 'Count & play' },
  { id: 'shape', title: 'Shape', emoji: '🔶', color: '#5ECF5A', subtitle: 'Build & spot shapes' },
  { id: 'thinking', title: 'Thinking', emoji: '🧠', color: '#FFD93D', subtitle: 'Solve fun puzzles' },
  { id: 'creative', title: 'Creative', emoji: '🎨', color: '#FF9A3C', subtitle: 'Build fun pictures' },
  { id: 'story', title: 'Good Habits', emoji: '🌟', color: '#9B7BFF', subtitle: 'Brush, sleep & more' },
];

export const GAMES: GameDef[] = [
  // Color — learn then play
  { id: 'learn_color', title: 'Learn Colors', emoji: '🌈', world: 'color', route: 'LearnColor', blurb: 'Meet each color', kind: 'learn' },
  { id: 'find_color', title: 'Find Color', emoji: '👀', world: 'color', route: 'FindColor', blurb: 'Tap the right ones', kind: 'quiz' },
  { id: 'sort_color', title: 'Color Sort', emoji: '🧺', world: 'color', route: 'SortColor', blurb: 'Fill the baskets', kind: 'quiz' },
  { id: 'match_color', title: 'Color Match', emoji: '🎯', world: 'color', route: 'MatchColor', blurb: 'Pair dots & things', kind: 'quiz' },
  // Number
  { id: 'count_objects', title: 'Count', emoji: '🍎', world: 'number', route: 'CountObjects', blurb: 'How many?', kind: 'learn' },
  { id: 'number_train', title: 'Number Train', emoji: '🚂', world: 'number', route: 'NumberTrain', blurb: 'Fix the coaches', kind: 'learn' },
  { id: 'count_collect', title: 'Feed Monster', emoji: '👾', world: 'number', route: 'CountCollect', blurb: 'Give the right amount', kind: 'quiz' },
  { id: 'before_after', title: 'Before & After', emoji: '◀️', world: 'number', route: 'BeforeAfter', blurb: 'Numbers & letters A–D', kind: 'quiz' },
  { id: 'missing_number', title: 'Missing Number', emoji: '🔢', world: 'number', route: 'MissingNumber', blurb: 'Fill the gap', kind: 'quiz' },
  { id: 'more_less', title: 'More or Less', emoji: '⚖️', world: 'number', route: 'MoreLess', blurb: 'Which has more?', kind: 'quiz' },
  // Shape
  { id: 'find_shape', title: 'Find Shapes', emoji: '🔺', world: 'shape', route: 'FindShape', blurb: 'Spot them all', kind: 'learn' },
  { id: 'shape_builder', title: 'Shape Builder', emoji: '🏠', world: 'shape', route: 'ShapeBuilder', blurb: 'Finish the picture', kind: 'learn', params: { pack: 'shapes' } },
  { id: 'match_shape', title: 'Shape Match', emoji: '🧩', world: 'shape', route: 'MatchShape', blurb: 'Match to objects', kind: 'quiz' },
  { id: 'shape_puzzle', title: 'Shape Puzzle', emoji: '🏠', world: 'shape', route: 'ShapePuzzle', blurb: 'Finish the picture', kind: 'quiz' },
  // Thinking
  { id: 'pattern', title: 'Patterns', emoji: '🧩', world: 'thinking', route: 'PatternGame', blurb: 'What comes next?', kind: 'learn' },
  { id: 'sequence', title: 'Sequence', emoji: '➡️', world: 'thinking', route: 'SequenceGame', blurb: 'Grow & order', kind: 'learn' },
  { id: 'memory', title: 'Memory', emoji: '🧠', world: 'thinking', route: 'MemoryGame', blurb: 'Flip & remember', kind: 'quiz' },
  { id: 'odd_one', title: 'Odd One Out', emoji: '🔍', world: 'thinking', route: 'OddOneOut', blurb: 'Find the different', kind: 'quiz' },
  { id: 'sort_category', title: 'Sort It', emoji: '📦', world: 'thinking', route: 'SortCategory', blurb: 'Put things away', kind: 'quiz' },
  // Creative — builder-style only (like Shape Builder)
  { id: 'create_shapes', title: 'Build a Picture', emoji: '🧱', world: 'creative', route: 'ShapeBuilder', blurb: 'Finish with shapes', kind: 'learn', params: { pack: 'shapes' } },
  { id: 'create_face', title: 'Happy Face', emoji: '😊', world: 'creative', route: 'ShapeBuilder', blurb: 'Build a smile', kind: 'learn', params: { pack: 'faces' } },
  { id: 'create_plate', title: 'Yummy Plate', emoji: '🍽️', world: 'creative', route: 'ShapeBuilder', blurb: 'Build a meal', kind: 'learn', params: { pack: 'food' } },
];

export function gamesForWorld(worldId: WorldId) {
  return GAMES.filter((g) => g.world === worldId);
}

export function gamesByKind(world: WorldId, kind: GameKind) {
  return gamesForWorld(world).filter((g) => g.kind === kind);
}
