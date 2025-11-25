import { View, Text, ScrollView, Image } from 'react-native';

export interface SlaytItem { id: number; baslikTR: string; pathTR: string; }

interface HeroSliderProps {
  data: SlaytItem[];
}

export const HeroSlider = ({ data }: HeroSliderProps) => {
  // Videoları filtrele
  const resimSlaytlar = data.filter(item => item.pathTR && !item.pathTR.endsWith('.mp4'));

  return (
    <View className="mt-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 pb-2">
        {resimSlaytlar.map((item) => (
          <View key={item.id} className="mr-4 w-80 h-48 rounded-2xl overflow-hidden bg-gray-200 shadow-sm relative">
            <Image source={{ uri: item.pathTR }} className="w-full h-full" resizeMode="cover" />
            <View className="absolute bottom-0 w-full bg-black/60 p-3 backdrop-blur-sm">
              <Text className="text-white font-bold text-sm leading-tight" numberOfLines={2}>
                {item.baslikTR}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};