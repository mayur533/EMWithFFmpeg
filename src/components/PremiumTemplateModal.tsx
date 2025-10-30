import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

export interface PremiumTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  selectedTemplate?: { thumbnail: string; name: string; category: string } | null;
}

const PremiumTemplateModal: React.FC<PremiumTemplateModalProps> = ({
  visible,
  onClose,
  onUpgrade,
  selectedTemplate,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ScrollView 
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.upgradeModalContent, { backgroundColor: '#ffffff' }]}> 
            <View style={styles.premiumBadge}>
              <Icon name="star" size={isSmallScreen ? 20 : 24} color="#DAA520" />
              <Text style={[styles.premiumBadgeText, { color: '#B8860B' }]}>PREMIUM</Text>
            </View>

            <View style={styles.upgradeModalHeader}>
              <Text style={[styles.upgradeModalTitle, { color: '#1a1a1a' }]}>Unlock Premium Template</Text>
              <Text style={[styles.upgradeModalSubtitle, { color: '#666666' }]}>Get access to this exclusive template and all premium features</Text>
            </View>

            {selectedTemplate && (
              <View style={styles.templatePreview}>
                <Image 
                  source={{ uri: selectedTemplate.thumbnail }} 
                  style={styles.templatePreviewImage}
                  resizeMode="cover"
                />
                <View style={styles.templatePreviewOverlay}>
                  <Text style={styles.templatePreviewTitle}>{selectedTemplate.name}</Text>
                  <Text style={styles.templatePreviewDescription}>{selectedTemplate.category}</Text>
                </View>
              </View>
            )}

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Icon name="check-circle" size={isSmallScreen ? 18 : 20} color="#4CAF50" />
                <Text style={[styles.featureText, { color: '#1a1a1a' }]}>Access to all premium templates</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="check-circle" size={isSmallScreen ? 18 : 20} color="#4CAF50" />
                <Text style={[styles.featureText, { color: '#1a1a1a' }]}>No watermarks on final designs</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="check-circle" size={isSmallScreen ? 18 : 20} color="#4CAF50" />
                <Text style={[styles.featureText, { color: '#1a1a1a' }]}>Priority customer support</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="check-circle" size={isSmallScreen ? 18 : 20} color="#4CAF50" />
                <Text style={[styles.featureText, { color: '#1a1a1a' }]}>Advanced editing features</Text>
              </View>
            </View>

            <View style={styles.upgradeModalFooter}>
              <TouchableOpacity 
                style={[styles.cancelButton, { borderColor: '#cccccc' }]}
                onPress={onClose}
              >
                <Text style={[styles.cancelButtonText, { color: '#666666' }]}>Maybe Later</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.upgradeButton}
                onPress={onUpgrade}
              >
                <LinearGradient
                  colors={[ '#FF6B6B', '#FF8E53' ]}
                  style={styles.upgradeButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Icon name="star" size={isSmallScreen ? 14 : 16} color="#ffffff" style={styles.upgradeButtonIcon} />
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default PremiumTemplateModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  upgradeModalContent: {
    margin: isSmallScreen ? 12 : 20,
    borderRadius: 24,
    padding: isSmallScreen ? 16 : 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
    maxHeight: screenHeight * 0.85,
    minHeight: screenHeight * 0.4,
    width: '100%',
    maxWidth: screenWidth - (isSmallScreen ? 24 : 40),
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingVertical: isSmallScreen ? 6 : 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: isSmallScreen ? 16 : 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  premiumBadgeText: {
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '700',
    color: '#B8860B',
    marginLeft: 6,
    letterSpacing: 1,
  },
  upgradeModalHeader: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? 20 : 24,
  },
  upgradeModalTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: isSmallScreen ? 6 : 8,
    paddingHorizontal: isSmallScreen ? 8 : 0,
    color: '#1a1a1a',
  },
  upgradeModalSubtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    textAlign: 'center',
    lineHeight: isSmallScreen ? 20 : 22,
    paddingHorizontal: isSmallScreen ? 8 : 0,
    color: '#666666',
  },
  templatePreview: {
    height: isSmallScreen ? 100 : 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: isSmallScreen ? 20 : 24,
    position: 'relative',
  },
  templatePreviewImage: {
    width: '100%',
    height: '100%',
  },
  templatePreviewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: isSmallScreen ? 12 : 16,
  },
  templatePreviewTitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  templatePreviewDescription: {
    fontSize: isSmallScreen ? 12 : 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuresList: {
    marginBottom: isSmallScreen ? 20 : 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 10 : 12,
  },
  featureText: {
    fontSize: isSmallScreen ? 14 : 16,
    marginLeft: isSmallScreen ? 10 : 12,
    flex: 1,
    lineHeight: isSmallScreen ? 20 : 22,
    color: '#1a1a1a',
  },
  upgradeModalFooter: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    gap: isSmallScreen ? 12 : 16,
    alignItems: 'stretch',
    width: '100%',
  },
  cancelButton: {
    flex: isSmallScreen ? undefined : 1,
    paddingVertical: isSmallScreen ? 14 : 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    maxWidth: '100%',
    borderColor: '#cccccc',
  },
  cancelButtonText: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: '#666666',
  },
  upgradeButton: {
    flex: isSmallScreen ? undefined : 1,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 48,
    maxWidth: '100%',
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 14 : 16,
    minHeight: 48,
  },
  upgradeButtonIcon: {
    marginRight: isSmallScreen ? 6 : 8,
  },
  upgradeButtonText: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

