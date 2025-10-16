import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle, ImageStyle, Image } from 'react-native';

// Type-safe ResizeMode
type ImageResizeMode = 'cover' | 'contain' | 'stretch' | 'center';

interface OptimizedImageProps {
  uri: string;
  style?: ImageStyle | ViewStyle;
  resizeMode?: ImageResizeMode;
  showLoader?: boolean;
  loaderColor?: string;
  loaderSize?: 'small' | 'large';
  fallbackSource?: any;
}

/**
 * OptimizedImage Component
 * 
 * A simple image component with loading indicators
 * Features:
 * - Loading indicators
 * - Fallback support
 * - Error handling
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
  showLoader = true,
  loaderColor = '#667eea',
  loaderSize = 'small',
  fallbackSource,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (err?: any) => {
    setLoading(false);
    setError(true);
    console.error('❌ [IMAGE LOAD ERROR]');
    console.error('  - URI:', uri);
    console.error('  - Error:', err);
  };

  return (
    <View style={style}>
      <Image
        source={error && fallbackSource ? fallbackSource : { uri }}
        style={StyleSheet.absoluteFill}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      {loading && showLoader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size={loaderSize} color={loaderColor} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default OptimizedImage;

