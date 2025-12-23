import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, GraduationCap, User as UserIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface LessonRaw {
  LessonName: string;
  LessonCode: string;
  LessonCredit: number;
  TeacherName: string;
  TeacherTitle: string;
  ClassId: number;
}

interface ExamRaw {
  ExamResult: number;
  ExcuseExamResult: number;
  ClassId: number;
  SharedExamName: string;
  ExamStartDate: string | null;
}

interface DisplayCourse {
  id: number;
  code: string;
  name: string;
  teacher: string;
  vize: string;
  final: string;
  butunleme: string;
  average: string;
}

export const CourseListScreen = () => {
  const { dictionary } = useLanguage();
  const navigation = useNavigation();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<DisplayCourse[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCoursesAndGrades = async () => {
    if (!token) {
        setLoading(false);
        return;
    }

    try {
      console.log("📚 Ders listesi çekiliyor (POST)...");
      const cleanToken = token.trim();

      const lessonResponse = await fetch('https://mobil.kastamonu.edu.tr/api/Student/GetStudentLessonInfo', {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
        },
        body: '' 
      });

      if (!lessonResponse.ok) {
        throw new Error(`Ders listesi hatası: ${lessonResponse.status}`);
      }
      
      const lessonJson = await lessonResponse.json();
      const lessonList: LessonRaw[] = lessonJson.Data || [];

      console.log(`✅ ${lessonList.length} ders bulundu. Notlar çekiliyor...`);

      if (lessonList.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      const combinedData = await Promise.all(
        lessonList.map(async (lesson) => {
          try {
            const examUrl = 'https://mobil.kastamonu.edu.tr/api/Student/GetStudentExamInfo/'; 
            
            const examResponse = await fetch(examUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${cleanToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                "classId": lesson.ClassId 
              })
            });

            let vize = "-";
            let final = "-";
            let butunleme = "-";

            if (examResponse.ok) {
              const examJson = await examResponse.json();
              const exams: ExamRaw[] = examJson.Data || [];

              exams.forEach(exam => {
                const result = exam.ExamResult !== null ? exam.ExamResult.toString() : "-";
                const name = exam.SharedExamName ? exam.SharedExamName.toLowerCase() : "";
                
                if (name.includes("vize") || name.includes("ara")) vize = result;
                else if (name.includes("final") || name.includes("genel")) final = result;
                else if (name.includes("bütünleme")) butunleme = result;
              });
            }

            let avg = "-";
            if (vize !== "-" && final !== "-") {
                const v = parseFloat(vize);
                const f = parseFloat(final);
                if (!isNaN(v) && !isNaN(f)) {
                    avg = (v * 0.4 + f * 0.6).toFixed(0);
                }
            }

            return {
              id: lesson.ClassId,
              code: lesson.LessonCode,
              name: lesson.LessonName,
              teacher: `${lesson.TeacherTitle} ${lesson.TeacherName}`,
              vize,
              final,
              butunleme,
              average: avg
            };

          } catch (e) {
            console.error(`Ders detayı hatası (${lesson.LessonCode}):`, e);
            return {
              id: lesson.ClassId,
              code: lesson.LessonCode,
              name: lesson.LessonName,
              teacher: `${lesson.TeacherTitle} ${lesson.TeacherName}`,
              vize: "-", final: "-", butunleme: "-", average: "-"
            };
          }
        })
      );

      setCourses(combinedData);

    } catch (error: any) {
      console.error("Veri çekme hatası:", error);
      Alert.alert("Hata", "Veriler alınırken bir sorun oluştu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndGrades();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCoursesAndGrades();
  };

  const renderItem = ({ item }: { item: DisplayCourse }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
      <View className="border-b border-slate-100 pb-3 mb-3">
        <View className="flex-row justify-between items-start">
            <View className="flex-1">
                <Text className="text-blue-600 font-bold text-xs mb-0.5">{item.code}</Text>
                <Text className="text-slate-900 font-bold text-base leading-tight">{item.name}</Text>
            </View>
        </View>
        <View className="flex-row items-center mt-2">
            <UserIcon size={14} color="#64748b" />
            <Text className="text-slate-500 text-xs ml-1.5 font-medium">{item.teacher}</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <View className="items-center flex-1 border-r border-slate-100">
          <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{dictionary.midterm}</Text>
          <Text className={`text-lg font-bold ${item.vize !== "-" ? "text-slate-800" : "text-slate-300"}`}>{item.vize}</Text>
        </View>
        <View className="items-center flex-1 border-r border-slate-100">
          <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{dictionary.final}</Text>
          <Text className={`text-lg font-bold ${item.final !== "-" ? "text-slate-800" : "text-slate-300"}`}>{item.final}</Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{dictionary.average}</Text>
          <View className={`px-2 py-0.5 rounded ${item.average !== "-" ? (parseFloat(item.average) >= 50 ? "bg-green-100" : "bg-red-100") : ""}`}>
             <Text className={`text-lg font-bold ${item.average !== "-" ? (parseFloat(item.average) >= 50 ? "text-green-700" : "text-red-700") : "text-slate-300"}`}>{item.average}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="px-4 py-3 bg-white border-b border-slate-100 flex-row items-center justify-between shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100">
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">{dictionary.myCourses}</Text>
        <View className="w-10 items-center"><GraduationCap size={24} color="#2563eb" /></View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-slate-400 text-xs mt-2">Dersler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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