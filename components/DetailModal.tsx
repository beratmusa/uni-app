import { Modal, View, Text, Image, ScrollView, TouchableOpacity, Dimensions, Share } from 'react-native';
import { X, Calendar, Share2, MapPin } from 'lucide-react-native';
import RenderHtml from 'react-native-render-html';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Modal'a gönderilecek verinin tipi
export interface DetailData {
  title: string;
  image?: string | null;
  date: string;
  content?: string | null; // HTML içerik
  location?: string;       // Sadece etkinlikler için
  category?: string;
}

interface DetailModalProps {
  visible: boolean;
  data: DetailData | null;
  onClose: () => void;
}

export const DetailModal = ({ visible, data, onClose }: DetailModalProps) => {
  const insets = useSafeAreaInsets(); // Çentik boşluklarını otomatik hesaplar

  if (!data) return null;

  // Paylaşma Özelliği
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${data.title}\n\nKastamonu Üniversitesi Mobil`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // HTML Stilleri (CSS gibi)
  const tagsStyles = {
    p: { fontSize: 16, lineHeight: 24, color: '#374151', marginBottom: 12 },
    a: { color: '#2563eb', textDecorationLine: 'none' },
    img: { width: '100%', borderRadius: 12, marginVertical: 10 },
  };

  return (
    <Modal
      visible={visible}
      animationType="slide" // Aşağıdan yukarı kayarak gelir
      presentationStyle="pageSheet" // iOS'te kart gibi görünür
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        
        {/* --- HEADER (Sabit Üst Kısım) --- */}
        <View 
          className="flex-row justify-between items-center px-4 pb-3 border-b border-gray-100 bg-white z-10"
          style={{ paddingTop: insets.top + 10 }} // Çentik payı
        >
          <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
            <X color="#1f2937" size={24} />
          </TouchableOpacity>

          <Text className="font-bold text-gray-500 text-xs uppercase tracking-widest">
            {data.category || "Detay"}
          </Text>

          <TouchableOpacity onPress={handleShare} className="p-2 bg-blue-50 rounded-full">
            <Share2 color="#2563eb" size={20} />
          </TouchableOpacity>
        </View>

        {/* --- İÇERİK (Scroll Edilebilir) --- */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          
          {/* Büyük Kapak Resmi */}
          {data.image && (
            <Image 
              source={{ uri: data.image }} 
              className="w-full h-64 bg-gray-200"
              resizeMode="cover"
            />
          )}

          <View className="p-5 pb-20">
            {/* Tarih ve Etiketler */}
            <View className="flex-row items-center mb-3 space-x-4">
              <View className="flex-row items-center bg-blue-50 px-3 py-1 rounded-lg">
                <Calendar size={14} color="#2563eb" />
                <Text className="text-blue-700 text-xs font-bold ml-2">{data.date}</Text>
              </View>
              
              {data.location && (
                <View className="flex-row items-center bg-orange-50 px-3 py-1 rounded-lg ml-2">
                  <MapPin size={14} color="#ea580c" />
                  <Text className="text-orange-700 text-xs font-bold ml-2 flex-1" numberOfLines={1}>
                    {data.location}
                  </Text>
                </View>
              )}
            </View>

            {/* Başlık */}
            <Text className="text-2xl font-extrabold text-gray-900 leading-8 mb-6">
              {data.title}
            </Text>

            {/* HTML İçerik */}
            {data.content ? (
              <RenderHtml
                contentWidth={width - 40} // Ekran genişliğine göre ayarlar
                source={{ html: data.content }}
                tagsStyles={tagsStyles as any}
                systemFonts={["System", "Roboto", "Arial"]} // Font desteği
              />
            ) : (
              <Text className="text-gray-500 italic text-center mt-4">
                İçerik detayı bulunmuyor.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
      
      {/* iOS Modal Stili için Status Bar */}
      <StatusBar style="dark" />
    </Modal>
  );
};