import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { showToast } from '../../components/Toast';

const { width, height } = Dimensions.get('window');

export const VideoPlayerScreen = ({ route, navigation }: any) => {
  const { chapterId, chapterUrl } = route.params;
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleProgress = (data: any) => setCurrentTime(data.currentTime);
  const handleLoad = (data: any) => setDuration(data.duration);
  const handleComplete = () => showToast('Chapter completed!', 'success');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={COLORS.white} />
      </TouchableOpacity>

      <Video ref={videoRef} source={{ uri: chapterUrl }} style={styles.video} paused={paused} onProgress={handleProgress} onLoad={handleLoad} onEnd={handleComplete} controls={true} resizeMode="contain" />

      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setPaused(!paused)} style={styles.playButton}>
          <Icon name={paused ? 'play-arrow' : 'pause'} size={32} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.timeText}>{formatTime(currentTime)} / {formatTime(duration)}</Text>
        <TouchableOpacity style={styles.quizButton} onPress={() => navigation.navigate('Quiz', { chapterId })}>
          <Text style={styles.quizButtonText}>Take Quiz →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  backButton: { position: 'absolute', top: SPACING.xl, left: SPACING.lg, zIndex: 10, padding: SPACING.sm },
  video: { width, height: height * 0.6 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg, backgroundColor: COLORS.gray900 },
  playButton: { padding: SPACING.md },
  timeText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.white },
  quizButton: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: 8 },
  quizButtonText: { color: COLORS.white, fontWeight: '500' },
});