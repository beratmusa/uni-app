import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, ChevronRight } from 'lucide-react-native';

export interface HaberItem { id: number; kategori: string; baslikTR: string; baslamaZamani: string; }

interface AnnouncementListProps {
  data: HaberItem[];
}

const KATEGORILER = ["Tümü", "Üniversite Haberleri", "Birim Haberleri", "Üniversite Duyuruları", "Öğrenci Duyuruları"];

export const AnnouncementList = ({ data }: AnnouncementListProps) => {
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  };

  const filteredList = selectedCategory === "Tümü" 
    ? data 
    : data.filter(item => item.kategori === selectedCategory);

  return (
    <View className="mt-8 px-4 min-h-[500px]">
      <Text className="text-lg font-bold text-black mb-4">📢 DUYURULAR & HABERLER</Text>
      
      {/* Kategori Butonları */}
      <View className="mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-ml-4 pl-4">
          {KATEGORILER.map((kat) => (
            <TouchableOpacity
              key={kat}
              onPress={() => setSelectedCategory(kat)}
              className={`mr-2 px-4 py-2 rounded-full border ${selectedCategory === kat ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}`}
            >
              <Text className={`text-xs font-bold ${selectedCategory === kat ? "text-white" : "text-gray-600"}`}>
                {kat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Liste */}
      <View className="gap-3">
        {filteredList.length === 0 ? (
          <Text className="text-center text-gray-400 py-10">Bu kategoride henüz içerik yok.</Text>
        ) : (
          filteredList.map((item) => (
            <TouchableOpacity key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-row items-start active:bg-gray-50">
              <View className="flex-1 mr-2">
                <Text className="text-gray-800 font-bold text-sm leading-5 mb-2">{item.baslikTR}</Text>
                <View className="flex-row items-center justify-between mt-1">
                    <View className="flex-row items-center">
                      <Calendar size={12} color="#9ca3af" />
                      <Text className="text-gray-400 text-xs ml-1">{formatDate(item.baslamaZamani)}</Text>
                    </View>
                    {selectedCategory === "Tümü" && (
                      <Text className="text-[10px] text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded">{item.kategori}</Text>
                    )}
                </View>
              </View>
              <View className="self-center opacity-30"><ChevronRight size={20} color="black" /></View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
};