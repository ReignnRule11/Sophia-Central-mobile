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

async function uploadBlobWithProgress(uploadUrl: string, blob: any, mimeType: string, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    try {
      xhr.setRequestHeader('Content-Type', mimeType);
    } catch (e) {
      // some presigned URLs do not allow setting content-type header explicitly
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));

    if (xhr.upload && typeof xhr.upload.onprogress !== 'undefined') {
      xhr.upload.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.send(blob);
  });
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export default function UploadScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

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
    setProgress(0);

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
      if (!uploadUrl || !fileKey) throw new Error('Invalid presign response');

      // download file into blob
      const fileResponse = await fetch(selectedFile.uri);
      const fileBlob = await fileResponse.blob();

      // upload with retries and progress
      const MAX_ATTEMPTS = 3;
      let attempt = 0;
      let uploaded = false;

      while (!uploaded && attempt < MAX_ATTEMPTS) {
        attempt += 1;
        try {
          await uploadBlobWithProgress(uploadUrl, fileBlob, selectedFile.mimeType || 'application/octet-stream', (p) => setProgress(p));
          uploaded = true;
        } catch (err) {
          console.log(`Upload attempt ${attempt} failed`, err);
          if (attempt >= MAX_ATTEMPTS) throw err;
          // exponential backoff
          await sleep(500 * Math.pow(2, attempt));
        }
      }

      // confirm upload with backend (with retry)
      const CONFIRM_ATTEMPTS = 3;
      let confirmAttempt = 0;
      let confirmed = false;
      while (!confirmed && confirmAttempt < CONFIRM_ATTEMPTS) {
        confirmAttempt += 1;
        try {
          await client.post('/storage/confirm-upload', { fileKey, resourceId });
          confirmed = true;
        } catch (err) {
          console.log(`Confirm attempt ${confirmAttempt} failed`, err);
          if (confirmAttempt >= CONFIRM_ATTEMPTS) throw err;
          await sleep(500 * Math.pow(2, confirmAttempt));
        }
      }

      Alert.alert('Upload successful', 'Your file has been uploaded and linked to the resource.');
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setProgress(0);
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
        title={uploading ? `Uploading... ${progress}%` : 'Upload Resource'}
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
