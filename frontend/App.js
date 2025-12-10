import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import WorkoutsScreen from './src/screens/WorkoutsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChatScreen from './src/screens/ChatScreen';
import AddMealScreen from './src/screens/AddMealScreen';
import WorkoutBuilderScreen from './src/screens/WorkoutBuilderScreen';
import ExerciseLibraryScreen from './src/screens/ExerciseLibraryScreen';
import LandingScreen from './src/screens/LandingScreen';
import AboutScreen from './src/screens/AboutScreen';
import FeaturesScreen from './src/screens/FeaturesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
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
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
          }}
        >
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
            name="Workouts" 
            component={WorkoutsScreen}
            options={{ headerShown: true, title: 'Тренировки' }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ headerShown: true, title: 'Профиль' }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ headerShown: true, title: 'AI-ассистент' }}
          />
          <Stack.Screen 
            name="AddMeal" 
            component={AddMealScreen}
            options={{ headerShown: true, title: 'Добавить приём пищи' }}
          />
          <Stack.Screen 
            name="WorkoutBuilder" 
            component={WorkoutBuilderScreen}
            options={{ headerShown: true, title: 'Конструктор тренировки' }}
          />
          <Stack.Screen 
            name="ExerciseLibrary" 
            component={ExerciseLibraryScreen}
            options={{ headerShown: true, title: 'Библиотека упражнений' }}
          />
          <Stack.Screen 
            name="Landing" 
            component={LandingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="About" 
            component={AboutScreen}
            options={{ headerShown: true, title: 'О проекте' }}
          />
          <Stack.Screen 
            name="Features" 
            component={FeaturesScreen}
            options={{ headerShown: true, title: 'Возможности' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
