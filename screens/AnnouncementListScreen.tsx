import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Filter, ChevronDown, Check, Megaphone } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';
import { DetailModal, DetailData } from '../components/DetailModal';
import { GenericItem } from '../components/AllItemsPage';

interface HaberItem {
  id: number;
  baslikTR: string;
  baslikEN?: string;
  icerikTR: string;
  icerikEN?: string;
  baslamaZamani: string;
  haberDuyuruFoto: string | null;
  kategori: string;
}

const CATEGORY_THEMES: Record<string, {
  bg: string;       
  text: string;     
  border: string;   
  lightBadge: string; 
  iconHex: string;    
}> = {
  "Tümü": {
    bg: "bg-slate-700", text: "text-slate-700", border: "border-slate-700", lightBadge: "bg-slate-100", iconHex: "#334155"
  },
  "Üniversite Haberleri": { 
    bg: "bg-sky-600", text: "text-sky-600", border: "border-sky-600", lightBadge: "bg-sky-50", iconHex: "#0284c7"
  },
  "Birim Haberleri": { 
    bg: "bg-rose-500", text: "text-rose-600", border: "border-rose-500", lightBadge: "bg-rose-50", iconHex: "#e11d48"
  },
  "Üniversite Duyuruları": { 
    bg: "bg-violet-600", text: "text-violet-600", border: "border-violet-600", lightBadge: "bg-violet-50", iconHex: "#7c3aed"
  },
  "Öğrenci Duyuruları": { 
    bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-500", lightBadge: "bg-amber-50", iconHex: "#d97706"
  },
  "Default": {
    bg: "bg-slate-500", text: "text-slate-600", border: "border-slate-400", lightBadge: "bg-slate-50", iconHex: "#64748b"
  }
};

const TRANSLATIONS: Record<string, string> = {
  "Üniversite Haberleri": "University News",
  "Birim Haberleri": "Unit News",
  "Üniversite Duyuruları": "University Announcements",
  "Öğrenci Duyuruları": "Student Announcements",
  "Tümü": "All"
};

