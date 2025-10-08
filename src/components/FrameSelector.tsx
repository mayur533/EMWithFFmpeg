import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Frame } from '../data/frames';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive breakpoints
const isUltraSmallScreen = screenWidth < 360;
const isSmallScreen = screenWidth >= 360 && screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const isLargeScreen = screenWidth >= 414 && screenWidth < 768;
const isTablet = screenWidth >= 768;
const isLandscape = screenWidth > screenHeight;

interface FrameSelectorProps {
  frames: Frame[];
  selectedFrameId: string;
  onFrameSelect: (frame: Frame) => void;
  onClose?: () => void;
}

const FrameSelector: React.FC<FrameSelectorProps> = ({
  frames,
  selectedFrameId,
  onFrameSelect,
  onClose,
}) => {


  const renderFrameItem = ({ item }: { item: Frame }) => {
    const isSelected = selectedFrameId === item.id;

    return (
      <TouchableOpacity
        style={[styles.frameItem, isSelected && styles.frameItemSelected]}
        onPress={() => onFrameSelect(item)}
      >
        <View style={styles.framePreview}>
          {/* Sample background for preview */}
          <View style={styles.framePreviewBackground} />
          {/* Frame image preview */}
          <Image
            source={item.background}
            style={styles.frameImagePreview}
            resizeMode="cover"
          />
          <View style={styles.frameOverlay}>
            {/* Show placeholder indicators */}
            {item.placeholders.map((placeholder, index) => (
              <View
                key={index}
                style={[
                  styles.placeholderIndicator,
                  {
                    left: placeholder.x * 0.3, // Scale down for preview
                    top: placeholder.y * 0.3,
                    width: placeholder.width ? placeholder.width * 0.3 : 20,
                    height: placeholder.height ? placeholder.height * 0.3 : 20,
                  },
                ]}
              />
            ))}
          </View>
        </View>
        <Text style={[styles.frameName, isSelected && styles.frameNameSelected]}>
          {item.name}
        </Text>
        <Text style={styles.frameCategory}>{item.category}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Choose Frame</Text>
            <Text style={styles.subtitle}>Select a frame for your poster</Text>
          </View>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666666" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Frames List */}
      <FlatList
        data={frames}
        renderItem={renderFrameItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: isLandscape ? (isTablet ? 16 : 12) : (isUltraSmallScreen ? 10 : isSmallScreen ? 12 : 14),
    padding: isLandscape ? (isTablet ? 16 : 12) : (isUltraSmallScreen ? 10 : isSmallScreen ? 12 : 14),
    marginHorizontal: isLandscape ? (isTablet ? 16 : 12) : (isUltraSmallScreen ? 8 : isSmallScreen ? 10 : 12),
    marginBottom: isLandscape ? (isTablet ? 15 : 12) : (isUltraSmallScreen ? 10 : isSmallScreen ? 12 : 14),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  header: {
    marginBottom: isLandscape ? (isTablet ? 16 : 12) : (isUltraSmallScreen ? 10 : isSmallScreen ? 12 : 14),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  closeButton: {
    padding: isLandscape ? (isTablet ? 8 : 6) : (isUltraSmallScreen ? 4 : 6),
    marginLeft: isLandscape ? (isTablet ? 12 : 8) : (isUltraSmallScreen ? 6 : 8),
  },
  title: {
    fontSize: isLandscape ? (isTablet ? 18 : 16) : (isUltraSmallScreen ? 14 : isSmallScreen ? 15 : 16),
    fontWeight: '700',
    color: '#333333',
    marginBottom: isLandscape ? (isTablet ? 6 : 4) : (isUltraSmallScreen ? 3 : 4),
  },
  subtitle: {
    fontSize: isLandscape ? (isTablet ? 13 : 12) : (isUltraSmallScreen ? 10 : isSmallScreen ? 11 : 12),
    color: '#666666',
  },
  listContent: {
    paddingHorizontal: isLandscape ? (isTablet ? 6 : 4) : (isUltraSmallScreen ? 2 : 4),
  },
  frameItem: {
    alignItems: 'center',
    minWidth: isLandscape ? (isTablet ? 130 : 110) : (isUltraSmallScreen ? 90 : isSmallScreen ? 100 : 110),
    padding: isLandscape ? (isTablet ? 10 : 8) : (isUltraSmallScreen ? 6 : 8),
    borderRadius: isLandscape ? (isTablet ? 12 : 10) : (isUltraSmallScreen ? 8 : 10),
  },
  frameItemSelected: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  framePreview: {
    width: isLandscape ? (isTablet ? 110 : 95) : (isUltraSmallScreen ? 75 : isSmallScreen ? 85 : 95),
    height: isLandscape ? (isTablet ? 150 : 130) : (isUltraSmallScreen ? 105 : isSmallScreen ? 120 : 130),
    borderRadius: isLandscape ? (isTablet ? 10 : 8) : (isUltraSmallScreen ? 6 : 8),
    overflow: 'hidden',
    marginBottom: isLandscape ? (isTablet ? 10 : 8) : (isUltraSmallScreen ? 6 : 8),
    position: 'relative',
    backgroundColor: '#f8f9fa',
  },
  framePreviewBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
  },
  frameImagePreview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.8,
  },
  frameOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholderIndicator: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 2,
  },
  frameName: {
    fontSize: isLandscape ? (isTablet ? 13 : 12) : (isUltraSmallScreen ? 10 : isSmallScreen ? 11 : 12),
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 2,
  },
  frameNameSelected: {
    color: '#667eea',
    fontWeight: '700',
  },
  frameCategory: {
    fontSize: isLandscape ? (isTablet ? 11 : 10) : (isUltraSmallScreen ? 9 : 10),
    color: '#666666',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  separator: {
    width: isLandscape ? (isTablet ? 14 : 12) : (isUltraSmallScreen ? 8 : 10),
  },
});

export default FrameSelector;
