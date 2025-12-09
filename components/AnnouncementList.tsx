import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, ChevronRight, Bell, Filter } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext'; // <-- EKLENDİ

export interface HaberItem { 
  id: number; 
  kategori: string; 
  baslikTR: string; 
  baslikEN?: string; // <-- EKLENDİ (API'de varsa)
  baslamaZamani: string; 
  icerikTR?: string | null; 
  icerikEN?: string | null;
  haberDuyuruFoto?: string | null;
}

interface AnnouncementListProps {
  data: HaberItem[];
  onItemClick: (item: HaberItem) => void;
}

// API'den gelen kategori isimleri ile bizim sözlükteki anahtarları eşleştiriyoruz
const CATEGORY_MAP: Record<string, string> = {
  "Öğrenci Duyuruları": "student",
  "Akademik Duyurular": "academic", // API'ye göre değişebilir
  "İdari Duyurular": "admin",
  "Genel Duyurular": "general",
  "Üniversite Haberleri": "general", // Örnek eşleştirme
  "Birim Haberleri": "academic",
  "Üniversite Duyuruları": "general"
};

// Filtreleme için kullanılacak ham liste (API Verisi)
const RAW_CATEGORIES = [
  "Tümü",
  "Üniversite Haberleri", 
  "Birim Haberleri", 
  "Üniversite Duyuruları", 
  "Öğrenci Duyuruları"
];

export const AnnouncementList = ({ data, onItemClick }: AnnouncementListProps) => {
  const { language, dictionary } = useLanguage(); // <-- HOOK
  const [selectedCategory, setSelectedCategory] = useState("Üniversite Haberleri");

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Tarih formatını dile göre ayarla
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long' });
  };

  const filteredList = selectedCategory === "Tümü" 
    ? data 
    : data.filter(item => item.kategori === selectedCategory);

 const getCategoryDisplayName = (rawName: string) => {
    if (rawName === "Tümü") return dictionary.categories.all;
    
    // --- GÜNCELLENEN MANTIK ---
    // İçinde kelime aramak yerine, gelen isme göre mantıklı bir kategori atıyoruz.
    
    if (rawName === "Öğrenci Duyuruları") return dictionary.categories.student; // "Öğrenci"
    if (rawName === "Birim Haberleri") return dictionary.categories.academic;   // "Akademik" (Fakülteler vb.)
    if (rawName === "Üniversite Duyuruları") return dictionary.categories.admin; // "İdari" (Rektörlük vb.)
    if (rawName === "Üniversite Haberleri") return dictionary.categories.general; // "Genel"
    
    return dictionary.categories.general; // Bilinmeyen bir şey gelirse Genel olsun
  };

  return (
    <View className="mt-8 px-4 min-h-[400px]">
      
      {/* HEADER */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Bell color="#1e3a8a" size={20} fill="#1e3a8a" />
          <Text className="text-xl font-extrabold text-slate-900 ml-2">
            {dictionary.announcements} {/* CANLI YAZI */}
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
            {dictionary.categories.all} {/* CANLI YAZI */}
          </Text>
        </TouchableOpacity>
      </View>

      {/* KATEGORİLER */}
      <View className="mb-5">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-ml-4 pl-4">
          {RAW_CATEGORIES.filter(k => k !== "Tümü").map((kat) => {
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
                  {getCategoryDisplayName(kat)} {/* ÇEVRİLMİŞ İSİM */}
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
            <Text className="text-slate-400 mt-2 font-medium">
              {language === 'tr' ? 'İçerik bulunamadı.' : 'No content found.'}
            </Text>
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
                
                {/* DİNAMİK BAŞLIK SEÇİMİ */}
                <Text className="text-slate-800 font-bold text-sm leading-5 mb-2">
                  {language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR)}
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
                          {getCategoryDisplayName(item.kategori)}
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