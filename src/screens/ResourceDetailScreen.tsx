import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function ResourceDetailScreen() {
  const route = useRoute<any>();
  const resource = route.params?.resource;

  if (!resource) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Resource not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>{resource.title}</Text>
      <Text style={styles.meta}>{resource.course ?? 'General'} • {resource.topic ?? 'Topic'}</Text>
      <Text style={styles.meta}>{resource.institution ?? 'Institution'} • {resource.type ?? 'Resource'}</Text>

      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>
        {resource.description ?? 'This resource contains academic material relevant to the selected course and topic.'}
      </Text>

      <TouchableOpacity style={styles.primaryButton} onPress={() => Alert.alert('Open', 'Open resource in a viewer or browser')}>
        <Text style={styles.primaryButtonText}>Open resource</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => Alert.alert('Saved', 'Resource saved to library')}>
        <Text style={styles.secondaryButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  meta: {
    color: '#94A3B8',
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    color: '#E5E7EB',
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  secondaryButtonText: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
});
