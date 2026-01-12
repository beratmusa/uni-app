import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
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
import { CourseListScreen } from './screens/CourseListScreen';
import { StudentIDScreen } from './screens/StudentIDScreen';
import { useDailyNotification } from './hooks/useDailyNotification';
import { CourseScheduleScreen } from './screens/CourseScheduleScreen';
import { AbsenteeismScreen } from './screens/AbsenteeismScreen';
import { InstructorAttendanceScreen } from './screens/InstructorAttendanceScreen';
import { AttendanceManagerScreen } from './screens/AttendanceManagerScreen';

const Stack = createNativeStackNavigator();
// Bu ayar katı modu kapatır ve gereksiz uyarıyı engeller
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, 
});

const AppNavigator = () => {
  const { language } = useLanguage();
  useDailyNotification();

  

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
        <Stack.Screen 
          name="CourseList" 
          component={CourseListScreen} 
          options={{ animation: 'slide_from_right' }} 
        />

        <Stack.Screen 
          name="StudentID" 
          component={StudentIDScreen} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="CourseSchedule" 
          component={CourseScheduleScreen} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="Absenteeism" 
          component={AbsenteeismScreen} 
          options={{ headerShown: false, animation: 'slide_from_right' }} 
        />

        <Stack.Screen 
          name="InstructorAttendance" 
          component={InstructorAttendanceScreen} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="AttendanceManager" 
          component={AttendanceManagerScreen} 
          options={{ headerShown: false }} 
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