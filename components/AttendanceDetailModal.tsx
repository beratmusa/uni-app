import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Alert } from 'react-native';
import { FileText, CheckCircle2, XCircle, Calendar, X, PieChart, Clock } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface Course {
  LessonCode: string;
  LessonName: string;
  ClassId: number;
  TeacherName?: string;
}

interface AttendanceRecord {
  Id: number;
  CourseDate: string;
  IsAttended: boolean;
  ScheduleOrder: number;
  IsBlock: boolean;
  ClassId: number; 
}

interface Props {
  course: Course;
  onClose: () => void;
}

export const AttendanceDetailModal = ({ course, onClose }: Props) => {
  const { token } = useAuth();
  const { dictionary, language } = useLanguage();
  
  const [data, setData] = useState<AttendanceRecord[] | null>(null);
  const [loading, setLoading] = useState(true);

  const t = dictionary.absenteeism || {
    modalTitle: "Devamsızlık Detayı",
    total: "TOPLAM",
    attended: "KATILDI",
    absent: "YOK",
    hour: "Saat",
    rate: "Devam Oranı",
    rule: "%70 zorunluluğu baz alınmıştır.",
    weekly: "Haftalık Döküm",
    present: "Var",
    absentStatus: "Yok",
    lessonHour: "Ders Saati",
    noData: "Kayıt bulunamadı.",
    calculating: "Veriler alınıyor...",
    error: "Hata oluştu."
  };

  // --- VERİ ÇEKME VE SIKI FİLTRELEME ---
  useEffect(() => {
    let isMounted = true; 

    const fetchData = async () => {
      try {
        if (isMounted) {
            setData(null); 
            setLoading(true);
        }

        console.log(`🔍 İSTENEN DERS: ${course.LessonName} (ID: ${course.ClassId})`);
        
        const url = `https://mobil.kastamonu.edu.tr/api/Student/GetMyAttendanceHistory?classId=${course.ClassId}&_t=${Date.now()}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store'
          },
          body: JSON.stringify({ 
              classId: course.ClassId,
              ClassId: course.ClassId 
          })
        });

        const json = await response.json();
        
        if (isMounted) {
            if (json.Data && Array.isArray(json.Data)) {

                if (json.Data.length > 0) {
                    console.log(`📦 API'DEN GELEN İLK KAYIT ID: ${json.Data[0].ClassId}`);
                }


                const correctData = json.Data.filter((record: AttendanceRecord) => {
                    const isMatch = String(record.ClassId) === String(course.ClassId);
                    return isMatch;
                });

                console.log(`🛡️ FİLTRE SONUCU: API ${json.Data.length} veri gönderdi, ${correctData.length} tanesi bu derse ait.`);

                setData(correctData);
            } else {
                setData([]);
            }
        }
      } catch (error) {
        if (isMounted) {
            console.error("Hata:", error);
            setData([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [course.ClassId]); 

  // --- İSTATİSTİK HESAPLAMA ---
  const stats = (() => {
    if (!data || data.length === 0) return { total: 0, attended: 0, absent: 0, percentage: "0", percentageNum: 0 };
    
    const total = data.length;
    const attended = data.filter(r => r.IsAttended).length;
    const absent = total - attended;
    
    let percentageNum = 0;
    if (total > 0) percentageNum = (attended / total) * 100;

    const percentage = Number.isInteger(percentageNum) ? percentageNum.toString() : percentageNum.toFixed(1);
    
    return { total, attended, absent, percentage, percentageNum };
  })();

  const groupedData = (() => {
    if (!data) return {};
    const groups: { [key: string]: AttendanceRecord[] } = {};
    data.forEach(record => {
        const d = record.CourseDate ? record.CourseDate.split('T')[0] : "Bilinmiyor";
        if (!groups[d]) groups[d] = [];
        groups[d].push(record);
    });
    return groups;
  })();

  const sortedDates = Object.keys(groupedData).sort((a, b) => b.localeCompare(a));
  const isPassing = stats.percentageNum >= 70;

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-slate-50">
         {/* HEADER */}
         <View className="bg-white px-5 py-4 flex-row items-center justify-between border-b border-slate-100 shadow-sm z-20">
            <View className="flex-1 pr-4">
                <Text className="text-lg font-extrabold text-slate-800 leading-6" numberOfLines={2}>
                    {course.LessonName}
                </Text>
                <View className="flex-row items-center mt-1">
                    <Clock size={12} color="#64748b" className="mr-1"/>
                    <Text className="text-slate-500 text-xs font-medium">{t.modalTitle}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={onClose} className="bg-slate-100 p-2.5 rounded-full">
                <X size={24} color="#64748b" />
            </TouchableOpacity>
        </View>

        {/* LOADING veya İÇERİK */}
        {loading || data === null ? (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-3 text-slate-500 font-medium">{t.calculating}</Text>
            </View>
        ) : (
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                {/* 1. KARTLAR */}
                <View className="flex-row gap-3 mb-6">
                    {/* Toplam */}
                    <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm items-center border border-slate-100 justify-center">
                        <View className="bg-slate-50 p-2 rounded-full mb-2"><PieChart size={18} color="#64748b" /></View>
                        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">{t.total}</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-2xl font-black text-slate-800">{stats.total}</Text>
                            <Text className="text-[10px] text-slate-400 ml-1">{t.hour}</Text>
                        </View>
                    </View>
                    {/* Katıldı */}
                    <View className="flex-1 p-4 rounded-2xl shadow-sm items-center border border-green-100 justify-center bg-green-50/50">
                        <View className="bg-green-100 p-2 rounded-full mb-2"><CheckCircle2 size={18} color="#16a34a" /></View>
                        <Text className="text-green-600 text-[10px] font-bold uppercase tracking-wider mb-0.5">{t.attended}</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-2xl font-black text-green-700">{stats.attended}</Text>
                            <Text className="text-[10px] text-green-600/70 ml-1">{t.hour}</Text>
                        </View>
                    </View>
                    {/* Yok */}
                    <View className="flex-1 p-4 rounded-2xl shadow-sm items-center border border-red-100 justify-center bg-red-50/50">
                        <View className="bg-red-100 p-2 rounded-full mb-2"><XCircle size={18} color="#dc2626" /></View>
                        <Text className="text-red-600 text-[10px] font-bold uppercase tracking-wider mb-0.5">{t.absent}</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-2xl font-black text-red-700">{stats.absent}</Text>
                            <Text className="text-[10px] text-red-600/70 ml-1">{t.hour}</Text>
                        </View>
                    </View>
                </View>

                {/* 2. YÜZDE */}
                <View className="bg-white p-5 rounded-3xl shadow-sm mb-8 border border-slate-100">
                    <View className="flex-row justify-between mb-3 items-end">
                        <View>
                            <Text className="font-bold text-slate-700 text-sm mb-1">{t.rate}</Text>
                            <Text className="text-xs text-slate-400 font-medium">{t.rule}</Text>
                        </View>
                        <Text className={`font-black text-4xl ${!isPassing ? 'text-red-600' : 'text-green-600'}`}>
                            %{stats.percentage}
                        </Text>
                    </View>
                    <View className="h-4 bg-slate-100 rounded-full overflow-hidden w-full relative border border-slate-200">
                        <View 
                            className={`h-full rounded-full ${!isPassing ? 'bg-red-500' : 'bg-green-500'} shadow-sm`} 
                            style={{ width: `${Math.min(Math.max(stats.percentageNum, 0), 100)}%` as any }} 
                        />
                    </View>
                </View>

                {/* 3. LİSTE */}
                <View className="flex-row items-center mb-4 ml-1">
                    <Calendar size={18} color="#334155" />
                    <Text className="text-slate-800 font-bold text-lg ml-2">{t.weekly}</Text>
                </View>

                {(!data || data.length === 0) ? (
                    <View className="bg-white p-10 rounded-3xl items-center border border-slate-100 border-dashed justify-center">
                        <FileText size={40} color="#cbd5e1" className="mb-3"/>
                        <Text className="text-slate-400 text-center font-medium">{t.noData}</Text>
                    </View>
                ) : (
                    sortedDates.map((date, index) => {
                        const dayRecords = groupedData[date];
                        let formattedDate = date;
                        try {
                             const locale = language === 'en' ? 'en-US' : 'tr-TR';
                             formattedDate = new Date(date).toLocaleDateString(locale, { day: 'numeric', month: 'long', weekday: 'long' });
                        } catch(e){}

                        return (
                            <View key={index} className="bg-white mb-5 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                <View className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex-row items-center justify-between">
                                    <Text className="font-bold text-slate-700 text-sm capitalize">{formattedDate}</Text>
                                    <View className="bg-white px-2 py-1 rounded-md border border-slate-200">
                                        <Text className="text-[10px] font-bold text-slate-500">{dayRecords.length} {t.hour}</Text>
                                    </View>
                                </View>
                                <View className="px-2">
                                    {dayRecords.map((record, rIndex) => (
                                        <View key={record.Id} className={`flex-row items-center justify-between p-3 ${rIndex !== dayRecords.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                            <View className="flex-row items-center">
                                                <View className="w-9 h-9 bg-blue-50 rounded-xl items-center justify-center mr-3 border border-blue-100">
                                                    <Text className="font-bold text-blue-600 text-sm">{record.ScheduleOrder}</Text>
                                                </View>
                                                <Text className="text-slate-600 font-semibold text-sm">{t.lessonHour}</Text>
                                            </View>
                                            <View className={`px-3 py-1.5 rounded-lg flex-row items-center border ${record.IsAttended ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                                {record.IsAttended ? (
                                                    <><CheckCircle2 size={14} color="#16a34a" className="mr-1.5" /><Text className="text-green-700 text-xs font-bold">{t.present}</Text></>
                                                ) : (
                                                    <><XCircle size={14} color="#dc2626" className="mr-1.5" /><Text className="text-red-700 text-xs font-bold">{t.absentStatus}</Text></>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        );
                    })
                )}
                <View className="h-10" />
            </ScrollView>
        )}
      </View>
    </Modal>
  );
};