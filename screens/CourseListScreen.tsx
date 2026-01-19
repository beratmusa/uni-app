import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, GraduationCap, User as UserIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Servisten gelen tipi ve fonksiyonu alıyoruz
import { fetchGradesFromApi, Course } from '../services/gradeApi';

export const CourseListScreen = () => {
  const { dictionary } = useLanguage();
  const navigation = useNavigation();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCoursesAndGrades = async () => {
    if (!token) {
        setLoading(false);
        return;
    }

    try {
        const data = await fetchGradesFromApi(token);

        setCourses(data);

        await AsyncStorage.setItem('cachedGrades', JSON.stringify(data));

    } catch (error: any) {
        console.error("Veri çekme hatası:", error);
        // Kullanıcıyı çok sıkmamak için Alert opsiyonel olabilir
        // Alert.alert("Hata", "Veriler alınırken bir sorun oluştu.");
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

  const renderItem = ({ item }: { item: Course }) => {
      const isFailed = item.letterGrade === "FF" || item.letterGrade === "FD";
      const hasGrade = item.letterGrade !== "-";
      
      const badgeBg = hasGrade ? (isFailed ? "bg-red-50" : "bg-green-50") : "bg-slate-50";
      const badgeText = hasGrade ? (isFailed ? "text-red-600" : "text-green-600") : "text-slate-400";

      return (
        <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
          <View className="border-b border-slate-100 pb-3 mb-3">
            <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-2">
                    <Text className="text-blue-600 font-bold text-xs mb-0.5">{item.code}</Text>
                    <Text className="text-slate-900 font-bold text-base leading-tight">{item.name}</Text>
                </View>
                {/* HARF NOTU BADGE */}
                <View className={`px-3 py-1.5 rounded-xl ${badgeBg} items-center justify-center min-w-[40px]`}>
                    <Text className={`font-black text-sm ${badgeText}`}>
                        {item.letterGrade}
                    </Text>
                </View>
            </View>
            <View className="flex-row items-center mt-2">
                <UserIcon size={14} color="#64748b" />
                <Text className="text-slate-500 text-xs ml-1.5 font-medium">{item.teacher}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center bg-slate-50/50 rounded-xl p-2">
            {/* VİZE */}
            <View className="items-center flex-1 border-r border-slate-200">
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{dictionary.midterm || "Vize"}</Text>
              <Text className={`text-base font-bold ${item.vize !== "-" ? "text-slate-700" : "text-slate-300"}`}>
                  {item.vize}
              </Text>
            </View>

            {/* FİNAL / BÜT */}
            <View className="items-center flex-1 border-r border-slate-200">
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  {item.butunleme !== "-" ? "Büt" : (dictionary.final || "Final")}
              </Text>
              <Text className={`text-base font-bold ${item.butunleme !== "-" ? "text-orange-600" : (item.final !== "-" ? "text-slate-700" : "text-slate-300")}`}>
                  {item.butunleme !== "-" ? item.butunleme : item.final}
              </Text>
            </View>

            {/* ORTALAMA */}
            <View className="items-center flex-1">
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{dictionary.average || "Ort."}</Text>
              <Text className={`text-base font-bold ${item.average !== "-" ? "text-slate-900" : "text-slate-300"}`}>
                  {item.average}
              </Text>
            </View>
          </View>
        </View>
      );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="px-4 py-3 bg-white border-b border-slate-100 flex-row items-center justify-between shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100 active:bg-slate-100">
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">{dictionary.myCourses}</Text>
        <View className="w-10 items-center"><GraduationCap size={24} color="#2563eb" /></View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-slate-400 text-xs mt-2">{dictionary.checkingLessons}</Text>
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
              <Text className="text-slate-400">{dictionary.lessonsLoadError}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};