import React, { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export const SplashScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-blue-900 justify-between items-center py-10">
      
      {/* Üst Boşluk (Dengelemek için) */}
      <View />

      {/* ORTA KISIM: LOGO VE İSİM */}
      <View className="items-center justify-center w-full px-10">
        
        {/* Logo Animasyonu */}
        <Animated.View 
          entering={ZoomIn.duration(1000).springify()} 
          className="bg-white p-6 rounded-full shadow-2xl mb-6 items-center justify-center"
          style={{ width: 140, height: 140 }}
        >
          <Image 
            source={require('../assets/icon.png')}
            className="w-24 h-24"
            resizeMode="contain"
          />
        </Animated.View>

        {/* Başlık Animasyonu */}
        <Animated.View entering={FadeIn.delay(500).duration(1000)} className="items-center">
          <Text className="text-white font-extrabold text-2xl text-center tracking-wider">
            KASTAMONU
          </Text>
          <Text className="text-blue-200 font-bold text-lg text-center tracking-[4px] mt-1">
            ÜNİVERSİTESİ
          </Text>
        </Animated.View>
      </View>

      {/* ALT KISIM: YÜKLENİYOR VE SÜRÜM */}
      <Animated.View entering={FadeIn.delay(1000)} className="items-center mb-6">
        <ActivityIndicator size="large" color="white" className="mb-4" />
        <Text className="text-blue-200 text-xs font-medium tracking-widest">
          Yükleniyor...
        </Text>
        <Text className="text-blue-400/50 text-[10px] mt-2">
          v1.0.0
        </Text>
      </Animated.View>

      {/* Arka Plan Süslemeleri (Opak Daireler) */}
      <View className="absolute top-[-100] left-[-100] w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl" />
      <View className="absolute bottom-[-50] right-[-50] w-80 h-80 bg-blue-600 rounded-full opacity-20 blur-3xl" />

    </SafeAreaView>
  );
};