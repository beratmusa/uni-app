import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, ChevronRight, Bell, Filter } from 'lucide-react-native';

export interface HaberItem { 
  id: number; 
  kategori: string; 
  baslikTR: string; 
  baslamaZamani: string; 
  icerikTR?: string | null; 
  icerikEN?: string | null;
  haberDuyuruFoto?: string | null;
}

interface AnnouncementListProps {
  data: HaberItem[];
  onItemClick: (item: HaberItem) => void;
}


const KATEGORILER = [
  "Tümü",
  "Üniversite Haberleri", 
  "Birim Haberleri", 
  "Üniversite Duyuruları", 
  "Öğrenci Duyuruları"
];

export const AnnouncementList = ({ data, onItemClick }: AnnouncementListProps) => {
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
    <View className="mt-8 px-4 min-h-[400px]">
      
      
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Bell color="#1e3a8a" size={20} fill="#1e3a8a" />
          <Text className="text-xl font-extrabold text-slate-900 ml-2">
            Duyurular
          </Text>
        </View>

        
        <TouchableOpacity 
          onPress={() => setSelectedCategory("Tümü")}
          className={`px-3 py-1.5 rounded-full border ${
            selectedCategory === "Tümü" 
              ? "bg-slate-800 border-slate-800" 
              : "bg-white border-slate-200"
          }`}
        >
          <Text className={`text-xs font-bold ${
            selectedCategory === "Tümü" ? "text-white" : "text-slate-600"
          }`}>
            Tümü
          </Text>
        </TouchableOpacity>
      </View>

      
      <View className="mb-5">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-ml-4 pl-4">
          {KATEGORILER.filter(k => k !== "Tümü").map((kat) => {
            const isActive = selectedCategory === kat;
            return (
              <TouchableOpacity
                key={kat}
                onPress={() => setSelectedCategory(kat)}
                className={`mr-2 px-4 py-2 rounded-xl border ${
                  isActive 
                    ? "bg-blue-600 border-blue-600" 
                    : "bg-white border-slate-200"
                }`}
              >
                <Text className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-600"}`}>
                  {kat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      
      <View className="gap-3">
        {filteredList.length === 0 ? (
          <View className="items-center py-10 opacity-50">
            <Filter size={30} color="#94a3b8" />
            <Text className="text-slate-400 mt-2 font-medium">Bu kategoride içerik yok.</Text>
          </View>
        ) : (
          filteredList.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => onItemClick(item)}
              activeOpacity={0.7}
              className="bg-white rounded-xl border border-slate-100 shadow-sm flex-row items-stretch overflow-hidden"
            >
              
              
              <View className="w-1.5 bg-blue-600" />

              <View className="flex-1 p-4 pl-3">
                
                <Text className="text-slate-800 font-bold text-sm leading-5 mb-2">
                  {item.baslikTR}
                </Text>
                
                
                <View className="flex-row items-center justify-between mt-1">
                    <View className="flex-row items-center">
                      <Calendar size={12} color="#9ca3af" />
                      <Text className="text-gray-400 text-xs ml-1 font-medium">
                        {formatDate(item.baslamaZamani)}
                      </Text>
                    </View>
                    
                    {selectedCategory === "Tümü" && (
                      <View className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 max-w-[120px]">
                        <Text className="text-[9px] text-slate-500 font-bold" numberOfLines={1}>
                          {item.kategori}
                        </Text>
                      </View>
                    )}
                </View>
              </View>
              
              <View className="justify-center pr-3 opacity-30">
                <ChevronRight size={20} color="black" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
};