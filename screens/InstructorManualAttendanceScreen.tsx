import React, { useState, useEffect, memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Switch, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, Grid, User, Clock, CheckSquare, Square, Search, X } from 'lucide-react-native';
// useNavigation YOK, prop kullanıyoruz.
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// --- TİPLER ---

interface RouteParams {
  classId: number;
  scheduleId: number;
  courseName: string;
  courseHours: { [key: string]: string }; 
}

interface Student {
  StudentId: number;
  Name: string;
  Surname: string;
  StudentNo: string;
  StudentImageCode?: string;
  AttendanceHistory: { [key: string]: boolean };
  isModified?: boolean; 
}

// --- FOTOĞRAF BİLEŞENİ ---
const StudentAvatar = memo(({ imageCode, token }: { imageCode?: string, token: string | null }) => {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchImage = async () => {
            if (!imageCode || !token) {
                if (isMounted) setLoading(false);
                return;
            }
            try {
                const response = await fetch('https://ubys.kastamonu.edu.tr/Framework/Integration/api/IntegratedService/Service', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        serviceName: "GetStudentImage",
                        serviceCriteria: { StudentImageCode: imageCode }
                    })
                });
                const json = await response.json();
                if (isMounted && json.Data?.Data?.Result) {
                    setImageUri(json.Data.Data.Result); 
                }
            } catch (e) { } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchImage();
        return () => { isMounted = false; };
    }, [imageCode, token]);

    if (loading) {
        return (
            <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center border border-slate-200">
                <ActivityIndicator size="small" color="#cbd5e1" />
            </View>
        );
    }

    if (imageUri) {
        return (
            <Image 
                source={{ uri: imageUri }} 
                className="w-12 h-12 rounded-full border border-slate-200"
                resizeMode="cover"
            />
        );
    }

    return (
        <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center border border-slate-200">
            <User size={20} color="#94a3b8" />
        </View>
    );
});


// --- ANA EKRAN ---

export const InstructorManualAttendanceScreen = ({ route, navigation }: { route: any, navigation: any }) => {
  const { token } = useAuth();
  const { dictionary } = useLanguage(); // Dil Desteği
  
  const params = route.params as RouteParams;
  const classId = params?.classId;
  const scheduleId = params?.scheduleId;
  const courseName = params?.courseName || "Ders";
  const courseHours = params?.courseHours || {};

  const hoursKeys = Object.keys(courseHours).filter(key => key !== "0").sort();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBlockMode, setIsBlockMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Arama State'i
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });

  // --- DİL ÇEVİRİLERİ (Fallback ile) ---
