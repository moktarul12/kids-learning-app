import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

let voiceEnabled = true;

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

/**
 * Device TTS helper.
 * For kid-perfect voice later: replace with pre-recorded MP3 / cloud neural TTS.
 * Keep lines SHORT (3–6 words) so robotic TTS stays clear.
 */
export function speak(text: string, opts?: { rate?: number; pitch?: number }) {
  if (!voiceEnabled || !text.trim()) return;
  const clean = text.replace(/[⭐✨🎉🌟💛🎈🦊🌈▶←→]/g, '').trim();
  if (!clean) return;
  Speech.stop();
  Speech.speak(clean, {
    language: 'en-US',
    rate: opts?.rate ?? (Platform.OS === 'ios' ? 0.95 : Platform.OS === 'web' ? 0.9 : 0.85),
    pitch: opts?.pitch ?? 1.2,
  });
}

export const VOICE = {
  amazing: () => speak('Amazing!'),
  almost: () => speak('Try again!'),
  great: () => speak('Great job!'),
  yay: () => speak('Yay!'),
  next: () => speak('Next one!'),
  welcome: () => speak("Let's play!"),
};
