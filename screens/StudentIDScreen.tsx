import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCw, CreditCard, ShieldCheck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// --- API VERİ TİPİ ---
interface CardData {
  ad: string;
  soyad: string;
  kategori: string;       
  nO_SICIL: string;       
  heX_KART_ID: string;    
  decimaL_KART_ID: number;
}

const { width } = Dimensions.get('window');

export const StudentIDScreen = () => {
  const navigation = useNavigation();
  const { userInfo } = useAuth(); 
  const { dictionary } = useLanguage();
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // NOT: Burası AuthContext'ten gelen gerçek veriyle doldurulmalı.
  const no = "214410062"; 

  useEffect(() => {
    fetchCardInfo();
  }, []);

  const fetchCardInfo = async () => {
    if (!no) {
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://perioapi.kastamonu.edu.tr/api/periokart/kart-bilgisi/${no}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
      });

      const json = await response.json();

      if (Array.isArray(json) && json.length > 0) {
        setCardData(json[0]);
      } else {
        setCardData(null);
      }

    } catch (error) {
      console.error("Kart bilgisi hatası:", error);
      Alert.alert(dictionary.idCard.fetchErrorTitle, dictionary.idCard.fetchErrorMessage);
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
      <Text className="text-lg font-bold text-slate-800">{dictionary.idCard.title}</Text>
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
                <Text className="mt-4 text-slate-500">{dictionary.idCard.loading}</Text>
            </View>
        ) : !cardData ? (
            <View className="mt-20 items-center px-6">
                <CreditCard size={64} color="#cbd5e1" />
                <Text className="mt-4 text-slate-800 font-bold text-lg text-center">
                    {dictionary.idCard.notFoundTitle}
                </Text>
                <Text className="mt-2 text-slate-400 text-center">
                   {!no ? dictionary.idCard.missingIdError : dictionary.idCard.noRecordError}
                </Text>
            </View>
        ) : (
            <>
                {/* --- DİJİTAL KİMLİK KARTI TASARIMI --- */}
                <View 
                    className="w-full bg-blue-900 rounded-3xl overflow-hidden shadow-xl"
                    style={{ height: 240, elevation: 10 }}
                >
                    {/* Arka Plan Deseni */}
                    <View className="absolute top-0 right-0 w-40 h-40 bg-blue-800 rounded-full -mr-10 -mt-10 opacity-50" />
                    <View className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full -ml-10 -mb-10 opacity-20" />

                    {/* Kart İçeriği */}
                    <View className="flex-1 p-6 justify-between">
                        
                        {/* Üst Kısım: Logo ve Başlık */}
                        <View className="flex-row items-center gap-3">
                            <View className="w-12 h-12 bg-white rounded-full items-center justify-center">
                                <ShieldCheck size={24} color="#1e3a8a" />
                            </View>
                            <View>
                                <Text className="text-white font-bold text-sm opacity-80">{dictionary.idCard.tcLabel}</Text>
                                <Text className="text-white font-extrabold text-lg leading-6">{dictionary.idCard.uniName}</Text>
                            </View>
                        </View>

                        {/* Orta Kısım: Öğrenci Bilgisi */}
                        <View className="flex-row items-end justify-between mt-4">
                            <View>
                                {/* Kategori API'den gelir, çevrilmez ise olduğu gibi gösterilir */}
                                <Text className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">
                                    {cardData.kategori?.trim() || "ÖĞRENCİ"}
                                </Text>
                                <Text className="text-white font-black text-2xl shadow-sm">
                                    {cardData.ad} {cardData.soyad}
                                </Text>
                                {/* Öğrenci Numarası */}
                                <Text className="text-blue-100 font-medium text-sm mt-1 letter-spacing-1">
                                    {cardData.nO_SICIL}
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
                        {dictionary.idCard.accessCodeLabel}
                    </Text>
                    
                    {/* QR Kodun Kendisi */}
                    <View className="p-2 border-2 border-slate-100 rounded-xl">
                        <QRCode
                            value={cardData.decimaL_KART_ID.toString()} 
                            size={180}
                            color="black"
                            backgroundColor="white"
                        />
                    </View>

                    <Text className="text-slate-800 font-bold text-lg mt-4">
                        {cardData.decimaL_KART_ID}
                    </Text>
                    <Text className="text-slate-400 text-xs text-center mt-2 px-4">
                        {dictionary.idCard.qrDesc}
                    </Text>
                </View>
            </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};