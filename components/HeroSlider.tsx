import { View, Text, ScrollView, Image, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.40;

export interface SlaytItem { 
  id: number; 
  baslikTR: string; 
  pathTR: string; 
}

interface HeroSliderProps {
  data: SlaytItem[];
}

export const HeroSlider = ({ data }: HeroSliderProps) => {
  

  const slaytlar = data.filter(item => 
    item.pathTR && item.pathTR.toLowerCase().endsWith('.mp4')
  );

  return (
    <View style={{ height: HERO_HEIGHT }}>
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        bounces={false}
      >
        {slaytlar.map((item) => (
          <View 
            key={item.id} 
            style={{ width: width, height: HERO_HEIGHT }} 
            className="relative bg-black"
          >
            
            <Video
              source={{ uri: item.pathTR }}
              style={{ width: '100%', height: '100%' }}
              resizeMode={ResizeMode.COVER}
              isLooping={true}
              shouldPlay={true}
              isMuted={true}
              useNativeControls={false}
            />

            {/* Karartma ve Yazı */}
            <View className="absolute inset-0 bg-black/20" /> 
            
            <View className="absolute bottom-0 w-full p-5 pb-8 bg-gradient-to-t from-black/80 to-transparent">
              <Text className="text-white font-extrabold text-2xl leading-8 shadow-sm">
                {item.baslikTR}
              </Text>
              <View className="w-16 h-1.5 bg-blue-500 rounded-full mt-3" />
            </View>

          </View>
        ))}
      </ScrollView>
    </View>
  );
};