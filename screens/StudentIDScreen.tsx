import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, Dimensions, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCw, User, CreditCard, ShieldCheck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg'; // QR Kod için
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// API'den dönen veri tipi
interface CardData {
  ad: string;
  soyad: string;
  heX_KART_ID: string;
  identitY_NO: string;
  decimaL_KART_ID: number;
}

const { width } = Dimensions.get('window');

export const StudentIDScreen = () => {
  const navigation = useNavigation();
  const { userInfo } = useAuth(); // Kullanıcı bilgisini alıyoruz
  const { dictionary } = useLanguage();

  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Eğer AuthContext'te TC yoksa burayı test için elle doldurabilirsin:
  const tcNo = "15817094364"

  useEffect(() => {
    fetchCardInfo();
  }, []);

  const fetchCardInfo = async () => {
    if (!tcNo) {
        Alert.alert("Hata", "TC Kimlik numarası bulunamadı.");
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://perioapi.kastamonu.edu.tr/api/periokart/kart-listesi/${tcNo}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
      });

      const json = await response.json();

      // API bir dizi (array) dönüyor, ilk elemanı alıyoruz
      if (Array.isArray(json) && json.length > 0) {
        setCardData(json[0]);
      } else {
        setCardData(null);
      }

    } catch (error) {
      console.error("Kart bilgisi hatası:", error);
      Alert.alert("Hata", "Kart bilgileri alınırken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View className="px-5 py-4 bg-white flex-row items-center justify-between shadow-sm z-10">
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100 active:bg-slate-100"
      >
        <ArrowLeft size={20} color="#334155" />
      </TouchableOpacity>
      <Text className="text-lg font-bold text-slate-800">Dijital Kimlik</Text>
      <TouchableOpacity 
        onPress={fetchCardInfo}
        className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100 active:bg-slate-100"
      >
        <RefreshCw size={20} color="#334155" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {renderHeader()}

      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        
        {loading ? (
            <View className="mt-20 items-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-4 text-slate-500">Kart bilgileri yükleniyor...</Text>
            </View>
        ) : !cardData ? (
            <View className="mt-20 items-center px-6">
                <CreditCard size={64} color="#cbd5e1" />
                <Text className="mt-4 text-slate-800 font-bold text-lg text-center">Kart Bulunamadı</Text>
                <Text className="mt-2 text-slate-400 text-center">
                    Sistemde adınıza kayıtlı bir kart veya geçiş yetkisi bulunamadı.
                </Text>
            </View>
        ) : (
            <>
                {/* --- DİJİTAL KİMLİK KARTI TASARIMI --- */}
                <View 
                    className="w-full bg-blue-900 rounded-3xl overflow-hidden shadow-xl"
                    style={{ height: 240, elevation: 10 }} // Android gölgesi için
                >
                    {/* Arka Plan Deseni (Süsleme) */}
                    <View className="absolute top-0 right-0 w-40 h-40 bg-blue-800 rounded-full -mr-10 -mt-10 opacity-50" />
                    <View className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full -ml-10 -mb-10 opacity-20" />

                    {/* Kart İçeriği */}
                    <View className="flex-1 p-6 justify-between">
                        
                        {/* Üst Kısım: Logo ve Başlık */}
                        <View className="flex-row items-center gap-3">
                            <View className="w-12 h-12 bg-white rounded-full items-center justify-center">
                                {/* Logo yerine ikon veya image konabilir */}
                                <ShieldCheck size={24} color="#1e3a8a" />
                            </View>
                            <View>
                                <Text className="text-white font-bold text-sm opacity-80">T.C.</Text>
                                <Text className="text-white font-extrabold text-lg leading-6">KASTAMONU{"\n"}ÜNİVERSİTESİ</Text>
                            </View>
                        </View>

                        {/* Orta Kısım: Öğrenci Bilgisi */}
                        <View className="flex-row items-end justify-between mt-4">
                            <View>
                                <Text className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">ÖĞRENCİ / STUDENT</Text>
                                <Text className="text-white font-black text-2xl shadow-sm">
                                    {cardData.ad} {cardData.soyad}
                                </Text>
                                <Text className="text-blue-100 font-medium text-sm mt-1 letter-spacing-1">
                                    {cardData.identitY_NO}
                                </Text>
                            </View>
                        </View>
                        
                    </View>

                    {/* Alt Şerit */}
                    <View className="h-2 bg-red-600 w-full" />
                </View>

                {/* --- QR KOD ALANI --- */}
                <View className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 items-center w-full">
                    <Text className="text-slate-400 font-bold text-xs uppercase mb-4 tracking-widest">
                        TURNİKE GEÇİŞ KODU
                    </Text>
                    
                    {/* QR Kodun Kendisi */}
                    <View className="p-2 border-2 border-slate-100 rounded-xl">
                        <QRCode
                            value={cardData.decimaL_KART_ID.toString()} // Kartın Hex ID'sini QR'a çeviriyoruz
                            size={180}
                            color="black"
                            backgroundColor="white"
                        />
                    </View>

                    <Text className="text-slate-800 font-bold text-lg mt-4">
                        {cardData.decimaL_KART_ID}
                    </Text>
                    <Text className="text-slate-400 text-xs text-center mt-2 px-4">
                        Bu QR kodu üniversite giriş turnikelerinde ve yemekhanelerde okutarak geçiş yapabilirsiniz.
                    </Text>
                </View>
            </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};