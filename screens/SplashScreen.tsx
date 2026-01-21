import React, { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  ZoomIn, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  Easing
} from 'react-native-reanimated';

const UNI_RED = "#C8102E"; 

interface SplashScreenProps {
  onAnimationEnd?: () => void;
}

export const SplashScreen = ({ onAnimationEnd }: SplashScreenProps) => {
  const scale = useSharedValue(0);
  const contentOpacity = useSharedValue(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      
      contentOpacity.value = withTiming(0, { duration: 600 });


      scale.value = withTiming(50, { 
        duration: 1500, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), 
      }, (finished) => {
        if (finished && onAnimationEnd) {
          runOnJS(onAnimationEnd)();
        }
      });

    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  const rCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const rContentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });

  return (
    <View className="flex-1 bg-blue-900 items-center justify-center overflow-hidden">
      
      {/* Gizli Kırmızı Daire */}
      <Animated.View 
        style={[
            { 
              width: 100, 
              height: 100, 
              backgroundColor: UNI_RED, 
              borderRadius: 50, 
              position: 'absolute',
              zIndex: 0,
            }, 
            rCircleStyle
        ]} 
      />

      <SafeAreaView className="flex-1 w-full justify-between items-center py-10 z-10">
        
        <View />

        <View className="items-center justify-center w-full px-10">
          
          <Animated.View 
            entering={ZoomIn.duration(1000).springify()} 
            className="bg-white p-6 rounded-full shadow-2xl mb-6 items-center justify-center z-20"
            style={{ width: 140, height: 140 }}
          >
            <Image 
              source={require('../assets/icon.png')}
              className="w-24 h-24"
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View 
            entering={FadeIn.delay(500).duration(1000)} 
            className="items-center"
            style={rContentStyle}
          >
            <Text className="text-white font-extrabold text-2xl text-center tracking-wider">
              KASTAMONU
            </Text>
            <Text className="text-blue-200 font-bold text-lg text-center tracking-[4px] mt-1">
              ÜNİVERSİTESİ
            </Text>
          </Animated.View>
        </View>

        <Animated.View 
          entering={FadeIn.delay(1000)} 
          className="items-center mb-6"
          style={rContentStyle}
        >
          <ActivityIndicator size="large" color="white" className="mb-4" />
          <Text className="text-blue-200 text-xs font-medium tracking-widest">
            Yükleniyor...
          </Text>
          <Text className="text-blue-400/50 text-[10px] mt-2">
            v1.0.0
          </Text>
        </Animated.View>

      </SafeAreaView>

      <Animated.View style={[{position: 'absolute', width: '100%', height: '100%'}, rContentStyle]}>
          <View className="absolute top-[-100] left-[-100] w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl" />
          <View className="absolute bottom-[-50] right-[-50] w-80 h-80 bg-blue-600 rounded-full opacity-20 blur-3xl" />
      </Animated.View>

    </View>
  );
};