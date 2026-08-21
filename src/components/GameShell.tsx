import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { GameHeader } from './GameHeader';
import { SoftParkBackground } from './SoftParkBackground';
import { WhiteStage, PromptBanner } from './SkyBackground';
import { ProgressBar } from './ProgressBar';
import { RewardModal, FeedbackToast } from './RewardModal';
import { HeaderBackTo } from './ui';

type Props = {
  title: string;
  prompt: string;
  promptEmoji?: string;
  accent?: string;
  round?: number;
  progressCurrent?: number;
  progressTotal?: number;
  onBack: () => void;
  onSpeak?: () => void;
  children: React.ReactNode;
  showReward: boolean;
  onNext: () => void;
  streak?: number;
  rewardMessage?: string;
  hint?: string | null;
  boardStyle?: StyleProp<ViewStyle>;
  hidePrompt?: boolean;
  backLabel?: string;
  backEmoji?: string;
  backTo?: HeaderBackTo;
};

/** Activity frame: soft park · back arrow · white stage · progress */
export function GameShell({
  title,
  prompt,
  promptEmoji,
  round = 0,
  progressCurrent,
  progressTotal = 10,
  onBack,
  onSpeak,
  children,
  showReward,
  onNext,
  streak,
  rewardMessage,
  hint,
  hidePrompt,
  backLabel = 'My World',
  backEmoji,
  backTo,
}: Props) {
  const current = progressCurrent ?? Math.min(round + 1, progressTotal);

  return (
    <View style={styles.root}>
      <SoftParkBackground>
        <GameHeader
          title={title}
          onBack={onBack}
          prompt={prompt}
          onSpeak={onSpeak}
          round={round}
          backLabel={backLabel}
          backEmoji={backEmoji}
          backTo={backTo}
        />
        <View style={styles.body}>
          <WhiteStage>
            {!hidePrompt && <PromptBanner text={prompt} emoji={promptEmoji} />}
            <View style={styles.content}>{children}</View>
            <ProgressBar current={current} total={progressTotal} />
          </WhiteStage>
        </View>
      </SoftParkBackground>
      {hint ? <FeedbackToast text={hint} /> : null}
      <RewardModal visible={showReward} onNext={onNext} streak={streak} message={rewardMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#C8EAF8' },
  body: { flex: 1, paddingHorizontal: 14, paddingTop: 4, paddingBottom: 16 },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    overflow: 'hidden',
    paddingTop: 4,
  },
});
