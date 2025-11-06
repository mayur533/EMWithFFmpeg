import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import { useTheme } from '../context/ThemeContext';

// Get responsive dimensions function
const getResponsiveDimensions = () => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Enhanced responsive design helpers with more granular breakpoints
  const isUltraSmallScreen = screenWidth < 360;
  const isSmallScreen = screenWidth >= 360 && screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
  const isLargeScreen = screenWidth >= 414 && screenWidth < 480;
  const isXLargeScreen = screenWidth >= 480 && screenWidth < 768;
  const isTablet = screenWidth >= 768;
  
  // Orientation detection
  const isPortrait = screenHeight > screenWidth;
  const isLandscape = screenWidth > screenHeight;
  
  // Enhanced responsive spacing and sizing
  const responsiveSpacing = {
    xs: isUltraSmallScreen ? 4 : isSmallScreen ? 6 : isMediumScreen ? 8 : isLargeScreen ? 10 : isTablet ? 16 : 12,
    sm: isUltraSmallScreen ? 6 : isSmallScreen ? 8 : isMediumScreen ? 12 : isLargeScreen ? 14 : isTablet ? 20 : 16,
    md: isUltraSmallScreen ? 8 : isSmallScreen ? 12 : isMediumScreen ? 16 : isLargeScreen ? 18 : isTablet ? 24 : 20,
    lg: isUltraSmallScreen ? 12 : isSmallScreen ? 16 : isMediumScreen ? 20 : isLargeScreen ? 22 : isTablet ? 32 : 24,
    xl: isUltraSmallScreen ? 16 : isSmallScreen ? 20 : isMediumScreen ? 24 : isLargeScreen ? 28 : isTablet ? 40 : 32,
    xxl: isUltraSmallScreen ? 20 : isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : isTablet ? 48 : 40,
  };
  
  const responsiveFontSize = {
    xs: isUltraSmallScreen ? 8 : isSmallScreen ? 9 : isMediumScreen ? 10 : isLargeScreen ? 11 : isTablet ? 14 : 12,
    sm: isUltraSmallScreen ? 10 : isSmallScreen ? 11 : isMediumScreen ? 12 : isLargeScreen ? 13 : isTablet ? 16 : 14,
    md: isUltraSmallScreen ? 12 : isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 15 : isTablet ? 18 : 16,
    lg: isUltraSmallScreen ? 14 : isSmallScreen ? 15 : isMediumScreen ? 16 : isLargeScreen ? 17 : isTablet ? 20 : 18,
    xl: isUltraSmallScreen ? 16 : isSmallScreen ? 17 : isMediumScreen ? 18 : isLargeScreen ? 19 : isTablet ? 24 : 20,
    xxl: isUltraSmallScreen ? 18 : isSmallScreen ? 19 : isMediumScreen ? 20 : isLargeScreen ? 21 : isTablet ? 26 : 22,
    xxxl: isUltraSmallScreen ? 20 : isSmallScreen ? 22 : isMediumScreen ? 24 : isLargeScreen ? 26 : isTablet ? 32 : 28,
    xxxxl: isUltraSmallScreen ? 24 : isSmallScreen ? 26 : isMediumScreen ? 28 : isLargeScreen ? 30 : isTablet ? 38 : 32,
  };
  
  return {
    screenWidth,
    screenHeight,
    isUltraSmallScreen,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isXLargeScreen,
    isTablet,
    isPortrait,
    isLandscape,
    responsiveSpacing,
    responsiveFontSize,
  };
};

