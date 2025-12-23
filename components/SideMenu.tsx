import { useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { X, User, BookOpen, Calendar, Phone, LogOut, ChevronRight, ChevronDown, Utensils, ClipboardCheck, QrCode, Keyboard,Briefcase,IdCard,Plus} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';

import { PdfModal } from './PdfModal';
import { AttendanceCodeModal } from './AttendanceCodeModal';

const UBYS_BASE_URL = "https://ubys.kastamonu.edu.tr/Framework/Integration/Authenticater/Login?authToken=";

const PDF_LINKS = {
  GENEL: "https://oidb.kastamonu.edu.tr/images/2025/dokumanlar/Akademik%20Takvim%201.pdf",
  ACADEMİC_Calendar_EN: "https://oidb.kastamonu.edu.tr/images/2025/dokumanlar/Akademik%20Takvim%20Ing%201%201.pdf", 
  TIP: "https://oidb.kastamonu.edu.tr/images/2025/dokumanlar/Akademik%20Takvim%20Tip%20Fakultesi.pdf", 
  VETERINER: "https://oidb.kastamonu.edu.tr/images/2025/dokumanlar/K.U.%20Veteriner%20Fakultesi%202025-2026%20Egitim-Ogretim%20Yili%20Akademik%20Takvimi.pdf"
};

interface SideMenuProps {
  onClose: () => void;
  onScrollToDining: () => void;
  onScrollToContact: () => void; 
}

export const SideMenu = ({ onClose, onScrollToDining, onScrollToContact }: SideMenuProps) => {
  const { language, setLanguage, dictionary } = useLanguage();
  const { token,userInfo,isStudent,isInstructor ,logout } = useAuth();
  const navigation = useNavigation<any>();
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [isAttendanceOpen, setAttendanceOpen] = useState(false);

  const [pdfVisible, setPdfVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");

  // WebView (Modal) State'leri
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [webViewTitle, setWebViewTitle] = useState("");
  const [codeModalVisible, setCodeModalVisible] = useState(false);

  const isBoth = isStudent && isInstructor;
  const isOnlyInstructor = isInstructor && !isStudent;
  const isOnlyStudent = isStudent && !isInstructor;
  if (!isStudent && !isInstructor) return null;

  const t = dictionary.sideMenu || {
    academicTitle: "AKADEMİK İŞLEMLER",
    attendance: "Yoklama ve Dersler",
    joinQr: "QR ile Katıl",
    joinCode: "Kod ile Katıl",
    createCourse: "Ders Aç (Eğitmen)",
    instructorOps: "Yoklama İşlemleri"
  };

  const handleDiningClick = () => {
    onClose(); 
    setTimeout(() => onScrollToDining(), 300);
  };

  const handleContactClick = () => {
    onClose();
    setTimeout(() => onScrollToContact(), 300);
  };

  const handleOpenPdf = (url: string, title: string) => {
    setPdfUrl(url);
    setPdfTitle(title);
    setPdfVisible(true);
  };

  const handleOpenWeb = (url: string, title: string) => {
    setWebViewUrl(url);
    setWebViewTitle(title);
    setWebViewVisible(true);
  };

  const handleUbysClick = () => {
    if (token) {
      const targetUrl = `${UBYS_BASE_URL}${token}`;
      console.log("UBYS Açılıyor:", targetUrl);
      
      handleOpenWeb(targetUrl, dictionary.login);
    } else {
      // 2. Token YOKSA: Önce giriş yapması için Login ekranına gönder
      onClose(); // Menüyü kapat
      navigation.navigate('Login'); // LoginScreen (sorgu.kastamonu.edu.tr) açılır
    }
  };

  const handleQRClick = () => {
    onClose();
    navigation.navigate('QRScanner');
  };

  const handleCodeSubmit = async (code: string) => {
    if (!token) {
      alert("Lütfen önce giriş yapınız.");
      return;
    }

    try {
      console.log("Yoklama gönderiliyor...", code);

      // 2. Sunucuya İstek Atma
      // Gerçek API adresini buraya yazmalısın
      const response = await fetch('https://mobil.kastamonu.edu.tr/api/Yoklama/Katil', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // <-- İŞTE KİMLİĞİN BURADA GİDİYOR
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendanceCode: code // Gönderilen kod
        })
      });

      // 3. Sonucu Kontrol Etme
      if (response.ok) {
        const result = await response.json();
        alert(`✅ Başarılı! ${result.message || "Yoklamaya katıldınız."}`);
        
        setCodeModalVisible(false);
      } else {
        alert("❌ Başarısız: Kod hatalı veya süre dolmuş olabilir.");
      }

    } catch (error) {
      console.error(error);
      alert("Bağlantı hatası oluştu.");
    }
  };

  const handleInstructorAttendance = () => {
      onClose();
      // İleride buraya hoca ekranı navigasyonu gelecek
      alert("Akademisyen yoklama ekranı yakında eklenecek.");
      // navigation.navigate('InstructorAttendance'); 
  };

  return (
    <Animated.View className="absolute inset-0 z-50">
      <Animated.View entering={FadeIn} exiting={FadeOut} className="absolute inset-0 bg-black/60">
        <TouchableOpacity className="w-full h-full" onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <View className="flex-1 flex-row justify-end">
        <Animated.View entering={SlideInRight.duration(300)} exiting={SlideOutRight.duration(300)} className="w-[80%] h-full bg-white shadow-2xl">
          <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
            <View className="flex-1 p-6">
              
              {/* Header */}
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-2xl font-bold text-blue-900">{dictionary.menu}</Text>
                <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                  <X color="#374151" size={24} />
                </TouchableOpacity>
              </View>

              {/* PROFİL KARTI */}
              <View className="flex-row items-center mb-8 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <View className={`w-12 h-12 rounded-full items-center justify-center overflow-hidden border-2 border-white shadow-sm ${token ? (isStudent ? 'bg-blue-600' : 'bg-orange-600') : 'bg-slate-400'}`}>
                    {token && userInfo?.Image ? (
                      <Image 
                        source={{ uri: `data:image/jpeg;base64,${userInfo.Image}` }} 
                        className="w-full h-full" resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-white font-bold text-lg">
                        {token && userInfo?.TitleNameSurname 
                            ? userInfo.TitleNameSurname.charAt(0).toUpperCase() 
                            : (token ? "✓" : <User size={24} color="white" />)
                        }
                      </Text>
                    )}
                </View>
                <View className="ml-3 flex-1">
                    <Text className="font-bold text-gray-900 text-sm" numberOfLines={1}>
                        {token && userInfo ? userInfo.TitleNameSurname : dictionary.guestUser}
                    </Text>
                    <Text className={`text-xs font-medium ${token ? (isStudent ? 'text-blue-600' : 'text-orange-600') : 'text-slate-500'}`}>
                        {token 
                          ? (isStudent ? dictionary.studentLogin : dictionary.instructorLogin) 
                          : dictionary.welcome
                        }
                    </Text>
                </View>
              </View>

              {/* --- DİL SEÇİMİ (SEGMENTED CONTROL) --- */}
              <View className="flex-row bg-slate-100 p-1.5 rounded-2xl mb-8 border border-slate-200">
                
                <TouchableOpacity 
                  onPress={() => setLanguage('tr')}
                  activeOpacity={0.9}
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-xl transition-all ${
                    language === 'tr' 
                      ? 'bg-white shadow-sm border border-slate-100' 
                      : 'bg-transparent'
                  }`}
                >
                  <Text className="text-base mr-2">🇹🇷</Text>
                  <Text className={`text-sm font-extrabold ${
                    language === 'tr' ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    Türkçe
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => setLanguage('en')}
                  activeOpacity={0.9}
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-xl transition-all ${
                    language === 'en' 
                      ? 'bg-white shadow-sm border border-slate-100' 
                      : 'bg-transparent'
                  }`}
                >
                  <Text className="text-base mr-2">🇬🇧</Text>
                  <Text className={`text-sm font-extrabold ${
                    language === 'en' ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    English
                  </Text>
                </TouchableOpacity>

              </View>

              <View className="gap-2">
                {!token && (
                  <TouchableOpacity 
                      onPress={handleUbysClick} 
                      className="flex-row items-center p-4 rounded-xl active:bg-gray-50 border border-transparent active:border-gray-200"
                  >
                    <View className="opacity-60 text-gray-700"><User size={20} /></View>
                    <Text className="ml-3 font-semibold text-gray-700 text-base">{dictionary.login}</Text>
                    <ChevronRight size={16} color="#9ca3af" style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                )}

                {/* --- KİMLİK KARTI BUTONU --- */}
                {token && (
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('StudentID')}
                    className="flex-row items-center p-4 rounded-xl mb-2 active:bg-slate-50"
                  >
                    <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center mr-3">
                      <IdCard size={20} color="#dc2626" />
                    </View>
                    <Text className="text-slate-700 font-bold text-base">
                      {dictionary.myIdCard}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* 3. DERSLERİM BUTONU (Sadece Öğrenciler ve Hem Hoca Hem Öğrenciler Görür) */}
                {token && isStudent && (
                  <TouchableOpacity 
                      onPress={() => { onClose(); navigation.navigate('CourseList'); }} 
                      className="flex-row items-center p-4 rounded-xl active:bg-blue-50 border border-transparent active:border-blue-100"
                  >
                    <View className="opacity-60 text-gray-700"><BookOpen size={20} /></View>
                    <Text className="ml-3 font-semibold text-gray-700 text-base">{dictionary.myCourses}</Text>
                  </TouchableOpacity>
                )}

                {/* 4. YOKLAMA VE İŞLEMLER (LOGIC BURADA) */}
                {token && (
                  <View>
                    {/* DURUM A: ÖĞRENCİ VEYA HEM ÖĞRENCİ HEM HOCA (Dropdown Menü) */}
                    {isStudent ? (
                      <View>
                        <TouchableOpacity 
                          onPress={() => setAttendanceOpen(!isAttendanceOpen)} 
                          className={`flex-row items-center p-4 rounded-xl border border-transparent transition-all ${isAttendanceOpen ? "bg-blue-50 border-blue-100" : "active:bg-gray-50"}`}
                        >
                          <View className={`${isAttendanceOpen ? "opacity-100 text-blue-600" : "opacity-60 text-gray-700"}`}>
                              <ClipboardCheck size={20} color={isAttendanceOpen ? "#2563eb" : "#374151"} />
                          </View>
                          <Text className={`ml-3 font-semibold text-base ${isAttendanceOpen ? "text-blue-700" : "text-gray-700"}`}>
                              {dictionary.attendance}
                          </Text>
                          {isAttendanceOpen ? <ChevronDown size={16} color="#2563eb" style={{ marginLeft: 'auto' }} /> : <ChevronRight size={16} color="#9ca3af" style={{ marginLeft: 'auto' }} />}
                        </TouchableOpacity>

                        {/* Açılır Menü İçeriği */}
                        {isAttendanceOpen && (
                          <View className="ml-4 pl-4 border-l-2 border-blue-100 mt-1 gap-1">
                            
                            {/* Herkes İçin: Kod ile Katıl */}
                            <TouchableOpacity onPress={() => setCodeModalVisible(true)} className="flex-row items-center p-3 rounded-lg active:bg-blue-50">
                              <Keyboard size={16} color="#64748b" className="mr-3" />
                              <Text className="text-gray-600 font-medium text-sm">{dictionary.joinWithCode}</Text>
                              <ChevronRight size={12} color="#9ca3af" style={{ marginLeft: 'auto', opacity: 0.5 }} />
                            </TouchableOpacity>

                            {/* Herkes İçin: QR ile Katıl */}
                            <TouchableOpacity onPress={handleQRClick} className="flex-row items-center p-3 rounded-lg active:bg-blue-50">
                              <QrCode size={16} color="#64748b" className="mr-3" />
                              <Text className="text-gray-600 font-medium text-sm">{dictionary.joinWithQR}</Text>
                              <ChevronRight size={12} color="#9ca3af" style={{ marginLeft: 'auto', opacity: 0.5 }} />
                            </TouchableOpacity>

                            {/* EKSTRA: Eğer Hem Öğrenci Hem Hocaysa "Ders Aç" Butonu Görünür */}
                            {isInstructor && (
                                <TouchableOpacity 
                                    onPress={() => { onClose(); navigation.navigate('CreateCourseScreen'); }} 
                                    className="flex-row items-center p-3 rounded-lg active:bg-red-50 mt-1"
                                >
                                    <View className="bg-red-100 p-1 rounded mr-3">
                                        <Plus size={14} color="#dc2626" />
                                    </View>
                                    <Text className="text-red-600 font-bold text-sm">
                                        {t.createCourse || "Ders Aç (Eğitmen)"}
                                    </Text>
                                    <ChevronRight size={12} color="#dc2626" style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </TouchableOpacity>
                            )}

                          </View>
                        )}
                      </View>
                    ) : (
                      // DURUM B: SADECE HOCA (Tek Buton)
                      <TouchableOpacity 
                          onPress={handleInstructorAttendance}
                          className="flex-row items-center p-4 rounded-xl active:bg-orange-50 border border-transparent active:border-orange-100"
                      >
                        <View className="opacity-60 text-gray-700"><Briefcase size={20} /></View>
                        <Text className="ml-3 font-semibold text-gray-700 text-base">
                            {t.instructorOps || "Yoklama İşlemleri"}
                        </Text>
                        <ChevronRight size={16} color="#9ca3af" style={{ marginLeft: 'auto' }} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                
                {/* 2. YEMEK LİSTESİ */}
                <TouchableOpacity onPress={handleDiningClick} className="flex-row items-center p-4 rounded-xl active:bg-blue-50 border border-transparent active:border-blue-100">
                    <View className="opacity-60 text-gray-700"><Utensils size={20} /></View>
                    <Text className="ml-3 font-semibold text-gray-700 text-base">{dictionary.dining}</Text>
                </TouchableOpacity>

                
                {/* 4. AKADEMİK TAKVİM */}
                <View>
                  <TouchableOpacity onPress={() => setCalendarOpen(!isCalendarOpen)} className={`flex-row items-center p-4 rounded-xl border border-transparent transition-all ${isCalendarOpen ? "bg-blue-50 border-blue-100" : "active:bg-gray-50"}`}>
                    <View className={`${isCalendarOpen ? "opacity-100 text-blue-600" : "opacity-60 text-gray-700"}`}><Calendar size={20} color={isCalendarOpen ? "#2563eb" : "#374151"} /></View>
                    <Text className={`ml-3 font-semibold text-base ${isCalendarOpen ? "text-blue-700" : "text-gray-700"}`}>{dictionary.academicCalendar}</Text>
                    {isCalendarOpen ? <ChevronDown size={16} color="#2563eb" style={{ marginLeft: 'auto' }} /> : <ChevronRight size={16} color="#9ca3af" style={{ marginLeft: 'auto' }} />}
                  </TouchableOpacity>

                  {/* ALT MENÜLER */}
                  {isCalendarOpen && (
                    <View className="ml-4 pl-4 border-l-2 border-blue-100 mt-1 gap-1">
                      <SubMenuLink 
                        title={dictionary.calendarGeneral}
                        onPress={() => handleOpenPdf(PDF_LINKS.GENEL, dictionary.calendarGeneral)} 
                      />
                      <SubMenuLink 
                        title={dictionary.calendarEn} 
                        onPress={() => handleOpenPdf(PDF_LINKS.ACADEMİC_Calendar_EN, "Academic Calendar")} 
                      />
                      <SubMenuLink 
                        title={dictionary.calendarMedicine} 
                        onPress={() => handleOpenPdf(PDF_LINKS.TIP, dictionary.calendarMedicine)} 
                      />
                      <SubMenuLink 
                        title={dictionary.calendarVet}
                        onPress={() => handleOpenPdf(PDF_LINKS.VETERINER, dictionary.calendarVet)} 
                      />
                    </View>
                  )}
                </View>

                {/* 5. İLETİŞİM */}
                <TouchableOpacity onPress={handleContactClick} className="flex-row items-center p-4 rounded-xl active:bg-gray-50 border border-transparent active:border-gray-200">
                    <View className="opacity-60 text-gray-700"><Phone size={20} /></View>
                    <Text className="ml-3 font-semibold text-gray-700 text-base">{dictionary.contactGuide}</Text>
                </TouchableOpacity>

              </View>

              {token && (
                <View className="mt-auto border-t border-gray-100 pt-6 pb-6">
                    <TouchableOpacity 
                        onPress={() => { 
                            logout(); 
                            onClose(); 
                        }} 
                        className="flex-row items-center p-3 rounded-xl bg-red-50"
                    >
                        <LogOut size={20} color="#dc2626" />
                        <Text className="ml-3 font-bold text-red-600">{dictionary.logout}</Text>
                    </TouchableOpacity>
                        <Text className="text-center text-xs text-gray-400 mt-4">v1.0.0 - Kampüs App</Text>
                </View>
              )}

            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
      <PdfModal 
        visible={pdfVisible}
        url={pdfUrl}
        title={pdfTitle}
        onClose={() => setPdfVisible(false)}
      />
      <AttendanceCodeModal 
        visible={codeModalVisible}
        onClose={() => setCodeModalVisible(false)}
        onSubmit={handleCodeSubmit}
      />
    </Animated.View>
  );
};

const MenuLink = ({ icon, title }: { icon: any, title: string }) => (
  <TouchableOpacity className="flex-row items-center p-4 rounded-xl active:bg-gray-50 border border-transparent active:border-gray-200">
    <View className="opacity-60 text-gray-700">{icon}</View>
    <Text className="ml-3 font-semibold text-gray-700 text-base">{title}</Text>
    <ChevronRight size={16} color="#9ca3af" style={{ marginLeft: 'auto' }} />
  </TouchableOpacity>
);

const SubMenuLink = ({ title, onPress }: { title: string, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center p-3 rounded-lg active:bg-blue-50">
    <View className="w-1.5 h-1.5 rounded-full bg-blue-300 mr-3" />
    <Text className="text-gray-600 font-medium text-sm">{title}</Text>
    <ChevronRight size={12} color="#9ca3af" style={{ marginLeft: 'auto', opacity: 0.5 }} />
  </TouchableOpacity>
);