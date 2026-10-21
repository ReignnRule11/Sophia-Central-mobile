import React from 'react';
import * as SecureStore from 'expo-secure-store';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const slides = [
  {
    title: 'Find vetted academic resources',
    description: 'Search lecture notes, past questions, research papers, and project references in one place.',
  },
  {
    title: 'Save time and study with focus',
    description: 'Skip the clutter of Google, groups, and random websites. Use a trusted academic hub built for students.',
  },
  {
    title: 'Earn and grow with Wisdom Points',
    description: 'Upload useful content, share resources, and unlock premium academic support as you keep learning.',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const [index, setIndex] = React.useState(0);
  const slide = slides[index];

  const onNext = async () => {
    if (index < slides.length - 1) {
      setIndex((current) => current + 1);
      return;
    }

    await SecureStore.setItemAsync('sophia_onboarding_seen', 'true');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />
      <Text style={styles.step}>{index + 1}/{slides.length}</Text>

      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>✦</Text>
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.dotsRow}>
        {slides.map((item, slideIndex) => (
          <View
            key={item.title}
            style={[styles.dot, slideIndex === index && styles.dotActive]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>{index === slides.length - 1 ? 'Get started' : 'Next'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    padding: 24,
    justifyContent: 'center',
  },
  topGlow: {
    position: 'absolute',
    top: 40,
    right: 30,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#7C3AED',
    opacity: 0.18,
  },
  step: {
    color: '#A5B4FC',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 28,
    padding: 26,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  icon: {
    color: '#C4B5FD',
    fontSize: 28,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 12,
  },
  description: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#334155',
    marginHorizontal: 5,
  },
  dotActive: {
    width: 28,
    backgroundColor: '#A5B4FC',
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
