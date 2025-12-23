import { View, Text, ScrollView, Image, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.40;

export interface SlaytItem { 
  id: number; 
  baslikTR: string; 
  baslikEN?: string;
  pathTR: string; 
}

interface HeroSliderProps {
  data: SlaytItem[];
}

export const HeroSlider = ({ data }: HeroSliderProps) => {
  const { language } = useLanguage();

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
            <View className="absolute inset-0 bg-black/20" /> 
            
            <View className="absolute bottom-0 w-full p-5 pb-8 bg-gradient-to-t from-black/80 to-transparent">
              {/* DİNAMİK BAŞLIK */}
              <Text className="text-white font-extrabold text-2xl leading-8 shadow-sm">
                {language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR)}
              </Text>
              <View className="w-16 h-1.5 bg-blue-500 rounded-full mt-3" />
            </View>

          </View>
        ))}
      </ScrollView>
    </View>
  );
};