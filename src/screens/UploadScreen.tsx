import React, { useState } from 'react';
import { View, Text, Button, TextInput } from 'react-native';

export default function UploadScreen() {
  const [title, setTitle] = useState('');
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Upload (placeholder)</Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={{ borderWidth:1, padding:8, marginVertical:8 }} />
      <Button title="Pick file & upload (use local client for full flows)" onPress={() => alert('Use full client locally')} />
    </View>
  );
}
