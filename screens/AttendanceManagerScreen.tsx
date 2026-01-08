import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator,Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QrCode, Hash, ArrowLeft, Check, Clock, Layers } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, useRoute } from '@react-navigation/native';

// --- Gelen Veri Tipi ---
interface RouteParams {
  classId: number;
  scheduleId: number;
  courseName: string;
  courseHours: { [key: string]: string };
}
const size = Math.min(Dimensions.get('window').width * 0.6, 280);


export const AttendanceManagerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Parametreleri route hook'undan alıyoruz
  const params = route.params as RouteParams;
  const courseName = params?.courseName || "Ders Yönetimi";
  
  
  // Ders saatlerini key dizisine çevir (Örn: ["1", "2", "3"])
  const availableHours = Object.keys(params?.courseHours || {}).filter(k => k !== "0").sort();

  // --- STATE ---
  const [selectedHours, setSelectedHours] = useState<string[]>([]); // Seçili saatler
  const [isBlockMode, setIsBlockMode] = useState(false); // Blok modu
  const [activeTab, setActiveTab] = useState<'QR' | 'CODE'>('QR'); // QR mı Kod mu?
  const [generatedData, setGeneratedData] = useState<string | null>(null); // Üretilen Kod/QR verisi
  const [loading, setLoading] = useState(false);

  // --- MANTIK ---
  
  // Saat seçimi
  const toggleHour = (hour: string) => {
    setGeneratedData(null); // Yeni seçim yapınca eski kodu temizle
    if (isBlockMode) {
        // Blok modundaysa birine basınca hepsini seç/kaldır
        if (selectedHours.length === availableHours.length) {
            setSelectedHours([]);
        } else {
            setSelectedHours([...availableHours]);
        }
    } else {
        // Tekli seçim
        if (selectedHours.includes(hour)) {
            setSelectedHours(selectedHours.filter(h => h !== hour));
        } else {
            setSelectedHours([...selectedHours, hour]);
        }
    }
  };

  // Blok Modu değişince
  const handleBlockSwitch = (val: boolean) => {
      setIsBlockMode(val);
      setGeneratedData(null);
      if (val) {
          setSelectedHours([...availableHours]); // Blok açılınca hepsini seç
      } else {
          setSelectedHours([]); // Blok kapanınca sıfırla
      }
  };

  // Üret Butonu (API İsteği Buraya Gelecek)
  const handleGenerate = async () => {
    if (selectedHours.length === 0) {
        Alert.alert("Uyarı", "Lütfen en az bir ders saati seçiniz.");
        return;
    }

    setLoading(true);
    
    // --- SİMÜLASYON API İSTEĞİ ---
    // Burada "StartAttendance" servisine classId, scheduleId ve selectedHours gönderilecek.
    setTimeout(() => {
        if (activeTab === 'QR') {
            // API'den dönen QR string (veya URL)
            const randomString = `UBYS-QR-${params.classId}-${Math.random().toString(36).substring(7)}`;
            setGeneratedData(randomString);
        } else {
            // API'den dönen 6 haneli kod
            const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedData(randomCode);
        }
        setLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      
      {/* HEADER */}
      <View className="px-4 py-3 flex-row items-center bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-slate-50 rounded-full border border-slate-100 mr-3">
            <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        <View>
            <Text className="font-bold text-slate-800 text-lg">Yoklama Yönet</Text>
            <Text className="text-slate-400 text-xs">{courseName}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">

        {/* 1. SEKSİYON: SAAT SEÇİMİ */}
        <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-slate-800 font-bold text-base flex-row items-center">
                    <Clock size={16} className="text-slate-400 mr-2" /> Ders Saatleri
                </Text>
                
                {/* Blok Modu Switch */}
                <View className="flex-row items-center bg-white px-3 py-1.5 rounded-full border border-slate-200">
                    <Text className={`text-xs font-bold mr-2 ${isBlockMode ? 'text-blue-600' : 'text-slate-400'}`}>
                        Blok Ders
                    </Text>
                    <Switch 
                        value={isBlockMode} 
                        onValueChange={handleBlockSwitch}
                        trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
                        thumbColor={isBlockMode ? "#2563eb" : "#f8fafc"}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                </View>
            </View>

            {/* Saat Butonları */}
            <View className="flex-row flex-wrap gap-3">
                {availableHours.map((hour) => {
                    const isSelected = selectedHours.includes(hour);
                    return (
                        <TouchableOpacity
                            key={hour}
                            onPress={() => toggleHour(hour)}
                            className={`w-14 h-14 rounded-2xl items-center justify-center border-2 ${
                                isSelected 
                                ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200' 
                                : 'bg-white border-slate-200'
                            }`}
                        >
                            <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                {hour}
                            </Text>
                            {isSelected && (
                                <View className="absolute -top-2 -right-2 bg-green-500 rounded-full p-0.5 border-2 border-white">
                                    <Check size={10} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>

        {/* 2. SEKSİYON: YÖNTEM SEÇİMİ (QR / KOD) */}
        <View className="mb-6 bg-white p-1 rounded-2xl border border-slate-200 flex-row">
            <TouchableOpacity 
                onPress={() => { setActiveTab('QR'); setGeneratedData(null); }}
                className={`flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2 ${activeTab === 'QR' ? 'bg-slate-800 shadow-sm' : ''}`}
            >
                <QrCode size={18} color={activeTab === 'QR' ? 'white' : '#64748b'} />
                <Text className={`font-bold ${activeTab === 'QR' ? 'text-white' : 'text-slate-500'}`}>QR Kod</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={() => { setActiveTab('CODE'); setGeneratedData(null); }}
                className={`flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2 ${activeTab === 'CODE' ? 'bg-slate-800 shadow-sm' : ''}`}
            >
                <Hash size={18} color={activeTab === 'CODE' ? 'white' : '#64748b'} />
                <Text className={`font-bold ${activeTab === 'CODE' ? 'text-white' : 'text-slate-500'}`}>Şifre</Text>
            </TouchableOpacity>
        </View>

        {/* 3. SEKSİYON: SONUÇ ALANI */}
        <View className="items-center justify-center min-h-[250px] bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-24">
            {loading ? (
                <View className="items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text className="mt-4 text-slate-400 text-xs font-medium">Oluşturuluyor...</Text>
                </View>
            ) : generatedData ? (
                // --- SONUÇ VARSA GÖSTER ---
                <View className="items-center w-full">
                    {activeTab === 'QR' ? (
                        <View className="p-4 bg-white border-2 border-slate-100 rounded-2xl">
                             <QRCode value={generatedData} size={size} />
                        </View>
                    ) : (
                        <View className="items-center py-8">
                            <Text className="text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">Ders Şifresi</Text>
                            <Text className="text-6xl font-black text-slate-800 tracking-widest">{generatedData}</Text>
                        </View>
                    )}
                    <Text className="mt-6 text-center text-slate-400 text-xs px-8">
                        {activeTab === 'QR' 
                            ? "Öğrenciler mobil uygulamadan bu QR kodu okutarak derse katılabilirler." 
                            : "Öğrenciler bu kodu girerek derse katılabilirler."}
                    </Text>
                </View>
            ) : (
                // --- HENÜZ OLUŞTURULMADIYSA ---
                <View className="items-center opacity-50">
                    <Layers size={48} color="#cbd5e1" />
                    <Text className="text-slate-400 text-sm font-medium mt-4 text-center">
                        Yukarıdan saatleri seçin ve{'\n'}yoklamayı başlatın.
                    </Text>
                </View>
            )}
        </View>

      </ScrollView>

      {/* FOOTER BUTON */}
      {!generatedData && (
          <View className="absolute bottom-8 left-5 right-5">
            <TouchableOpacity
                onPress={handleGenerate}
                disabled={selectedHours.length === 0}
                className={`py-4 rounded-2xl shadow-lg flex-row items-center justify-center ${
                    selectedHours.length === 0 
                    ? 'bg-slate-300 shadow-none' 
                    : 'bg-blue-600 shadow-blue-300'
                }`}
            >
                {activeTab === 'QR' ? <QrCode size={20} color="white" /> : <Hash size={20} color="white" />}
                <Text className="text-white font-bold text-lg ml-3">
                    {activeTab === 'QR' ? 'QR Oluştur' : 'Kod Oluştur'}
                </Text>
            </TouchableOpacity>
          </View>
      )}

    </SafeAreaView>
  );
};