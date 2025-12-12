import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AllItemsPage, GenericItem } from '../components/AllItemsPage';
import { useLanguage } from '../context/LanguageContext';
import { HaberItem } from '../components/AnnouncementList';
// EKLENEN IMPORTLAR:
import { DetailModal, DetailData } from '../components/DetailModal';

export const AnnouncementListScreen = ({ navigation }: any) => {
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
      const response = await fetch('https://testapi.kastamonu.edu.tr/api/haberduyuru');
      const json = await response.json();
      const rawData: HaberItem[] = json.data || [];

      const formattedData: GenericItem[] = rawData.map(item => ({
        id: item.id,
        title: language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR),
        date: new Date(item.baslamaZamani).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        image: item.haberDuyuruFoto, 
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

  // TIKLAMA OLAYI
  const handleItemPress = (item: GenericItem) => {
    const rawItem = item.originalData as HaberItem;

    setSelectedItem({
        title: item.title,
        date: item.date,
        // İçerik yoksa boş string dönmesin diye kontrol
        content: language === 'tr' 
          ? (rawItem.icerikTR || "İçerik bulunamadı.") 
          : (rawItem.icerikEN || rawItem.icerikTR || "Content not available."),
        image: null, // Duyuru detayında genelde büyük resim olmaz, varsa item.image kullanabilirsin
        category: item.category
    });
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  return (
    <>
      <AllItemsPage
        title={dictionary.announcements}
        type="announcement"
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