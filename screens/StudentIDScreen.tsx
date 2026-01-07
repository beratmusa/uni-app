import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, GraduationCap } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

// API'den dönen veri yapısı
interface CardData {
  ad: string;
  soyad: string;
  heX_KART_ID: string;      // QR Kod için kullanılacak
  identitY_NO: string;      // TC No
  decimaL_KART_ID: number;  // Kart Numarası
}

export const StudentIDScreen = () => {
  // Navigasyon hatası alıyorsanız App.tsx'te NavigationContainer içinde olduğundan emin olun.
  const navigation = useNavigation(); 
  const { dictionary } = useLanguage();
  
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);

  // --- DİNAMİK TC DEĞİŞKENİ ---
  // Buraya test için geçerli bir TC veya öğrenciye ait bir veri girin.
  const DYNAMIC_TC_NO = "15817094364"; 

  const t = dictionary.idCard || {
    title: "Dijital Kimlik",
    uniName: "KASTAMONU ÜNİVERSİTESİ",
    cardType: "KİMLİK KARTI",
    studentNo: "Öğrenci No",
    tcNo: "T.C. Kimlik No",
    faculty: "Fakülte / Bölüm",
    active: "Aktif Öğrenci",
    scan: "Doğrulama için okutunuz",
    cardId: "Kart No",
    loading: "Kart bilgileri yükleniyor...",
    error: "Kart bilgisi bulunamadı."
  };

  useEffect(() => {
    fetchCardInfo();
  }, []);

  const fetchCardInfo = async () => {
    if (!DYNAMIC_TC_NO) return;

    try {
      setLoading(true);
      // API İsteği
      const response = await fetch(`https://perioapi.kastamonu.edu.tr/api/periokart/kart-listesi/${DYNAMIC_TC_NO}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
      });

      const json = await response.json();

      // API dizi döndüğü için ilk elemanı alıyoruz
      if (Array.isArray(json) && json.length > 0) {
        setCardData(json[0]);
      } else {
        setCardData(null);
        // Alert.alert("Bilgi", "Bu TC numarasına ait kart bulunamadı.");
      }

    } catch (error) {
      console.error("Kart hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      
      {/* HEADER */}
      <View className="px-4 py-3 bg-white flex-row items-center justify-between shadow-sm z-10">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100 active:bg-slate-100"
        >
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">{t.title}</Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center opacity-50">
             <Share2 size={20} color="#334155" />
        </TouchableOpacity>
      </View>

     <ScrollView 
        contentContainerStyle={{ 
            flexGrow: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: 20,
            paddingBottom: 40 
        }}
      >
        
        {/* --- YÜKLENİYOR DURUMU --- */}
        {loading ? (
            <View className="items-center justify-center">
                <ActivityIndicator size="large" color="#b91c1c" />
                <Text className="mt-4 text-slate-500">{t.loading}</Text>
            </View>
        ) : !cardData ? (
            // --- VERİ YOKSA ---
            <View className="items-center justify-center opacity-50">
                 <GraduationCap size={64} color="#cbd5e1" />
                 <Text className="mt-4 text-slate-400 font-bold">{t.error}</Text>
                 <Text className="text-xs text-slate-400 mt-1">TC: {DYNAMIC_TC_NO}</Text>
            </View>
        ) : (
            // --- KİMLİK KARTI (Veri varsa) ---
            <View 
                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200"
                style={{ width: width - 40 }} 
            >
                
                {/* BAŞLIK ALANI (Kırmızı) */}
                <View className="bg-red-700 p-6 items-center justify-center">
                    <View className="bg-white/20 p-3 rounded-full mb-3">
                        <GraduationCap size={32} color="white" />
                    </View>
                    <Text className="text-white font-bold text-lg text-center uppercase">
                        {t.uniName}
                    </Text>
                    <View className="mt-2 bg-white/20 px-3 py-1 rounded-md">
                        <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                            {t.cardType}
                        </Text>
                    </View>
                </View>

                {/* ÖĞRENCİ BİLGİLERİ */}
                <View className="items-center py-6 border-b border-slate-100 px-4">
                    {/* İsim Soyisim */}
                    <Text className="text-2xl font-black text-slate-800 text-center uppercase mb-2">
                        {cardData.ad} {cardData.soyad}
                    </Text>
                    
                    {/* TC Kimlik No */}
                    <View className="bg-slate-100 px-3 py-1 rounded-md mb-2">
                        <Text className="text-slate-500 font-bold text-xs tracking-widest">
                            {cardData.identitY_NO}
                        </Text>
                    </View>

                    {/* Kart Numarası (Decimal) */}
                    <Text className="text-slate-400 text-[10px] font-medium uppercase">
                        {t.cardId}: {cardData.decimaL_KART_ID}
                    </Text>
                </View>

                
                {/* QR KOD ALANI */}
                <View className="bg-slate-50 p-8 items-center justify-center">
                    <View className="bg-white p-3 rounded-xl shadow-sm mb-4 border border-slate-100">
                        {/* QR Kodun düzgün çalışması için heX_KART_ID'nin dolu olması gerekir */}
                        {cardData.heX_KART_ID ? (
                            <QRCode 
                                value={cardData.heX_KART_ID} 
                                size={200} 
                                color="black" 
                                backgroundColor="white"
                            />
                        ) : (
                            <Text className="text-red-500 text-xs">QR Kod Verisi Yok</Text>
                        )}
                    </View>
                    <Text className="text-slate-400 text-[10px] text-center uppercase tracking-wide">
                        {t.scan}
                    </Text>
                    <Text className="text-slate-300 text-[9px] text-center font-mono mt-1">
                        HEX: {cardData.heX_KART_ID}
                    </Text>
                </View>

            </View>
        )}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};