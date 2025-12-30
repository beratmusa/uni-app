import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, FileText, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { AttendanceDetailModal } from '../components/AttendanceDetailModal';

interface Course {
  LessonCode: string;
  LessonName: string;
  ClassId: number;
  TeacherName?: string;
}

export const AbsenteeismScreen = () => {
  const navigation = useNavigation();
  const { dictionary } = useLanguage();
  const { token } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const t = dictionary.absenteeism || {
    title: "Devamsızlık Bilgisi",
    loading: "Dersler yükleniyor...",
    noCourse: "Ders kaydı bulunamadı."
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('https://ubys.kastamonu.edu.tr/Framework/Integration/api/IntegratedService/Service', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceName: "GetStudentLessonProgram", serviceCriteria: {} })
      });

      const json = await response.json();
      if (json.Data && json.Data.Data) {
        const uniqueCourses = json.Data.Data.reduce((acc: Course[], current: any) => {
            if (!acc.find(item => item.ClassId === current.ClassId)) {
                acc.push({
                    LessonCode: current.LessonCode,
                    LessonName: current.LessonName,
                    ClassId: current.ClassId,
                    TeacherName: current.TeacherName
                });
            }
            return acc;
        }, []);
        setCourses(uniqueCourses);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const renderHeader = () => (
    <View className="px-5 py-4 bg-white flex-row items-center justify-between shadow-sm z-10 border-b border-gray-100">
      <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100 active:bg-slate-100">
        <ArrowLeft size={20} color="#334155" />
      </TouchableOpacity>
      <Text className="text-lg font-bold text-slate-800">{t.title}</Text>
      <View className="w-10" /> 
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {renderHeader()}

      {/* --- MODAL ÇAĞRISI --- */}
      {selectedCourse && (
          <AttendanceDetailModal 
            key={selectedCourse.ClassId}
            course={selectedCourse} 
            onClose={() => setSelectedCourse(null)} 
          />
      )}

      {loadingCourses ? (
        <View className="flex-1 items-center justify-center">
             <ActivityIndicator size="large" color="#2563eb" />
             <Text className="mt-4 text-slate-500 font-medium">{t.loading}</Text>
        </View>
      ) : (
        <FlatList
            data={courses}
            keyExtractor={(item) => item.ClassId.toString()}
            contentContainerStyle={{ paddingVertical: 20 }}
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedCourse(item)} className="bg-white mx-5 mb-4 p-4 rounded-2xl border border-slate-100 shadow-sm flex-row items-center active:bg-blue-50 transition-all">
                    <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mr-4 border border-blue-100">
                        <FileText size={26} color="#2563eb" />
                    </View>
                    <View className="flex-1 justify-center">
                        <Text className="font-bold text-slate-800 text-base mb-1 leading-tight" numberOfLines={2}>{item.LessonName}</Text>
                        <View className="flex-row items-center">
                            <Text className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md overflow-hidden">{item.LessonCode}</Text>
                        </View>
                    </View>
                    <View className="bg-slate-50 p-2 rounded-full"><ChevronRight size={20} color="#cbd5e1" /></View>
                </TouchableOpacity>
            )}
            ListEmptyComponent={
                <View className="items-center justify-center mt-20 p-10">
                     <FileText size={48} color="#cbd5e1" />
                     <Text className="text-slate-400 mt-4 text-center">{t.noCourse}</Text>
                </View>
            }
        />
      )}
    </SafeAreaView>
  );
};