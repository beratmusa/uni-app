import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Clock, User, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// API'den gelen verinin tipi
interface Lesson {
  LessonCode: string;
  LessonName: string;
  StartTime: string;
  EndTime: string;
  Day: number; // 1 = Pazartesi, 2 = Salı...
  TeacherName: string;
  TeacherTitle: string;
  ClassName: string;
  ClassLocation: string;
}

export const CourseScheduleScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const { dictionary } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState<Lesson[]>([]);
  // Başlangıçta 1. gün (Pazartesi) seçili olsun
  const [selectedDay, setSelectedDay] = useState(1); 

  const t = dictionary.courseSchedule || {
    title: "Ders Programı",
    days: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
    noLesson: "Bu gün için ders bulunmamaktadır.",
    loading: "Yükleniyor...",
    error: "Hata oluştu",
    classroom: "Derslik",
    lecturer: "Öğretim Elemanı"
  };

  const weekDays = t.days.slice(0, 5);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await fetch('https://ubys.kastamonu.edu.tr/Framework/Integration/api/IntegratedService/Service', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           serviceName: "GetStudentLessonProgram",
           serviceCriteria: {} 
        })
      });

      const json = await response.json();
      

      if (json.Data && json.Data.Data) {
        setScheduleData(json.Data.Data);
      }
    } catch (error) {
      console.error("Ders programı hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = scheduleData
    .filter(lesson => lesson.Day === selectedDay)
    .sort((a, b) => a.StartTime.localeCompare(b.StartTime));

  const renderHeader = () => (
    <View className="px-4 py-3 bg-white flex-row items-center justify-between shadow-sm z-10">
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100 active:bg-slate-100"
      >
        <ArrowLeft size={20} color="#334155" />
      </TouchableOpacity>
      <Text className="text-lg font-bold text-slate-800">{t.title}</Text>
      <View className="w-10" /> 
    </View>
  );

  const renderDayTabs = () => (
    <View className="bg-white pb-2 shadow-sm">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 py-2">
        {weekDays.map((dayName: string, index: number) => {
          const dayNumber = index + 1; // 1-Based index
          const isSelected = selectedDay === dayNumber;
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedDay(dayNumber)}
              className={`mr-3 px-5 py-2 rounded-full border ${
                isSelected 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                {dayName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderLessonCard = ({ item }: { item: Lesson }) => {
    
    let roomLabel = item.ClassName; 
    let roomNumber = "";

    const lastSpaceIndex = item.ClassName.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
        roomLabel = item.ClassName.substring(0, lastSpaceIndex);
        roomNumber = item.ClassName.substring(lastSpaceIndex + 1);
    }

    return (
      <View className="bg-white mx-4 mb-4 rounded-xl shadow-md border border-slate-200 flex-row overflow-hidden min-h-[100px]">
        
        <View className="w-20 bg-blue-600 flex-col items-center justify-between py-6 px-1">
            {/* Başlangıç Saati */}
            <View>
              <Text className="text-white font-bold text-sm text-center">
                {item.StartTime}
              </Text>
            </View>
            <View className="h-3 w-[2px] bg-blue-300 my-0.5 rounded-full" />
            {/* Bitiş Saati */}
            <View>
              <Text className="text-white font-bold text-sm text-center">
                {item.EndTime}
              </Text>
            </View>
        </View>

        {/* 2. İÇERİK KISMI */}
        <View className="flex-1 flex-row">
            
            {/* ORTA: DERS ADI ve HOCA */}
            <View className="flex-1 justify-center pl-4 pr-2 py-6">
                <Text className="text-slate-800 font-bold text-lg mb-2 leading-6">
                    {item.LessonName}
                </Text>
                
                <View className="flex-row items-center mt-auto">
                    <User size={14} color="#64748b" className="mr-1.5" />
                    <Text className="text-slate-500 text-xs font-medium" numberOfLines={1}>
                        {item.TeacherTitle} {item.TeacherName}
                    </Text>
                </View>
            </View>


            {/* 3. SAĞ: DERSLİK BİLGİSİ */}
            <View className="w-28 items-center justify-center px-2 py-2 bg-slate-50/30">
                 <Text className="text-blue-600 font-bold text-[10px] text-center uppercase tracking-wider mb-1">
                    {roomLabel}
                 </Text>
                 
                 {roomNumber ? (
                    <Text className="text-slate-700 font-black text-2xl tracking-tighter">
                        {roomNumber}
                    </Text>
                 ) : null}
            </View>

        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={['top']}>
      {renderHeader()}
      {renderDayTabs()}

      {loading ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-slate-500 mt-2">{t.loading}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLessons}
          keyExtractor={(item, index) => `${item.LessonCode}-${item.Day}-${index}`}
          renderItem={renderLessonCard}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 opacity-50">
                <Calendar size={64} color="#cbd5e1" />
                <Text className="text-slate-400 font-medium mt-4 text-center px-10">
                    {t.noLesson}
                </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};