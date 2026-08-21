# KIDS — Play · Learn · Create

Interactive learning app for children ages **3–6**, built with **React Native + Expo + TypeScript**.

Learning is wrapped in play: colors, numbers, shapes, thinking games, creative tools, and a short interactive story — with stars, coins, badges, and daily adventures.

## Run

```bash
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android, or scan the QR code with Expo Go.

## What's included (MVP)

| Area | Activities |
|------|------------|
| **Color World** | Learn, Find, Sort, Match, Mix |
| **Number World** | Intro, Count, Feed Monster, Before/After, Missing, Train, More/Less |
| **Shape World** | Find, Match, Puzzle, Builder |
| **Thinking** | Memory, Odd One Out, Patterns, Sequence, Sort |
| **Creative** | Coloring, My World scene builder |
| **Story** | Bunny adventure with a counting moment |
| **Me** | Learning journey stars, badges, mystery box |

## Navigation

Bottom tabs: **World · Games · Create · Me**

## Stack

- Expo SDK 57
- React Navigation (native stack + bottom tabs)
- AsyncStorage progress persistence
- Fredoka + Nunito fonts
- Reanimated / Gesture Handler ready

## Android APK (GitHub Actions)

Every push to `main` (and manual **Run workflow**) builds an installable APK:

1. Open [Actions → Build Android APK](https://github.com/moktarul12/kids-learning-app/actions)
2. Open the latest successful run
3. Download the **kids-learning-app-apk** artifact

You can also trigger it from the Actions tab → **Build Android APK** → **Run workflow**.
