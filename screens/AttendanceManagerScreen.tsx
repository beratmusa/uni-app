import React, { useState, useEffect, memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, Switch, ActivityIndicator, FlatList, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QrCode, Hash, ArrowLeft, Search, User, CheckSquare, Square, Lock, Settings2, X, RefreshCw, Clock } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CustomAlert } from '../components/CustomAlert';

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
  ScheduleOrder?: number;
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

  // --- SAAT HESAPLAMA ---
  const allKeys = Object.keys(params?.courseHours || {});
  
  const availableHours = allKeys
      .filter(k => k !== "0")
      .sort((a, b) => parseInt(a) - parseInt(b));

  const canBeBlock = allKeys.includes("0");

  // --- STATE INIT ---
  const [isBlockMode, setIsBlockMode] = useState(canBeBlock);
  const [isLockedBlockMode, setIsLockedBlockMode] = useState(false);

  const [selectedHours, setSelectedHours] = useState<string[]>(
      (!canBeBlock && availableHours.length > 0) ? [availableHours[0]] : []
  );

  const [activeTab, setActiveTab] = useState<'QR' | 'CODE'>('CODE');
  const [generatedData, setGeneratedData] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
      if (token && params.scheduleId) {
          fetchStudents();
      }
  }, [token, params.scheduleId]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
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
        const studentList = json.Data.Data;
        setStudents(studentList);

        if (studentList.length > 0) {
            const firstStudent = studentList[0];
            
            if (firstStudent.Isblock === true) {
                setIsBlockMode(true);
                setSelectedHours([]); 
                setIsLockedBlockMode(true); 
            } else {
                setIsBlockMode(false);
                setIsLockedBlockMode(false);

                const scheduleOrder = firstStudent.ScheduleOrder || 0;
                const orderStr = scheduleOrder.toString();

                if (scheduleOrder > 0 && availableHours.includes(orderStr)) {
                    setSelectedHours([orderStr]);
                } else if (availableHours.length > 0) {
                    setSelectedHours([availableHours[0]]);
                }
            }
        } else {
            setIsLockedBlockMode(false);
            if (canBeBlock) {
                setIsBlockMode(true);
                setSelectedHours([]);
            } else if (availableHours.length > 0) {
                setIsBlockMode(false);
                setSelectedHours([availableHours[0]]);
            }
        }

      } else {
        setStudents([]);
      }
    } catch (error) {
      showAlert('error', dictionary.error || "Hata", dictionary.studentNotFound || "Öğrenci listesi alınamadı.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // --- KOD ÜRETME (SÜRE HESAPLAMA) ---
  const handleGenerate = async () => {
    if (!isBlockMode && selectedHours.length === 0) {
        showAlert('warning', dictionary.error || "Uyarı", "Lütfen kod üretmek için bir saat seçiniz.");
        return;
    }

    let targetHour = "1"; 
    if (!isBlockMode && selectedHours.length > 0) {
        targetHour = selectedHours[0];
    } else if (isBlockMode && selectedHours.length > 0) {
        targetHour = selectedHours[0];
    }

    setQrLoading(true);
    setGeneratedData(null); 

    try {
        const response = await fetch('https://ubys.kastamonu.edu.tr/Framework/Integration/api/IntegratedService/Service', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                serviceName: "GetConfirmationCode",
                serviceCriteria: {
                    scheduleId: params.scheduleId,
                    scheduleorder: parseInt(targetHour),
                    isblock: isBlockMode
                }
            })
        });

        const json = await response.json();
        
        if (json.Data) {
            if (json.Data.ExceptionMessage) {
                showAlert('warning', dictionary.error || "Uyarı", json.Data.ExceptionMessage);
            } else if (json.Data.Data && json.Data.Data.Result) {
                
                if (activeTab === 'QR') {
                    const qrPayload = {
                        scheduleId: params.scheduleId,
                        scheduleorder: parseInt(targetHour),
                        isblock: isBlockMode,
                        timestamp: new Date().toISOString()
                    };
                    setGeneratedData(JSON.stringify(qrPayload));
                } else {
                    setGeneratedData(json.Data.Data.Result.toString());
                }

            } else {
                showAlert('error', dictionary.error || "Hata", "Kod üretilemedi. Beklenmedik bir cevap alındı.");
            }
        } else {
             showAlert('error', dictionary.error || "Hata", "Sunucudan geçersiz yanıt alındı.");
        }

    } catch (error) {
        console.error("Kod üretme hatası:", error);
        showAlert('error', dictionary.error || "Hata", "Sunucuya bağlanırken bir hata oluştu.");
    } finally {
        setQrLoading(false);
    }
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
            let allPresent = false;
            if (availableHours.length > 0) {
                allPresent = availableHours.every(h => s.AttendanceHistory?.[h] === true);
            } else {
                allPresent = s.AttendanceHistory?.["1"] === true;
            }

            const target = !allPresent;
            let newHistory = { ...s.AttendanceHistory };
            
            if (availableHours.length > 0) {
                availableHours.forEach(h => newHistory[h] = target);
            } else {
                newHistory["1"] = target;
            }

            return { ...s, AttendanceHistory: newHistory, isModified: true };
        }
        return s;
    }));
  };

  const handleSave = async () => {
      const modifiedStudents = students.filter(s => s.isModified);
      
      if (modifiedStudents.length === 0) {
          showAlert('warning', dictionary.info, dictionary.noChange);
          return;
      }

      setSaving(true);

      try {
          const promises = [];

          for (const student of modifiedStudents) {
              if (isBlockMode) {
                  const firstHour = availableHours.length > 0 ? availableHours[0] : "1"; 
                  const isAttended = student.AttendanceHistory[firstHour] || false;

                  const payload = {
                      serviceName: "SaveStudentAttendancyForInstructor",
                      serviceCriteria: {
                          scheduleId: params.scheduleId,
                          IsAttended: isAttended,
                          scheduleorder: 1, 
                          studentId: student.StudentId,
                          isblock: true
                      }
                  };

                  promises.push(
                      fetch('https://ubys.kastamonu.edu.tr/Framework/Integration/api/IntegratedService/Service', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload)
                      })
                  );

              } else {
                  for (const hour of availableHours) {
                      const isAttended = student.AttendanceHistory[hour] || false;
                      const payload = {
                          serviceName: "SaveStudentAttendancyForInstructor",
                          serviceCriteria: {
                              scheduleId: params.scheduleId,
                              IsAttended: isAttended,
                              scheduleorder: parseInt(hour),
                              studentId: student.StudentId,
                              isblock: false
                          }
                      };

                      promises.push(
                          fetch('https://ubys.kastamonu.edu.tr/Framework/Integration/api/IntegratedService/Service', {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                              body: JSON.stringify(payload)
                          })
                      );
                  }
              }
          }

          await Promise.all(promises);
          showAlert('success', dictionary.saved, `${modifiedStudents.length} ${dictionary.savedMessage}`);
          setStudents(curr => curr.map(s => ({ ...s, isModified: false })));

      } catch (error) {
          console.error("Kaydetme hatası:", error);
          showAlert('error', dictionary.error, "Kaydetme sırasında bir hata oluştu.");
      } finally {
          setSaving(false);
      }
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

  const stats = useMemo(() => {
    const total = filteredStudents.length;
    const present = filteredStudents.filter(s => {
        if (isBlockMode) {
            if (availableHours.length > 0) {
                return availableHours.every(h => s.AttendanceHistory?.[h] === true);
            } else {
                return s.AttendanceHistory?.["1"] === true;
            }
        } else {
            return availableHours.some(h => s.AttendanceHistory?.[h] === true);
        }
    }).length;
    
    const absent = total - present;
    return { total, present, absent };
  }, [filteredStudents, availableHours, isBlockMode]);

  const renderStudent = ({ item }: { item: Student }) => {
      const isAttendanceActive = !!generatedData; 

      let isAllPresent = false;
      if (isBlockMode) {
          if (availableHours.length > 0) {
              isAllPresent = availableHours.every(h => item.AttendanceHistory?.[h] === true);
          } else {
              isAllPresent = item.AttendanceHistory?.["1"] === true;
          }
      } else {
          isAllPresent = availableHours.every(h => item.AttendanceHistory?.[h] === true);
      }

      const StudentInfo = (
        <View className="flex-row items-center flex-1">
            <StudentAvatar imageCode={item.StudentImageCode} token={token} />
            <View className="ml-3 flex-1">
                <Text className="font-bold text-base text-slate-800" numberOfLines={1}>
                    {item.Name} {item.Surname}
                </Text>
                <Text className="text-slate-400 text-xs font-medium">{item.StudentNo}</Text>
            </View>
        </View>
      );

      if (isBlockMode) {
          return (
            <View className={`bg-white mx-5 mb-3 p-4 rounded-2xl border flex-row items-center justify-between ${isAttendanceActive ? 'border-slate-300' : 'border-slate-200'}`}>
                {StudentInfo}
                <TouchableOpacity 
                    onPress={() => toggleBlockAttendance(item.StudentId)}
                    disabled={!isAttendanceActive}
                    className={`ml-3 w-14 h-14 rounded-xl items-center justify-center border-2 ${
                        isAllPresent 
                            ? 'bg-green-600 border-green-700' 
                            : 'bg-white border-slate-300'
                    } ${!isAttendanceActive ? 'opacity-50' : ''}`} 
                >
                     {isAllPresent ? <CheckSquare size={28} color="white" /> : <Square size={28} color="#94a3b8" />}
                </TouchableOpacity>
            </View>
          );
      }

      return (
        <View className={`bg-white mx-5 mb-3 p-4 rounded-2xl border ${isAttendanceActive ? 'border-slate-300' : 'border-slate-200'}`}>
            <View className="flex-row items-center mb-4">
                 {StudentInfo}
            </View>
            <View className="flex-row flex-wrap gap-3">
                {availableHours.map(hour => {
                    const isPresent = item.AttendanceHistory?.[hour] === true;
                    const isHourEditable = isAttendanceActive && selectedHours.includes(hour);

                    return (
                        <TouchableOpacity
                            key={hour}
                            onPress={() => toggleAttendanceHour(item.StudentId, hour)}
                            disabled={!isHourEditable}
                            className={`w-12 h-12 rounded-xl items-center justify-center border-2 ${
                                isPresent 
                                    ? 'bg-green-600 border-green-700' 
                                    : 'bg-white border-slate-300'     
                            } ${!isHourEditable ? 'opacity-60' : ''}`}
                        >
                             <Text className={`font-bold text-lg ${isPresent ? 'text-white' : 'text-slate-600'}`}>
                                {hour}
                             </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
      );
  };

  const HeaderContent = (
    <View className="px-5 pt-4 pb-2">
        <View className="bg-white rounded-3xl p-5 border border-slate-300 mb-6">
            <View className="flex-row justify-between items-center mb-5">
                <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mr-3">
                        <Clock size={16} color="#2563eb" />
                    </View>
                    <View>
                        <Text className="text-slate-800 font-bold text-sm uppercase tracking-wide">
                            {dictionary.instructor?.hoursLabel || "Ders Ayarları"}
                        </Text>
                        <Text className="text-slate-400 text-[10px] font-bold">
                            {isBlockMode ? dictionary.instructor?.blockMode : dictionary.instructor?.hourMode}
                        </Text>
                    </View>
                </View>

                {canBeBlock && (
                    <View className="flex-row items-center bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                        <Text className={`text-xs font-bold mr-2 ${isBlockMode ? 'text-blue-600' : 'text-slate-400'}`}>
                            {dictionary.block}
                        </Text>
                        <Switch 
                            value={isBlockMode} 
                            onValueChange={(val) => {
                                if (isLockedBlockMode && !val) {
                                    showAlert('warning', dictionary.warning || "Uyarı", "Bu ders blok olarak işlendiği için saatlik sisteme çevrilemez.");
                                    return;
                                }
                                setIsBlockMode(val);
                                setSelectedHours(val ? [] : []);
                                setGeneratedData(null);
                            }}
                            trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
                            thumbColor={isBlockMode ? "#2563eb" : "#f8fafc"}
                        />
                    </View>
                )}
            </View>

            {availableHours.length > 0 && (
                <>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {availableHours.map((hour) => {
                            const isSelected = selectedHours.includes(hour);
                            const isDisabled = isBlockMode; 

                            return (
                                <TouchableOpacity
                                    key={hour}
                                    disabled={isDisabled}
                                    onPress={() => {
                                        setGeneratedData(null); 
                                        if (!isBlockMode) {
                                            setSelectedHours(selectedHours.includes(hour) ? [] : [hour]);
                                        }
                                    }}
                                    className={`h-11 min-w-[44px] px-3 rounded-xl items-center justify-center border-2 ${
                                        isSelected 
                                        ? 'bg-blue-600 border-blue-600' 
                                        : (isDisabled ? 'bg-slate-50 border-slate-200 opacity-50' : 'bg-slate-50 border-slate-200')
                                    }`}
                                >
                                    <Text className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                        {hour} {dictionary.hour || "Saat"}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <View className="h-[1px] bg-slate-100 mb-5" />
                </>
            )}

            <View className="flex-row gap-3">
                <TouchableOpacity 
                    onPress={() => handleGenerate()} 
                    disabled={!isBlockMode && selectedHours.length === 0}
                    className={`flex-1 py-3.5 rounded-xl items-center flex-row justify-center ${
                        (!isBlockMode && selectedHours.length === 0) ? 'bg-slate-300' : 'bg-slate-800'
                    }`}
                >
                    <Text className={`font-bold ${(!isBlockMode && selectedHours.length === 0) ? 'text-slate-500' : 'text-white'}`}>
                        {activeTab === 'QR' ? dictionary.createQR : dictionary.createCode}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-[50px] items-center">
                    <TouchableOpacity 
                        onPress={() => { setActiveTab('QR'); setGeneratedData(null); }} 
                        className={`h-full px-4 justify-center ${activeTab === 'QR' ? 'bg-white border-r border-slate-200' : ''}`}
                    >
                        <QrCode size={20} color={activeTab === 'QR' ? '#2563eb' : '#94a3b8'} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => { setActiveTab('CODE'); setGeneratedData(null); }} 
                        className={`h-full px-4 justify-center ${activeTab === 'CODE' ? 'bg-white border-l border-slate-200' : ''}`}
                    >
                        <Hash size={20} color={activeTab === 'CODE' ? '#2563eb' : '#94a3b8'} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>

        {qrLoading ? (
             <View className="mb-6 bg-white p-6 rounded-3xl border border-slate-200 items-center justify-center h-48">
                <ActivityIndicator size="large" color="#2563eb" />
             </View>
        ) : generatedData && (
            <View className="mb-6 bg-white p-6 rounded-3xl border border-blue-200 relative overflow-hidden">
                <View className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-10 -mt-10" />
                <View className="items-center">
                    {activeTab === 'QR' ? (
                        <View className="p-3 bg-white rounded-2xl border border-slate-100">
                            <QRCode value={generatedData} size={180} />
                        </View>
                    ) : (
                        <View className="py-4">
                            <Text className="text-slate-400 text-xs font-bold tracking-[6px] text-center mb-1">DERS KODU</Text>
                            <Text className="text-5xl font-black text-slate-800 tracking-widest">{generatedData}</Text>
                        </View>
                    )}
                    <Text className="text-slate-500 text-xs mt-4 text-center font-medium px-4">
                        {(dictionary.joinInfo || "Öğrenciler {0} derse katılabilir.").replace("{0}", activeTab === 'QR' ? (dictionary.joinWithQR || "QR kodu okutarak") : (dictionary.joinWithCode || "kodu girerek"))}
                    </Text>
                </View>
            </View>
        )}

        <View className="mb-2">
             <View className="flex-row justify-between items-center mb-3">
                 <View className="flex-row items-center">
                    <Text className="text-slate-800 font-bold text-lg mr-2">{dictionary.studentList}</Text>
                    <TouchableOpacity 
                        onPress={fetchStudents}
                        disabled={loadingStudents}
                        className="bg-slate-100 p-1.5 rounded-full border border-slate-200"
                    >
                        <RefreshCw size={16} color="#64748b" />
                    </TouchableOpacity>
                 </View>
                 
                 <View className="flex-row gap-2">
                    <View className="bg-white border border-slate-200 px-2 py-1 rounded-lg">
                        <Text className="text-slate-500 text-[10px] font-bold">{dictionary.absenteeism.total || "TOPLAM"}</Text>
                        <Text className="text-slate-800 text-xs font-bold text-center">{stats.total}</Text>
                    </View>
                    <View className="bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
                        <Text className="text-green-600 text-[10px] font-bold">{dictionary.absenteeism.attended || "GELEN"}</Text>
                        <Text className="text-green-800 text-xs font-bold text-center">{stats.present}</Text>
                    </View>
                     <View className="bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
                        <Text className="text-red-600 text-[10px] font-bold">{dictionary.absenteeism.absent || "GELMEYEN"}</Text>
                        <Text className="text-red-800 text-xs font-bold text-center">{stats.absent}</Text>
                    </View>
                 </View>
             </View>
             <View className="flex-row items-center bg-white border border-slate-300 rounded-xl px-3 h-12">
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
        <View className="px-4 py-3 flex-row items-center bg-white border-b border-slate-200 justify-between">
            <View className="flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-slate-50 rounded-full border border-slate-200 mr-3">
                    <ArrowLeft size={20} color="#334155" />
                </TouchableOpacity>
                <View>
                    <Text className="font-bold text-slate-800 text-lg">{dictionary.attendanceTitle}</Text>
                    <Text className="text-slate-400 text-[10px]">{courseName}</Text>
                </View>
            </View>
            <TouchableOpacity 
                onPress={handleSave} 
                disabled={saving}
                className="bg-blue-600 px-4 py-2 rounded-lg"
            >
                {saving ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Text className="text-white font-bold text-sm">{dictionary.save}</Text>
                )}
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

        <CustomAlert
            visible={alertConfig.visible}
            type={alertConfig.type}
            title={alertConfig.title}
            message={alertConfig.message}
            onConfirm={closeAlert}
            confirmText={dictionary.ok || "Tamam"}
        />
    </SafeAreaView>
  );
};