import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Platform } from 'react-native';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import WorkoutsScreen from './src/screens/WorkoutsScreen';
import ExerciseLibraryScreen from './src/screens/ExerciseLibraryScreen';
import WorkoutBuilderScreen from './src/screens/WorkoutBuilderScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AddMealScreen from './src/screens/AddMealScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import ChatScreen from './src/screens/ChatScreen';
import WorkoutDetailsScreen from './src/screens/WorkoutDetailsScreen';
import LandingScreen from './src/screens/LandingScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  const theme = {
    ...MD3DarkTheme,
    roundness: 12,
    colors: {
      ...MD3DarkTheme.colors,
      primary: '#4F46E5',
      secondary: '#A5B4FC',
      background: '#0B1220',
      surface: '#0F172A',
      onSurface: '#E5E7EB',
      outline: 'rgba(148,163,184,0.25)',
      outlineVariant: 'rgba(148,163,184,0.35)'
    },
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (Platform.OS === 'web') {
        setInitialRoute('Landing');
        return;
      }
      const token = await AsyncStorage.getItem('token');
      setInitialRoute(token ? 'Home' : 'Login');
    } catch (error) {
      setInitialRoute('Login');
    }
  };

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen 
              name="Landing" 
              component={LandingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Onboarding" 
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Nutrition" 
              component={NutritionScreen}
              options={{ headerShown: true, title: 'Питание' }}
            />
            <Stack.Screen 
              name="AddMeal" 
              component={AddMealScreen}
              options={{ headerShown: true, title: 'Добавление приёма пищи' }}
            />
            <Stack.Screen 
              name="Scanner" 
              component={ScannerScreen}
              options={{ headerShown: true, title: 'Сканер штрих‑кодов' }}
            />
            <Stack.Screen 
              name="AI" 
              component={ChatScreen}
              options={{ headerShown: true, title: 'AI‑ассистент' }}
            />
            <Stack.Screen 
              name="Workouts" 
              component={WorkoutsScreen}
              options={{ headerShown: true, title: 'Тренировки' }}
            />
            <Stack.Screen 
              name="WorkoutBuilder" 
              component={WorkoutBuilderScreen}
              options={{ headerShown: true, title: 'Конструктор тренировки' }}
            />
            <Stack.Screen 
              name="ExerciseLibrary" 
              component={ExerciseLibraryScreen}
              options={{ headerShown: true, title: 'Упражнения' }}
            />
            <Stack.Screen 
              name="WorkoutDetails" 
              component={WorkoutDetailsScreen}
              options={{ headerShown: true, title: 'Детали тренировки' }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ headerShown: true, title: 'Профиль' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
