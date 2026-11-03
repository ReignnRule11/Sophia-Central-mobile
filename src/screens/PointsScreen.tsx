import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';

const payloadOf = (response: any) => response?.data?.data ?? response?.data ?? {};
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString() : '';

export default function PointsScreen() {
  const wallet = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => payloadOf(await apiClient.get('/points/my-wallet/balance')),
  });
  const transactions = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: async () => {
      const payload = payloadOf(await apiClient.get('/points/my-wallet/transactions', { params: { limit: 30 } }));
      return Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
    },
  });
  const balance = typeof wallet.data === 'number' ? wallet.data : Number(wallet.data?.balance ?? 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wisdom Points</Text>
      {wallet.isLoading ? <ActivityIndicator color="#A5B4FC" /> : (
        <Text style={styles.balance}>{Number.isFinite(balance) ? balance.toLocaleString() : '—'}</Text>
      )}
      {wallet.isError ? <Text style={styles.error}>Unable to load your balance. Pull down to retry.</Text> : null}
      <Text style={styles.section}>Recent activity</Text>
      {transactions.isLoading ? <ActivityIndicator color="#A5B4FC" /> : (
        <FlatList
          data={transactions.data ?? []}
          keyExtractor={(item: any, index: number) => String(item.id ?? index)}
          refreshControl={<RefreshControl refreshing={wallet.isRefetching || transactions.isRefetching} onRefresh={() => { void wallet.refetch(); void transactions.refetch(); }} tintColor="#A5B4FC" />}
          ListEmptyComponent={<Text style={styles.empty}>{transactions.isError ? 'Unable to load transactions.' : 'No transactions yet.'}</Text>}
          renderItem={({ item }: any) => {
            const amount = Number(item.amount ?? 0);
            const positive = amount >= 0;
            return (
              <View style={styles.card}>
                <View style={styles.transactionText}>
                  <Text style={styles.cardTitle}>{item.reason ?? item.type ?? 'Wallet activity'}</Text>
                  <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                </View>
                <Text style={[styles.cardValue, { color: positive ? '#34D399' : '#FCA5A5' }]}>{positive ? '+' : ''}{amount}</Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220', padding: 20 },
  title: { color: '#F8FAFC', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  balance: { color: '#A5B4FC', fontSize: 42, fontWeight: '800', marginBottom: 28 },
  section: { color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: '#111827', padding: 18, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: '#1F2937', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  transactionText: { flex: 1, marginRight: 12 },
  cardTitle: { color: '#F8FAFC', fontSize: 15 },
  date: { color: '#64748B', fontSize: 12, marginTop: 4 },
  cardValue: { fontWeight: '700', fontSize: 18 },
  error: { color: '#FCA5A5', marginBottom: 16 },
  empty: { color: '#94A3B8', textAlign: 'center', padding: 24 },
});
