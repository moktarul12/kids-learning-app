export type WorldId = 'color' | 'number' | 'shape' | 'thinking' | 'creative' | 'story';

export type GameDef = {
  id: string;
  title: string;
  emoji: string;
  world: WorldId;
  route: string;
  blurb: string;
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
  { id: 'learn_color', title: 'Learn Colors', emoji: '🎨', world: 'color', route: 'LearnColor', blurb: 'Meet each color' },
  { id: 'find_color', title: 'Find Color', emoji: '🔎', world: 'color', route: 'FindColor', blurb: 'Tap the right ones' },
  { id: 'sort_color', title: 'Color Sort', emoji: '🧺', world: 'color', route: 'SortColor', blurb: 'Fill the baskets' },
  { id: 'match_color', title: 'Color Match', emoji: '🔗', world: 'color', route: 'MatchColor', blurb: 'Pair dots & things' },
  { id: 'mix_color', title: 'Color Mix', emoji: '🧪', world: 'color', route: 'MixColor', blurb: 'Mix & discover' },
  { id: 'number_intro', title: 'Meet Numbers', emoji: '5️⃣', world: 'number', route: 'NumberIntro', blurb: 'Big friendly digits' },
  { id: 'count_objects', title: 'Count', emoji: '🍎', world: 'number', route: 'CountObjects', blurb: 'How many?' },
  { id: 'count_collect', title: 'Feed Monster', emoji: '👾', world: 'number', route: 'CountCollect', blurb: 'Give the right amount' },
  { id: 'before_after', title: 'Before & After', emoji: '↔️', world: 'number', route: 'BeforeAfter', blurb: 'What comes next?' },
  { id: 'missing_number', title: 'Missing Number', emoji: '❓', world: 'number', route: 'MissingNumber', blurb: 'Fill the gap' },
  { id: 'number_train', title: 'Number Train', emoji: '🚂', world: 'number', route: 'NumberTrain', blurb: 'Fix the coaches' },
  { id: 'more_less', title: 'More or Less', emoji: '⚖️', world: 'number', route: 'MoreLess', blurb: 'Which has more?' },
  { id: 'find_shape', title: 'Find Shapes', emoji: '🔺', world: 'shape', route: 'FindShape', blurb: 'Spot them all' },
  { id: 'match_shape', title: 'Shape Match', emoji: '🧩', world: 'shape', route: 'MatchShape', blurb: 'Match to objects' },
  { id: 'shape_puzzle', title: 'Shape Puzzle', emoji: '🏠', world: 'shape', route: 'ShapePuzzle', blurb: 'Finish the picture' },
  { id: 'shape_builder', title: 'Shape Builder', emoji: '🚀', world: 'shape', route: 'ShapeBuilder', blurb: 'Build a rocket' },
  { id: 'memory', title: 'Memory', emoji: '🃏', world: 'thinking', route: 'MemoryGame', blurb: 'Flip & remember' },
  { id: 'odd_one', title: 'Odd One Out', emoji: '🍌', world: 'thinking', route: 'OddOneOut', blurb: 'Find the different' },
  { id: 'pattern', title: 'Patterns', emoji: '🔴', world: 'thinking', route: 'PatternGame', blurb: 'What comes next?' },
  { id: 'sequence', title: 'Sequence', emoji: '🐣', world: 'thinking', route: 'SequenceGame', blurb: 'Grow & order' },
  { id: 'sort_category', title: 'Sort It', emoji: '🥕', world: 'thinking', route: 'SortCategory', blurb: 'Fruit or veggie?' },
  { id: 'coloring', title: 'Coloring', emoji: '🐘', world: 'creative', route: 'Coloring', blurb: 'Fill with color' },
  { id: 'my_world', title: 'My World', emoji: '🌎', world: 'creative', route: 'MyWorldCreator', blurb: 'Build a scene' },
  { id: 'story_bunny', title: 'Bunny Story', emoji: '🐰', world: 'story', route: 'StoryPlay', blurb: 'Choose & learn' },
];

export function gamesForWorld(world: WorldId) {
  return GAMES.filter((g) => g.world === world);
}