const t = dictionary.instructor || {
    title: "Yoklama Listesi",
    save: "Kaydet",
    saved: "Kaydedildi",
    error: "Hata",
    blockMode: "Blok Modu",
    hourMode: "Saat Bazlı Mod",
    searchPlaceholder: "Öğrenci Ara...",
    present: "GELEN",
    absent: "GELMEYEN",
    total: "MEVCUT",
    hoursLabel: "DERS SAATLERİ",
    yes: "VAR",
    no: "YOK",
    noStudent: "Öğrenci bulunamadı.",
    search: "ARA"
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [students]);

  // --- API ---
  const fetchStudents = async () => {
    try {
      const response = await fetch('https://ubys.kastamonu.edu.tr/Framework/Integration/api/IntegratedService/Service', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           serviceName: "GetClassStudentInfo",
           serviceCriteria: {
             classId: classId,
             scheduleId: scheduleId
           }
        })
      });

      const json = await response.json();
      if (json.Data && json.Data.Data) {
        setStudents(json.Data.Data);
      }
    } catch (error) {
      Alert.alert(t.error, "Öğrenci listesi alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  // --- İSTATİSTİK ---
  const calculateStats = () => {
      let presentCount = 0;
      students.forEach(s => {
          const isPresentAnyHour = Object.values(s.AttendanceHistory || {}).some(val => val === true);
          if (isPresentAnyHour) presentCount++;
      });
      
      setStats({
          total: students.length,
          present: presentCount,
          absent: students.length - presentCount
      });
  };

  // --- FİLTRELEME (ARAMA) ---
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const lowerQuery = searchQuery.toLocaleLowerCase('tr-TR');
    return students.filter(s => 
        s.Name.toLocaleLowerCase('tr-TR').includes(lowerQuery) ||
        s.Surname.toLocaleLowerCase('tr-TR').includes(lowerQuery) ||
        s.StudentNo.includes(lowerQuery)
    );
  }, [students, searchQuery]);

  // --- ETKİLEŞİMLER ---
  const toggleAttendanceHour = (studentId: number, hourKey: string) => {
    setStudents(currentStudents => 
      currentStudents.map(student => {
        if (student.StudentId === studentId) {
          const currentStatus = student.AttendanceHistory?.[hourKey] || false;
          let newHistory = { ...(student.AttendanceHistory || {}) };
          newHistory[hourKey] = !currentStatus;
          return { ...student, AttendanceHistory: newHistory, isModified: true };
        }
        return student;
      })
    );
  };

  const toggleBlockAttendance = (studentId: number) => {
    setStudents(currentStudents => 
        currentStudents.map(student => {
          if (student.StudentId === studentId) {
            const allPresent = hoursKeys.every(h => student.AttendanceHistory?.[h] === true);
            const targetStatus = !allPresent;

            let newHistory = { ...(student.AttendanceHistory || {}) };
            hoursKeys.forEach(h => { newHistory[h] = targetStatus; });

            return { ...student, AttendanceHistory: newHistory, isModified: true };
          }
          return student;
        })
    );
  };

  const handleSave = () => {
    const modifiedStudents = students.filter(s => s.isModified);
    console.log("Değişen Kayıt Sayısı:", modifiedStudents.length);
    Alert.alert(t.saved, "Yoklama verileri başarıyla kaydedildi.");
    if (navigation?.goBack) navigation.goBack();
  };

  // --- ÖĞRENCİ KARTI RENDER ---
  const renderStudentRow = ({ item }: { item: Student }) => {
    const isAllPresent = hoursKeys.every(h => item.AttendanceHistory?.[h] === true);

    // --- DURUM 1: BLOK MODU (Yatay Hizalama - Checkbox Sağda) ---
    if (isBlockMode) {
        return (
            <View className="bg-white mb-3 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-row items-center p-3">
                {/* SOL: Fotoğraf ve Bilgi */}
                <View className="flex-row items-center flex-1">
                    <StudentAvatar imageCode={item.StudentImageCode} token={token} />
                    
                    <View className="ml-3 flex-1 pr-2">
                        <Text className="font-bold text-slate-800 text-base mb-1" numberOfLines={1}>
                            {item.Name} {item.Surname}
                        </Text>
                        <View className="flex-row items-center">
                            <View className="bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                <Text className="text-blue-600 text-[10px] font-bold tracking-wide">
                                    {item.StudentNo}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* SAĞ: Checkbox */}
                <TouchableOpacity
                    onPress={() => toggleBlockAttendance(item.StudentId)}
                    className={`flex-row items-center px-3 py-2 rounded-xl border ${
                        isAllPresent 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-white border-slate-300'
                    }`}
                    activeOpacity={0.7}
                >
                    <Text className={`text-xs font-bold mr-2 ${isAllPresent ? 'text-white' : 'text-slate-500'}`}>
                        {isAllPresent ? t.yes : t.no}
                    </Text>
                    {isAllPresent ? (
                        <CheckSquare size={20} color="white" />
                    ) : (
                        <Square size={20} color="#cbd5e1" />
                    )}
                </TouchableOpacity>
            </View>
        );
    }

    // --- DURUM 2: NORMAL MOD (Dikey Hizalama - Saatler Altta) ---
    return (
      <View className="bg-white mb-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* ÜST KISIM: Fotoğraf ve İsim */}
        <View className="flex-row items-center p-4 border-b border-slate-50 bg-slate-50/50">
            <StudentAvatar imageCode={item.StudentImageCode} token={token} />
            
            <View className="ml-4 flex-1">
                <Text className="font-bold text-slate-800 text-base mb-1">
                    {item.Name} {item.Surname}
                </Text>
                <View className="flex-row items-center">
                    <View className="bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        <Text className="text-blue-600 text-[10px] font-bold tracking-wide">
                            {item.StudentNo}
                        </Text>
                    </View>
                </View>
            </View>
        </View>

        {/* ALT KISIM: Saat Kontrol Butonları */}
        <View className="p-4 flex-row items-center justify-between bg-white">
            <View className="flex-row gap-2">
                {hoursKeys.map((hourKey) => {
                    const isPresent = item.AttendanceHistory?.[hourKey] === true;
                    return (
                        <TouchableOpacity
                            key={hourKey}
                            onPress={() => toggleAttendanceHour(item.StudentId, hourKey)}
                            className={`w-10 h-10 rounded-xl items-center justify-center border ${
                                isPresent 
                                ? 'bg-green-500 border-green-600 shadow-sm' 
                                : 'bg-slate-50 border-slate-200'
                            }`}
                        >
                            <Text className={`font-bold text-sm ${isPresent ? 'text-white' : 'text-slate-300'}`}>
                                {hourKey}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      
      {/* --- HEADER --- */}
      <View className="bg-white shadow-sm z-20 pb-2 border-b border-slate-100">
          <View className="px-4 py-3 flex-row items-center justify-between">
            <TouchableOpacity 
              onPress={() => navigation?.goBack && navigation.goBack()}
              className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100 active:bg-slate-100"
            >
              <ArrowLeft size={20} color="#334155" />
            </TouchableOpacity>
            
            <View className="items-center flex-1 mx-4">
                <Text className="text-base font-bold text-slate-800" numberOfLines={1}>{t.title}</Text>
                <Text className="text-[10px] text-slate-400 font-medium" numberOfLines={1}>{courseName}</Text>
            </View>

            <TouchableOpacity 
              onPress={handleSave}
              className="h-10 px-5 bg-blue-600 rounded-full flex-row items-center justify-center shadow-sm active:bg-blue-700"
            >
              <Save size={16} color="white" />
              <Text className="text-white font-bold text-xs ml-2">{t.save}</Text>
            </TouchableOpacity>
          </View>

          {/* --- ARAMA ÇUBUĞU --- */}
          <View className="px-5 mb-2">
              <View className="flex-row items-center bg-slate-100 rounded-xl px-3 h-10 border border-slate-200">
                  <Search size={16} color="#94a3b8" />
                  <TextInput
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 ml-2 text-slate-700 h-full"
                    placeholderTextColor="#cbd5e1"
                  />
                  {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery("")}>
                          <X size={16} color="#94a3b8" />
                      </TouchableOpacity>
                  )}
              </View>
          </View>

          {/* --- ARAÇ ÇUBUĞU (SWITCH) --- */}
          <View className="px-5 mt-1 flex-row items-center justify-between">
              <View className="flex-row items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Grid size={14} color={isBlockMode ? "#2563eb" : "#94a3b8"} className="mr-2"/>
                  <Text className={`text-xs font-bold ${isBlockMode ? 'text-blue-600' : 'text-slate-500'}`}>
                      {isBlockMode ? t.blockMode : t.hourMode}
                  </Text>
              </View>
              <Switch
                trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
                thumbColor={isBlockMode ? "#2563eb" : "#f8fafc"}
                onValueChange={setIsBlockMode}
                value={isBlockMode}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} 
              />
          </View>
      </View>

      {/* --- LİSTE --- */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
             <ActivityIndicator size="large" color="#2563eb" />
             <Text className="mt-4 text-slate-500 font-medium text-xs">Liste yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
            data={filteredStudents} // Filtrelenmiş veri kullanılıyor
            keyExtractor={(item) => item.StudentId.toString()}
            renderItem={renderStudentRow}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={3}
            ListEmptyComponent={
                <View className="items-center justify-center mt-20 opacity-50">
                     <User size={48} color="#cbd5e1" />
                     <Text className="text-slate-400 mt-4 text-sm font-medium">{t.noStudent}</Text>
                </View>
            }
        />
      )}
      
      {/* --- ALT BİLGİ (İSTATİSTİK) --- */}
      {!loading && students.length > 0 && (
          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 flex-row justify-between items-center shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
              <View className="flex-row gap-4">
                  <View>
                      <Text className="text-[10px] text-slate-400 font-bold uppercase">{t.present}</Text>
                      <Text className="text-lg font-black text-slate-800">{stats.present}</Text>
                  </View>
                  <View className="w-[1px] h-full bg-slate-100" />
                  <View>
                      <Text className="text-[10px] text-slate-400 font-bold uppercase">{t.absent}</Text>
                      <Text className="text-lg font-black text-slate-400">{stats.absent}</Text>
                  </View>
              </View>
              <View className="items-end">
                  <Text className="text-[10px] text-slate-400 font-bold uppercase">{t.total}</Text>
                  <Text className="text-lg font-black text-blue-600">{stats.total}</Text>
              </View>
          </View>
      )}

    </SafeAreaView>
  );
};