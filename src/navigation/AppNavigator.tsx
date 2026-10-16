import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ResourceDetailScreen from '../screens/ResourceDetailScreen';
import UploadScreen from '../screens/UploadScreen';
import PointsScreen from '../screens/PointsScreen';
import AIChatScreen from '../screens/AIChatScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ResourceDetail" component={ResourceDetailScreen} />
          <Stack.Screen name="Upload" component={UploadScreen} />
          <Stack.Screen name="Points" component={PointsScreen} />
          <Stack.Screen name="AIChat" component={AIChatScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
