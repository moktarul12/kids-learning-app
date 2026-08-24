import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { duckMusic } from './sound';

let voiceEnabled = true;
let kidName = '';
let preferredVoice: string | undefined;
let voiceReady = false;

export function setVoiceEnabled(on: boolean) {
  voiceEnabled = on;
  if (!on) Speech.stop();
}

export function isVoiceEnabled() {
  return voiceEnabled;
}

export function stopVoice() {
  Speech.stop();
}

/** Sync from profile so TTS can say the child's name */
export function setKidName(name: string) {
  kidName = (name || '').trim();
}

export function getKidName() {
  return kidName;
}

export function kidFirst() {
  return kidName || 'friend';
}

/** Pick a soft, friendly English voice when the device offers one */
async function ensureFriendlyVoice() {
  if (voiceReady) return;
  voiceReady = true;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const en = voices.filter((v) => (v.language || '').toLowerCase().startsWith('en'));
    const score = (v: (typeof voices)[0]) => {
      const id = `${v.identifier} ${v.name}`.toLowerCase();
      let s = 0;
      if (/samantha|karen|moira|tessa|fiona|victoria|zira|jenny|aria|natural|neural|premium|enhanced/.test(id))
        s += 5;
      if (/female|woman|girl|child|kid/.test(id)) s += 4;
      if (/male|man|boy|daniel|alex|arthur/.test(id)) s -= 2;
      if ((v.language || '').toLowerCase().includes('en-us') || (v.language || '').toLowerCase().includes('en-gb'))
        s += 1;
      return s;
    };
    en.sort((a, b) => score(b) - score(a));
    preferredVoice = en[0]?.identifier;
  } catch {
    preferredVoice = undefined;
  }
}

ensureFriendlyVoice().catch(() => {});

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Friendly kid-buddy TTS — higher pitch, gentle pace, short clear lines.
 */
export function speak(text: string, opts?: { rate?: number; pitch?: number }) {
  if (!voiceEnabled || !text.trim()) return;
  const clean = text.replace(/[⭐✨🎉🌟💛🎈🦊🌈▶←→👏❓]/g, '').trim();
  if (!clean) return;
  Speech.stop();
  duckMusic(true).catch(() => {});
  const rate =
    opts?.rate ??
    (Platform.OS === 'ios' ? 0.88 : Platform.OS === 'web' ? 0.85 : 0.78);
  const pitch = opts?.pitch ?? (Platform.OS === 'ios' ? 1.35 : 1.4);
  Speech.speak(clean, {
    language: 'en-US',
    voice: preferredVoice,
    rate,
    pitch,
    onDone: () => {
      duckMusic(false).catch(() => {});
    },
    onStopped: () => {
      duckMusic(false).catch(() => {});
    },
    onError: () => {
      duckMusic(false).catch(() => {});
    },
  });
}

/** Personalized buddy lines — use on screen entry sometimes */
export function greetKid(activity?: string) {
  const n = kidFirst();
  const named = kidName.length > 0;
  if (!named) {
    speak(activity ? `Let's try ${activity}!` : "Let's play!");
    return;
  }
  const lines = activity
    ? [
        `Hi ${n}! Let's learn ${activity}!`,
        `Hello ${n}! Ready for ${activity}?`,
        `Hey ${n}! Come play ${activity} with me!`,
      ]
    : [
        `Hi ${n}! Let's learn!`,
        `Hello ${n}! What are you thinking?`,
        `Hey ${n}! What are you doing? Let's play!`,
        `Hi ${n}! You're awesome! Let's go!`,
        `Hello ${n}! I missed you! Let's learn!`,
      ];
  speak(pick(lines));
}

export function cheerKid() {
  const n = kidFirst();
  if (!kidName) {
    speak(pick(['Amazing!', 'Great job!', 'Yay!', 'You did it!']));
    return;
  }
  speak(
    pick([
      `Amazing ${n}!`,
      `Wow ${n}, great job!`,
      `Yay ${n}! You did it!`,
      `So proud of you, ${n}!`,
      `Yes ${n}! Super star!`,
    ]),
  );
}

export const VOICE = {
  amazing: () => cheerKid(),
  almost: () => speak(pick(['Try again!', 'Almost! One more try!', 'You can do it!'])),
  great: () => cheerKid(),
  yay: () => speak('Yay!'),
  next: () => speak(pick(['Next one!', 'Here we go!', "Let's keep going!"])),
  welcome: () => greetKid(),
  congrats: () => cheerKid(),
};
