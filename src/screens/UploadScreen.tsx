import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { apiClient } from '../config/api';

export default function UploadScreen() {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post('/resources', {
        title,
        course,
        topic,
        description,
        type: 'lecture_notes',
      });

      Alert.alert('Upload created', 'Your resource has been posted for moderation.');
      setTitle('');
      setCourse('');
      setTopic('');
      setDescription('');
    } catch (error: any) {
      Alert.alert('Upload failed', error?.response?.data?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload resource</Text>

      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Course" value={course} onChangeText={setCourse} style={styles.input} />
      <TextInput placeholder="Topic" value={topic} onChangeText={setTopic} style={styles.input} />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={5}
        style={[styles.input, styles.textArea]}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleUpload} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? 'Uploading...' : 'Submit resource'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    padding: 20,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#111827',
    color: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
