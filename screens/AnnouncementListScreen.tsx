import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Filter, ChevronDown, Check, Megaphone, X } from 'lucide-react-native';
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

const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const AnnouncementListScreen = ({ navigation }: any) => {
  const { language, dictionary } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState<GenericItem[]>([]); 
  const [filteredData, setFilteredData] = useState<GenericItem[]>([]);
  
  // --- FİLTRE STATELERİ ---
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // --- MODAL STATELERİ ---
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  
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
        
        image: item.haberDuyuruFoto || null, 
        
        category: item.kategori,
        originalData: item
      }));

      setAllData(formattedData);
      setFilteredData(formattedData); 

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

  // --- ANA FİLTRELEME FONKSİYONU ---
  const applyFilters = (category: string, month: number | null) => {
    let result = allData;

    // 1. Kategori Filtresi
    if (category !== "Tümü") {
      result = result.filter(item => item.category === category);
    }

    // 2. Ay Filtresi
    if (month !== null) {
      result = result.filter(item => {
        const rawDate = (item.originalData as HaberItem).baslamaZamani;
        const itemMonth = new Date(rawDate).getMonth(); 
        return itemMonth === month;
      });
    }

    setFilteredData(result);
  };

  const handleCategorySelect = (catValue: string) => {
    setSelectedCategory(catValue);
    setIsCategoryDropdownOpen(false);
    applyFilters(catValue, selectedMonth); 
  };

  const handleMonthSelect = (monthIndex: number | null) => {
    setSelectedMonth(monthIndex);
    setIsMonthDropdownOpen(false);
    applyFilters(selectedCategory, monthIndex); 
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

  const monthOptions = language === 'tr' ? MONTHS_TR : MONTHS_EN;

  const handleItemPress = async (item: GenericItem) => {
    const rawItem = item.originalData as HaberItem;
    
    const initialData: DetailData = {
        title: item.title,
        date: item.date,
        content: language === 'tr' ? (rawItem.icerikTR || "") : (rawItem.icerikEN || rawItem.icerikTR || ""),
        image: rawItem.haberDuyuruFoto, 
        category: getCategoryDisplayName(item.category || ""),
        gallery: []
    };

    setSelectedItem(initialData);
    setModalVisible(true);

    try {

        const response = await fetch(`https://testapi.kastamonu.edu.tr/api/haberduyuru/${item.id}`);
        const json = await response.json();
        const detailData = json.data;

        if (detailData) {

            
            const freshImage = (detailData.haberFotolar && detailData.haberFotolar.length > 0) 
                ? detailData.haberFotolar[0] 
                : initialData.image;

            setSelectedItem({
                ...initialData,
                title: language === 'tr' 
                    ? (detailData.baslikTR || initialData.title) 
                    : (detailData.baslikEN || initialData.title),
                content: language === 'tr' 
                    ? (detailData.icerikTR || initialData.content) 
                    : (detailData.icerikEN || initialData.content),
                
                image: freshImage, 
                gallery: detailData.haberFotolar || []
            });
        }
    } catch (error) {
        console.error("Duyuru detay hatası:", error);
    }
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
  const selectedCategoryLabel = getCategoryDisplayName(selectedCategory);
  const selectedMonthLabel = selectedMonth !== null 
    ? monthOptions[selectedMonth] 
    : (language === 'tr' ? 'Tüm Aylar' : 'All Months');

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      
      {/* HEADER */}
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

      {/* FİLTRE ALANI (YAN YANA İKİ DROPDOWN) */}
      <View className="px-4 py-4 z-20 flex-row gap-3">
        
        {/* 1. KATEGORİ SEÇİMİ */}
        <TouchableOpacity 
          onPress={() => setIsCategoryDropdownOpen(true)}
          activeOpacity={0.9}
          className={`flex-1 flex-row items-center justify-between bg-white border p-3 rounded-xl shadow-sm ${activeTheme.border.replace('border-', 'border-opacity-30 border-')}`}
          style={{ borderColor: activeTheme.iconHex + '40' }}
        >
          <View className="flex-row items-center flex-1 mr-2">
            <View className={`p-1.5 rounded-lg mr-2 ${activeTheme.lightBadge}`}>
              <Filter size={16} color={activeTheme.iconHex} />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] text-slate-400 font-medium" numberOfLines={1}>
                {language === 'tr' ? 'Kategori' : 'Category'}
              </Text>
              <Text className="text-slate-800 font-bold text-sm" numberOfLines={1}>
                {selectedCategoryLabel}
              </Text>
            </View>
          </View>
          <ChevronDown size={16} color="#64748b" />
        </TouchableOpacity>

        {/* 2. AY SEÇİMİ */}
        <TouchableOpacity 
          onPress={() => setIsMonthDropdownOpen(true)}
          activeOpacity={0.9}
          className="flex-1 flex-row items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm"
        >
          <View className="flex-row items-center flex-1 mr-2">
            <View className="p-1.5 rounded-lg mr-2 bg-orange-50">
              <Calendar size={16} color="#ea580c" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] text-slate-400 font-medium" numberOfLines={1}>
                {language === 'tr' ? 'Tarih' : 'Date'}
              </Text>
              <Text className={`text-sm font-bold ${selectedMonth !== null ? 'text-orange-600' : 'text-slate-800'}`} numberOfLines={1}>
                {selectedMonthLabel}
              </Text>
            </View>
          </View>
          {selectedMonth !== null ? (
             <TouchableOpacity onPress={() => handleMonthSelect(null)}>
                 <X size={16} color="#94a3b8" />
             </TouchableOpacity>
          ) : (
             <ChevronDown size={16} color="#64748b" />
          )}
        </TouchableOpacity>

      </View>

      {/* --- KATEGORİ MODALI --- */}
      <Modal visible={isCategoryDropdownOpen} transparent animationType="fade">
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setIsCategoryDropdownOpen(false)}
        >
          <View className="bg-white rounded-3xl p-4 shadow-2xl max-h-[60%]">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-slate-100">
               <Text className="text-lg font-bold text-slate-800">
                 {language === 'tr' ? 'Kategoriler' : 'Categories'}
               </Text>
               <TouchableOpacity onPress={() => setIsCategoryDropdownOpen(false)}>
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
                    onPress={() => handleCategorySelect(item)}
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

      {/* --- AY SEÇİM MODALI --- */}
      <Modal visible={isMonthDropdownOpen} transparent animationType="fade">
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setIsMonthDropdownOpen(false)}
        >
          <View className="bg-white rounded-3xl p-4 shadow-2xl max-h-[60%]">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-slate-100">
               <Text className="text-lg font-bold text-slate-800">
                 {language === 'tr' ? 'Ay Seçiniz' : 'Select Month'}
               </Text>
               <TouchableOpacity onPress={() => setIsMonthDropdownOpen(false)}>
                 <Text className="font-bold text-slate-500">{language === 'tr' ? 'Kapat' : 'Close'}</Text>
               </TouchableOpacity>
            </View>
            
            <FlatList 
              data={monthOptions}
              keyExtractor={(item, index) => index.toString()}
              ListHeaderComponent={
                <TouchableOpacity 
                    onPress={() => handleMonthSelect(null)}
                    className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${selectedMonth === null ? 'bg-orange-50' : 'active:bg-slate-50'}`}
                  >
                    <Text className={`font-semibold text-base ${selectedMonth === null ? 'text-orange-600' : 'text-slate-700'}`}>
                      {language === 'tr' ? 'Tüm Aylar' : 'All Months'}
                    </Text>
                    {selectedMonth === null && <Check size={18} color="#ea580c" />}
                </TouchableOpacity>
              }
              renderItem={({ item, index }) => {
                const isSelected = selectedMonth === index;
                return (
                  <TouchableOpacity 
                    onPress={() => handleMonthSelect(index)}
                    className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${isSelected ? 'bg-orange-50' : 'active:bg-slate-50'}`}
                  >
                    <Text className={`font-semibold text-base ${isSelected ? 'text-orange-600' : 'text-slate-700'}`}>
                      {item}
                    </Text>
                    {isSelected && (
                      <Check size={18} color="#ea580c" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* LİSTE */}
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
                {language === 'tr' ? 'Seçilen kriterlere uygun içerik bulunamadı.' : 'No content found for selected criteria.'}
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