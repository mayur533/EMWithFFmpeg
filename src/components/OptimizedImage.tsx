import React, { useMemo, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle, ImageStyle, Image, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Type-safe ResizeMode
type ImageResizeMode = 'cover' | 'contain' | 'stretch' | 'center';

const defaultFallbackSource = require('../assets/MainLogo/MB.png');

interface OptimizedImageProps {
  uri?: string | null;
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
  uri = '',
  style,
  resizeMode = 'cover',
  showLoader = true,
  loaderColor = '#667eea',
  loaderSize = 'small',
  fallbackSource = defaultFallbackSource,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const sanitizedUri = useMemo(() => (typeof uri === 'string' ? uri.trim() : ''), [uri]);
  const displayUri = useMemo(() => (sanitizedUri ? ensureImageUri(sanitizedUri) : ''), [sanitizedUri]);

  const handleLoadStart = () => {
    if (!sanitizedUri) {
      setLoading(false);
      setError(true);
      return;
    }
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (err?: any) => {
    setLoading(false);
    setError(true);
    
    // Extract meaningful error information
    const errorMessage = err?.message || err?.toString() || 'Unknown error';
    const errorCode = err?.nativeEvent?.error?.code || err?.code || 'N/A';
    const errorDescription = err?.nativeEvent?.error?.description || err?.description || 'N/A';
    
    // Only log error if it's not a network timeout or similar transient error
    if (!errorMessage.includes('network') && !errorMessage.includes('timeout')) {
      console.warn('⚠️ [IMAGE LOAD ERROR]');
      console.warn('  - Requested URI:', uri);
      console.warn('  - Loaded URI   :', displayUri);
      console.warn('  - Error Code   :', errorCode);
      console.warn('  - Error Message:', errorMessage);
      console.warn('  - Error Details:', errorDescription);
      if (err?.nativeEvent) {
        console.warn('  - Native Event :', JSON.stringify(err.nativeEvent, null, 2));
      }
    }
  };

  const shouldShowFallback = error || !sanitizedUri;

  return (
    <View style={style}>
      {shouldShowFallback ? (
        fallbackSource ? (
          <Image
            source={fallbackSource}
            style={StyleSheet.absoluteFill}
            resizeMode={resizeMode}
          />
        ) : (
          // Show placeholder when error occurs and no fallback is provided
          <View style={[StyleSheet.absoluteFill, styles.errorContainer]}>
            <Icon name="image" size={40} color="#999999" />
            <Text style={styles.errorText}>Image unavailable</Text>
          </View>
        )
      ) : (
        <Image
          source={{ uri: displayUri }}
          style={StyleSheet.absoluteFill}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
        />
      )}
      {loading && showLoader && !error && sanitizedUri && (
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
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
});

export default OptimizedImage;

