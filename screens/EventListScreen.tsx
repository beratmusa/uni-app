import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Filter, ChevronDown, Check, MapPin } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';
import { DetailModal, DetailData } from '../components/DetailModal';
import { GenericItem } from '../components/AllItemsPage';

// API'den gelen veri tipi
interface EtkinlikItem {
  id: number;
  baslikTR: string;
  baslikEN?: string;
  icerikTR: string;
  baslamaZamani: string;
  bitisZamani?: string;
  yerTR: string; // Etkinlik yeri
  pathTR: string | null; // Resim
}

// Filtre Seçeneği Tipi
interface FilterOption {
  label: string;
  value: string;
}

export const EventListScreen = ({ navigation }: any) => {
  const { language, dictionary } = useLanguage();
  
  // State'ler
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState<GenericItem[]>([]); 
  const [filteredData, setFilteredData] = useState<GenericItem[]>([]);
  
  // Filtre (Combobox) State'leri
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>({ 
    label: language === 'tr' ? 'Tüm Etkinlikler' : 'All Events', 
    value: 'all' 
  });
  
  // Modal State'leri
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DetailData | null>(null);

  useEffect(() => {
    fetchData();
  }, [language]);

  const fetchData = async () => {
    try {
      const response = await fetch('https://testapi.kastamonu.edu.tr/api/etkinlik');
      const json = await response.json();
      const rawData: EtkinlikItem[] = json.data || [];

      const formattedData: GenericItem[] = rawData.map(item => ({
        id: item.id,
        title: language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR),
        // Tarihi string olarak formatlıyoruz
        date: new Date(item.baslamaZamani).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        image: item.pathTR, 
        category: dictionary.events, 
        originalData: item
      }));

      setAllData(formattedData);
      setFilteredData(formattedData);
    } catch (error) {
      console.error("Etkinlik verisi alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FİLTRE SEÇENEKLERİNİ OLUŞTURMA (AY/YIL) ---
  const filterOptions = useMemo(() => {
    const options: FilterOption[] = [
      { label: language === 'tr' ? 'Tüm Etkinlikler' : 'All Events', value: 'all' }
    ];

    const uniqueMonths = new Set<string>();

    allData.forEach(item => {
      // Orijinal veriden tarihi al
      const rawItem = item.originalData as EtkinlikItem;
      const date = new Date(rawItem.baslamaZamani);
      
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11
      const key = `${year}-${(month + 1).toString().padStart(2, '0')}`; // "2025-12"

      if (!uniqueMonths.has(key)) {
        uniqueMonths.add(key);
        
        // Ay İsimleri (Dil desteğiyle)
        const dateObj = new Date(year, month);
        const monthName = dateObj.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long' });
        const label = `${monthName} ${year}`; // "Aralık 2025"
        
        options.push({ label, value: key });
      }
    });

    return options;
  }, [allData, language]);

  // --- FİLTRELEME İŞLEMİ ---
  const handleFilterSelect = (option: FilterOption) => {
    setSelectedFilter(option);
    setIsDropdownOpen(false);

    if (option.value === 'all') {
      setFilteredData(allData);
    } else {
      // Seçilen "2025-12" değerine göre filtrele
      const filtered = allData.filter(item => {
        const rawItem = item.originalData as EtkinlikItem;
        return rawItem.baslamaZamani.startsWith(option.value);
      });
      setFilteredData(filtered);
    }
  };

  // --- DETAY GÖSTERİMİ ---
  const handleItemPress = (item: GenericItem) => {
    const rawItem = item.originalData as EtkinlikItem;
    setSelectedItem({
        title: item.title,
        date: item.date,
        content: rawItem.icerikTR,
        image: item.image,
        location: rawItem.yerTR, // Konum bilgisini gönderiyoruz
        category: dictionary.events
    });
    setModalVisible(true);
  };

  // --- KART TASARIMI ---
  const renderItem = ({ item }: { item: GenericItem }) => {
    const rawItem = item.originalData as EtkinlikItem;
    
    return (
      <TouchableOpacity 
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
        // DÜZELTME: border-rose-200 yerine border-red-200 kullanıldı (Standart renk)
        className="bg-white rounded-xl mb-3 shadow-sm border-red-200 flex-row h-32 "
      >
        {/* SOL: RESİM ALANI */}
        {/* w-32: Genişlik sabit, h-full: Yükseklik tam */}
        {item.image ? (
            <Image 
              source={{ uri: item.image }} 
              className="w-32 h-full bg-slate-200" 
              resizeMode="cover"
            />
        ) : (
            // Resim yoksa Kırmızı kutu içinde takvim ikonu
            // DÜZELTME: bg-rose-50 -> bg-red-50
            <View className="w-32 h-full bg-red-50 items-center justify-center border-r border-red-100">
                <Calendar size={32} color="#dc2626" />
            </View>
        )}

        {/* SAĞ: İÇERİK */}
        <View className="flex-1 p-3 justify-between">
            <View>
                {/* Başlık */}
                <Text className="text-slate-800 font-bold text-sm leading-5 mb-1" numberOfLines={2}>
                    {item.title}
                </Text>
                
                {/* Konum (Varsa) */}
                {rawItem.yerTR && (
                  <View className="flex-row items-center mt-1">
                    <MapPin size={12} color="#dc2626" className="mr-1" />
                    <Text className="text-slate-500 text-xs font-medium flex-1" numberOfLines={1}>
                      {rawItem.yerTR}
                    </Text>
                  </View>
                )}
            </View>
            
            {/* Tarih (Alt Kısım) */}
            <View className="flex-row items-center mt-auto">
                <Calendar size={12} color="#94a3b8" className="mr-1"/>
                <Text className="text-slate-400 text-xs font-medium">
                    {item.date}
                </Text>
            </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        
        <Text className="text-lg font-bold text-slate-800">{dictionary.events}</Text>
        
        <View className="w-10" /> 
      </View>

      {/* FİLTRE ALANI (COMBOBOX) - KIRMIZI TEMA */}
      <View className="px-4 py-4 z-20">
        <TouchableOpacity 
          onPress={() => setIsDropdownOpen(true)}
          activeOpacity={0.8}
          // DÜZELTME: border-rose-200 -> border-red-200 (Siyah kenarlığı engellemek için)
          className="flex-row items-center justify-between bg-white border-red-200 p-4 rounded-xl shadow-sm"
        >
          <View className="flex-row items-center">
            <View className="bg-red-50 p-2 rounded-lg mr-3">
              <Filter size={18} color="#dc2626" />
            </View>
            <View>
              <Text className="text-xs text-slate-400 font-medium">
                {language === 'tr' ? 'Dönem Seçiniz' : 'Select Period'}
              </Text>
              <Text className="text-slate-800 font-bold text-base">{selectedFilter.label}</Text>
            </View>
          </View>
          <ChevronDown size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* DROPDOWN MODAL */}
      <Modal visible={isDropdownOpen} transparent animationType="fade">
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View className="bg-white rounded-3xl p-4 shadow-2xl max-h-[50%]">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-slate-100">
               <Text className="text-lg font-bold text-slate-800">
                 {language === 'tr' ? 'Filtrele' : 'Filter'}
               </Text>
               <TouchableOpacity onPress={() => setIsDropdownOpen(false)}>
                 <Text className="text-red-600 font-bold">
                   {language === 'tr' ? 'Kapat' : 'Close'}
                 </Text>
               </TouchableOpacity>
            </View>
            
            <FlatList 
              data={filterOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => handleFilterSelect(item)}
                  // DÜZELTME: bg-rose-50 -> bg-red-50
                  className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${selectedFilter.value === item.value ? 'bg-red-50' : 'active:bg-slate-50'}`}
                >
                  {/* DÜZELTME: text-rose-700 -> text-red-700 */}
                  <Text className={`font-semibold text-base ${selectedFilter.value === item.value ? 'text-red-700' : 'text-slate-700'}`}>
                    {item.label}
                  </Text>
                  {selectedFilter.value === item.value && (
                    <Check size={18} color="#dc2626" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* LİSTE */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#dc2626" />
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
                {language === 'tr' ? 'Bu tarih aralığında etkinlik bulunamadı.' : 'No events found in this date range.'}
              </Text>
            </View>
          }
        />
      )}

      {/* DETAY MODAL */}
      <DetailModal 
        visible={modalVisible}
        data={selectedItem}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};