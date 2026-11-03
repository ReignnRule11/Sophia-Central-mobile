import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { apiClient } from '../config/api';

const payloadOf = (response: any) => response?.data?.data ?? response?.data ?? {};

export default function ResourceDetailScreen() {
  const route = useRoute<any>();
  const resource = route.params?.resource;
  const [busy, setBusy] = useState<'open' | 'save' | null>(null);
  const [saved, setSaved] = useState(false);

  if (!resource) {
    return <View style={styles.container}><Text style={styles.title}>Resource not found</Text></View>;
  }

  const openResource = async () => {
    if (!resource.id || busy) return;
    setBusy('open');
    try {
      // The backend requires an in-app download record before issuing a short-lived reader URL.
      await apiClient.post(`/resources/${encodeURIComponent(resource.id)}/download`);
      const file = payloadOf(await apiClient.get(`/resources/${encodeURIComponent(resource.id)}/file-url`));
      if (typeof file.url !== 'string' || !file.url.startsWith('https://')) {
        throw new Error('The backend did not return a secure document URL.');
      }
      await Linking.openURL(file.url);
    } catch (error: any) {
      Alert.alert('Unable to open resource', String(error?.response?.data?.message ?? error?.message ?? 'Please try again.'));
    } finally {
      setBusy(null);
    }
  };

  const toggleSave = async () => {
    if (!resource.id || busy) return;
    setBusy('save');
    try {
      if (saved) {
        await apiClient.delete(`/resources/${encodeURIComponent(resource.id)}/save`);
        setSaved(false);
      } else {
        await apiClient.post(`/resources/${encodeURIComponent(resource.id)}/save`);
        setSaved(true);
      }
    } catch (error: any) {
      Alert.alert('Unable to update saved resources', String(error?.response?.data?.message ?? error?.message ?? 'Please try again.'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>{resource.title}</Text>
      <Text style={styles.meta}>{resource.course ?? 'General'} · {resource.topic ?? 'Academic material'}</Text>
      <Text style={styles.meta}>{resource.institution ?? 'Institution'} · {resource.type ?? 'Resource'}</Text>
      {resource.moderationStatus ? <Text style={styles.meta}>Status: {resource.moderationStatus}</Text> : null}
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{resource.description ?? 'Academic material relevant to the selected course and topic.'}</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={openResource} disabled={busy !== null}>
        {busy === 'open' ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Download and open resource</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={toggleSave} disabled={busy !== null}>
        {busy === 'save' ? <ActivityIndicator color="#F8FAFC" /> : <Text style={styles.secondaryButtonText}>{saved ? 'Remove from saved' : 'Save resource'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  title: { color: '#F8FAFC', fontSize: 28, fontWeight: '700', marginBottom: 12 },
  meta: { color: '#94A3B8', marginBottom: 6 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 8 },
  description: { color: '#E5E7EB', lineHeight: 22 },
  primaryButton: { marginTop: 24, backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#FFF', fontWeight: '700' },
  secondaryButton: { marginTop: 12, backgroundColor: '#111827', borderRadius: 12, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1F2937' },
  secondaryButtonText: { color: '#F8FAFC', fontWeight: '700' },
});
