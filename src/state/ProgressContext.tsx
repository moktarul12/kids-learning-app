import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setKidName as syncVoiceName } from '../services/voice';

export type SkillId = 'colors' | 'numbers' | 'shapes' | 'thinking' | 'creativity' | 'stories';

export type BadgeId =
  | 'star_learner'
  | 'number_master'
  | 'shape_builder'
  | 'creative_star'
  | 'color_explorer'
  | 'thinker';

type ProgressState = {
  hasStarted: boolean;
  stars: number;
  coins: number;
  gems: number;
  skillStars: Record<SkillId, number>;
  badges: BadgeId[];
  completedGames: string[];
  dailyTasks: { id: string; label: string; done: boolean; route?: string }[];
  dailyDate: string;
  unlockedWorlds: string[];
  /** Child's first name for personalized voice */
  kidName: string;
  /** ISO date YYYY-MM-DD or empty */
  kidDob: string;
};

type ProgressContextValue = ProgressState & {
  ready: boolean;
  kidAge: number | null;
  startAdventure: () => void;
  setKidProfile: (name: string, dob: string) => void;
  addReward: (opts: {
    stars?: number;
    coins?: number;
    gems?: number;
    skill?: SkillId;
    gameId?: string;
    badge?: BadgeId;
  }) => void;
  completeDailyTask: (id: string) => void;
  resetDailyIfNeeded: () => void;
};

const STORAGE_KEY = 'kids_learning_progress_v2';

const defaultDaily = () => [
  { id: 'find_red', label: 'Find 3 red things', done: false, route: 'FindColor' },
  { id: 'count_five', label: 'Count to 5', done: false, route: 'CountObjects' },
  { id: 'find_shape', label: 'Find triangles', done: false, route: 'FindShape' },
  { id: 'pattern', label: 'Finish a pattern', done: false, route: 'PatternGame' },
  { id: 'create', label: 'Build a picture', done: false, route: 'ShapeBuilder' },
];

const initialState: ProgressState = {
  hasStarted: false,
  stars: 0,
  coins: 0,
  gems: 0,
  skillStars: {
    colors: 0,
    numbers: 0,
    shapes: 0,
    thinking: 0,
    creativity: 0,
    stories: 0,
  },
  badges: [],
  completedGames: [],
  dailyTasks: defaultDaily(),
  dailyDate: new Date().toDateString(),
  unlockedWorlds: ['color', 'number', 'shape', 'thinking', 'creative', 'story'],
  kidName: '',
  kidDob: '',
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

function today() {
  return new Date().toDateString();
}

export function ageFromDob(dob: string): number | null {
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const born = new Date(dob + 'T12:00:00');
  if (Number.isNaN(born.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  const m = now.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age -= 1;
  if (age < 0 || age > 18) return null;
  return age;
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const legacy = !raw ? await AsyncStorage.getItem('kids_learning_progress_v1') : null;
        const source = raw || legacy;
        if (source) {
          const parsed = JSON.parse(source) as Partial<ProgressState>;
          const next = { ...initialState, ...parsed };
          if (next.dailyDate !== today()) {
            next.dailyDate = today();
            next.dailyTasks = defaultDaily();
          }
          setState(next);
          syncVoiceName(next.kidName || '');
        }
      } catch {
        // keep defaults
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    syncVoiceName(state.kidName);
  }, [state, ready]);

  const startAdventure = useCallback(() => {
    setState((s) => ({ ...s, hasStarted: true }));
  }, []);

  const setKidProfile = useCallback((name: string, dob: string) => {
    const kidName = name.trim().slice(0, 24);
    const kidDob = /^\d{4}-\d{2}-\d{2}$/.test(dob) ? dob : '';
    syncVoiceName(kidName);
    setState((s) => ({ ...s, kidName, kidDob }));
  }, []);

  const addReward = useCallback(
    (opts: {
      stars?: number;
      coins?: number;
      gems?: number;
      skill?: SkillId;
      gameId?: string;
      badge?: BadgeId;
    }) => {
      setState((s) => {
        const skillStars = { ...s.skillStars };
        if (opts.skill) {
          skillStars[opts.skill] = Math.min(5, skillStars[opts.skill] + (opts.stars ? 1 : 0));
        }
        const badges = [...s.badges];
        if (opts.badge && !badges.includes(opts.badge)) badges.push(opts.badge);
        if (skillStars.colors >= 3 && !badges.includes('color_explorer')) {
          badges.push('color_explorer');
        }
        if (skillStars.numbers >= 3 && !badges.includes('number_master')) {
          badges.push('number_master');
        }
        if (skillStars.shapes >= 3 && !badges.includes('shape_builder')) {
          badges.push('shape_builder');
        }
        if (skillStars.creativity >= 3 && !badges.includes('creative_star')) {
          badges.push('creative_star');
        }
        if (skillStars.thinking >= 3 && !badges.includes('thinker')) {
          badges.push('thinker');
        }
        if (s.stars + (opts.stars ?? 0) >= 10 && !badges.includes('star_learner')) {
          badges.push('star_learner');
        }
        return {
          ...s,
          stars: s.stars + (opts.stars ?? 0),
          coins: s.coins + (opts.coins ?? 0),
          gems: s.gems + (opts.gems ?? 0),
          skillStars,
          badges,
          completedGames: opts.gameId
            ? Array.from(new Set([...s.completedGames, opts.gameId]))
            : s.completedGames,
        };
      });
    },
    [],
  );

  const completeDailyTask = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      dailyTasks: s.dailyTasks.map((t) => (t.id === id ? { ...t, done: true } : t)),
    }));
  }, []);

  const resetDailyIfNeeded = useCallback(() => {
    setState((s) => {
      if (s.dailyDate === today()) return s;
      return { ...s, dailyDate: today(), dailyTasks: defaultDaily() };
    });
  }, []);

  const kidAge = ageFromDob(state.kidDob);

  const value = useMemo(
    () => ({
      ...state,
      ready,
      kidAge,
      startAdventure,
      setKidProfile,
      addReward,
      completeDailyTask,
      resetDailyIfNeeded,
    }),
    [state, ready, kidAge, startAdventure, setKidProfile, addReward, completeDailyTask, resetDailyIfNeeded],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
