import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, QrCode, Share2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext'; // Kullanıcı bilgilerini buradan alacağız

const { width } = Dimensions.get('window');

export const StudentIDScreen = () => {
  const navigation = useNavigation();
  const { userInfo } = useAuth(); // Giriş yapmış kullanıcı bilgileri

  // Varsayılan Fotoğraf (Eğer kullanıcı fotosu yoksa)
  const userImage = userInfo?.Image 
    ? { uri: userInfo.Image } 
    : { uri: 'https://via.placeholder.com/150' };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 relative">
      
      {/* HEADER */}
      <View className="px-4 py-3 bg-white flex-row items-center justify-between shadow-sm z-10">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100 active:bg-slate-100"
        >
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Öğrenci Kimlik Kartı</Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
             <Share2 size={20} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* İÇERİK - KİMLİK KARTI */}
      <View className="flex-1 items-center justify-center p-4">
        
        {/* KART ÇERÇEVESİ */}
        <View 
            className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200"
            style={{ width: width - 40, height: 550 }} // Kart boyutu
        >
            {/* 1. ÜST KIRMIZI ŞERİT (LOGO ALANI) */}
            <View className="bg-[#dc2626] h-32 items-center justify-center relative">
                {/* Arka plan deseni veya logo */}
                <View className="absolute w-64 h-64 bg-white/10 rounded-full -top-32 -left-10" />
                <View className="absolute w-40 h-40 bg-white/10 rounded-full top-10 -right-10" />
                
                <Text className="text-white/80 font-bold text-lg text-center mt-2 uppercase tracking-widest">
                    Kastamonu Üniversitesi
                </Text>
                <Text className="text-white/80 text-xs font-medium uppercase tracking-widest">
                    Öğrenci Kimlik Kartı
                </Text>
            </View>

            {/* 2. FOTOĞRAF ALANI (YUVARLAK VE ORTADA) */}
            <View className="items-center -mt-16 z-10">
                <View className="p-1.5 bg-white rounded-full shadow-md">
                    <Image 
                        source={userImage} 
                        className="w-32 h-32 rounded-full bg-slate-200"
                        resizeMode="cover"
                    />
                </View>
            </View>

            {/* 3. ÖĞRENCİ BİLGİLERİ */}
            <View className="items-center mt-4 px-6">
                <Text className="text-2xl font-bold text-slate-900 text-center mb-1">
                    {userInfo?.TitleNameSurname || "Ad Soyad"}
                </Text>
                <Text className="text-slate-500 font-medium text-sm mb-6">
                    Öğrenci
                </Text>

                {/* Bilgi Satırları */}
                <View className="w-full gap-y-4">
                    <View className="flex-row justify-between border-b border-slate-100 pb-2">
                        <Text className="text-slate-400 font-medium text-xs">Öğrenci No</Text>
                        <Text className="text-slate-800 font-bold text-sm">
                            {userInfo?.PersonId || "220000000"}
                        </Text>
                    </View>
                    <View className="flex-row justify-between border-b border-slate-100 pb-2">
                        <Text className="text-slate-400 font-medium text-xs">TC Kimlik No</Text>
                        <Text className="text-slate-800 font-bold text-sm">***********</Text>
                    </View>
                    
                </View>
            </View>

            {/* 4. ALT KISIM (BARKOD/QR) */}
            <View className="mt-auto bg-slate-50 p-6 items-center justify-center border-t border-slate-100">
                <QrCode size={60} color="#1e293b" />
                <Text className="text-[10px] text-slate-400 mt-2 text-center">
                    Bu kimlik kartı resmi belge niteliğindedir.
                </Text>
            </View>

        </View>

      </View>
    </SafeAreaView>
  );
};