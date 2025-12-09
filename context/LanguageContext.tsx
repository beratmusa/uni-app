import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. SABİT ÇEVİRİLER
const translations = {
  tr: {
    agenda: "Gündem",
    featured: "Öne Çıkanlar",
    seeAll: "Tümü",
    announcements: "Duyurular",
    events: "Etkinlik Takvimi",
    campusLife: "Kampüste Hayat",
    dining: "Günün Menüsü",
    bonAppetit: "Afiyet Olsun",
    menu: "Menü",
    studentLogin: "Öğrenci Girişi",
    academicCalendar: "Akademik Takvim",
    contact: "İletişim",
    logout: "Çıkış Yap",
    readMore: "Devamını Oku",
    details: "Detaylar",
    categories: {
      all: "Tümü",
      student: "Öğrenci",
      academic: "Akademik",
      admin: "İdari",
      general: "Genel"
    }
  },
  en: {
    agenda: "Agenda",
    featured: "Featured",
    seeAll: "See All",
    announcements: "Announcements",
    events: "Event Calendar",
    campusLife: "Campus Life",
    dining: "Daily Menu",
    bonAppetit: "Bon Appétit",
    menu: "Menu",
    studentLogin: "Student Login",
    academicCalendar: "Academic Calendar",
    contact: "Contact",
    logout: "Log Out",
    readMore: "Read More",
    details: "Details",
    categories: {
      all: "All",
      student: "Student",
      academic: "Academic",
      admin: "Admin",
      general: "General"
    }
  }
};

type Language = 'tr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['tr']) => any; 
  dictionary: typeof translations['tr'];
}
// ---------------------------

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLangState] = useState<Language>('tr');

  useEffect(() => {
    AsyncStorage.getItem('appLanguage').then((savedLang) => {
      if (savedLang === 'tr' || savedLang === 'en') {
        setLangState(savedLang);
      }
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    setLangState(lang);
    await AsyncStorage.setItem('appLanguage', lang);
  };

  const dictionary = translations[language];
  const t = (key: keyof typeof translations['tr']) => dictionary[key];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dictionary }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};