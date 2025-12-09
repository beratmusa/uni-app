// App.tsx içine import et:
import { LanguageProvider } from './context/LanguageContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainContent from './MainContent';


export default function App() {

  return (
    <LanguageProvider> 
      <SafeAreaProvider>
         <MainContent /> 
      </SafeAreaProvider>
    </LanguageProvider>
  );
}