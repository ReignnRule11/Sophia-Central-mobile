import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';

const payloadOf = (response: any) => response?.data?.data ?? response?.data ?? {};
export default function ModerationScreen() {
  const queryClient = useQueryClient();
  const queue = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: async () => {
      const payload = payloadOf(await apiClient.get('/moderation/queue'));
      return Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
    },
  });

  const review = async (resourceId: string, status: 'approved' | 'rejected') => {
    try {
      await apiClient.patch(`/moderation/resources/${encodeURIComponent(resourceId)}/review`, { status });
      await queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      await queryClient.invalidateQueries({ queryKey: ['resources'] });
      Alert.alert('Review recorded', status === 'approved' ? 'The resource is approved and can appear in the student library.' : 'The resource has been rejected.');
    } catch (error: any) {
      Alert.alert('Review failed', String(error?.response?.data?.message ?? error?.message ?? 'The item remains pending.'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moderation queue</Text>
      <Text style={styles.subtitle}>Review lecturer submissions before they appear in the academic library.</Text>
      {queue.isLoading ? <ActivityIndicator color="#A5B4FC" style={{ margin: 24 }} /> : null}
      {queue.isError ? <TouchableOpacity onPress={() => void queue.refetch()}><Text style={styles.error}>Unable to load queue. Tap to retry.</Text></TouchableOpacity> : null}
      <FlatList
        data={queue.data ?? []}
        keyExtractor={(item: any) => String(item.id)}
        refreshControl={<RefreshControl refreshing={queue.isRefetching} onRefresh={() => void queue.refetch()} tintColor="#A5B4FC" />}
        ListEmptyComponent={!queue.isLoading && !queue.isError ? <Text style={styles.empty}>There are no pending submissions.</Text> : null}
        renderItem={({ item }: any) => (
          <View style={styles.card}>
            <Text style={styles.status}>{item.moderationStatus ?? 'pending'}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.meta}>{item.course ?? 'Course not specified'} · {item.type ?? 'Resource'}</Text>
            <Text style={styles.meta}>Lecturer: {item.uploader?.name ?? [item.uploader?.firstName, item.uploader?.lastName].filter(Boolean).join(' ') ?? item.uploader?.email ?? item.uploaderId ?? 'Unknown'}</Text>
            {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.reject} onPress={() => void review(String(item.id), 'rejected')}><Text style={styles.actionText}>Reject</Text></TouchableOpacity>
              <TouchableOpacity style={styles.approve} onPress={() => void review(String(item.id), 'approved')}><Text style={styles.actionText}>Approve</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220', padding: 20 },
  title: { color: '#F8FAFC', fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#94A3B8', lineHeight: 20, marginBottom: 18 },
  card: { backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1F2937', padding: 16, marginBottom: 12 },
  status: { color: '#FBBF24', fontSize: 11, textTransform: 'uppercase', marginBottom: 8 },
  cardTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  meta: { color: '#94A3B8', marginBottom: 4 },
  description: { color: '#CBD5E1', lineHeight: 20, marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  reject: { backgroundColor: '#7F1D1D', paddingVertical: 11, paddingHorizontal: 18, borderRadius: 10, marginRight: 10 },
  approve: { backgroundColor: '#166534', paddingVertical: 11, paddingHorizontal: 18, borderRadius: 10 },
  actionText: { color: '#FFF', fontWeight: '700' },
  empty: { color: '#94A3B8', textAlign: 'center', padding: 24 },
  error: { color: '#FCA5A5', textAlign: 'center', padding: 20 },
});
