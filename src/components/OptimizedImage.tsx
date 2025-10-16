import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle, ImageStyle, Image } from 'react-native';
import FastImage, { FastImageProps, Priority, ResizeMode } from 'react-native-fast-image';

// Type-safe ResizeMode that works with both Image and FastImage
type ImageResizeMode = 'cover' | 'contain' | 'stretch' | 'center';

interface OptimizedImageProps extends Partial<FastImageProps> {
  uri: string;
  style?: ImageStyle | ViewStyle;
  resizeMode?: ImageResizeMode;
  priority?: Priority;
  showLoader?: boolean;
  loaderColor?: string;
  loaderSize?: 'small' | 'large';
  fallbackSource?: any;
  useFallback?: boolean; // Force use regular Image component
}

/**
 * OptimizedImage Component
 * 
 * A high-performance image component using react-native-fast-image
 * Features:
 * - Aggressive caching (memory + disk)
 * - Lazy loading support
 * - Loading indicators
 * - Fallback support
 * - Better performance than standard Image
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
  priority = FastImage.priority.normal,
  showLoader = true,
  loaderColor = '#667eea',
  loaderSize = 'small',
  fallbackSource,
  useFallback = false,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [useFastImage, setUseFastImage] = useState(!useFallback);

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
    console.log('Image load error:', err);
  };

  // Fallback to regular Image if FastImage fails or useFallback is true
  if (!useFastImage || error) {
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
  }

  // Try to use FastImage with error boundary
  try {
    return (
      <View style={style}>
        <FastImage
          source={{
            uri,
            priority,
            cache: FastImage.cacheControl.immutable,
          }}
          style={StyleSheet.absoluteFill}
          resizeMode={resizeMode as ResizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={(err) => {
            // If FastImage fails, switch to regular Image
            console.log('FastImage error, falling back to Image:', err);
            setUseFastImage(false);
            handleError(err);
          }}
          {...props}
        />
        {loading && showLoader && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size={loaderSize} color={loaderColor} />
          </View>
        )}
      </View>
    );
  } catch (err) {
    // If FastImage component fails to render, use regular Image
    console.log('FastImage component error, using Image fallback:', err);
    return (
      <View style={style}>
        <Image
          source={{ uri }}
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
  }
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

// Pre-load images for better UX
export const preloadImages = (uris: string[]) => {
  FastImage.preload(
    uris.map(uri => ({
      uri,
      priority: FastImage.priority.high,
    }))
  );
};

// Clear cache if needed
export const clearImageCache = async () => {
  await FastImage.clearMemoryCache();
  await FastImage.clearDiskCache();
};

