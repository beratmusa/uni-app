import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, ChevronRight, Bell, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

// --- RENK TEMALARI ---
const CATEGORY_THEMES: Record<string, {
  bg: string;       
  text: string;     
  border: string;   
  lightBadge: string; 
  iconHex: string;    
  gradient: readonly [string, string, string];
}> = {
  "Tümü": {
    bg: "bg-slate-700",
    text: "text-slate-700",
    border: "border-slate-700",
    lightBadge: "bg-slate-100",
    iconHex: "#334155", 
    gradient: ['#f8fafc', '#f1f5f9', '#e2e8f0']
  },
  "Üniversite Haberleri": { 
    bg: "bg-sky-600",
    text: "text-sky-600",
    border: "border-sky-600",
    lightBadge: "bg-sky-50",
    iconHex: "#0284c7", 
    gradient: ['#f0f9ff', '#e0f2fe', '#bae6fd']
  },
  "Birim Haberleri": { 
    bg: "bg-rose-500",
    text: "text-rose-600",
    border: "border-rose-500",
    lightBadge: "bg-rose-50",
    iconHex: "#e11d48", 
    gradient: ['#fff1f2', '#ffe4e6', '#fecdd3']
  },
  "Üniversite Duyuruları": { 
    bg: "bg-violet-600",
    text: "text-violet-600",
    border: "border-violet-600",
    lightBadge: "bg-violet-50",
    iconHex: "#7c3aed", 
    gradient: ['#f5f3ff', '#ede9fe', '#ddd6fe']
  },
  "Öğrenci Duyuruları": { 
    bg: "bg-amber-500",
    text: "text-amber-600",
    border: "border-amber-500",
    lightBadge: "bg-amber-50",
    iconHex: "#d97706", 
    gradient: ['#fffbeb', '#fef3c7', '#fde68a']
  }
};

const DEFAULT_THEME = CATEGORY_THEMES["Üniversite Haberleri"];

export const AnnouncementList = ({ data, onItemClick }: AnnouncementListProps) => {
  const { language, dictionary } = useLanguage();
  
  // Başlangıç kategorisi
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

  const getTheme = (catName: string) => CATEGORY_THEMES[catName] || DEFAULT_THEME;
  
  // Aktif kategorinin temasını alıyoruz (Arkaplan ve Başlıktaki Zil için)
  const activeTheme = getTheme(selectedCategory);

  return (
    <View className="mt-8 mx-4 rounded-3xl relative overflow-hidden bg-white shadow-sm border border-white/60">
      
      {/* 1. DİNAMİK ARKA PLAN GRADYANI */}
      <LinearGradient
        colors={activeTheme.gradient as any} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      {/* Dekoratif Dalgalar */}
      <View className="absolute -top-16 -right-16 w-48 h-48 bg-white/30 rounded-full" />
      <View className="absolute top-24 -left-12 w-64 h-64 bg-white/20 rounded-full" />
      <View className="absolute -bottom-10 right-10 w-32 h-32 bg-white/20 rounded-full" />

      <View className="p-5 min-h-[400px]">
        
        {/* HEADER */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="bg-white/60 p-1.5 rounded-full mr-2">
              {/* --- GÜNCELLEME BURADA --- */}
              {/* Zil ikonunun rengini aktif temanın rengi yaptık */}
              <Bell color={activeTheme.iconHex} size={18} /> 
            </View>
            <Text className="text-xl font-extrabold text-slate-900">
              {dictionary.announcements}
            </Text>
          </View>

          <TouchableOpacity 
            onPress={() => setSelectedCategory("Tümü")}
            className={`px-3 py-1.5 rounded-full border ${
              selectedCategory === "Tümü" 
                ? "bg-slate-800 border-slate-800" 
                : "bg-white/60 border-slate-200"
            }`}
          >
            <Text className={`text-xs font-bold ${
              selectedCategory === "Tümü" ? "text-white" : "text-slate-600"
            }`}>
              {dictionary.categories.all}
            </Text>
          </TouchableOpacity>
        </View>

        {/* KATEGORİ FİLTRELERİ */}
        <View className="mb-5">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-ml-1 py-1">
            {RAW_CATEGORIES.filter(k => k !== "Tümü").map((kat) => {
              const isActive = selectedCategory === kat;
              const theme = getTheme(kat);

              return (
                <TouchableOpacity
                  key={kat}
                  onPress={() => setSelectedCategory(kat)}
                  className={`mr-2 px-4 py-2 rounded-xl border shadow-sm ${
                    isActive 
                      ? `${theme.bg} ${theme.border}` 
                      : "bg-white/80 border-white/40"
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

        {/* DUYURU KARTLARI */}
        <View className="gap-3">
          {filteredList.length === 0 ? (
            <View className="items-center py-10 opacity-50">
              <Filter size={30} color="#64748b" />
              <Text className="text-slate-600 mt-2 font-medium">
                {language === 'tr' ? 'İçerik bulunamadı.' : 'No content found.'}
              </Text>
            </View>
          ) : (
            filteredList.map((item) => {
              // Her kart kendi kategorisinin rengini kullanır
              const itemTheme = getTheme(item.kategori);

              return (
                <TouchableOpacity 
                  key={item.id} 
                  onPress={() => onItemClick(item)}
                  activeOpacity={0.7}
                  className="bg-white/95 rounded-xl border border-white/50 shadow-sm flex-row items-stretch overflow-hidden"
                >
                  {/* RENKLİ ŞERİT */}
                  <View className={`w-1.5 ${itemTheme.bg}`} />

                  <View className="flex-1 p-4 pl-3">
                    <Text className="text-slate-800 font-bold text-sm leading-5 mb-2">
                      {language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR)}
                    </Text>
                    
                    <View className="flex-row items-center justify-between mt-1">
                        <View className="flex-row items-center">
                          {/* DİNAMİK İKON RENGİ */}
                          <Calendar size={12} color={itemTheme.iconHex} />
                          <Text className="text-slate-500 text-xs ml-1.5 font-medium">
                            {formatDate(item.baslamaZamani)}
                          </Text>
                        </View>
                        
                        {selectedCategory === "Tümü" && (
                          <View className={`px-2 py-0.5 rounded border border-transparent ${itemTheme.lightBadge}`}>
                            <Text className={`text-[9px] font-bold ${itemTheme.text}`} numberOfLines={1}>
                              {getCategoryDisplayName(item.kategori)}
                            </Text>
                          </View>
                        )}
                    </View>
                  </View>
                  
                  <View className="justify-center pr-3 opacity-30">
                    {/* DİNAMİK OK İKONU RENGİ */}
                    <ChevronRight size={20} color={itemTheme.iconHex} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

      </View>
    </View>
  );
};