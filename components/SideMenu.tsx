import { useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { X, User, BookOpen, Calendar, Phone, LogOut, ChevronRight, ChevronDown, Utensils, ClipboardCheck, QrCode, Keyboard,Briefcase,IdCard,Plus,GraduationCap,FileText} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';
import { CustomAlert } from './CustomAlert';

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
  const [isCourseOpsOpen, setCourseOpsOpen] = useState(false);

  const [pdfVisible, setPdfVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // WebView (Modal) State'leri
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [webViewTitle, setWebViewTitle] = useState("");
  const [codeModalVisible, setCodeModalVisible] = useState(false);

  const isBoth = isStudent && isInstructor;
  const isOnlyInstructor = isInstructor && !isStudent;
  const isOnlyStudent = isStudent && !isInstructor;

  const t = dictionary.sideMenu || {
    academicTitle: "AKADEMİK İŞLEMLER",
    attendance: "Yoklama ve Dersler",
    joinQr: "QR ile Katıl",
    joinCode: "Kod ile Katıl",
    createCourse: "Ders Aç (Eğitmen)",
    instructorOps: "Yoklama İşlemleri",
    successTitle: "Başarılı",
    errorTitle: "Hata",
    sessionExpired: "Oturum süreniz dolmuş.",
    serverError: "Sunucu hatası.",
    successMessage: "Yoklamaya katıldınız!",
    invalidCode: "Geçersiz kod veya süresi dolmuş.",
    ok: "Tamam",
    retry: "Tekrar Dene",
    exit: "Çık",
    courseOperations: "Ders İşlemleri",
    myCourses: "Derslerim",
    schedule: "Ders Programı",
    absenteeism: "Devamsızlık Bilgisi"
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
      onClose();
      navigation.navigate('Login');
    }
  };

  const handleQRClick = () => {
    onClose();
    navigation.navigate('QRScanner');
  };

  const fetchMyStudentId = async (): Promise<number | null> => {
    try {
        const response = await fetch('https://mobil.kastamonu.edu.tr/api/Student/GetMyStudentInfo', {
            method: 'GET', 
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: '' 
        });

        if (!response.ok) return null;

        const json = await response.json();
        
        // Dizi kontrolü ve ilk elemanı alma
        const dataList = Array.isArray(json) ? json : (json.Data || []);

        if (Array.isArray(dataList) && dataList.length > 0) {
            return dataList[0].StudentId;
        }

        return null;
    } catch (e) {
        console.error("Öğrenci bilgisi hatası:", e);
        return null;
    }
  };


  const handleCodeSubmit = async (code: string) => {
    if (!token) {
      showAlert('error', t.errorTitle, t.sessionExpired);
      return;
    }

    try {
      const currentStudentId = await fetchMyStudentId();
      if (!currentStudentId) {
         showAlert('error', t.errorTitle, "Öğrenci kimliği alınamadı. Lütfen tekrar giriş yapın.");
         return;
      }

      const response = await fetch('https://ubys.kastamonu.edu.tr/Framework/Integration/api/IntegratedService/Service', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: "RecordStudentAttendanceWithVerificationCode",
          serviceCriteria: {
            VerificationCode: code,           
            studentId: currentStudentId,
            IsAttended: "true"                
          }
        })
      });

      const json = await response.json();

      if (json.Data && json.Data.IsSuccessful) {
        setCodeModalVisible(false);
        showAlert(
            'success', 
            t.successTitle, 
            json.Data.Message || t.successMessage || "Yoklamaya katıldınız!"
        );
      } else {
        const errorMsg = json.Data?.ExceptionMessage || json.Data?.Message || t.invalidCode;
        showAlert('error', t.errorTitle, errorMsg);
      }

    } 
    catch (error) {
      console.error(error);
      showAlert('error', t.errorTitle, t.serverError);
    }
  };



  const showAlert = (type: 'success' | 'error', title: string, message: string) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })) // Sadece kapatır
    });
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
                    onPress={() => navigation.navigate('DigitalID')}
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

               {/* --- DERS İŞLEMLERİ (Dropdown Menü) --- */}
                {token && isStudent && (
                  <View>
                    <TouchableOpacity 
                      onPress={() => setCourseOpsOpen(!isCourseOpsOpen)} 
                      className={`flex-row items-center p-4 rounded-xl border border-transparent transition-all ${isCourseOpsOpen ? "bg-blue-50 border-blue-100" : "active:bg-gray-50"}`}
                    >
                      <View className={`${isCourseOpsOpen ? "opacity-100 text-blue-600" : "opacity-60 text-gray-700"}`}>
                          {/* GraduationCap ikonu yoksa BookOpen da kullanabilirsiniz */}
                          <GraduationCap size={20} color={isCourseOpsOpen ? "#2563eb" : "#374151"} />
                      </View>
                      <Text className={`ml-3 font-semibold text-base ${isCourseOpsOpen ? "text-blue-700" : "text-gray-700"}`}>
                          {t.courseOperations || "Ders İşlemleri"}
                      </Text>
                      {isCourseOpsOpen ? <ChevronDown size={16} color="#2563eb" style={{ marginLeft: 'auto' }} /> : <ChevronRight size={16} color="#9ca3af" style={{ marginLeft: 'auto' }} />}
                    </TouchableOpacity>

                    {/* --- ALT MENÜLER --- */}
                    {isCourseOpsOpen && (
                      <View className="ml-4 pl-4 border-l-2 border-blue-100 mt-1 gap-1">
                        
                        {/* 1. Derslerim */}
                        <TouchableOpacity 
                            onPress={() => { onClose(); navigation.navigate('CourseList'); }} 
                            className="flex-row items-center p-3 rounded-lg active:bg-blue-50"
                        >
                          <BookOpen size={16} color="#64748b" />
                          <Text className="text-gray-600 font-medium text-sm ml-2">
                              {dictionary.myCourses || "Derslerim"}
                          </Text>      
                        </TouchableOpacity>

                        {/* 2. Ders Programı */}
                        <TouchableOpacity 
                            onPress={() => { onClose(); navigation.navigate('CourseSchedule'); }} 
                            className="flex-row items-center p-3 rounded-lg active:bg-blue-50"
                        >
                          <Calendar size={16} color="#64748b" />
                          <Text className="text-gray-600 font-medium text-sm ml-2">
                              {t.schedule || "Ders Programı"}
                          </Text>                              
                        </TouchableOpacity>

                        {/* 3. Devamsızlık Bilgisi */}
                        <TouchableOpacity 
                            onPress={() => { 
                                onClose(); 
                                navigation.navigate('Absenteeism'); 
                            }} 
                            className="flex-row items-center p-3 rounded-lg active:bg-blue-50"
                        >
                          <FileText size={16} color="#64748b" />
                          <Text className="text-gray-600 font-medium text-sm ml-2">
                              {t.absenteeism || "Devamsızlık Bilgisi"}
                          </Text>                              
                        </TouchableOpacity>

                      </View>
                    )}
                  </View>
                )}

                {/*  YOKLAMA VE İŞLEMLER (LOGIC BURADA) */}
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
                              <Keyboard size={16} color="#64748b" />
                              <Text className="text-gray-600 font-medium text-sm ml-2">{dictionary.joinWithCode}</Text>      
                            </TouchableOpacity>

                            {/* Herkes İçin: QR ile Katıl */}
                            <TouchableOpacity onPress={handleQRClick} className="flex-row items-center p-3 rounded-lg active:bg-blue-50">
                              <QrCode size={16} color="#64748b" />
                              <Text className="text-gray-600 font-medium text-sm ml-2">{dictionary.joinWithQR}</Text>                              
                            </TouchableOpacity>

                            {/* EKSTRA: Eğer Hem Öğrenci Hem Hocaysa "Ders Aç" Butonu Görünür */}
                            {isInstructor && (
                                <TouchableOpacity 
                                    onPress={() => { onClose(); navigation.navigate('InstructorAttendance'); }} 
                                    className="flex-row items-center p-3 rounded-lg active:bg-red-50 mt-1"
                                >
                                    <View className="bg-red-100 p-1 rounded mr-3">
                                        <Plus size={14} color="#dc2626" />
                                    </View>
                                    <Text className="text-red-600 font-bold text-sm">
                                        {t.createCourse || "Ders Aç (Eğitmen)"}
                                    </Text>                                    
                                </TouchableOpacity>
                            )}

                          </View>
                        )}
                      </View>
                    ) : (
                      // DURUM B: SADECE HOCA (Tek Buton)
                      <TouchableOpacity 
                          onPress={() => {
                              onClose();
                              navigation.navigate('InstructorAttendance');
                          }}
                          className="flex-row items-center p-4 rounded-xl active:bg-orange-50 border border-transparent active:border-orange-100"
                      >
                        <View className="opacity-60 text-gray-700"><Briefcase size={20} /></View>
                        <Text className="ml-3 font-semibold text-gray-700 text-base">
                            {t.instructorOps || "Yoklama İşlemleri"}
                        </Text>                        
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                
                
                {/*  AKADEMİK TAKVİM */}
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

                {/*  YEMEK LİSTESİ */}
                <TouchableOpacity onPress={handleDiningClick} className="flex-row items-center p-4 rounded-xl active:bg-blue-50 border border-transparent active:border-blue-100">
                    <View className="opacity-60 text-gray-700"><Utensils size={20} /></View>
                    <Text className="ml-3 font-semibold text-gray-700 text-base">{dictionary.dining}</Text>
                </TouchableOpacity>

                {/*  İLETİŞİM */}
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
      <CustomAlert 
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        confirmText={t.ok || "Tamam"}
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