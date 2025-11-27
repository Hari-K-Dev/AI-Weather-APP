import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage as ChatMessageType } from '@/types';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser && styles.userText]}>
          {message.content}
          {isStreaming && <Text style={styles.cursor}>▊</Text>}
        </Text>
      </View>

      {/* Citations */}
      {message.citations && message.citations.length > 0 && (
        <View style={styles.citationsContainer}>
          <Text style={styles.citationsTitle}>Sources:</Text>
          {message.citations.map((citation, index) => (
            <View key={index} style={styles.citationChip}>
              <Text style={styles.citationSource}>{citation.source}</Text>
              <Text style={styles.citationScore}>
                {Math.round(citation.score * 100)}%
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  bubble: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: BorderRadius.sm,
  },
  assistantBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  text: {
    color: Colors.text,
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
  userText: {
    color: Colors.background,
  },
  cursor: {
    color: Colors.primary,
    opacity: 0.7,
  },
  citationsContainer: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  citationsTitle: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
    marginRight: Spacing.xs,
  },
  citationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  citationSource: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
  },
  citationScore: {
    color: Colors.primary,
    fontSize: FontSizes.xs,
    marginLeft: Spacing.xs,
  },
  timestamp: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
});
