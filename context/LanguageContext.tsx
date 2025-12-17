import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. SABİT ÇEVİRİLER
const translations = {
  tr: {
    agenda: "Gündem",
    featured: "Öne Çıkanlar",
    seeAll: "Tümünü Gör",
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
    notLoggedIn: "Giriş Yapılmadı",
    login: "Giriş Yap",
    library: "Kütüphane",
    contactGuide: "İletişim & Rehber",
    calendarGeneral: "Genel Takvim",
    calendarMedicine: "Tıp Fakültesi",
    calendarVet: "Veteriner Fakültesi",
    calendarEn: "Academic Calendar (EN)",
    universityName: "ÜNİVERSİTESİ",
    addressTitle: "Adres",
    phoneTitle: "Santral",
    emailTitle: "E-Posta",
    webTitle: "Web Sitesi",
    copyright: "© 2025 Kastamonu Üniversitesi Bilgi İşlem Daire Başkanlığı",
    gallery: "Galeri",
    attendance: "Yoklama",
    joinWithCode: "Kod ile Katıl",
    joinWithQR: "QR ile Katıl",
    attendanceCodeTitle: "Yoklama Kodu",
    attendanceCodeDesc: "Dersi veren öğretim üyesinin paylaştığı yoklama kodunu aşağıya giriniz.",
    codePlaceholder: "Örn: 123456",
    joinButton: "Yoklamaya Katıl",
    codeSuccessMessage: "Kod ile yoklamaya katılındı:",
    cameraPermissionRequest: "Kamera izni isteniyor...",
    noCameraPermission: "Kamera izni yok",
    scanQROverlay: "QR Kodu okutun",
    qrScannedTitle: "QR Kod Okundu!",
    myCourses: "Derslerim",
    courseName: "Ders Adı",
    midterm: "Vize",
    final: "Final",
    average: "Ortalama",
    grade: "Harf",
    status: "Durum",
    passed: "Geçti",
    failed: "Kaldı",
    attendanceOperations: "Yoklama İşlemleri",
    instructorLogin: "Akademisyen Girişi",
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
    notLoggedIn: "Not Logged In",
    login: "Login",
    library: "Library",
    contactGuide: "Contact & Guide",
    calendarGeneral: "General Calendar",
    calendarMedicine: "Faculty of Medicine",
    calendarVet: "Faculty of Veterinary Medicine",
    calendarEn: "Academic Calendar (EN)",
    universityName: "UNIVERSITY",
    addressTitle: "Address",
    phoneTitle: "Switchboard",
    emailTitle: "E-Mail",
    webTitle: "Website",
    copyright: "© 2025 Kastamonu University IT Department",
    gallery: "Gallery",
    attendance: "Attendance",
    joinWithCode: "Join via Code",
    joinWithQR: "Join via QR",
    attendanceCodeTitle: "Attendance Code",
    attendanceCodeDesc: "Enter the attendance code shared by the instructor below.",
    codePlaceholder: "Ex: 123456",
    joinButton: "Join Attendance",
    codeSuccessMessage: "Joined attendance via code:",
    cameraPermissionRequest: "Requesting camera permission...",
    noCameraPermission: "No camera permission",
    scanQROverlay: "Scan QR Code",
    qrScannedTitle: "QR Code Scanned!",
    myCourses: "My Courses",
    courseName: "Course Name",
    midterm: "Midterm",
    final: "Final",
    average: "Average",
    grade: "Letter",
    status: "Status",
    passed: "Passed",
    failed: "Failed",
    attendanceOperations: "Attendance Operations",
    instructorLogin: "Instructor Login",
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