const SplashScreen: React.FC = () => {
  const { isDarkMode, theme } = useTheme();
  
  // Responsive dimensions state
  const [dimensions, setDimensions] = useState(getResponsiveDimensions());
  
  // Listen for orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setDimensions(getResponsiveDimensions());
    });
    
    return () => subscription?.remove();
  }, []);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const videoOpacity = useRef(new Animated.Value(1)).current;
  
  // Video state
  const [showVideo, setShowVideo] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoTimeout, setVideoTimeout] = useState<NodeJS.Timeout | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Video event handlers
  const onVideoEnd = () => {
    console.log('✅ Video ended successfully');
    setVideoEnded(true);
    // Clear timeout if video ends successfully
    if (videoTimeout) {
      clearTimeout(videoTimeout);
      setVideoTimeout(null);
    }
    // Add a small delay before fading out video for smooth transition
    setTimeout(() => {
      // Fade out video
      Animated.timing(videoOpacity, {
        toValue: 0,
        duration: 800, // Slower fade out for smoother transition
        useNativeDriver: true,
      }).start(() => {
        setShowVideo(false);
        startAnimations();
      });
    }, 500); // Hold video at end for 500ms before fading
  };

  const onVideoError = (error: any) => {
    console.log('❌ Video error:', error);
    console.log('❌ Video path: intro.mp4');
    console.log('❌ Error details:', JSON.stringify(error, null, 2));
    // Clear timeout on error
    if (videoTimeout) {
      clearTimeout(videoTimeout);
      setVideoTimeout(null);
    }
    // If video fails to load, show regular splash screen
    setShowVideo(false);
    startAnimations();
  };

  const onVideoLoad = () => {
    console.log('✅ Video loaded successfully: intro.mp4');
    setVideoReady(true);
    // Clear timeout on successful load
    if (videoTimeout) {
      clearTimeout(videoTimeout);
      setVideoTimeout(null);
    }
  };

  const onVideoReadyForDisplay = () => {
    console.log('🎬 Video ready for display: intro.mp4');
  };

  const onVideoProgress = (data: any) => {
    console.log('📊 Video progress:', data);
  };

  const onVideoBuffer = (data: any) => {
    console.log('🔄 Video buffer:', data);
  };

  const onVideoLoadStart = () => {
    console.log('🔄 Video loading started: intro.mp4');
    // Set a timeout to fallback if video doesn't load within 8 seconds
    const timeout = setTimeout(() => {
      console.log('⏰ Video loading timeout - falling back to regular splash');
      setShowVideo(false);
      startAnimations();
    }, 8000); // 8 seconds timeout
    setVideoTimeout(timeout);
  };

  // Memoized animation sequence
  const startAnimations = useMemo(() => () => {
    // Fade in animation - slower for better impact
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500, // Increased from 1000ms to 1500ms
      useNativeDriver: true,
    }).start();

    // Scale animation - smoother spring effect
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40, // Reduced for slower, smoother animation
      friction: 8, // Increased for more damping
      useNativeDriver: true,
    }).start();

    // Slide up animation - slower
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1200, // Increased from 800ms to 1200ms
      useNativeDriver: true,
    }).start();

    // Rotation animation - slower rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000, // Increased from 3000ms to 4000ms for slower rotation
        useNativeDriver: true,
      })
    ).start();
  }, [fadeAnim, scaleAnim, slideAnim, rotateAnim]);

  useEffect(() => {
    // Don't start animations immediately if video is showing
    // They will start after video ends
    if (!showVideo) {
      startAnimations();
    }
  }, [startAnimations, showVideo]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <StatusBar 
        barStyle="light-content"
        backgroundColor="transparent" 
        translucent={true}
      />
      
      {/* Video Background - Fully Responsive Across All Screen Sizes */}
      {showVideo && (
        <Animated.View style={[
          styles.videoContainer, 
          { 
            opacity: videoOpacity,
            width: dimensions.screenWidth,
            height: dimensions.screenHeight,
          }
        ]}>
          <Video
            source={require('../assets/intro/intro.mp4')}
            style={[
              styles.video,
              {
                width: '100%',
                height: '100%',
                minWidth: dimensions.screenWidth,
                minHeight: dimensions.screenHeight,
              }
            ]}
            resizeMode="cover"
            onEnd={onVideoEnd}
            onError={onVideoError}
            onLoad={onVideoLoad}
            onLoadStart={onVideoLoadStart}
            onReadyForDisplay={onVideoReadyForDisplay}
            onProgress={onVideoProgress}
            onBuffer={onVideoBuffer}
            repeat={false}
            muted={false}
            volume={1.0}
            playInBackground={false}
            playWhenInactive={false}
            paused={false}
            ignoreSilentSwitch="ignore"
            mixWithOthers="mix"
            progressUpdateInterval={1000}
            bufferConfig={{
              minBufferMs: 15000,
              maxBufferMs: 50000,
              bufferForPlaybackMs: 2500,
              bufferForPlaybackAfterRebufferMs: 5000,
            }}
            maxBitRate={2000000}
            allowsExternalPlayback={false}
            hideShutterView={false}
            automaticallyWaitsToMinimizeStalling={false}
          />
        </Animated.View>
      )}
      
      {/* Manual Splash Screen - COMMENTED OUT - Only video plays as splash */}
      {/* 
      {!showVideo && (
        <LinearGradient
          colors={theme.colors.gradient}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.content}>
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    { scale: scaleAnim },
                    { translateY: slideAnim },
                  ],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.logoCircle,
                  {
                    backgroundColor: theme.colors.cardBackground,
                    transform: [{ rotate: spin }],
                  },
                ]}
              >
                <Image 
                  source={require('../assets/MainLogo/main_logo.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </Animated.View>
            </Animated.View>

            <Animated.View
              style={[
                styles.titleContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.appTitle}>MarketBrand</Text>
              <Text style={styles.appSubtitle}>Professional Event Marketing Solutions</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.loadingContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={[styles.loadingDots, { backgroundColor: theme.colors.cardBackground }]}>
                <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.poweredByContainer,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text style={styles.poweredByText}>Powered by RSL Solution Private Limited</Text>
            </Animated.View>
          </View>
        </LinearGradient>
      )}
      */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000', // Black background
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensures video stays within bounds
  },
  video: {
    flex: 1,
    alignSelf: 'stretch',
    // Responsive across all screen sizes - uses percentage-based dimensions with min constraints
  },
  gradientBackground: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoImage: {
    // Dimensions set dynamically
  },
  logoText: {
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  titleContainer: {
    alignItems: 'center',
  },
  appTitle: {
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 3,
  },
  appSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  poweredByContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
  },
  poweredByText: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default SplashScreen; 