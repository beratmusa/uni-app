import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, MapPin, QrCode, Keyboard, Calendar, AlertCircle,ListChecks,Settings2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation, useRoute } from '@react-navigation/native';

// API'den dönen veri yapısı
interface InstructorSchedule {
  WeeklyClassScheduleNo: number;
  DayOfWeek: number;
  Scheduledate: string;
  StartHour: string;
  FinishHour: string;
  CourseName: string;
  WorkCenterName: string;
  StudyTypeName: string;
  InstructorName: string;
  CourseCode: string;
  ClassNo: number;
  IsActiveLesson: boolean;
  CourseHours:{ [key: string]: string };
}

// Navigasyon prop'unu güvenli alıyoruz
export const InstructorAttendanceScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const { dictionary } = useLanguage();

  const [activeSchedules, setActiveSchedules] = useState<InstructorSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dil Değişkenleri
  const t = {
    title: "Yoklama Yönetimi",
    startQR: "QR Başlat",
    startCode: "Kod Üret",
    noActiveTitle: "Aktif Ders Yok",
    noActiveDesc: "Şu an yoklama başlatabileceğiniz bir ders saati içerisinde değilsiniz.",
    loading: "Dersler kontrol ediliyor...",
    activeLabel: "YOKLAMA BAŞLATILABİLİR",
    refresh: "Yenile"
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('https://ubys.kastamonu.edu.tr/Framework/Integration/api/IntegratedService/Service', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           serviceName: "GetMyInstructorWeeklyClassSchedulesInfo",
           serviceCriteria: {} 
        })
      });

      const json = await response.json();
      
      if (json.Data && json.Data.Data) {
        // Tüm dersleri al
        const allLessons = json.Data.Data;
        
        // Sadece AKTİF olanları filtrele
        const filteredActive = allLessons.filter((item: InstructorSchedule) => 
            isLessonActive(item.StartHour, item.FinishHour)
        );

        setActiveSchedules(filteredActive);
      } else {
        setActiveSchedules([]);
      }
    } catch (error) {
      console.error("Ders programı hatası:", error);
      Alert.alert("Hata", "Dersler yüklenemedi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- SAAT KONTROLÜ (15 DK KURALI) ---
  const isLessonActive = (startHour: string, finishHour: string) => {
    // const now = new Date(); 
    // Test etmek isterseniz aşağıdaki satırı açıp saati manuel verebilirsiniz:
    const now = new Date("2026-01-07T13:40:00"); 

    const start = new Date(startHour);
    const finish = new Date(finishHour);

    // Başlangıçtan 15 dk önce başlar
    const activeStart = new Date(start.getTime() - 15 * 60000);
    
    // Bitişten 15 dk sonra biter
    const activeEnd = new Date(finish.getTime() + 15 * 60000);

    return now >= activeStart && now <= activeEnd;
  };

  const handleStartQR = (lesson: InstructorSchedule) => {
    Alert.alert("QR Modülü", `${lesson.CourseName} için QR başlatılıyor...`);
    // navigation.navigate('InstructorQR', { lessonData: lesson });
  };

  const handleStartCode = (lesson: InstructorSchedule) => {
    Alert.alert("Kod Modülü", `${lesson.CourseName} için kod üretiliyor...`);
    // navigation.navigate('InstructorCode', { lessonData: lesson });
  };

  // Güvenli Geri Gitme
  const handleGoBack = () => {
    if (navigation?.canGoBack?.()) navigation.goBack();
  };

  const renderActiveCard = ({ item }: { item: InstructorSchedule }) => {
    const startTime = new Date(item.StartHour).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const finishTime = new Date(item.FinishHour).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    return (
        <View className="bg-white mx-5 mb-6 rounded-3xl border-2 border-green-500 shadow-xl overflow-hidden">
            {/* Üst Bilgi Başlığı (Yeşil) */}
            <View className="bg-green-500 p-4 flex-row justify-between items-center">
                <View className="bg-white/20 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold uppercase tracking-wider animate-pulse">
                        {t.activeLabel}
                    </Text>
                </View>
                <View className="bg-white/20 p-1.5 rounded-full">
                     <Clock size={16} color="white" />
                </View>
            </View>
            
            <View className="p-5">
                <Text className="text-2xl font-black text-slate-800 leading-tight mb-1">
                    {item.CourseName}
                </Text>
                <Text className="text-slate-500 font-medium text-sm mb-5">
                    {item.CourseCode} • {item.StudyTypeName}
                </Text>
                
                <View className="flex-row gap-3 mb-6">
                    <View className="flex-row items-center bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                        <Clock size={16} color="#15803d" className="mr-2" />
                        <Text className="text-green-800 font-bold">{startTime} - {finishTime}</Text>
                    </View>
                    <View className="flex-row items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex-1">
                        <MapPin size={16} color="#64748b" className="mr-2" />
                        <Text className="text-slate-600 font-bold text-xs" numberOfLines={1}>
                            {item.WorkCenterName}
                        </Text>
                    </View>
                </View>

                {/* Butonlar */}
                <View className="">
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('AttendanceManager', { 
                            classId: item.ClassNo, 
                            scheduleId: item.Scheduledate,
                            courseName: item.CourseName,
                            courseHours: item.CourseHours // Ders saatlerini (1, 2, 3...) buraya gönderiyoruz
                        })}
                        className="mt-4 bg-blue-600 rounded-xl py-3 flex-row items-center justify-center shadow-sm active:bg-blue-700"
                    >
                        <Settings2 size={18} color="white" /> 
                        <Text className="text-white font-bold ml-2 text-sm">Yoklama Yönet</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      
      {/* HEADER */}
      <View className="px-5 py-4 bg-white flex-row items-center justify-between shadow-sm z-10 border-b border-gray-100">
        <TouchableOpacity 
          onPress={handleGoBack}
          className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100 active:bg-slate-100"
        >
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">{t.title}</Text>
        <View className="w-10" /> 
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
             <ActivityIndicator size="large" color="#2563eb" />
             <Text className="mt-4 text-slate-500 font-medium">{t.loading}</Text>
        </View>
      ) : (
        <FlatList
            data={activeSchedules}
            keyExtractor={(item) => item.WeeklyClassScheduleNo.toString()}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSchedules(); }} />
            }
            renderItem={renderActiveCard}
            contentContainerStyle={{ paddingVertical: 20, flexGrow: 1 }}
            ListEmptyComponent={
                <View className="flex-1 items-center justify-center px-10 -mt-20">
                     <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                        <AlertCircle size={40} color="#94a3b8" />
                     </View>
                     <Text className="text-slate-800 font-bold text-lg text-center mb-2">
                        {t.noActiveTitle}
                     </Text>
                     <Text className="text-slate-400 text-center leading-5">
                        {t.noActiveDesc}
                     </Text>
                     <TouchableOpacity 
                        onPress={() => { setLoading(true); fetchSchedules(); }}
                        className="mt-6 bg-blue-50 px-6 py-3 rounded-full border border-blue-100 active:bg-blue-100"
                     >
                        <Text className="text-blue-600 font-bold">{t.refresh}</Text>
                     </TouchableOpacity>
                </View>
            }
        />
      )}
    </SafeAreaView>
  );
};