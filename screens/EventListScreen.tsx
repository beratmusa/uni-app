import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AllItemsPage, GenericItem } from '../components/AllItemsPage';
import { useLanguage } from '../context/LanguageContext';
import { EtkinlikItem } from '../components/EventList';
// EKLENEN IMPORTLAR:
import { DetailModal, DetailData } from '../components/DetailModal';

export const EventListScreen = ({ navigation }: any) => {
  const { language, dictionary } = useLanguage();
  const [data, setData] = useState<GenericItem[]>([]);
  const [loading, setLoading] = useState(true);

  // MODAL STATE'LERİ
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
        date: new Date(item.baslamaZamani).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        image: item.pathTR, 
        category: dictionary.events, 
        originalData: item
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Etkinlik verisi alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  // TIKLAMA OLAYI
  const handleItemPress = (item: GenericItem) => {
    const rawItem = item.originalData as EtkinlikItem;

    setSelectedItem({
        title: item.title,
        date: item.date,
        content: rawItem.icerikTR, // Etkinlik içeriği genelde HTML olabilir
        image: item.image,
        location: rawItem.yerTR, // Etkinlikte konum bilgisi de var
        category: dictionary.events
    });
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  return (
    <>
      <AllItemsPage
        title={dictionary.events}
        type="event"
        data={data}
        onItemPress={handleItemPress}
      />

      {/* MODAL EKLENDİ */}
      <DetailModal 
        visible={modalVisible}
        data={selectedItem}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};