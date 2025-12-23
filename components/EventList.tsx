import { View, Text, ScrollView, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { MapPin, Clock } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';

export interface EtkinlikItem {
  id: number;
  baslikTR: string;
  baslikEN?: string;
  baslamaZamani: string;
  bitisZamani: string;
  pathTR: string;
  yerTR: string;
  icerikTR?: string | null;
}

interface EventListProps {
  data: EtkinlikItem[];
  onItemClick: (item: EtkinlikItem) => void;
}

const CARD_WIDTH = 256; 
const SPACING = 16;     
const SNAP_INTERVAL = CARD_WIDTH + SPACING;

export const EventList = ({ data, onItemClick }: EventListProps) => {
  const { language, dictionary } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (data.length === 0) return;
    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= data.length) {
        nextIndex = 0;
        scrollRef.current?.scrollTo({ x: 0, animated: true });
      } else {
        scrollRef.current?.scrollTo({ x: nextIndex * SNAP_INTERVAL, animated: true });
      }
      setCurrentIndex(nextIndex);
    }, 3500);
    return () => clearInterval(interval);
  }, [currentIndex, data.length]);

  const getDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  const getMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long' }).toUpperCase();
  };

  const getShortMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { month: 'short' }).toUpperCase();
  };

  const getTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const currentMonthName = data.length > 0 ? getMonth(data[0].baslamaZamani) : (language === 'tr' ? "KASIM" : "NOV");
  const currentYear = new Date().getFullYear();

  return (
    <ImageBackground
      source={{ uri: 'https://www.transparenttextures.com/patterns/concrete-wall.png' }}
      resizeMode="repeat"
      className="mt-8 py-10 border-y border-stone-300"
      style={{ backgroundColor: '#e5e5e5' }}
    >
      <View className="px-4">
        <View className="flex-row justify-between items-center mb-4 ml-1">
            <Text className="text-stone-500 font-bold text-xs uppercase tracking-widest">
                {dictionary.campusLife}
            </Text>

            <TouchableOpacity 
              onPress={() => navigation.navigate('EventList')}
              className="bg-white/80 px-3 py-1.5 rounded-full border border-stone-300 shadow-sm"
            >
              <Text className="text-stone-600 text-[10px] font-bold">
                {dictionary.seeAll}
              </Text>
            </TouchableOpacity>
        </View>

        <View className="relative">
          {/* Çivi */}
          <View className="absolute -top-3 left-1/2 -ml-2 z-20 w-4 h-4 bg-stone-800 rounded-full border-2 border-stone-400 shadow-md" />

          {/* Gövde */}
          <View className="bg-white rounded-lg shadow-2xl shadow-black border border-slate-200 overflow-hidden pb-4">
            
            {/* Spiral */}
            <View className="bg-slate-100 h-8 flex-row justify-evenly items-center border-b border-slate-200">
              {[...Array(10)].map((_, i) => (
                <View key={i} className="w-2.5 h-2.5 rounded-full bg-stone-800 shadow-inner" />
              ))}
            </View>

            {/* Başlık */}
            <View className="bg-red-700 py-3 items-center justify-center shadow-sm">
              <Text className="text-white font-black text-lg tracking-widest shadow-black/20 shadow-offset-1">
                {currentMonthName} {currentYear}
              </Text>
            </View>

            {/* Çizgiler */}
            <View className="absolute top-24 left-0 right-0 bottom-0 z-0 opacity-10">
               <View className="mt-12 h-[1px] bg-slate-900 w-full" />
               <View className="mt-12 h-[1px] bg-slate-900 w-full" />
               <View className="mt-12 h-[1px] bg-slate-900 w-full" />
               <View className="mt-12 h-[1px] bg-slate-900 w-full" />
               <View className="mt-12 h-[1px] bg-slate-900 w-full" />
            </View>

            {/* Kartlar */}
            <View className="pt-5 pb-2 z-10">
              <ScrollView 
                ref={scrollRef}
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ paddingHorizontal: 16, paddingRight: 24 }}
                scrollEventThrottle={16}
              >
                {data.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    onPress={() => onItemClick(item)}
                    activeOpacity={0.9}
                    className="mr-4 w-64 bg-white rounded border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <View className="h-80 relative"> 
                      <Image 
                        source={{ uri: item.pathTR }} 
                        className="w-full h-full" 
                        resizeMode="cover"
                      />
                      <View className="absolute top-2 right-2 bg-white/95 rounded px-2 py-1 items-center shadow-sm border border-slate-100">
                        <Text className="text-lg font-bold text-red-600 leading-5">
                          {getDay(item.baslamaZamani)}
                        </Text>
                        <Text className="text-[9px] font-bold text-slate-500 uppercase">
                          {getShortMonth(item.baslamaZamani)}
                        </Text>
                      </View>
                    </View>

                    <View className="p-4">
                      {/* DİNAMİK BAŞLIK */}
                      <Text className="text-slate-800 font-bold text-sm leading-5 mb-3 h-10" numberOfLines={2}>
                        {language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR)}
                      </Text>

                      <View className="gap-2">
                        <View className="flex-row items-center">
                          <Clock size={12} color="#dc2626" />
                          <Text className="text-xs text-slate-500 ml-1.5 font-medium">
                            {getTime(item.baslamaZamani)}
                          </Text>
                        </View>
                        
                        <View className="flex-row items-center">
                          <MapPin size={12} color="#94a3b8" />
                          <Text className="text-[10px] text-slate-400 ml-1.5 flex-1" numberOfLines={1}>
                            {item.yerTR}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="h-1 bg-red-600 w-full" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};