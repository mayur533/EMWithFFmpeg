import React, { useMemo, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle, ImageStyle, Image, Text, Dimensions, StyleProp } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Type-safe ResizeMode
type ImageResizeMode = 'cover' | 'contain' | 'stretch' | 'center';

const defaultFallbackSource = require('../assets/MainLogo/MB.png');

interface OptimizedImageProps {
  uri?: string | null;
  style?: StyleProp<ViewStyle | ImageStyle>;
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

const CLOUDINARY_UPLOAD_SEGMENT = '/upload/';
const CLOUDINARY_MIN_WIDTH = 320;
const CLOUDINARY_MAX_WIDTH = 1200;
const CLOUDINARY_DEFAULT_WIDTH = Math.min(
  CLOUDINARY_MAX_WIDTH,
  Math.max(CLOUDINARY_MIN_WIDTH, Math.round(Dimensions.get('window').width || CLOUDINARY_MIN_WIDTH)),
);
const CLOUDINARY_BASE_TRANSFORM = 'f_auto,q_auto:eco,c_limit';

const clampWidth = (value?: number | null): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return CLOUDINARY_DEFAULT_WIDTH;
  }
  return Math.min(CLOUDINARY_MAX_WIDTH, Math.max(CLOUDINARY_MIN_WIDTH, Math.round(value)));
};

const getTargetWidth = (style?: StyleProp<ViewStyle | ImageStyle>): number => {
  if (!style) {
    return CLOUDINARY_DEFAULT_WIDTH;
  }

  const flattened = StyleSheet.flatten(style);
  const { width, height } = flattened || {};

  if (typeof width === 'number') {
    return clampWidth(width);
  }

  if (typeof height === 'number') {
    // Fall back to height to avoid downloading far larger bitmaps than necessary
    return clampWidth(height);
  }

  return CLOUDINARY_DEFAULT_WIDTH;
};

const applyCloudinaryTransform = (input: string, targetWidth: number): string => {
  if (!input || !input.includes('res.cloudinary.com') || !input.includes(CLOUDINARY_UPLOAD_SEGMENT)) {
    return input;
  }

  try {
    const [prefix, remainder] = input.split(CLOUDINARY_UPLOAD_SEGMENT);
    if (!remainder) {
      return input;
    }

    const [firstSegment, ...restSegments] = remainder.split('/');

    // If the first segment is not a version string, we assume a transform already exists
    if (firstSegment && !/^v\d+/.test(firstSegment)) {
      return input;
    }

    const restPath = [firstSegment, ...restSegments].join('/');
    const transform = `${CLOUDINARY_BASE_TRANSFORM},w_${targetWidth}`;
    return `${prefix}${CLOUDINARY_UPLOAD_SEGMENT}${transform}/${restPath}`;
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
  const targetWidth = useMemo(() => getTargetWidth(style), [style]);
  const sanitizedUri = useMemo(() => (typeof uri === 'string' ? uri.trim() : ''), [uri]);
  const displayUri = useMemo(() => (sanitizedUri ? ensureImageUri(sanitizedUri) : ''), [sanitizedUri]);
  const optimizedUri = useMemo(
    () => (displayUri ? applyCloudinaryTransform(displayUri, targetWidth) : ''),
    [displayUri, targetWidth],
  );

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
      if (optimizedUri && optimizedUri !== displayUri) {
        console.warn('  - Optimized URI:', optimizedUri);
        console.warn('  - Target Width :', targetWidth);
      }
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
          source={{ uri: optimizedUri }}
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

