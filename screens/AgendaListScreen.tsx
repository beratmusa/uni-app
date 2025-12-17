import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Filter, ChevronDown, Check, Calendar } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';
import { GundemItem } from '../components/AgendaList';
import { DetailModal, DetailData } from '../components/DetailModal';
import { GenericItem } from '../components/AllItemsPage'; 

interface FilterOption {
  label: string;
  value: string;
}

export const AgendaListScreen = ({ navigation }: any) => {
  const { language, dictionary } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState<GenericItem[]>([]); 
  const [filteredData, setFilteredData] = useState<GenericItem[]>([]); 

  // Filtre State'leri
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>({ 
    label: language === 'tr' ? 'Tüm Gündem' : 'All Agenda', 
    value: 'all' 
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DetailData | null>(null);

  useEffect(() => {
    fetchData();
  }, [language]);

  const fetchData = async () => {
    try {
      const response = await fetch('https://testapi.kastamonu.edu.tr/api/gundem'); 
      const json = await response.json();
      const rawData: GundemItem[] = json.data || [];

      const formattedData: GenericItem[] = rawData.map(item => ({
        id: item.id,
        title: language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR),
        date: new Date(item.eklemeZamani).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        image: item.path,
        category: dictionary.agenda, 
        originalData: item 
      }));

      setAllData(formattedData);
      setFilteredData(formattedData);
    } catch (error) {
      console.error("Gündem verisi alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = useMemo(() => {
    const options: FilterOption[] = [
      { label: language === 'tr' ? 'Tüm Gündem' : 'All Agenda', value: 'all' }
    ];

    const uniqueMonths = new Set<string>();

    allData.forEach(item => {
      const rawItem = item.originalData as GundemItem;
      const date = new Date(rawItem.eklemeZamani);
      
      const year = date.getFullYear();
      const month = date.getMonth(); 
      const key = `${year}-${(month + 1).toString().padStart(2, '0')}`;

      if (!uniqueMonths.has(key)) {
        uniqueMonths.add(key);
        const dateObj = new Date(year, month);
        const monthName = dateObj.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long' });
        const label = `${monthName} ${year}`;
        options.push({ label, value: key });
      }
    });

    return options;
  }, [allData, language]);

  const handleFilterSelect = (option: FilterOption) => {
    setSelectedFilter(option);
    setIsDropdownOpen(false);

    if (option.value === 'all') {
      setFilteredData(allData);
    } else {
      const filtered = allData.filter(item => {
        const rawItem = item.originalData as GundemItem;
        return rawItem.eklemeZamani.startsWith(option.value);
      });
      setFilteredData(filtered);
    }
  };

  const handleItemPress = async (item: GenericItem) => {
    const rawItem = item.originalData as GundemItem;
    
    let detailData: DetailData = {
        title: item.title,
        date: item.date,
        content: language === 'tr' ? rawItem.icerikTR : rawItem.icerikEN,
        image: item.image,
        category: dictionary.agenda,
        gallery: []
    };

    setSelectedItem(detailData);
    setModalVisible(true);

    try {
        const response = await fetch(`https://testapi.kastamonu.edu.tr/api/gundem/${item.id}`);
        const json = await response.json();
        const apiDetail = json.data;

        if (apiDetail) {
            setSelectedItem({
                ...detailData,
                content: language === 'tr' 
                  ? (apiDetail.icerikTR || rawItem.icerikTR) 
                  : (apiDetail.icerikEN || rawItem.icerikEN || rawItem.icerikTR),
                gallery: apiDetail.gundemFotolar || []
            });
        }
    } catch (error) {
        console.log("Detay çekilemedi.");
    }
  };

  // --- KART TASARIMI (ESKİ / STANDART HALİ) ---
  const renderItem = ({ item }: { item: GenericItem }) => (
    <TouchableOpacity 
      onPress={() => handleItemPress(item)}
      className="bg-white rounded-xl mb-3 shadow-sm border border-slate-100 flex-row h-28 overflow-hidden"
    >
       {/* SOL TARAF: RESİM KONTROLÜ */}
       {/* Eğer item.image (resim url) varsa Image bileşenini göster */}
       {item.image ? (
         <Image 
           source={{ uri: item.image }} 
           className="w-32 h-full bg-slate-200" 
           resizeMode="cover"
         />
       ) : (
         /* Resim yoksa (null ise) gri bir kutu ve takvim ikonu göster */
         <View className="w-32 h-full bg-slate-200 items-center justify-center">
            <Calendar size={32} color="#94a3b8" />
         </View>
       )}

       {/* SAĞ TARAF: İÇERİK */}
       <View className="flex-1 p-3 justify-between">
         {/* Başlık */}
         <Text className="text-slate-800 font-bold text-sm leading-5" numberOfLines={3}>
            {item.title}
         </Text>
         
         {/* Tarih */}
         <Text className="text-slate-400 text-xs font-medium mt-auto">
            {item.date}
         </Text>
       </View>
    </TouchableOpacity>
  );

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
        
        <Text className="text-lg font-bold text-slate-800">{dictionary.agenda}</Text>
        
        <View className="w-10" /> 
      </View>

      {/* FİLTRE ALANI */}
      <View className="px-4 py-4 z-20">
        <TouchableOpacity 
          onPress={() => setIsDropdownOpen(true)}
          activeOpacity={0.8}
          className="flex-row items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm"
        >
          <View className="flex-row items-center">
            <View className="bg-blue-50 p-2 rounded-lg mr-3">
              <Filter size={18} color="#2563eb" />
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
                 <Text className="text-blue-600 font-bold">
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
                  className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${selectedFilter.value === item.value ? 'bg-blue-50' : 'active:bg-slate-50'}`}
                >
                  <Text className={`font-semibold text-base ${selectedFilter.value === item.value ? 'text-blue-700' : 'text-slate-700'}`}>
                    {item.label}
                  </Text>
                  {selectedFilter.value === item.value && (
                    <Check size={18} color="#2563eb" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* LİSTE (SADELEŞTİRİLMİŞ KARTLAR) */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
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
                {language === 'tr' ? 'Bu tarih aralığında gündem maddesi bulunamadı.' : 'No agenda items found in this date range.'}
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