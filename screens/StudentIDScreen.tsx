import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, GraduationCap, User, QrCode } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');
const BASE_URL = "https://kastamonu.edu.tr"; 

export const StudentIDScreen = () => {
  const navigation = useNavigation();
  const { userInfo } = useAuth();
  const { dictionary } = useLanguage();

  // Dil verilerini güvenli çekelim
  const t = dictionary.idCard || {
    title: "Dijital Kimlik",
    uniName: "KASTAMONU ÜNİVERSİTESİ",
    cardType: "ÖĞRENCİ KİMLİK KARTI",
    studentNo: "Öğrenci No",
    tcNo: "T.C. Kimlik No",
    faculty: "Fakülte / Bölüm",
    active: "Aktif Öğrenci",
    scan: "Doğrulama için okutunuz"
  };

  // Resim URL Düzeltici
  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; 
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BASE_URL}/${cleanPath}`;
  };

  const photoUri = getImageUrl(userInfo?.Image);

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

      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        
        {/* --- KİMLİK KARTI --- */}
        <View 
            className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200"
            style={{ width: width - 40 }} // Genişlik ekranın tamamını kaplasın (kenar boşlukları hariç)
        >
            
            {/* 1. KIRMIZI BAŞLIK ALANI */}
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

            {/* 2. FOTOĞRAF VE İSİM ALANI */}
            <View className="items-center py-6 border-b border-slate-100">
                {/* Fotoğraf Çerçevesi */}
                <View className="p-1 border-2 border-red-100 rounded-full mb-4">
                    {photoUri ? (
                        <Image 
                            source={{ uri: photoUri }} 
                            className="w-28 h-28 rounded-full bg-slate-100"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-28 h-28 rounded-full bg-slate-100 items-center justify-center">
                             <User size={48} color="#94a3b8" />
                        </View>
                    )}
                </View>

                {/* İsim Soyisim */}
                <Text className="text-xl font-bold text-slate-800 text-center uppercase px-4">
                    {userInfo?.TitleNameSurname || "Öğrenci Adı"}
                </Text>
                
                {/* Aktiflik Rozeti */}
                <View className="mt-2 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                    <Text className="text-emerald-700 text-xs font-bold uppercase">
                        {t.active}
                    </Text>
                </View>
            </View>

            {/* 3. BİLGİ LİSTESİ */}
            <View className="p-6 gap-y-4">
                
                {/* Öğrenci No */}
                <View className="flex-row justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <Text className="text-slate-500 text-xs font-bold uppercase">{t.studentNo}</Text>
                    <Text className="text-slate-800 text-sm font-bold">{userInfo?.PersonId || "---"}</Text>
                </View>

                {/* TC No */}
                <View className="flex-row justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <Text className="text-slate-500 text-xs font-bold uppercase">{t.tcNo}</Text>
                    <Text className="text-slate-800 text-sm font-bold">***********</Text>
                </View>

                {/* Bölüm */}
                <View className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <Text className="text-slate-500 text-xs font-bold uppercase mb-1">{t.faculty}</Text>
                    <Text className="text-slate-800 text-sm font-bold">
                        Mühendislik ve Mimarlık Fakültesi
                    </Text>
                    <Text className="text-slate-600 text-xs font-medium mt-0.5">
                        Bilgisayar Mühendisliği
                    </Text>
                </View>

            </View>

            {/* 4. QR KOD ALANI (Alt Kısım) */}
            <View className="bg-slate-50 p-6 items-center justify-center">
                <View className="bg-white p-2 rounded-lg mb-3">
                    <QRCode 
                        value={userInfo?.PersonId?.toString() || "000000"} 
                        size={100} 
                        color="black" 
                        backgroundColor="white"
                    />
                </View>
                <Text className="text-slate-400 text-[10px] text-center uppercase tracking-wide">
                    {t.scan}
                </Text>
            </View>

        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};