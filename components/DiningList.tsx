import { View, Text, ScrollView, Image, LayoutChangeEvent } from 'react-native';
import { Utensils, Info, Flame } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react'; 
import { useLanguage } from '../context/LanguageContext'; // <-- HOOK

export interface YemekhaneItem {
  yemekhaneId: number;
  adTR: string;
  path: string;
  yemek1TR: string;
  yemek2TR: string;
  yemek3TR: string;
  yemek4TR: string;
  notTR: string;
}

interface DiningListProps {
  data: YemekhaneItem[];
  onLayout: (event: LayoutChangeEvent) => void;
}

const CARD_WIDTH = 320; 
const SPACING = 20;     
const SNAP_INTERVAL = CARD_WIDTH + SPACING; 

export const DiningList = ({ data, onLayout }: DiningListProps) => {
  const { dictionary } = useLanguage(); // <-- DİL
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ... (Otomatik kaydırma useEffect kodu aynı) ...
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
    }, 4000); 
    return () => clearInterval(interval);
  }, [currentIndex, data.length]);
  

  const parseFood = (foodString: string) => {
    if (!foodString) return { name: "", cal: "" };
    const parts = foodString.split(/[\t\n-]+|\s{2,}/);
    let name = parts[0]?.trim() || "";
    let cal = parts[1]?.trim() || "";
    if (!cal && name.includes("KKAL")) {
       const match = name.match(/(\d+)\s*KKAL/i);
       if (match) {
         cal = match[0];
         name = name.replace(match[0], "").trim();
       }
    }
    return { name, cal };
  };

  return (
    <View className="mt-8 px-4" onLayout={onLayout}>
      
      {/* HEADER */}
      <View className="flex-row items-center mb-5">
        <View className="bg-orange-100 p-2 rounded-full mr-3">
          <Utensils color="#ea580c" size={20} />
        </View>
        <View>
          {/* CANLI YAZILAR */}
          <Text className="text-xl font-extrabold text-slate-900">{dictionary.dining}</Text>
          <Text className="text-orange-600 font-bold text-xs uppercase tracking-widest">{dictionary.bonAppetit}</Text>
        </View>
      </View>
      
      <ScrollView 
        ref={scrollRef} 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="-ml-4 pl-4" 
        contentContainerStyle={{ paddingRight: 20 }}
        scrollEventThrottle={16}
      >
        {data.map((yemek) => (
          <View 
            key={yemek.yemekhaneId} 
            className="mr-5 w-80 h-96 bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden flex-col"
          >
            
            <View className="h-36 relative">
              <Image 
                source={{ uri: yemek.path }} 
                className="w-full h-full" 
                resizeMode="cover" 
              />
              <View className="absolute inset-0 bg-black/30" />
              <View className="absolute bottom-3 left-4 right-4">
                <Text className="text-white font-extrabold text-lg shadow-sm leading-6">
                  {yemek.adTR}
                </Text>
                <View className="w-8 h-1 bg-orange-500 rounded-full mt-1.5" />
              </View>
            </View>

            <View className="p-5 gap-3 flex-1 justify-center">
              {[yemek.yemek1TR, yemek.yemek2TR, yemek.yemek3TR, yemek.yemek4TR].map((item, index) => {
                if(!item) return null;
                const { name, cal } = parseFood(item);
                
                return (
                  <View key={index} className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-1.5 h-1.5 rounded-full bg-orange-300 mr-2" />
                      <Text className="text-slate-700 font-bold text-xs leading-4" numberOfLines={2}>
                        {name}
                      </Text>
                    </View>

                    {cal ? (
                      <View className="flex-row items-center bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-md">
                        <Text className="text-[9px] text-orange-700 font-bold">
                          {cal}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>

            <View className="bg-slate-50 p-3 border-t border-slate-100 flex-row items-center h-14">
              <Info size={14} color="#64748b" />
              <Text 
                className="text-[10px] text-slate-500 font-medium ml-2 flex-1" 
                numberOfLines={2}
              >
                {yemek.notTR}
              </Text>
            </View>

          </View>
        ))}
      </ScrollView>
    </View>
  );
};