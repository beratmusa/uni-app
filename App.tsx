import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LanguageProvider } from './context/LanguageContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainContent from './MainContent';
import { AgendaListScreen } from './screens/AgendaListScreen';
import { AnnouncementListScreen } from './screens/AnnouncementListScreen'; 
import { EventListScreen } from './screens/EventListScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <LanguageProvider> 
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            
            <Stack.Screen name="Main" component={MainContent} />
            
            <Stack.Screen name="AgendaList" component={AgendaListScreen} />
            
            <Stack.Screen name="AnnouncementList" component={AnnouncementListScreen} />

            <Stack.Screen name="EventList" component={EventListScreen} />
            
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </LanguageProvider>
  );
}
