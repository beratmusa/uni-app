import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BookOpen, GraduationCap } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

// Örnek Ders Verisi Tipi
interface CourseData {
  id: string;
  code: string;
  name: string;
  midterm: number | string;
  final: number | string;
  average: number | string;
  letterGrade: string;
  passed: boolean;
}

export const CourseListScreen = () => {
  const { dictionary } = useLanguage();
  const navigation = useNavigation();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseData[]>([]);

  useEffect(() => {
    // Buraya API isteği gelecek:
    // fetch('https://mobil.kastamonu.edu.tr/api/.../GetGrades', ...)
    
    // (Simülasyon)
    setTimeout(() => {
      setCourses([
        { id: '1', code: 'BIL301', name: 'Yazılım Mühendisliği', midterm: 85, final: 90, average: 88, letterGrade: 'AA', passed: true },
        { id: '2', code: 'BIL305', name: 'Web Programlama', midterm: 70, final: 60, average: 64, letterGrade: 'CC', passed: true },
        { id: '3', code: 'MAT201', name: 'Diferansiyel Denklemler', midterm: 40, final: 30, average: 34, letterGrade: 'FF', passed: false },
        { id: '4', code: 'BIL307', name: 'Mobil Uygulama Geliştirme', midterm: 95, final: 85, average: 89, letterGrade: 'AA', passed: true },
        { id: '5', code: 'ISL101', name: 'İşletmeye Giriş', midterm: 60, final: 75, average: 69, letterGrade: 'CB', passed: true },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const renderItem = ({ item }: { item: CourseData }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
      {/* Ders Başlığı */}
      <View className="flex-row justify-between items-start mb-3 border-b border-slate-100 pb-2">
        <View className="flex-1">
          <Text className="text-blue-600 font-bold text-xs">{item.code}</Text>
          <Text className="text-slate-800 font-bold text-base">{item.name}</Text>
        </View>
        <View className={`px-2 py-1 rounded-lg ${item.passed ? 'bg-green-100' : 'bg-red-100'}`}>
           <Text className={`font-bold text-xs ${item.passed ? 'text-green-700' : 'text-red-700'}`}>
             {item.letterGrade}
           </Text>
        </View>
      </View>

      {/* Notlar */}
      <View className="flex-row justify-between items-center">
        <View className="items-center flex-1 border-r border-slate-100">
          <Text className="text-slate-400 text-xs font-medium uppercase">{dictionary.midterm}</Text>
          <Text className="text-slate-900 font-bold text-lg">{item.midterm}</Text>
        </View>
        
        <View className="items-center flex-1 border-r border-slate-100">
          <Text className="text-slate-400 text-xs font-medium uppercase">{dictionary.final}</Text>
          <Text className="text-slate-900 font-bold text-lg">{item.final}</Text>
        </View>

        <View className="items-center flex-1">
          <Text className="text-slate-400 text-xs font-medium uppercase">{dictionary.average}</Text>
          <Text className={`font-bold text-lg ${item.passed ? 'text-slate-900' : 'text-red-600'}`}>
            {item.average}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-slate-100 flex-row items-center justify-between shadow-sm z-10">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100"
        >
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        
        <Text className="text-lg font-bold text-slate-800">{dictionary.myCourses}</Text>
        
        <View className="w-10 items-center">
             <GraduationCap size={24} color="#2563eb" />
        </View>
      </View>

      {/* İçerik */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Text className="text-slate-400">Ders kaydı bulunamadı.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};