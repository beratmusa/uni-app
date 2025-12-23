import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, GraduationCap, User, QrCode } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const StudentIDScreen = () => {
  const navigation = useNavigation();
  const { userInfo } = useAuth();
  const { dictionary } = useLanguage();

  const t = dictionary.idCard || {
    title: "Dijital Kimlik",
    uniName: "KASTAMONU ÜNİVERSİTESİ",
    cardType: "KİMLİK KARTI",
    studentNo: "Öğrenci No",
    tcNo: "T.C. Kimlik No",
    faculty: "Fakülte / Bölüm",
    active: "Aktif Öğrenci",
    scan: "Doğrulama için okutunuz"
  };

  const FIXED_QR_VALUE = "1586088047";


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
        
        {/* --- KİMLİK KARTI --- */}
        <View 
            className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200"
            style={{ width: width - 40 }} 
        >
            
            {/* BAŞLIK ALANI */}
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

            {/* FOTOĞRAF VE İSİM ALANI */}
            <View className="items-center py-6 border-b border-slate-100">
                <Text className="text-xl font-bold text-slate-800 text-center uppercase px-4">
                    {userInfo?.TitleNameSurname || "Öğrenci Adı"}
                </Text>
            </View>

            
            {/* QR KOD ALANI (Alt Kısım) */}
            <View className="bg-slate-50 p-6 items-center justify-center">
                <View className="bg-white p-2 rounded-lg mb-3">
                    <QRCode 
                        value={FIXED_QR_VALUE} 
                        size={180} 
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