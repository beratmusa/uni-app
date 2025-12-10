import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AllItemsPage, GenericItem } from '../components/AllItemsPage';
import { useLanguage } from '../context/LanguageContext';
import { EtkinlikItem } from '../components/EventList';

export const EventListScreen = ({ navigation }: any) => {
  const { language, dictionary } = useLanguage();
  const [data, setData] = useState<GenericItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [language]);

  const fetchData = async () => {
    try {
      const response = await fetch('https://testapi.kastamonu.edu.tr/api/main');
      const json = await response.json();
      
      const rawData: EtkinlikItem[] = json.etkinlik?.data || [];

      // Etkinlik verisini GenericItem formatına çeviriyoruz
      const formattedData: GenericItem[] = rawData.map(item => ({
        id: item.id,
        // Dile göre başlık
        title: language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR),
        // Tarih formatlama
        date: new Date(item.baslamaZamani).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        // Etkinlik görseli
        image: item.pathTR, 
        // Kategori (Sabit: Etkinlik)
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  return (
    <AllItemsPage
      title={dictionary.events} // "Etkinlik Takvimi"
      type="event"              // <-- ÖNEMLİ: Etkinlik modunu seçtik (Takvim yaprağı görünümü)
      data={data}
      onItemPress={(item) => {
        console.log("Tıklanan Etkinlik:", item.title);
        // İleride detay sayfasına/modalına yönlendirme buraya eklenecek
      }}
    />
  );
};