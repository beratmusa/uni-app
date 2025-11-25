import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';

export interface GundemItem { id: number; baslikTR: string; path: string; eklemeZamani: string; }

interface AgendaListProps {
  data: GundemItem[];
}

export const AgendaList = ({ data }: AgendaListProps) => {
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  };

  return (
    <View className="mt-6 px-4">
      <Text className="text-lg font-bold text-black mb-3">🔥 GÜNDEM</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-ml-4 pl-4">
        {data.map((item) => (
          <TouchableOpacity key={item.id} className="mr-4 w-64 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden active:opacity-90">
            <Image source={{ uri: item.path }} className="w-full h-36" resizeMode="cover" />
            <View className="p-3">
              <Text className="text-xs text-gray-400 font-medium mb-1">
                {formatDate(item.eklemeZamani)}
              </Text>
              <Text className="text-gray-800 font-bold text-sm leading-5" numberOfLines={2}>
                {item.baslikTR}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};