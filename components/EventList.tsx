import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Calendar, MapPin, Clock } from 'lucide-react-native';

export interface EtkinlikItem {
  id: number;
  baslikTR: string;
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

export const EventList = ({ data, onItemClick }: EventListProps) => {

  // Tarih Formatlama (Gün) -> "25"
  const getDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  // Tarih Formatlama (Ay) -> "KAS"
  const getMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase();
  };

  // Saat Formatlama -> "14:00"
  const getTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View className="mt-8 px-4">
      {/* Başlık */}
      <View className="flex-row items-center mb-4">
        <Calendar color="#2563eb" size={20} />
        <Text className="text-lg font-bold text-black ml-2">ETKİNLİK TAKVİMİ</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-ml-4 pl-4">
        {data.map((item) => (
          <TouchableOpacity 
            key={item.id}
            onPress={() => onItemClick(item)} 
            className="mr-4 w-72 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-2 active:opacity-90"
          >
            
            {/* Görsel Alanı */}
            <View className="h-40 relative">
              <Image 
                source={{ uri: item.pathTR }} 
                className="w-full h-full" 
                resizeMode="cover" 
              />
              
              {/* Tarih Rozeti (Resmin Üzerinde) */}
              <View className="absolute top-3 right-3 bg-white/95 rounded-xl px-3 py-2 items-center shadow-sm">
                <Text className="text-xl font-extrabold text-blue-600 leading-6">
                  {getDay(item.baslamaZamani)}
                </Text>
                <Text className="text-[10px] font-bold text-gray-500 tracking-widest">
                  {getMonth(item.baslamaZamani)}
                </Text>
              </View>

              {/* Overlay (Hafif karartma - Altta) */}
              <View className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
            </View>

            {/* İçerik Alanı */}
            <View className="p-4">
              {/* Başlık */}
              <Text className="text-gray-900 font-bold text-base leading-5 mb-3" numberOfLines={2}>
                {item.baslikTR}
              </Text>

              {/* Detaylar (Konum ve Saat) */}
              <View className="gap-2">
                <View className="flex-row items-center">
                  <MapPin size={14} color="#6b7280" />
                  <Text className="text-xs text-gray-600 ml-1.5 flex-1" numberOfLines={1}>
                    {item.yerTR}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Clock size={14} color="#6b7280" />
                  <Text className="text-xs text-gray-600 ml-1.5">
                    {getTime(item.baslamaZamani)} - {getTime(item.bitisZamani)}
                  </Text>
                </View>
              </View>
            </View>

          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};