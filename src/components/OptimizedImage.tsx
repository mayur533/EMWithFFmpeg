import React, { useMemo, useState } from 'react';
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

const ensureImageUri = (input: string): string => {
  if (!input) {
    return input;
  }

  try {
    const [path, query] = input.split('?');
    const hasImageExtension = /\.(png|jpe?g|gif|webp|bmp|avif|heic)$/i.test(path);
    const hasVideoExtension = /\.(mp4|mov|webm|mkv|avi)$/i.test(path);

    if (hasImageExtension) {
      return input;
    }

    let transformedPath = path;

    if (hasVideoExtension) {
      transformedPath = path.replace(/\.[^/.]+$/, '.jpg');
    } else if (path.includes('/video/')) {
      transformedPath = `${path}.jpg`;
    }

    if (transformedPath === path) {
      return input;
    }

    return query ? `${transformedPath}?${query}` : transformedPath;
  } catch (error) {
    return input;
  }
};

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
  const displayUri = useMemo(() => ensureImageUri(uri), [uri]);

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
    console.error('  - Requested URI:', uri);
    console.error('  - Loaded URI   :', displayUri);
    console.error('  - Error        :', err);
  };

  return (
    <View style={style}>
      <Image
        source={
          error && fallbackSource
            ? fallbackSource
            : { uri: displayUri }
        }
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

