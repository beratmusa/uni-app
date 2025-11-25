import { View, Text, ScrollView, Image, LayoutChangeEvent } from 'react-native';
import { Utensils } from 'lucide-react-native';

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
  onLayout: (event: LayoutChangeEvent) => void; // Konum bildirmek için
}

export const DiningList = ({ data, onLayout }: DiningListProps) => {

  // Yemek isminden kaloriyi ayıklama fonksiyonu
  const parseFood = (foodString: string) => {
    if (!foodString) return { name: "", cal: "" };
    const parts = foodString.split(/[\t\n]+/);
    return { name: parts[0], cal: parts[1] || "" };
  };

  return (
    <View className="mt-8 px-4" onLayout={onLayout}>
      <View className="flex-row items-center mb-4">
        <Utensils color="#2563eb" size={20} />
        <Text className="text-lg font-bold text-black ml-2">GÜNÜN MENÜSÜ</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-ml-4 pl-4">
        {data.map((yemek) => (
          <View key={yemek.yemekhaneId} className="mr-4 w-72 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-2">
            
            {/* Resim */}
            <View className="h-32 relative">
              <Image source={{ uri: yemek.path }} className="w-full h-full" resizeMode="cover" />
              <View className="absolute inset-0 bg-black/40 justify-center items-center">
                <Text className="text-white font-bold text-lg text-center px-2">{yemek.adTR}</Text>
              </View>
            </View>

            {/* Liste */}
            <View className="p-4 gap-3">
              {[yemek.yemek1TR, yemek.yemek2TR, yemek.yemek3TR, yemek.yemek4TR].map((item, index) => {
                if(!item) return null;
                const { name, cal } = parseFood(item);
                return (
                  <View key={index} className="flex-row justify-between items-center border-b border-gray-100 pb-2 last:border-0">
                    <Text className="text-gray-700 font-medium flex-1 text-sm">{name}</Text>
                    {cal ? (
                      <Text className="text-xs text-orange-500 font-bold bg-orange-50 px-2 py-1 rounded ml-2">{cal}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>

            {/* Not */}
            <View className="bg-gray-50 p-3 border-t border-gray-100">
              <Text className="text-[10px] text-gray-500 text-center">{yemek.notTR}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};