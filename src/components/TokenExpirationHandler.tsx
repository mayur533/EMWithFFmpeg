import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  DeviceEventEmitter,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TOKEN_EXPIRED_EVENT } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import authService from '../services/auth';
import { CommonActions } from '@react-navigation/native';
import { navigationRef } from '../navigation/NavigationService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const TokenExpirationHandler: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleTokenExpiration = () => {
      console.log('🔴 Token expiration detected, showing modal');
      setShowModal(true);
    };

    // Listen for token expiration events using DeviceEventEmitter
    const subscription = DeviceEventEmitter.addListener(
      TOKEN_EXPIRED_EVENT,
      handleTokenExpiration
    );

    // Cleanup listener on unmount
    return () => {
      subscription.remove();
    };
  }, []);

  const handleOk = async () => {
    setShowModal(false);
    
    // Sign out user
    await authService.signOut();
    
    // Navigate to login screen using navigation ref
    if (navigationRef.current) {
      navigationRef.current.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    }
  };

  return (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="fade"
      onRequestClose={handleOk}
      statusBarTranslucent={true}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleOk}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => {}} // Prevent closing when tapping inside modal
        >
          <View style={[styles.errorModalContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.errorModalHeader}>
              <View style={[styles.errorIconContainer, { backgroundColor: '#ff444420' }]}>
                <Icon name="error-outline" size={Math.min(screenWidth * 0.08, 32)} color="#ff4444" />
              </View>
              <Text 
                style={[styles.errorModalTitle, { color: theme.colors.text }]}
              >
                Session Expired
              </Text>
            </View>
            
            <View style={styles.errorModalContent}>
              <Text style={[styles.errorModalMessage, { color: theme.colors.text }]}>
                Your session has expired. Please log in again to continue.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.errorModalButton, { backgroundColor: '#ff4444' }]}
              onPress={handleOk}
            >
              <Text style={styles.errorModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModalContainer: {
    width: screenWidth * 0.85,
    maxWidth: 400,
    borderRadius: 20,
    padding: screenWidth * 0.06,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorModalHeader: {
    alignItems: 'center',
    marginBottom: screenHeight * 0.02,
    position: 'relative',
  },
  errorIconContainer: {
    width: Math.min(screenWidth * 0.18, 72),
    height: Math.min(screenWidth * 0.18, 72),
    borderRadius: Math.min(screenWidth * 0.09, 36),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: screenHeight * 0.015,
  },
  errorModalTitle: {
    fontSize: Math.min(screenWidth * 0.06, 24),
    fontWeight: '700',
    textAlign: 'center',
  },
  errorModalContent: {
    marginBottom: screenHeight * 0.025,
  },
  errorModalMessage: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    textAlign: 'center',
    lineHeight: Math.min(screenWidth * 0.06, 24),
  },
  errorModalButton: {
    paddingVertical: screenHeight * 0.018,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorModalButtonText: {
    color: '#FFFFFF',
    fontSize: Math.min(screenWidth * 0.042, 17),
    fontWeight: '600',
  },
});

export default TokenExpirationHandler;

