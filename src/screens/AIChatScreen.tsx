import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function AIChatScreen() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', from: 'bot', text: 'Ask me a question about your course materials.' },
  ]);

  const handleSend = () => {
    if (!question.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), from: 'user', text: question },
      { id: String(Date.now() + 1), from: 'bot', text: `AI response for: ${question}` },
    ]);
    setQuestion('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Study Assistant</Text>

      <ScrollView style={styles.chatBox} contentContainerStyle={{ padding: 12 }}>
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.message, msg.from === 'user' ? styles.userMessage : styles.botMessage]}>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask about notes, quizzes, or concepts"
          style={styles.input}
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 16,
  },
  chatBox: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  message: {
    maxWidth: '80%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: '#7C3AED',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#1F2937',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#F8FAFC',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#111827',
    color: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  sendButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 10,
  },
  sendText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
