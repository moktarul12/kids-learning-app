import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

type SoundKey = 'bg' | 'applause' | 'chime';

const SOURCES = {
  bg: require('../../assets/sounds/bg_music_loop.wav'),
  applause: require('../../assets/sounds/applause.wav'),
  chime: require('../../assets/sounds/success_chime.wav'),
} as const;

let musicEnabled = true;
let sfxEnabled = true;
let ready = false;
let bg: AudioPlayer | null = null;
let applause: AudioPlayer | null = null;
let chime: AudioPlayer | null = null;

function makePlayer(key: SoundKey): AudioPlayer {
  const player = createAudioPlayer(SOURCES[key]);
  player.loop = key === 'bg';
  player.volume = key === 'bg' ? 0.22 : 0.85;
  return player;
}

/** Call once when the app is ready */
export async function initSound() {
  if (ready) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
    });
    bg = makePlayer('bg');
    applause = makePlayer('applause');
    chime = makePlayer('chime');
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
    if (!bg.playing) bg.play();
  } catch {
    /* ignore */
  }
}

export async function pauseMusic() {
  if (!bg) return;
  try {
    bg.pause();
  } catch {
    /* ignore */
  }
}

export async function duckMusic(on: boolean) {
  if (!bg || !musicEnabled) return;
  try {
    bg.volume = on ? 0.06 : 0.22;
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
      await chime.seekTo(0);
      chime.play();
    }
    if (applause) {
      await applause.seekTo(0);
      applause.play();
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
      s?.remove();
    } catch {
      /* ignore */
    }
  }
  bg = applause = chime = null;
  ready = false;
}
