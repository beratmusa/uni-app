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

// ÖNEMLİ NOT:
// App bileşeni içinde "useLanguage" kullanamazsın çünkü Provider'ın içindeki çocuklar kullanabilir.
// Bu yüzden App.tsx'teki tüm kodunu "MainContent" adında yeni bir bileşene taşıyıp,
// App fonksiyonunu sadece Provider olarak kullanmak en temizidir.
// Veya şimdilik sadece bileşenleri güncelleyelim, App.tsx'i en son hallederiz.