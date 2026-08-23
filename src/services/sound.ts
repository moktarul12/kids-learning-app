import { Audio, AVPlaybackStatusSuccess } from 'expo-av';
import { Platform } from 'react-native';

type SoundKey = 'bg' | 'applause' | 'chime';

const SOURCES = {
  bg: require('../../assets/sounds/bg_music_loop.wav'),
  applause: require('../../assets/sounds/applause.wav'),
  chime: require('../../assets/sounds/success_chime.wav'),
} as const;

let musicEnabled = true;
let sfxEnabled = true;
let ready = false;
let bg: Audio.Sound | null = null;
let applause: Audio.Sound | null = null;
let chime: Audio.Sound | null = null;
let ducked = false;

async function ensureMode() {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

async function load(key: SoundKey) {
  const { sound } = await Audio.Sound.createAsync(SOURCES[key], {
    shouldPlay: false,
    isLooping: key === 'bg',
    volume: key === 'bg' ? 0.22 : 0.85,
  });
  return sound;
}

/** Call once when the app is ready */
export async function initSound() {
  if (ready || Platform.OS === 'web') {
    // Web: still try — expo-av works on web in many cases
  }
  try {
    await ensureMode();
    bg = await load('bg');
    applause = await load('applause');
    chime = await load('chime');
    ready = true;
    if (musicEnabled) await playMusic();
  } catch {
    // Audio optional — never crash the app
    ready = false;
  }
}

export async function playMusic() {
  if (!musicEnabled || !bg) return;
  try {
    const st = (await bg.getStatusAsync()) as AVPlaybackStatusSuccess;
    if (st.isLoaded && !st.isPlaying) await bg.playAsync();
  } catch {
    /* ignore */
  }
}

export async function pauseMusic() {
  if (!bg) return;
  try {
    await bg.pauseAsync();
  } catch {
    /* ignore */
  }
}

export async function duckMusic(on: boolean) {
  if (!bg || !musicEnabled) return;
  ducked = on;
  try {
    await bg.setVolumeAsync(on ? 0.06 : 0.22);
  } catch {
    /* ignore */
  }
}

/** Soft clap + chime for quiz success */
export async function playSuccessFanfare() {
  if (!sfxEnabled) return;
  try {
    await duckMusic(true);
    if (chime) {
      await chime.setPositionAsync(0);
      await chime.playAsync();
    }
    if (applause) {
      await applause.setPositionAsync(0);
      await applause.playAsync();
    }
    setTimeout(() => {
      duckMusic(false).catch(() => {});
    }, 1600);
  } catch {
    /* ignore */
  }
}

export function setMusicEnabled(on: boolean) {
  musicEnabled = on;
  if (on) playMusic();
  else pauseMusic();
}

export function setSfxEnabled(on: boolean) {
  sfxEnabled = on;
}

export function isMusicEnabled() {
  return musicEnabled;
}

export async function unloadSound() {
  for (const s of [bg, applause, chime]) {
    try {
      await s?.unloadAsync();
    } catch {
      /* ignore */
    }
  }
  bg = applause = chime = null;
  ready = false;
}
