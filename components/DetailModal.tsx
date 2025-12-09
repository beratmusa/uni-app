import { Modal, View, Text, Image, ScrollView, TouchableOpacity, Dimensions, Share, Platform } from 'react-native'; // <-- Platform EKLENDİ
import { X, Calendar, Share2, MapPin } from 'lucide-react-native';
import RenderHtml from 'react-native-render-html';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

export interface DetailData {
  title: string;
  image?: string | null;
  date: string;
  content?: string | null;
  location?: string;
  category?: string;
}

interface DetailModalProps {
  visible: boolean;
  data: DetailData | null;
  onClose: () => void;
}

export const DetailModal = ({ visible, data, onClose }: DetailModalProps) => {
  const insets = useSafeAreaInsets();
  const { dictionary } = useLanguage();

  if (!data) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${data.title}\n\nKastamonu Üniversitesi Mobil`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const tagsStyles = {
    p: { fontSize: 16, lineHeight: 24, color: '#374151', marginBottom: 12 },
    a: { color: '#2563eb', textDecorationLine: 'none' },
    img: { width: '100%', borderRadius: 12, marginVertical: 10 },
  };

  const isEvent = data.category === dictionary.events || data.category === 'Etkinlik';
  const imageHeight = isEvent ? 'h-[600px]' : 'h-64';
  const resizeMode = isEvent ? 'contain' : 'cover';
  const bgStyle = isEvent ? 'bg-gray-50' : 'bg-gray-200';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        
        {/* HEADER (DÜZELTİLDİ) */}
        <View 
          className="flex-row justify-between items-center px-4 pb-3 border-b border-gray-100 bg-white z-10"
          style={{ 
            // iOS (PageSheet) için sabit boşluk, Android (FullScreen) için safe area
            paddingTop: Platform.OS === 'android' ? insets.top + 10 : 15 
          }}
        >
          <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
            <X color="#1f2937" size={24} />
          </TouchableOpacity>

          <Text className="font-bold text-gray-500 text-xs uppercase tracking-widest w-48 text-center" numberOfLines={1}>
            {data.category || dictionary.details}
          </Text>

          <TouchableOpacity onPress={handleShare} className="p-2 bg-blue-50 rounded-full">
            <Share2 color="#2563eb" size={20} />
          </TouchableOpacity>
        </View>

        {/* İÇERİK */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false}>
          
          {data.image && (
            <Image 
              source={{ uri: data.image }} 
              className={`w-full ${imageHeight} ${bgStyle}`}
              resizeMode={resizeMode}
            />
          )}

          <View className="p-5 pb-20">
            <View className="flex-row items-center mb-3 space-x-4">
              <View className="flex-row items-center bg-blue-50 px-3 py-1 rounded-lg">
                <Calendar size={14} color="#2563eb" />
                <Text className="text-blue-700 text-xs font-bold ml-2">{data.date}</Text>
              </View>
              
              {data.location && (
                <View className="flex-row items-center bg-orange-50 px-3 py-1 rounded-lg ml-2 flex-1">
                  <MapPin size={14} color="#ea580c" />
                  <Text className="text-orange-700 text-xs font-bold ml-2" numberOfLines={1}>
                    {data.location}
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-2xl font-extrabold text-gray-900 leading-8 mb-6">
              {data.title}
            </Text>

            {data.content ? (
              <RenderHtml
                contentWidth={width - 40}
                source={{ html: data.content }}
                tagsStyles={tagsStyles as any}
                systemFonts={["System", "Roboto", "Arial"]}
              />
            ) : (
              <Text className="text-gray-500 italic text-center mt-4">
                İçerik detayı bulunmuyor.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
      
      <StatusBar style="dark" />
    </Modal>
  );
};