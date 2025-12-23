import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, ChevronRight, Bell, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';

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
  "Üniversite Haberleri", 
  "Birim Haberleri", 
  "Üniversite Duyuruları", 
  "Öğrenci Duyuruları"
];

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  "Üniversite Haberleri": "University News",
  "Birim Haberleri": "Unit News",
  "Üniversite Duyuruları": "Uni. Announcements", 
  "Öğrenci Duyuruları": "Student Announcements",
  "Tümü": "All"
};

const CATEGORY_THEMES: Record<string, {
  bg: string;       
  text: string;     
  border: string;   
  lightBadge: string; 
  iconHex: string;    
  gradient: readonly [string, string, string];
}> = {
  "Tümü": {
    bg: "bg-slate-700", text: "text-slate-700", border: "border-slate-700", lightBadge: "bg-slate-100", iconHex: "#334155", 
    gradient: ['#f8fafc', '#f1f5f9', '#e2e8f0']
  },
  "Üniversite Haberleri": { 
    bg: "bg-sky-600", text: "text-sky-600", border: "border-sky-600", lightBadge: "bg-sky-50", iconHex: "#0284c7", 
    gradient: ['#f0f9ff', '#e0f2fe', '#bae6fd']
  },
  "Birim Haberleri": { 
    bg: "bg-rose-500", text: "text-rose-600", border: "border-rose-500", lightBadge: "bg-rose-50", iconHex: "#e11d48", 
    gradient: ['#fff1f2', '#ffe4e6', '#fecdd3']
  },
  "Üniversite Duyuruları": { 
    bg: "bg-violet-600", text: "text-violet-600", border: "border-violet-600", lightBadge: "bg-violet-50", iconHex: "#7c3aed", 
    gradient: ['#f5f3ff', '#ede9fe', '#ddd6fe']
  },
  "Öğrenci Duyuruları": { 
    bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-500", lightBadge: "bg-amber-50", iconHex: "#d97706", 
    gradient: ['#fffbeb', '#fef3c7', '#fde68a']
  },
  "Default": {
    bg: "bg-slate-500", text: "text-slate-600", border: "border-slate-500", lightBadge: "bg-slate-50", iconHex: "#64748b",
    gradient: ['#f1f5f9', '#e2e8f0', '#cbd5e1']
  }
};

export const AnnouncementList = ({ data, onItemClick }: AnnouncementListProps) => {
  const { language, dictionary } = useLanguage();
  const navigation = useNavigation<any>();
  
  const [selectedCategory, setSelectedCategory] = useState("Üniversite Haberleri");

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long' });
  };

  const filteredList = selectedCategory === "Tümü" 
    ? data 
    : data.filter(item => item.kategori === selectedCategory);

  const getTheme = (catName: string) => {
    if (catName === "Tümü") return CATEGORY_THEMES["Tümü"];
    if (CATEGORY_THEMES[catName]) return CATEGORY_THEMES[catName];
    
    const lower = catName.toLowerCase();
    if (lower.includes("öğrenci")) return CATEGORY_THEMES["Öğrenci Duyuruları"];
    if (lower.includes("birim")) return CATEGORY_THEMES["Birim Haberleri"];
    if (lower.includes("duyuru")) return CATEGORY_THEMES["Üniversite Duyuruları"];
    if (lower.includes("haber")) return CATEGORY_THEMES["Üniversite Haberleri"];
    
    return CATEGORY_THEMES["Default"];
  };
  
  const activeTheme = getTheme(selectedCategory);

  const getDisplayName = (originalName: string) => {
    if (language === 'tr') return originalName;
    return CATEGORY_TRANSLATIONS[originalName] || originalName;
  };

  
  const splitTitle = (title: string) => {
    const parts = title.split(" ");
    if (parts.length < 2) return { first: title, second: "" };
    return { first: parts[0], second: parts.slice(1).join(" ") };
  };

  return (
    <View className="mt-8 mx-4 rounded-3xl relative overflow-hidden bg-white shadow-sm border border-white/60">
      
      
      <LinearGradient
        colors={activeTheme.gradient as any} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      <View className="absolute -top-16 -right-16 w-48 h-48 bg-white/30 rounded-full" />
      <View className="absolute top-24 -left-12 w-64 h-64 bg-white/20 rounded-full" />

      <View className="p-5 min-h-[400px]">
        
        {/* HEADER */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="bg-white/60 p-1.5 rounded-full mr-2">
              <Bell color={activeTheme.iconHex} size={18} /> 
            </View>
            <Text className="text-xl font-extrabold text-slate-900">
              {dictionary.announcements}
            </Text>
          </View>

          <TouchableOpacity 
            onPress={() => navigation.navigate('AnnouncementList')} 
            className="px-3 py-1.5 rounded-full border bg-white/60 border-slate-200"
          >
            <Text className="text-xs font-bold text-slate-600">
              {dictionary.seeAll || "Tümü"} 
            </Text>
          </TouchableOpacity>
        </View>

        {/* KATEGORİ FİLTRELERİ (TEK SATIR - EŞİT GENİŞLİK) */}
        <View className="flex-row items-stretch justify-between gap-x-1.5 mb-5">
            {RAW_CATEGORIES.map((kat) => {
              const isActive = selectedCategory === kat;
              const theme = getTheme(kat);
              
              const displayName = getDisplayName(kat);
              const { first, second } = splitTitle(displayName);

              return (
                <TouchableOpacity
                  key={kat}
                  onPress={() => setSelectedCategory(kat)}
                  className={`flex-1 py-2 px-0.5 rounded-xl border shadow-sm items-center justify-center min-h-[45px] ${
                    isActive 
                      ? `${theme.bg} ${theme.border}` 
                      : "bg-white/80 border-white/40"
                  }`}
                >
                  {/* Birinci Satır (Bold) */}
                  <Text className={`text-[10px] font-bold text-center leading-3 ${isActive ? "text-white" : "text-slate-800"}`}>
                    {first}
                  </Text>
                  
                  {/* İkinci Satır (Normal) */}
                  {second ? (
                    <Text className={`text-[9px] font-bold text-center mt-0.5 leading-3 ${isActive ? "text-white" : "text-slate-800"}`}>
                        {second}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
        </View>

        {/* LİSTE */}
        <View className="gap-3">
          {filteredList.length === 0 ? (
            <View className="items-center py-10 opacity-50">
              <Filter size={30} color="#64748b" />
              <Text className="text-slate-600 mt-2 font-medium">
                {language === 'tr' ? 'Bu kategoride içerik bulunamadı.' : 'No content in this category.'}
              </Text>
            </View>
          ) : (
            filteredList.slice(0, 5).map((item) => {
              const itemTheme = getTheme(item.kategori);
              const displayCategory = getDisplayName(item.kategori);

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
                          <Calendar size={12} color={itemTheme.iconHex} />
                          <Text className="text-slate-500 text-xs ml-1.5 font-medium">
                            {formatDate(item.baslamaZamani)}
                          </Text>
                        </View>
                    </View>
                  </View>
                  
                  <View className="justify-center pr-3 opacity-30">
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