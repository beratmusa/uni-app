import React, { useState, useEffect, memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, Switch, ActivityIndicator, FlatList, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QrCode, Hash, ArrowLeft, Clock, Search, User, X, CheckSquare, Square } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CustomAlert } from '../components/CustomAlert'; // <-- CustomAlert import edildi

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
  Isblock?: boolean;
  isModified?: boolean;
}

// --- FOTOĞRAF BİLEŞENİ ---
const StudentAvatar = memo(({ imageCode, token }: { imageCode?: string, token: string | null }) => {
    const [imageUri, setImageUri] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchImage = async () => {
            if (!imageCode || !token) return;
            try {
                const response = await fetch('https://ubys.kastamonu.edu.tr/Framework/Integration/api/IntegratedService/Service', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        serviceName: "GetStudentImage",
                        serviceCriteria: { StudentImageCode: imageCode }
                    })
                });
                const json = await response.json();
                if (isMounted && json.Data?.Data?.Result) {
                    setImageUri(json.Data.Data.Result); 
                }
            } catch (e) { }
        };
        fetchImage();
        return () => { isMounted = false; };
    }, [imageCode, token]);

    if (imageUri) {
        return <Image source={{ uri: imageUri }} className="w-12 h-12 rounded-full border border-slate-200" resizeMode="cover" />;
    }
    return (
        <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center border border-slate-200">
            <User size={20} color="#94a3b8" />
        </View>
    );
});

