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

// Compact spacing multiplier for reduced spacing (50% reduction)
const COMPACT_MULTIPLIER = 0.5;

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

// Separate component for frame item to properly use hooks
interface FrameItemProps {
  item: Frame;
  isSelected: boolean;
  onSelect: (frame: Frame) => void;
}

const FrameItem: React.FC<FrameItemProps> = ({ item, isSelected, onSelect }) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <TouchableOpacity
      style={[styles.frameItem, isSelected && styles.frameItemSelected]}
      onPress={() => onSelect(item)}
    >
      <View style={styles.framePreview}>
        {/* Sample background for preview */}
        <View style={styles.framePreviewBackground} />
        {/* Frame image preview */}
        {!imageError ? (
          <Image
            source={item.background}
            style={styles.frameImagePreview}
            resizeMode="contain"
            onError={(error) => {
              console.log(`Error loading frame preview ${item.id}:`, error.nativeEvent?.error);
              setImageError(true);
            }}
          />
        ) : (
          <View style={styles.framePreviewFallback}>
            <Icon name="image" size={Math.max(20, 32 * 0.7)} color="#999999" />
            <Text style={styles.framePreviewFallbackText}>{item.name}</Text>
          </View>
        )}
        <View style={styles.frameOverlay}>
          {/* Show placeholder indicators */}
          {!imageError && item.placeholders.map((placeholder, index) => (
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

const FrameSelector: React.FC<FrameSelectorProps> = ({
  frames,
  selectedFrameId,
  onFrameSelect,
  onClose,
}) => {

  const renderFrameItem = ({ item }: { item: Frame }) => {
    const isSelected = selectedFrameId === item.id;
    return (
      <FrameItem
        item={item}
        isSelected={isSelected}
        onSelect={onFrameSelect}
      />
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
              <Icon name="close" size={Math.max(16, 24 * 0.75)} color="#666666" />
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
    borderRadius: Math.max(6, (isLandscape ? (isTablet ? 16 : 12) : (isUltraSmallScreen ? 10 : isSmallScreen ? 12 : 14)) * 0.7),
    padding: Math.max(4, (isLandscape ? (isTablet ? 16 : 12) : (isUltraSmallScreen ? 10 : isSmallScreen ? 12 : 14)) * COMPACT_MULTIPLIER),
    marginHorizontal: Math.max(4, (isLandscape ? (isTablet ? 16 : 12) : (isUltraSmallScreen ? 8 : isSmallScreen ? 10 : 12)) * COMPACT_MULTIPLIER),
    marginBottom: Math.max(5, (isLandscape ? (isTablet ? 15 : 12) : (isUltraSmallScreen ? 10 : isSmallScreen ? 12 : 14)) * COMPACT_MULTIPLIER),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: Math.max(2, 4 * COMPACT_MULTIPLIER),
    },
    shadowOpacity: 0.08,
    shadowRadius: Math.max(6, 12 * COMPACT_MULTIPLIER),
    elevation: Math.max(4, 8 * COMPACT_MULTIPLIER),
    borderWidth: 0.5,
    borderColor: '#e9ecef',
  },
  header: {
    marginBottom: Math.max(5, (isLandscape ? (isTablet ? 16 : 12) : (isUltraSmallScreen ? 10 : isSmallScreen ? 12 : 14)) * COMPACT_MULTIPLIER),
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
    padding: Math.max(2, (isLandscape ? (isTablet ? 8 : 6) : (isUltraSmallScreen ? 4 : 6)) * COMPACT_MULTIPLIER),
    marginLeft: Math.max(3, (isLandscape ? (isTablet ? 12 : 8) : (isUltraSmallScreen ? 6 : 8)) * COMPACT_MULTIPLIER),
  },
  title: {
    fontSize: Math.max(12, (isLandscape ? (isTablet ? 18 : 16) : (isUltraSmallScreen ? 14 : isSmallScreen ? 15 : 16)) * 0.85),
    fontWeight: '700',
    color: '#333333',
    marginBottom: Math.max(2, (isLandscape ? (isTablet ? 6 : 4) : (isUltraSmallScreen ? 3 : 4)) * COMPACT_MULTIPLIER),
  },
  subtitle: {
    fontSize: Math.max(9, (isLandscape ? (isTablet ? 13 : 12) : (isUltraSmallScreen ? 10 : isSmallScreen ? 11 : 12)) * 0.8),
    color: '#666666',
  },
  listContent: {
    paddingHorizontal: Math.max(1, (isLandscape ? (isTablet ? 6 : 4) : (isUltraSmallScreen ? 2 : 4)) * COMPACT_MULTIPLIER),
  },
  frameItem: {
    alignItems: 'center',
    minWidth: Math.max(60, (isLandscape ? (isTablet ? 130 : 110) : (isUltraSmallScreen ? 90 : isSmallScreen ? 100 : 110)) * 0.7),
    padding: Math.max(3, (isLandscape ? (isTablet ? 10 : 8) : (isUltraSmallScreen ? 6 : 8)) * COMPACT_MULTIPLIER),
    borderRadius: Math.max(5, (isLandscape ? (isTablet ? 12 : 10) : (isUltraSmallScreen ? 8 : 10)) * 0.7),
  },
  frameItemSelected: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderWidth: 1.5,
    borderColor: '#667eea',
  },
  framePreview: {
    width: Math.max(50, (isLandscape ? (isTablet ? 110 : 95) : (isUltraSmallScreen ? 75 : isSmallScreen ? 85 : 95)) * 0.7),
    height: Math.max(70, (isLandscape ? (isTablet ? 150 : 130) : (isUltraSmallScreen ? 105 : isSmallScreen ? 120 : 130)) * 0.7),
    borderRadius: Math.max(4, (isLandscape ? (isTablet ? 10 : 8) : (isUltraSmallScreen ? 6 : 8)) * 0.7),
    overflow: 'hidden',
    marginBottom: Math.max(3, (isLandscape ? (isTablet ? 10 : 8) : (isUltraSmallScreen ? 6 : 8)) * COMPACT_MULTIPLIER),
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
    opacity: 0.9,
    width: '100%',
    height: '100%',
  },
  framePreviewFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  framePreviewFallbackText: {
    fontSize: Math.max(8, 10 * 0.85),
    color: '#999999',
    marginTop: Math.max(2, 4 * COMPACT_MULTIPLIER),
    textAlign: 'center',
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
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 1,
  },
  frameName: {
    fontSize: Math.max(8, (isLandscape ? (isTablet ? 13 : 12) : (isUltraSmallScreen ? 10 : isSmallScreen ? 11 : 12)) * 0.85),
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 1,
  },
  frameNameSelected: {
    color: '#667eea',
    fontWeight: '700',
  },
  frameCategory: {
    fontSize: Math.max(7, (isLandscape ? (isTablet ? 11 : 10) : (isUltraSmallScreen ? 9 : 10)) * 0.8),
    color: '#666666',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  separator: {
    width: Math.max(4, (isLandscape ? (isTablet ? 14 : 12) : (isUltraSmallScreen ? 8 : 10)) * COMPACT_MULTIPLIER),
  },
});

export default FrameSelector;
