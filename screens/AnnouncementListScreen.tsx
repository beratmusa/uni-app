import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AllItemsPage, GenericItem } from '../components/AllItemsPage';
import { useLanguage } from '../context/LanguageContext';
import { HaberItem } from '../components/AnnouncementList';

export const AnnouncementListScreen = ({ navigation }: any) => {
  const { language, dictionary } = useLanguage();
  const [data, setData] = useState<GenericItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [language]);

  const fetchData = async () => {
    try {
      // Yine ana API'den çekiyoruz. İleride sadece duyuru için özel endpoint varsa onu kullanabilirsin.
      const response = await fetch('https://testapi.kastamonu.edu.tr/api/main');
      const json = await response.json();
      
      const rawData: HaberItem[] = json.haber?.data || [];

      // HaberItem -> GenericItem dönüşümü
      const formattedData: GenericItem[] = rawData.map(item => ({
        id: item.id,
        // Dile göre başlık seçimi
        title: language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR),
        // Tarih formatlama
        date: new Date(item.baslamaZamani).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        // Duyurularda genelde resim olmaz ama varsa kullanır
        image: item.haberDuyuruFoto, 
        // Kategori ismi (Örn: "Birim Haberleri")
        category: item.kategori, 
        originalData: item
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Duyuru verisi alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  return (
    <AllItemsPage
      title={dictionary.announcements} // "Duyurular"
      type="announcement"              // <-- ÖNEMLİ: Duyuru modunu seçtik (Megafon ikonu vb.)
      data={data}
      onItemPress={(item) => {
        console.log("Tıklanan Duyuru:", item.title);
        // İleride detay sayfasına yönlendirme buraya eklenecek
      }}
    />
  );
};