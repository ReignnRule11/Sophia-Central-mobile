import React, { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const seen = await SecureStore.getItemAsync('sophia_onboarding_seen');
        if (token) {
          navigation.replace('Main');
          return;
        }

        if (seen === 'true') {
          navigation.replace('Login');
        } else {
          navigation.replace('Onboarding');
        }
      } catch (_error) {
        navigation.replace('Onboarding');
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [navigation, token]);

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>S</Text>
      </View>
      <Text style={styles.title}>Sophia Central</Text>
      <Text style={styles.subtitle}>Study smarter. Research faster.</Text>
      <ActivityIndicator color="#A5B4FC" size="small" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1220',
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    marginBottom: 18,
  },
  logoText: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: '800',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#94A3B8',
    marginTop: 8,
    fontSize: 14,
  },
});
