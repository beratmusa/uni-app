import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, ChevronRight, Bell, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient'; // <-- EKLENDİ
import { useLanguage } from '../context/LanguageContext';

export interface HaberItem { 
  id: number; 
  kategori: string; 
  baslikTR: string; 
  baslikEN?: string;
  baslamaZamani: string; 
  icerikTR?: string | null; 
  icerikEN?: string | null;
  haberDuyuruFoto?: string | null;
}

interface AnnouncementListProps {
  data: HaberItem[];
  onItemClick: (item: HaberItem) => void;
}

const RAW_CATEGORIES = [
  "Tümü",
  "Üniversite Haberleri", 
  "Birim Haberleri", 
  "Üniversite Duyuruları", 
  "Öğrenci Duyuruları"
];

export const AnnouncementList = ({ data, onItemClick }: AnnouncementListProps) => {
  const { language, dictionary } = useLanguage();
  
  // Varsayılan kategori
  const [selectedCategory, setSelectedCategory] = useState("Üniversite Haberleri");

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long' });
  };

  const filteredList = selectedCategory === "Tümü" 
    ? data 
    : data.filter(item => item.kategori === selectedCategory);

  const getCategoryDisplayName = (rawName: string) => {
    if (rawName === "Tümü") return dictionary.categories.all;
    if (rawName === "Öğrenci Duyuruları") return dictionary.categories.student; // "Öğrenci"
    if (rawName === "Birim Haberleri") return dictionary.categories.academic;   // "Akademik" (Fakülteler vb.)
    if (rawName === "Üniversite Duyuruları") return dictionary.categories.admin; // "İdari" (Rektörlük vb.)
    if (rawName === "Üniversite Haberleri") return dictionary.categories.general; // "Genel"
    return dictionary.categories.general; // Bilinmeyen bir şey gelirse Genel olsun
  };

  return (
    // 1. DIŞ KAPSAYICI (KART GÖRÜNÜMÜ)
    <View className="mt-8 mx-4 rounded-3xl relative overflow-hidden bg-white shadow-sm border border-white/60">
      
      {/* 2. ARKA PLAN GRADYANI (Hafif Gök Mavisi Geçişli) */}
      <LinearGradient
        // Renkler: Çok açık maviden -> Biraz daha belirgin maviye -> Tekrar açığa
        colors={['#f0f9ff', '#dbeafe', '#eff6ff']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      {/* 3. DALGA EFEKTİ (Dekoratif Silik Daireler) */}
      {/* Sağ üst köşe */}
      <View className="absolute -top-16 -right-16 w-48 h-48 bg-blue-400/10 rounded-full" />
      {/* Sol orta */}
      <View className="absolute top-24 -left-12 w-64 h-64 bg-indigo-400/5 rounded-full" />
      {/* Alt sağ */}
      <View className="absolute -bottom-10 right-10 w-32 h-32 bg-sky-300/10 rounded-full" />


      {/* 4. ASIL İÇERİK (Padding ile içeride tutuyoruz) */}
      <View className="p-5 min-h-[400px]">
        
        {/* HEADER */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="bg-blue-100 p-1.5 rounded-full mr-2">
              <Bell color="#1e3a8a" size={18} fill="#1e3a8a" />
            </View>
            <Text className="text-xl font-extrabold text-slate-900">
              {dictionary.announcements}
            </Text>
          </View>

          <TouchableOpacity 
            onPress={() => setSelectedCategory("Tümü")}
            className={`px-3 py-1.5 rounded-full border ${
              selectedCategory === "Tümü" 
                ? "bg-slate-900 border-slate-900" 
                : "bg-white/80 border-slate-200"
            }`}
          >
            <Text className={`text-xs font-bold ${
              selectedCategory === "Tümü" ? "text-white" : "text-slate-600"
            }`}>
              {dictionary.categories.all}
            </Text>
          </TouchableOpacity>
        </View>

        {/* KATEGORİLER */}
        <View className="mb-5">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-ml-1 py-1">
            {RAW_CATEGORIES.filter(k => k !== "Tümü").map((kat) => {
              const isActive = selectedCategory === kat;
              return (
                <TouchableOpacity
                  key={kat}
                  onPress={() => setSelectedCategory(kat)}
                  className={`mr-2 px-4 py-2 rounded-xl border shadow-sm ${
                    isActive 
                      ? "bg-blue-600 border-blue-600" 
                      : "bg-white/90 border-slate-100"
                  }`}
                >
                  <Text className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-600"}`}>
                    {getCategoryDisplayName(kat)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* LİSTE */}
        <View className="gap-3">
          {filteredList.length === 0 ? (
            <View className="items-center py-10 opacity-50">
              <Filter size={30} color="#94a3b8" />
              <Text className="text-slate-500 mt-2 font-medium">
                {language === 'tr' ? 'İçerik bulunamadı.' : 'No content found.'}
              </Text>
            </View>
          ) : (
            filteredList.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => onItemClick(item)}
                activeOpacity={0.7}
                // Kartların arka planını biraz daha şeffaf beyaz yaparak zeminle kaynaştırıyoruz
                className="bg-white/95 rounded-xl border border-white/60 shadow-sm flex-row items-stretch overflow-hidden"
              >
                <View className="w-1.5 bg-blue-500" />
                <View className="flex-1 p-4 pl-3">
                  <Text className="text-slate-800 font-bold text-sm leading-5 mb-2">
                    {language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR)}
                  </Text>
                  
                  <View className="flex-row items-center justify-between mt-1">
                      <View className="flex-row items-center">
                        <Calendar size={12} color="#64748b" />
                        <Text className="text-slate-500 text-xs ml-1 font-medium">
                          {formatDate(item.baslamaZamani)}
                        </Text>
                      </View>
                      
                      {selectedCategory === "Tümü" && (
                        <View className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 max-w-[120px]">
                          <Text className="text-[9px] text-slate-600 font-bold" numberOfLines={1}>
                            {getCategoryDisplayName(item.kategori)}
                          </Text>
                        </View>
                      )}
                  </View>
                </View>
                
                <View className="justify-center pr-3 opacity-30">
                  <ChevronRight size={20} color="#1e293b" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

      </View>
    </View>
  );
};