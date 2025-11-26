import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import loginAPIs from '../services/loginAPIs';
import { RootStackParamList } from '../navigation/AppNavigator';

type VerifyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VerifyResetCode'>;
type VerifyScreenRouteProp = RouteProp<RootStackParamList, 'VerifyResetCode'>;

type Props = {
  navigation: VerifyScreenNavigationProp;
  route: VerifyScreenRouteProp;
};

const VerifyResetCodeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;
  const { theme } = useTheme();
  const [code, setCode] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const isCodeValid = useMemo(() => /^\d{6}$/.test(code), [code]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleVerify = useCallback(async () => {
    if (!isCodeValid) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code sent to your email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginAPIs.verifyResetCode({ email, code });
      navigation.navigate('ResetPassword', { email, code });
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Verification failed. Please try again.';
      Alert.alert('Verification Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [code, email, isCodeValid, navigation]);

  const handleResend = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await loginAPIs.requestPasswordReset({ email });
      Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
      setResendTimer(30);
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Unable to resend code right now.';
      Alert.alert('Resend Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [email]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={theme.colors.gradient} style={styles.gradient}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Verify Code</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Enter the 6-digit code we sent to{'\n'}
              <Text style={styles.boldText}>{email}</Text>
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.codeInput,
                  {
                    borderColor: (isFocused || code) ? theme.colors.primary : theme.colors.border,
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.text,
                  },
                ]}
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="••••••"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: isCodeValid ? theme.colors.buttonPrimary : theme.colors.border,
                  opacity: isSubmitting ? 0.7 : 1,
                },
              ]}
              onPress={handleVerify}
              disabled={!isCodeValid || isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleResend}
              disabled={resendTimer > 0 || isSubmitting}
              style={styles.resendWrapper}
            >
              <Text
                style={[
                  styles.resendText,
                  {
                    color: resendTimer > 0 ? theme.colors.textSecondary : theme.colors.primary,
                  },
                ]}
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Didn’t receive the code? Resend'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.backLink}>
              <Text style={[styles.backLinkText, { color: theme.colors.primary }]}>Use another email</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 24,
  },
  codeInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendWrapper: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default VerifyResetCodeScreen;

