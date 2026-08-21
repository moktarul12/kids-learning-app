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
};

export const WORLDS: {
  id: WorldId;
  title: string;
  emoji: string;
  color: string;
  subtitle: string;
}[] = [
  { id: 'color', title: 'Color', emoji: '🎨', color: '#FF5A5A', subtitle: 'Paint the forest' },
  { id: 'number', title: 'Number', emoji: '🔢', color: '#4BA3FF', subtitle: 'Ride the number train' },
  { id: 'shape', title: 'Shape', emoji: '🔷', color: '#5ECF5A', subtitle: 'Build & spot shapes' },
  { id: 'thinking', title: 'Thinking', emoji: '💡', color: '#FFD93D', subtitle: 'Solve fun puzzles' },
  { id: 'creative', title: 'Creative', emoji: '🖌️', color: '#FF9A3C', subtitle: 'Make something new' },
  { id: 'story', title: 'Story', emoji: '📖', color: '#9B7BFF', subtitle: 'Choose your path' },
];

export const GAMES: GameDef[] = [
  // Color — learn then play
  { id: 'learn_color', title: 'Learn Colors', emoji: '🎨', world: 'color', route: 'LearnColor', blurb: 'Meet each color', kind: 'learn' },
  { id: 'mix_color', title: 'Color Mix', emoji: '🧪', world: 'color', route: 'MixColor', blurb: 'Mix & discover', kind: 'learn' },
  { id: 'find_color', title: 'Find Color', emoji: '🔎', world: 'color', route: 'FindColor', blurb: 'Tap the right ones', kind: 'quiz' },
  { id: 'sort_color', title: 'Color Sort', emoji: '🧺', world: 'color', route: 'SortColor', blurb: 'Fill the baskets', kind: 'quiz' },
  { id: 'match_color', title: 'Color Match', emoji: '🔗', world: 'color', route: 'MatchColor', blurb: 'Pair dots & things', kind: 'quiz' },
  // Number
  { id: 'number_intro', title: 'Meet Numbers', emoji: '5️⃣', world: 'number', route: 'NumberIntro', blurb: 'Big friendly digits', kind: 'learn' },
  { id: 'count_objects', title: 'Count', emoji: '🍎', world: 'number', route: 'CountObjects', blurb: 'How many?', kind: 'learn' },
  { id: 'number_train', title: 'Number Train', emoji: '🚂', world: 'number', route: 'NumberTrain', blurb: 'Fix the coaches', kind: 'learn' },
  { id: 'count_collect', title: 'Feed Monster', emoji: '👾', world: 'number', route: 'CountCollect', blurb: 'Give the right amount', kind: 'quiz' },
  { id: 'before_after', title: 'Before & After', emoji: '↔️', world: 'number', route: 'BeforeAfter', blurb: 'What comes next?', kind: 'quiz' },
  { id: 'missing_number', title: 'Missing Number', emoji: '❓', world: 'number', route: 'MissingNumber', blurb: 'Fill the gap', kind: 'quiz' },
  { id: 'more_less', title: 'More or Less', emoji: '⚖️', world: 'number', route: 'MoreLess', blurb: 'Which has more?', kind: 'quiz' },
  // Shape
  { id: 'find_shape', title: 'Find Shapes', emoji: '🔺', world: 'shape', route: 'FindShape', blurb: 'Spot them all', kind: 'learn' },
  { id: 'shape_builder', title: 'Shape Builder', emoji: '🚀', world: 'shape', route: 'ShapeBuilder', blurb: 'Build a rocket', kind: 'learn' },
  { id: 'match_shape', title: 'Shape Match', emoji: '🧩', world: 'shape', route: 'MatchShape', blurb: 'Match to objects', kind: 'quiz' },
  { id: 'shape_puzzle', title: 'Shape Puzzle', emoji: '🏠', world: 'shape', route: 'ShapePuzzle', blurb: 'Finish the picture', kind: 'quiz' },
  // Thinking
  { id: 'pattern', title: 'Patterns', emoji: '🔴', world: 'thinking', route: 'PatternGame', blurb: 'What comes next?', kind: 'learn' },
  { id: 'sequence', title: 'Sequence', emoji: '🐣', world: 'thinking', route: 'SequenceGame', blurb: 'Grow & order', kind: 'learn' },
  { id: 'memory', title: 'Memory', emoji: '🃏', world: 'thinking', route: 'MemoryGame', blurb: 'Flip & remember', kind: 'quiz' },
  { id: 'odd_one', title: 'Odd One Out', emoji: '🍌', world: 'thinking', route: 'OddOneOut', blurb: 'Find the different', kind: 'quiz' },
  { id: 'sort_category', title: 'Sort It', emoji: '🥕', world: 'thinking', route: 'SortCategory', blurb: 'Fruit or veggie?', kind: 'quiz' },
  // Creative + story — learning play
  { id: 'coloring', title: 'Coloring', emoji: '🐘', world: 'creative', route: 'Coloring', blurb: 'Fill with color', kind: 'learn' },
  { id: 'my_world', title: 'My World', emoji: '🌎', world: 'creative', route: 'MyWorldCreator', blurb: 'Build a scene', kind: 'learn' },
  { id: 'story_bunny', title: 'Bunny Story', emoji: '🐰', world: 'story', route: 'StoryPlay', blurb: 'Choose & learn', kind: 'learn' },
];

export function gamesForWorld(world: WorldId) {
  return GAMES.filter((g) => g.world === world);
}

export function gamesByKind(world: WorldId, kind: GameKind) {
  return gamesForWorld(world).filter((g) => g.kind === kind);
}
