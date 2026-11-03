import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';

const payloadOf = (response: any) => response?.data?.data ?? response?.data ?? {};
const statusColor: Record<string, string> = {
  approved: '#34D399',
  rejected: '#FCA5A5',
  pending: '#FBBF24',
  flagged: '#FB923C',
  draft: '#94A3B8',
};

export default function MyUploadsScreen() {
  const submissions = useQuery({
    queryKey: ['lecturer-submissions'],
    queryFn: async () => {
      const payload = payloadOf(await apiClient.get('/resources/mine'));
      return Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My submissions</Text>
      <Text style={styles.subtitle}>Track the review status of resources you have submitted.</Text>
      {submissions.isLoading ? <ActivityIndicator color="#A5B4FC" style={{ margin: 24 }} /> : null}
      {submissions.isError ? <Text style={styles.error}>Unable to load your submissions. Pull down to retry.</Text> : null}
      <FlatList
        data={submissions.data ?? []}
        keyExtractor={(item: any) => String(item.id)}
        refreshControl={<RefreshControl refreshing={submissions.isRefetching} onRefresh={() => void submissions.refetch()} tintColor="#A5B4FC" />}
        ListEmptyComponent={!submissions.isLoading && !submissions.isError ? <Text style={styles.empty}>You have not submitted any resources yet.</Text> : null}
        renderItem={({ item }: any) => {
          const status = String(item.moderationStatus ?? 'pending').toLowerCase();
          return (
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={[styles.status, { color: statusColor[status] ?? '#94A3B8' }]}>{status}</Text>
              </View>
              <Text style={styles.meta}>{item.course ?? 'Course not specified'} · {item.type ?? 'Resource'}</Text>
              {item.topic ? <Text style={styles.meta}>{item.topic}</Text> : null}
              {item.moderationNote ? <Text style={styles.note}>Review note: {item.moderationNote}</Text> : null}
              <Text style={styles.meta}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220', padding: 20 },
  title: { color: '#F8FAFC', fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#94A3B8', lineHeight: 20, marginBottom: 18 },
  card: { backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1F2937', padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle: { flex: 1, color: '#F8FAFC', fontSize: 17, fontWeight: '700', marginRight: 10 },
  status: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  meta: { color: '#94A3B8', marginTop: 7 },
  note: { color: '#CBD5E1', marginTop: 8 },
  empty: { color: '#94A3B8', textAlign: 'center', padding: 24 },
  error: { color: '#FCA5A5', textAlign: 'center', padding: 20 },
});
