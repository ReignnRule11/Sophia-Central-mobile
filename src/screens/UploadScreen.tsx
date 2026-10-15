import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import client from '../api/client';

type SelectedFile = {
  uri: string;
  name?: string;
  size?: number;
  mimeType?: string;
};

export default function UploadScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
          'image/png',
          'image/jpeg',
        ],
        copyToCacheDirectory: true,
      });

      if (result.type === 'cancel') {
        return;
      }

      const file = {
        uri: result.uri,
        name: result.name,
        size: result.size,
        mimeType: result.mimeType || 'application/octet-stream',
      };

      setSelectedFile(file);
    } catch (error) {
      Alert.alert('File picker error', 'Unable to choose a file right now.');
      console.log(error);
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please add a title before uploading.');
      return;
    }

    if (!selectedFile) {
      Alert.alert('No file selected', 'Please select a file before uploading.');
      return;
    }

    setUploading(true);

    try {
      const resourcePayload = {
        title,
        description,
        type: 'other',
      };

      const resourceResponse = await client.post('/resources', resourcePayload);
      const resourceId = resourceResponse.data?.id;

      if (!resourceId) {
        throw new Error('Resource creation response did not include an id.');
      }

      const presignResponse = await client.post('/storage/presigned-url', {
        filename: selectedFile.name || 'uploaded-file',
        mimeType: selectedFile.mimeType || 'application/octet-stream',
        size: selectedFile.size || 0,
      });

      const { uploadUrl, fileKey } = presignResponse.data;

      const fileResponse = await fetch(selectedFile.uri);
      const fileBlob = await fileResponse.blob();

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedFile.mimeType || 'application/octet-stream',
        },
        body: fileBlob,
      });

      await client.post('/storage/confirm-upload', {
        fileKey,
        resourceId,
      });

      Alert.alert('Upload successful', 'Your file has been uploaded and linked to the resource.');
      setTitle('');
      setDescription('');
      setSelectedFile(null);
    } catch (error) {
      console.log(error);
      Alert.alert('Upload failed', 'Something went wrong while uploading. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Resource</Text>

      <TextInput
        placeholder="Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="Description"
        style={styles.input}
        value={description}
        multiline
        onChangeText={setDescription}
      />

      <Button title={selectedFile ? `Selected: ${selectedFile.name}` : 'Select File'} onPress={handlePickFile} />

      <View style={{ height: 12 }} />

      <Button
        title={uploading ? 'Uploading...' : 'Upload Resource'}
        onPress={handleUpload}
        disabled={uploading}
      />

      {uploading && <ActivityIndicator style={{ marginTop: 16 }} size="small" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
});
