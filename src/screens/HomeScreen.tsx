import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { mockResources } from '../data/mockData';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const { data, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/resources');
        const payload = response.data?.data ?? response.data ?? mockResources;
        return Array.isArray(payload) ? payload : payload.items ?? mockResources;
      } catch (_error) {
        return mockResources;
      }
    },
  });

  const resources = Array.isArray(data) ? data : mockResources;
  const featured = resources.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Good evening</Text>
          <Text style={styles.title}>Sophia Central</Text>
        </View>
        <TouchableOpacity style={styles.badge} onPress={() => navigation.navigate('Points')}>
          <Text style={styles.badgeText}>850 pts</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.searchCard} onPress={() => navigation.navigate('Discover')}>
        <Text style={styles.searchText}>Search courses, notes, papers...</Text>
      </TouchableOpacity>

      <View style={styles.heroCard}>
        <Text style={styles.heroTag}>Study smarter</Text>
        <Text style={styles.heroTitle}>Find verified academic resources in minutes.</Text>
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>81%</Text>
            <Text style={styles.statLabel}>students saving time</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>1.8k</Text>
            <Text style={styles.statLabel}>resources</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Trending now</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={featured}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.trendCard} onPress={() => navigation.navigate('ResourceDetail', { resource: item })}>
            <Text style={styles.trendType}>{item.type ?? 'Resource'}</Text>
            <Text style={styles.trendTitle}>{item.title}</Text>
            <Text style={styles.trendMeta}>{item.institution ?? 'University'}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionTitle}>Recently added</Text>
      {isLoading ? (
        <Text style={styles.empty}>Loading resources...</Text>
      ) : (
        <View style={styles.listWrap}>
          {(resources.length ? resources : mockResources).map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.resourceCard}
              onPress={() => navigation.navigate('ResourceDetail', { resource: item })}
            >
              <Text style={styles.resourceTitle}>{item.title}</Text>
              <Text style={styles.resourceMeta}>{item.course ?? item.institution ?? 'General'} • {item.type ?? 'Resource'}</Text>
              <Text style={styles.resourceMeta}>{item.topic ?? 'Academic material'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  eyebrow: {
    color: '#94A3B8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#1F2937',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeText: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  searchCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 20,
  },
  searchText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  heroCard: {
    backgroundColor: '#171C2D',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2A3552',
    marginBottom: 20,
  },
  heroTag: {
    color: '#A5B4FC',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statChip: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  horizontalList: {
    paddingRight: 12,
    paddingBottom: 8,
  },
  trendCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    width: 220,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  trendType: {
    color: '#A5B4FC',
    fontSize: 11,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  trendTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  trendMeta: {
    color: '#94A3B8',
    fontSize: 12,
  },
  listWrap: {
    marginBottom: 20,
  },
  resourceCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 18,
    marginBottom: 12,
  },
  resourceTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  resourceMeta: {
    color: '#94A3B8',
  },
  empty: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 18,
  },
});