// --- ANA EKRAN ---
export const AttendanceManagerScreen = ({ navigation, route }: any) => {
  const { token } = useAuth();
  const { dictionary } = useLanguage();
  
  const params = route.params as RouteParams;
  const courseName = params?.courseName || dictionary.courseManagement || "Ders Yönetimi";

  const availableHours = Object.keys(params?.courseHours || {}).filter(k => k !== "0").sort();
  const canBeBlock = Object.keys(params?.courseHours || {}).includes("0");

  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [isBlockMode, setIsBlockMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'QR' | 'CODE'>('QR');
  const [generatedData, setGeneratedData] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- CUSTOM ALERT STATE ---
  const [alertConfig, setAlertConfig] = useState({
      visible: false,
      type: 'success' as 'success' | 'error' | 'warning',
      title: '',
      message: ''
  });

  const showAlert = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
      setAlertConfig({ visible: true, type, title, message });
  };

  const closeAlert = () => {
      setAlertConfig(prev => ({ ...prev, visible: false }));
  };
  // --------------------------

  useEffect(() => {
      fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('https://ubys.kastamonu.edu.tr/Framework/Integration/api/IntegratedService/Service', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
           serviceName: "GetClassStudentInfo",
           serviceCriteria: { 
               classId: params.classId, 
               scheduleId: params.scheduleId 
           }
        })
      });
      
      const json = await response.json();
      if (json.Data && Array.isArray(json.Data.Data)) {
        setStudents(json.Data.Data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      showAlert('error', dictionary.error || "Hata", dictionary.studentNotFound || "Öğrenci listesi alınamadı.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleGenerate = () => {
    if (selectedHours.length === 0) return;
    setQrLoading(true);
    setTimeout(() => {
        if (activeTab === 'QR') {
            setGeneratedData(`UBYS-QR-${params.classId}-${Math.random().toString(36).substring(7)}`);
        } else {
            setGeneratedData(Math.floor(100000 + Math.random() * 900000).toString());
        }
        setQrLoading(false);
    }, 1000);
  };

  const toggleAttendanceHour = (studentId: number, hourKey: string) => {
    setStudents(curr => curr.map(s => {
        if (s.StudentId === studentId) {
            const currentStatus = s.AttendanceHistory?.[hourKey] || false;
            const newHistory = { ...s.AttendanceHistory, [hourKey]: !currentStatus };
            return { ...s, AttendanceHistory: newHistory, isModified: true };
        }
        return s;
    }));
  };

  const toggleBlockAttendance = (studentId: number) => {
    setStudents(curr => curr.map(s => {
        if (s.StudentId === studentId) {
            const allPresent = availableHours.every(h => s.AttendanceHistory?.[h] === true);
            const target = !allPresent;
            let newHistory = { ...s.AttendanceHistory };
            availableHours.forEach(h => newHistory[h] = target);
            return { ...s, AttendanceHistory: newHistory, isModified: true };
        }
        return s;
    }));
  };

  const handleSave = () => {
      const modifiedStudents = students.filter(s => s.isModified);
      
      if (modifiedStudents.length === 0) {
          // UYARI ALERT (Değişiklik yok)
          showAlert('warning', dictionary.info, dictionary.noChange);
          return;
      }
      
      showAlert('success', dictionary.saved, `${modifiedStudents.length} ${dictionary.savedMessage}`);
      
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const lower = searchQuery.toLocaleLowerCase('tr-TR');
    return students.filter(s => 
        s.Name.toLocaleLowerCase('tr-TR').includes(lower) || 
        s.Surname.toLocaleLowerCase('tr-TR').includes(lower) ||
        s.StudentNo.includes(lower)
    );
  }, [students, searchQuery]);

  // --- ÖĞRENCİ KARTI ---
  const renderStudent = ({ item }: { item: Student }) => {
      const isAllPresent = availableHours.every(h => item.AttendanceHistory?.[h] === true);

      // Ortak Bilgi Alanı
      const StudentInfo = (
        <View className="flex-row items-center flex-1">
            <StudentAvatar imageCode={item.StudentImageCode} token={token} />
            <View className="ml-3 flex-1">
                <Text className="font-bold text-slate-800 text-base" numberOfLines={1}>{item.Name} {item.Surname}</Text>
                <Text className="text-slate-400 text-xs font-medium">{item.StudentNo}</Text>
            </View>
        </View>
      );

      if (isBlockMode) {
          // BLOK MODU (Yatay)
          return (
            <View className="bg-white mx-5 mb-3 p-4 rounded-2xl border border-slate-200 flex-row items-center justify-between">
                {StudentInfo}
                <TouchableOpacity 
                    onPress={() => toggleBlockAttendance(item.StudentId)}
                    className={`ml-3 w-14 h-14 rounded-xl items-center justify-center border-2 ${
                        isAllPresent 
                        ? 'bg-green-500 border-green-600' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                >
                    {isAllPresent ? <CheckSquare size={28} color="white" /> : <Square size={28} color="#cbd5e1" />}
                </TouchableOpacity>
            </View>
          );
      }

      // NORMAL MOD (Dikey)
      return (
        <View className="bg-white mx-5 mb-3 p-4 rounded-2xl border border-slate-200">
            <View className="flex-row items-center mb-4">
                 {StudentInfo}
            </View>
            <View className="flex-row flex-wrap gap-3">
                {availableHours.map(hour => {
                    const isPresent = item.AttendanceHistory?.[hour] === true;
                    return (
                        <TouchableOpacity
                            key={hour}
                            onPress={() => toggleAttendanceHour(item.StudentId, hour)}
                            className={`w-12 h-12 rounded-xl items-center justify-center border-2 ${
                                isPresent 
                                ? 'bg-green-500 border-green-600' 
                                : 'bg-slate-50 border-slate-200'
                            }`}
                        >
                            <Text className={`font-bold text-lg ${isPresent ? 'text-white' : 'text-slate-400'}`}>
                                {hour}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
      );
  };

  // HEADER
  const HeaderContent = (
    <View className="px-5 pt-6 pb-2">
        <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-slate-800 font-bold text-base flex-row items-center">
                    <Clock size={16} className="text-slate-400 mr-2" /> {dictionary.courseHours}
                </Text>
                {canBeBlock && (
                    <View className="flex-row items-center bg-white px-3 py-1.5 rounded-full border border-slate-200">
                        <Text className={`text-xs font-bold mr-2 ${isBlockMode ? 'text-blue-600' : 'text-slate-400'}`}>{dictionary.block}</Text>
                        <Switch 
                            value={isBlockMode} 
                            onValueChange={(val) => {
                                setIsBlockMode(val);
                                setSelectedHours(val ? [...availableHours] : []);
                                setGeneratedData(null);
                            }}
                            trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
                            thumbColor={isBlockMode ? "#2563eb" : "#f8fafc"}
                        />
                    </View>
                )}
            </View>
            <View className="flex-row flex-wrap gap-3">
                {availableHours.map((hour) => {
                    const isSelected = selectedHours.includes(hour);
                    return (
                        <TouchableOpacity
                            key={hour}
                            onPress={() => {
                                setGeneratedData(null);
                                if (isBlockMode) {
                                    setSelectedHours(selectedHours.length === availableHours.length ? [] : [...availableHours]);
                                } else {
                                    setSelectedHours(selectedHours.includes(hour) ? selectedHours.filter(h => h !== hour) : [...selectedHours, hour]);
                                }
                            }}
                            className={`w-12 h-12 rounded-xl items-center justify-center border-2 ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'}`}
                        >
                            <Text className={`font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>{hour}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>

        <View className="flex-row gap-4 mb-6">
            <TouchableOpacity 
                onPress={() => handleGenerate()} 
                disabled={selectedHours.length === 0}
                className={`flex-1 py-3 rounded-xl items-center flex-row justify-center ${selectedHours.length === 0 ? 'bg-slate-300' : 'bg-slate-800'}`}
            >
                <Text className="text-white font-bold">{activeTab === 'QR' ? dictionary.createQR : dictionary.createCode}</Text>
            </TouchableOpacity>

            <View className="flex-row bg-white border border-slate-200 rounded-xl overflow-hidden">
                <TouchableOpacity onPress={() => { setActiveTab('QR'); setGeneratedData(null); }} className={`px-4 justify-center ${activeTab === 'QR' ? 'bg-blue-50' : ''}`}>
                    <QrCode size={20} color={activeTab === 'QR' ? '#2563eb' : '#94a3b8'} />
                </TouchableOpacity>
                <View className="w-[1px] bg-slate-200"/>
                <TouchableOpacity onPress={() => { setActiveTab('CODE'); setGeneratedData(null); }} className={`px-4 justify-center ${activeTab === 'CODE' ? 'bg-blue-50' : ''}`}>
                    <Hash size={20} color={activeTab === 'CODE' ? '#2563eb' : '#94a3b8'} />
                </TouchableOpacity>
            </View>
        </View>

        {qrLoading ? (
            <ActivityIndicator className="mb-8" color="#2563eb" />
        ) : generatedData && (
            <View className="items-center bg-white p-6 rounded-3xl border border-slate-200 mb-8">
                {activeTab === 'QR' ? <QRCode value={generatedData} size={200} /> : <Text className="text-5xl font-black text-slate-800 tracking-widest">{generatedData}</Text>}
                <Text className="text-slate-400 text-xs mt-4 text-center">
                    {(dictionary.joinInfo || "Öğrenciler {0} derse katılabilir.").replace("{0}", activeTab === 'QR' ? (dictionary.joinWithQR || "QR kodu okutarak") : (dictionary.joinWithCode || "kodu girerek"))}
                </Text>
            </View>
        )}

        <View className="mb-2 mt-2">
             <Text className="text-slate-800 font-bold text-lg mb-2">{dictionary.studentList}</Text>
             <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-3 h-12">
                <Search size={20} color="#94a3b8" />
                <TextInput
                    placeholder={dictionary.searchPlaceholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 ml-3 text-slate-800 h-full"
                    placeholderTextColor="#cbd5e1"
                    autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <X size={20} color="#94a3b8" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
        <View className="px-4 py-3 flex-row items-center bg-white border-b border-slate-100 justify-between">
            <View className="flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-slate-50 rounded-full border border-slate-100 mr-3">
                    <ArrowLeft size={20} color="#334155" />
                </TouchableOpacity>
                <View>
                    <Text className="font-bold text-slate-800 text-lg">{dictionary.attendanceTitle}</Text>
                    <Text className="text-slate-400 text-[10px]">{courseName}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={handleSave} className="bg-blue-600 px-4 py-2 rounded-lg">
                <Text className="text-white font-bold text-sm">{dictionary.save}</Text>
            </TouchableOpacity>
        </View>

        {loadingStudents ? (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-4 text-slate-400">{dictionary.loadingList}</Text>
            </View>
        ) : (
            <FlatList
                data={filteredStudents}
                keyExtractor={item => item.StudentId.toString()}
                renderItem={renderStudent}
                ListHeaderComponent={HeaderContent} 
                contentContainerStyle={{ paddingBottom: 100 }}
                removeClippedSubviews={true} 
                initialNumToRender={5}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                    <View className="items-center justify-center py-10">
                        <Text className="text-slate-400">{dictionary.studentNotFound}</Text>
                    </View>
                }
            />
        )}

        {/* --- CUSTOM ALERT BİLEŞENİ --- */}
        <CustomAlert
            visible={alertConfig.visible}
            type={alertConfig.type}
            title={alertConfig.title}
            message={alertConfig.message}
            onConfirm={closeAlert}
            confirmText={dictionary.ok}
        />
    </SafeAreaView>
  );
};