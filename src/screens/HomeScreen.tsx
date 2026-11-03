import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { fetchResources } from '../services/resources';

const payloadOf = (response: any) => response?.data?.data ?? response?.data ?? {};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const resourcesQuery = useQuery({ queryKey: ['resources'], queryFn: () => fetchResources() });
  const walletQuery = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => payloadOf(await apiClient.get('/points/my-wallet/balance')),
  });
  const resources = resourcesQuery.data?.items ?? [];
  const balanceValue = typeof walletQuery.data === 'number' ? walletQuery.data : Number(walletQuery.data?.balance);
  const balance = Number.isFinite(balanceValue) ? balanceValue.toLocaleString() : '—';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Your learning space</Text>
          <Text style={styles.title}>Sophia Central</Text>
        </View>
        <TouchableOpacity style={styles.badge} onPress={() => navigation.navigate('Points')}>
          <Text style={styles.badgeText}>{walletQuery.isLoading ? '…' : `${balance} pts`}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.searchCard} onPress={() => navigation.navigate('Discover')}>
        <Text style={styles.searchText}>Search courses, notes, papers...</Text>
      </TouchableOpacity>
      <View style={styles.heroCard}>
        <Text style={styles.heroTag}>Study smarter</Text>
        <Text style={styles.heroTitle}>Find academic resources from your learning community.</Text>
        <Text style={styles.heroDescription}>Browse materials approved and made available through Sophia Central.</Text>
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recently available</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Discover')}><Text style={styles.viewAll}>Discover all</Text></TouchableOpacity>
      </View>
      {resourcesQuery.isLoading ? <ActivityIndicator color="#A5B4FC" style={{ margin: 24 }} /> : null}
      {resourcesQuery.isError ? (
        <View style={styles.stateCard}>
          <Text style={styles.empty}>We couldn't load resources.</Text>
          <TouchableOpacity onPress={() => void resourcesQuery.refetch()}><Text style={styles.retry}>Try again</Text></TouchableOpacity>
        </View>
      ) : null}
      {!resourcesQuery.isLoading && !resourcesQuery.isError && resources.length === 0 ? (
        <Text style={styles.empty}>No approved resources are available yet.</Text>
      ) : null}
      <FlatList
        scrollEnabled={false}
        data={resources.slice(0, 8)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listWrap}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resourceCard} onPress={() => navigation.navigate('ResourceDetail', { resource: item })}>
            <Text style={styles.trendType}>{item.type ?? 'Academic resource'}</Text>
            <Text style={styles.resourceTitle}>{item.title}</Text>
            <Text style={styles.resourceMeta}>{item.course ?? item.institution ?? 'Academic material'}{item.level ? ` · Level ${item.level}` : ''}</Text>
            <Text style={styles.resourceMeta}>{item.topic ?? item.description ?? ''}</Text>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  contentContainer: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  eyebrow: { color: '#94A3B8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  title: { color: '#F8FAFC', fontSize: 30, fontWeight: '800' },
  badge: { backgroundColor: '#1F2937', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#334155' },
  badgeText: { color: '#F8FAFC', fontWeight: '700' },
  searchCard: { backgroundColor: '#111827', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#1F2937', marginBottom: 20 },
  searchText: { color: '#94A3B8', fontSize: 16 },
  heroCard: { backgroundColor: '#171C2D', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#2A3552', marginBottom: 24 },
  heroTag: { color: '#A5B4FC', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  heroTitle: { color: '#F8FAFC', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  heroDescription: { color: '#94A3B8', lineHeight: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  viewAll: { color: '#A5B4FC', fontWeight: '600' },
  listWrap: { paddingBottom: 20 },
  resourceCard: { backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1F2937', padding: 18, marginBottom: 12 },
  trendType: { color: '#A5B4FC', fontSize: 11, marginBottom: 8, textTransform: 'uppercase' },
  resourceTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  resourceMeta: { color: '#94A3B8', marginTop: 3 },
  empty: { color: '#94A3B8', textAlign: 'center', marginTop: 12, marginBottom: 18 },
  retry: { color: '#A5B4FC', textAlign: 'center', fontWeight: '700', padding: 10 },
  stateCard: { backgroundColor: '#111827', padding: 16, borderRadius: 14 },
});
