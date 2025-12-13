import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import WorkoutsScreen from './src/screens/WorkoutsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChatScreen from './src/screens/ChatScreen';
import AddMealScreen from './src/screens/AddMealScreen';
import WorkoutBuilderScreen from './src/screens/WorkoutBuilderScreen';
import WorkoutDetailsScreen from './src/screens/WorkoutDetailsScreen';
import ExerciseLibraryScreen from './src/screens/ExerciseLibraryScreen';
import LandingScreen from './src/screens/LandingScreen';
import AboutScreen from './src/screens/AboutScreen';
import FeaturesScreen from './src/screens/FeaturesScreen';
import ProgramsScreen from './src/screens/ProgramsScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import ProgramDetailScreen from './src/screens/ProgramDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Landing"
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
            name="WorkoutDetails" 
            component={WorkoutDetailsScreen}
            options={{ headerShown: true, title: 'Детали тренировки' }}
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
          <Stack.Screen 
            name="Programs" 
            component={ProgramsScreen}
            options={{ headerShown: true, title: 'Программы' }}
          />
          <Stack.Screen 
            name="Recipes" 
            component={RecipesScreen}
            options={{ headerShown: true, title: 'Рецепты' }}
          />
          <Stack.Screen 
            name="ProgramDetail" 
            component={ProgramDetailScreen}
            options={{ headerShown: true, title: 'Программа' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
