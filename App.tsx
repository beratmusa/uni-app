import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LanguageProvider, useLanguage } from './context/LanguageContext'; 
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainContent from './MainContent';
import { AgendaListScreen } from './screens/AgendaListScreen';
import { AnnouncementListScreen } from './screens/AnnouncementListScreen';
import { EventListScreen } from './screens/EventListScreen';
import { AuthProvider } from './context/AuthContext'; 
import { LoginScreen } from './screens/LoginScreen';
import { QRScannerScreen } from './screens/QRScannerScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { language } = useLanguage();

  return (
    <NavigationContainer key={language}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        <Stack.Screen name="Main" component={MainContent} />

        <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal' }} />

        <Stack.Screen 
          name="AgendaList" 
          component={AgendaListScreen} 
          options={{ animation: 'slide_from_right' }} 
        />
        <Stack.Screen 
          name="AnnouncementList" 
          component={AnnouncementListScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen 
          name="EventList" 
          component={EventListScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen 
          name="QRScanner" 
          component={QRScannerScreen} 
          options={{ headerShown: false, presentation: 'modal' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <LanguageProvider> 
      <AuthProvider>
      <SafeAreaProvider>
         <AppNavigator />
      </SafeAreaProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}