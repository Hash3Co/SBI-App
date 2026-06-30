import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Platform } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface VideoPlayerProps {
  uri: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ uri, onProgress, onComplete }) => {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleProgress = (data: any) => {
    setCurrentTime(data.currentTime);
    if (onProgress && duration > 0) {
      onProgress((data.currentTime / duration) * 100);
    }
  };

  const handleLoad = (data: any) => {
    setDuration(data.duration);
    setIsLoading(false);
  };

  const handleEnd = () => {
    onComplete?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={styles.video}
        paused={paused}
        onProgress={handleProgress}
        onLoad={handleLoad}
        onEnd={handleEnd}
        resizeMode="contain"
        controls={true}
      />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Icon name="hourglass-empty" size={40} color={COLORS.white} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: width, height: height * 0.3, backgroundColor: COLORS.black },
  video: { width: '100%', height: '100%' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.black + '80' },
  loadingText: { color: COLORS.white, marginTop: SPACING.sm, fontSize: TYPOGRAPHY.sizes.sm },
});