export const AnnouncementListScreen = ({ navigation }: any) => {
  const { language, dictionary } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState<GenericItem[]>([]); 
  const [filteredData, setFilteredData] = useState<GenericItem[]>([]);
  
  const ALL_LABEL = language === 'tr' ? "Tümü" : "All";
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DetailData | null>(null);

  useEffect(() => {
    fetchData();
  }, [language]);

  const fetchData = async () => {
    try {
      const response = await fetch('https://testapi.kastamonu.edu.tr/api/haberduyuru');
      const json = await response.json();
      const rawData: HaberItem[] = json.data || [];

      const formattedData: GenericItem[] = rawData.map(item => ({
        id: item.id,
        title: language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR),
        date: new Date(item.baslamaZamani).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        
        // 1. DÜZELTME: Veri haritalanırken resmi de alıyoruz
        image: item.haberDuyuruFoto || null, 
        
        category: item.kategori,
        originalData: item
      }));

      setAllData(formattedData);
      
      if (selectedCategory === "Tümü") {
        setFilteredData(formattedData);
      } else {
        setFilteredData(formattedData.filter(item => item.category === selectedCategory));
      }

    } catch (error) {
      console.error("Duyuru verisi alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDisplayName = (rawName: string) => {
    if (rawName === "Tümü" || rawName === "All") return language === 'tr' ? "Tümü" : "All";
    if (language === 'tr') return rawName; 
    return TRANSLATIONS[rawName] || rawName; 
  };

  const getTheme = (catName: string) => {
    if (catName === "Tümü") return CATEGORY_THEMES["Tümü"];
    if (CATEGORY_THEMES[catName]) return CATEGORY_THEMES[catName];
    
    const lowerName = catName.toLowerCase();
    if (lowerName.includes("öğrenci") || lowerName.includes("student")) return CATEGORY_THEMES["Öğrenci Duyuruları"];
    if (lowerName.includes("birim") || lowerName.includes("fakülte")) return CATEGORY_THEMES["Birim Haberleri"];
    if (lowerName.includes("haber") || lowerName.includes("news")) return CATEGORY_THEMES["Üniversite Haberleri"];
    if (lowerName.includes("duyuru") || lowerName.includes("announcement")) return CATEGORY_THEMES["Üniversite Duyuruları"];
    
    return CATEGORY_THEMES["Default"];
  };

  const filterOptions = useMemo(() => {
    const uniqueCats = new Set<string>();
    allData.forEach(item => {
        if (item.category) uniqueCats.add(item.category);
    });

    const options = ["Tümü"]; 
    uniqueCats.forEach(cat => options.push(cat));
    
    return options;
  }, [allData]);

  const handleFilterSelect = (catValue: string) => {
    setSelectedCategory(catValue);
    setIsDropdownOpen(false);

    if (catValue === "Tümü") {
      setFilteredData(allData);
    } else {
      setFilteredData(allData.filter(item => item.category === catValue));
    }
  };

  const handleItemPress = (item: GenericItem) => {
    const rawItem = item.originalData as HaberItem;
    
    // Debug için konsola yazdırıyoruz
    // console.log("Seçilen Öğenin Resmi:", rawItem.haberDuyuruFoto);

    setSelectedItem({
        title: item.title,
        date: item.date,
        content: language === 'tr' ? (rawItem.icerikTR || "") : (rawItem.icerikEN || rawItem.icerikTR || ""),
        
        // 2. DÜZELTME: Burası null idi, API'den gelen veriyi bağlıyoruz
        image: rawItem.haberDuyuruFoto, 
        
        category: getCategoryDisplayName(item.category || "") 
    });
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: GenericItem }) => {
    const theme = getTheme(item.category || "");
    const displayName = getCategoryDisplayName(item.category || "");
    
    return (
      <TouchableOpacity 
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
        className="bg-white rounded-xl border border-slate-100 shadow-sm flex-row items-stretch overflow-hidden mb-3 h-28"
      >
        <View className={`w-1.5 ${theme.bg}`} />
        <View className={`w-16 items-center justify-center border-r border-slate-50 ${theme.lightBadge}`}>
             <Megaphone size={24} color={theme.iconHex} />
        </View>

        <View className="flex-1 p-3 pl-3 justify-between">
            <View>
                <Text className="text-slate-800 font-bold text-sm leading-5 mb-1" numberOfLines={3}>
                    {item.title}
                </Text>
            </View>

            <View className="flex-row items-center justify-between mt-auto">
                <View className="flex-row items-center">
                    <Calendar size={14} color={theme.iconHex} />
                    <Text className="text-slate-500 text-xs ml-1.5 font-medium">
                        {item.date}
                    </Text>
                </View>

                <View className={`px-2 py-0.5 rounded border border-transparent ${theme.lightBadge}`}>
                    <Text className={`text-[9px] font-bold ${theme.text}`} numberOfLines={1}>
                        {displayName}
                    </Text>
                </View>
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  const activeTheme = getTheme(selectedCategory);
  const selectedLabel = getCategoryDisplayName(selectedCategory);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      
      <View className="px-4 py-3 bg-white border-b border-slate-100 flex-row items-center justify-between shadow-sm z-10">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100 active:bg-slate-100"
        >
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        
        <Text className="text-lg font-bold text-slate-800">{dictionary.announcements}</Text>
        <View className="w-10" /> 
      </View>

      <View className="px-4 py-4 z-20">
        <TouchableOpacity 
          onPress={() => setIsDropdownOpen(true)}
          activeOpacity={0.9}
          className={`flex-row items-center justify-between bg-white border p-4 rounded-xl shadow-sm ${activeTheme.border.replace('border-', 'border-opacity-30 border-')}`}
          style={{ borderColor: activeTheme.iconHex + '40' }}
        >
          <View className="flex-row items-center">
            <View className={`p-2 rounded-lg mr-3 ${activeTheme.lightBadge}`}>
              <Filter size={18} color={activeTheme.iconHex} />
            </View>
            <View>
              <Text className="text-xs text-slate-400 font-medium">
                {language === 'tr' ? 'Kategori Seçiniz' : 'Select Category'}
              </Text>
              <Text className="text-slate-800 font-bold text-base">
                {selectedLabel}
              </Text>
            </View>
          </View>
          <ChevronDown size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <Modal visible={isDropdownOpen} transparent animationType="fade">
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View className="bg-white rounded-3xl p-4 shadow-2xl max-h-[60%]">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-slate-100">
               <Text className="text-lg font-bold text-slate-800">
                 {language === 'tr' ? 'Kategoriler' : 'Categories'}
               </Text>
               <TouchableOpacity onPress={() => setIsDropdownOpen(false)}>
                 <Text className="font-bold text-slate-500">{language === 'tr' ? 'Kapat' : 'Close'}</Text>
               </TouchableOpacity>
            </View>
            
            <FlatList 
              data={filterOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = selectedCategory === item;
                const itemTheme = getTheme(item);
                const displayItemName = getCategoryDisplayName(item);

                return (
                  <TouchableOpacity 
                    onPress={() => handleFilterSelect(item)}
                    className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${isSelected ? itemTheme.lightBadge : 'active:bg-slate-50'}`}
                  >
                    <Text className={`font-semibold text-base ${isSelected ? itemTheme.text : 'text-slate-700'}`}>
                      {displayItemName}
                    </Text>
                    {isSelected && (
                      <Check size={18} color={itemTheme.iconHex} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ea580c" />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-10 p-6">
              <Text className="text-slate-400 text-center text-base">
                {language === 'tr' ? 'İçerik bulunamadı.' : 'No content found.'}
              </Text>
            </View>
          }
        />
      )}

      <DetailModal 
        visible={modalVisible}
        data={selectedItem}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};