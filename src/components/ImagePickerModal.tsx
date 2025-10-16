import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
  Animated,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import { useTheme } from '../context/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive design helpers
const isSmallScreen = screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const isLargeScreen = screenWidth >= 414;
const isTablet = screenWidth >= 768;
const isLandscape = screenWidth > screenHeight;

// Dynamic responsive helpers for modal
const getModalDimensions = () => {
  const currentWidth = Dimensions.get('window').width;
  const currentHeight = Dimensions.get('window').height;
  const isCurrentlyLandscape = currentWidth > currentHeight;
  
  return {
    width: currentWidth,
    height: currentHeight,
    isLandscape: isCurrentlyLandscape,
    isSmall: currentWidth < 375,
    isMedium: currentWidth >= 375 && currentWidth < 414,
    isLarge: currentWidth >= 414,
    isTablet: currentWidth >= 768,
  };
};

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (imageUri: string) => void;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onImageSelected,
}) => {
  const { theme } = useTheme();
  const [dimensions, setDimensions] = useState(getModalDimensions());
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const backdropAnimation = useRef(new Animated.Value(0)).current;

  // Update dimensions on orientation change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setDimensions(getModalDimensions());
    });

    return () => subscription?.remove();
  }, []);

  // Animate modal appearance
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalAnimation, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        console.log('Camera permission result:', granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Camera permission error:', err);
        return false;
      }
    }
    // iOS permissions are handled automatically by react-native-image-picker
    return true;
  };

  const handleCameraPress = async () => {
    console.log('📷 Camera button pressed');
    
    try {
      // Request camera permission for Android
      const hasPermission = await requestCameraPermission();
      
      if (!hasPermission) {
        console.log('❌ Camera permission denied');
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('✅ Camera permission granted, launching camera...');
      
      const options = {
        title: 'Take Photo',
        mediaType: 'photo' as const,
        quality: 0.8 as number,
        maxWidth: 1024,
        maxHeight: 1024,
        saveToPhotos: false,
        cameraType: 'back' as const,
      };

      launchCamera(options, (response) => {
        // Wrap in setTimeout to avoid callback issues
        setTimeout(async () => {
          try {
            console.log('📸 Camera response received');
            
            if (response.didCancel) {
              console.log('User cancelled camera');
              return;
            }

            if (response.errorCode) {
              console.error('Camera error:', response.errorCode, response.errorMessage);
              Alert.alert(
                'Camera Error',
                response.errorMessage || 'Failed to take photo. Please try again.',
                [{ text: 'OK' }]
              );
              return;
            }

            if (response.assets && response.assets[0] && response.assets[0].uri) {
              const imageUri = response.assets[0].uri;
              console.log('✅ Photo captured successfully');
              console.log('📍 Image URI:', imageUri);
              console.log('📏 Image size:', response.assets[0].fileSize, 'bytes');
              console.log('📐 Image dimensions:', response.assets[0].width, 'x', response.assets[0].height);
              
              // Open crop modal with error handling
              try {
                await openCropModal(imageUri);
              } catch (cropError) {
                console.error('❌ Unexpected crop error:', cropError);
                // Fallback - use image without cropping
                onImageSelected(imageUri);
                onClose();
              }
            } else {
              console.error('❌ No image URI in response');
              console.error('Response assets:', response.assets);
              Alert.alert(
                'Error',
                'Failed to capture photo. Please try again.',
                [{ text: 'OK' }]
              );
            }
          } catch (error) {
            console.error('❌ Error processing camera response:', error);
            Alert.alert(
              'Error',
              'An error occurred while processing the photo. Please try again.',
              [{ text: 'OK' }]
            );
          }
        }, 100);
      });
    } catch (error) {
      console.error('❌ Camera error:', error);
      Alert.alert(
        'Camera Error',
        'Failed to open camera. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleGalleryPress = () => {
    console.log('🖼️ Gallery button pressed');
    
    try {
      const options = {
        title: 'Select Photo',
        mediaType: 'photo' as const,
        quality: 0.8 as number,
        maxWidth: 1024,
        maxHeight: 1024,
        selectionLimit: 1,
      };

      launchImageLibrary(options, (response) => {
        // Wrap in setTimeout to avoid callback issues
        setTimeout(async () => {
          try {
            console.log('📸 Gallery response received');
            
            if (response.didCancel) {
              console.log('User cancelled gallery picker');
              return;
            }

            if (response.errorCode) {
              console.error('Gallery error:', response.errorCode, response.errorMessage);
              Alert.alert(
                'Gallery Error',
                response.errorMessage || 'Failed to select photo. Please try again.',
                [{ text: 'OK' }]
              );
              return;
            }

            if (response.assets && response.assets[0] && response.assets[0].uri) {
              const imageUri = response.assets[0].uri;
              console.log('✅ Photo selected from gallery');
              console.log('📍 Image URI:', imageUri);
              console.log('📏 Image size:', response.assets[0].fileSize, 'bytes');
              
              // Open crop modal with error handling
              try {
                await openCropModal(imageUri);
              } catch (cropError) {
                console.error('❌ Unexpected crop error:', cropError);
                // Fallback - use image without cropping
                onImageSelected(imageUri);
                onClose();
              }
            } else {
              console.error('❌ No image URI in response');
              console.error('Response assets:', response.assets);
              Alert.alert(
                'Error',
                'Failed to select photo. Please try again.',
                [{ text: 'OK' }]
              );
            }
          } catch (error) {
            console.error('❌ Error processing gallery response:', error);
            Alert.alert(
              'Error',
              'An error occurred while processing the photo. Please try again.',
              [{ text: 'OK' }]
            );
          }
        }, 100);
      });
    } catch (error) {
      console.error('❌ Gallery error:', error);
      Alert.alert(
        'Gallery Error',
        'Failed to open gallery. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const openCropModal = async (imageUri: string) => {
    console.log('✂️ Opening crop modal for:', imageUri);
    
    try {
      // Use the URI as-is - the cropper library handles file:// prefix correctly
      let cropperPath = imageUri;
      
      // For Android, ensure we have the full file:// URI
      if (Platform.OS === 'android' && !cropperPath.startsWith('file://')) {
        cropperPath = `file://${cropperPath}`;
      }
      
      console.log('📍 Cropper path:', cropperPath);
      
      const croppedImage = await ImageCropPicker.openCropper({
        path: cropperPath,
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
        includeBase64: false,
        cropperToolbarTitle: 'Crop Profile Picture',
        cropperStatusBarColor: theme.colors.primary,
        cropperToolbarColor: theme.colors.primary,
        cropperActiveWidgetColor: theme.colors.primary,
        cropperToolbarWidgetColor: '#ffffff',
        freeStyleCropEnabled: false,
        enableRotationGesture: true,
        avoidEmptySpaceAroundImage: true,
        mediaType: 'photo',
      });
      
      console.log('✅ Image cropped successfully:', croppedImage.path);
      
      // Ensure the cropped image path is properly formatted
      const finalPath = Platform.OS === 'android' && !croppedImage.path.startsWith('file://')
        ? `file://${croppedImage.path}`
        : croppedImage.path;
      
      onImageSelected(finalPath);
      onClose();
      
    } catch (error: any) {
      console.log('❌ Crop error:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));
      
      // User cancelled cropping
      if (error.code === 'E_PICKER_CANCELLED' || 
          error.message === 'User cancelled image selection') {
        console.log('User cancelled cropping');
        return;
      }
      
      // Crop failed - offer to use image without cropping
      Alert.alert(
        'Cropping Failed',
        'The image cropping tool encountered an error. Would you like to use the image without cropping?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => console.log('User cancelled after crop error')
          },
          {
            text: 'Use Without Crop',
            onPress: () => {
              console.log('✅ Using image without cropping:', imageUri);
              onImageSelected(imageUri);
              onClose();
            },
          },
        ]
      );
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const renderOption = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    iconColor: string
  ) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        {
          backgroundColor: theme.colors.cardBackground,
          marginBottom: dimensions.isSmall ? 12 : dimensions.isMedium ? 16 : 20,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.optionContent}>
        <View style={[styles.optionIcon, { backgroundColor: `${iconColor}20` }]}>
          <Icon name={icon} size={dimensions.isSmall ? 24 : dimensions.isMedium ? 28 : 32} color={iconColor} />
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={[
            styles.optionTitle,
            { color: theme.colors.text, fontSize: dimensions.isSmall ? 16 : dimensions.isMedium ? 18 : 20 }
          ]}>
            {title}
          </Text>
          <Text style={[
            styles.optionSubtitle,
            { color: theme.colors.textSecondary, fontSize: dimensions.isSmall ? 12 : dimensions.isMedium ? 14 : 16 }
          ]}>
            {subtitle}
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropAnimation,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [
              {
                translateY: modalAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [dimensions.height, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.cardBackground,
              borderTopLeftRadius: dimensions.isTablet ? 24 : 20,
              borderTopRightRadius: dimensions.isTablet ? 24 : 20,
              paddingHorizontal: dimensions.isSmall ? 16 : dimensions.isMedium ? 20 : 24,
              paddingTop: dimensions.isSmall ? 16 : dimensions.isMedium ? 20 : 24,
              paddingBottom: Math.max(34, dimensions.height * 0.05), // Account for safe area
            },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              {
                color: theme.colors.text,
                fontSize: dimensions.isSmall ? 18 : dimensions.isMedium ? 20 : 22,
              }
            ]}>
              Select Profile Picture
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {renderOption(
              'camera-alt',
              'Take Photo',
              'Capture a new photo with camera',
              handleCameraPress,
              theme.colors.primary
            )}
            {renderOption(
              'photo-library',
              'Choose from Gallery',
              'Select an existing photo from gallery',
              handleGalleryPress,
              '#4CAF50'
            )}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                paddingVertical: dimensions.isSmall ? 12 : dimensions.isMedium ? 14 : 16,
              }
            ]}
            onPress={handleClose}
          >
            <Text style={[
              styles.cancelButtonText,
              {
                color: theme.colors.textSecondary,
                fontSize: dimensions.isSmall ? 16 : dimensions.isMedium ? 18 : 20,
              }
            ]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    opacity: 0.8,
  },
  cancelButton: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontWeight: '600',
  },
});

export default ImagePickerModal;
