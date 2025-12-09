import { View, Text, TouchableOpacity, ScrollView, LayoutChangeEvent } from 'react-native';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export interface YemekhaneItem {
  yemekhaneId: number;
  adTR: string;
  adEN?: string;
  path: string; // Resim yolu var ama tasarım text odaklı olduğu için arka planda veya ikonik kullanabiliriz
  
  yemek1TR: string;
  yemek2TR: string;
  yemek3TR: string;
  yemek4TR: string;
  
  yemek1EN?: string;
  yemek2EN?: string;
  yemek3EN?: string;
  yemek4EN?: string;

  notTR: string;
  notEN?: string; 
}

interface DiningListProps {
  data: YemekhaneItem[];
  onLayout: (event: LayoutChangeEvent) => void;
}

export const DiningList = ({ data, onLayout }: DiningListProps) => {
  const { language, dictionary } = useLanguage();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // İlk açılışta ilk yemekhaneyi seç
  useEffect(() => {
    if (data.length > 0 && selectedId === null) {
      setSelectedId(data[0].yemekhaneId);
    }
  }, [data]);

  const selectedItem = data.find(item => item.yemekhaneId === selectedId) || data[0];

  // Kalori ayrıştırma fonksiyonu (Aynı kaldı)
  const parseFood = (foodString: string | undefined) => {
    if (!foodString) return { name: "", cal: "" };
    const parts = foodString.split(/[\t\n-]+|\s{2,}/);
    let name = parts[0]?.trim() || "";
    let cal = parts[1]?.trim() || "";
    if (!cal && name.includes("KKAL")) {
       const match = name.match(/(\d+)\s*KKAL/i);
       if (match) {
         cal = match[0];
         name = name.replace(match[0], "").trim();
       }
    }
    return { name, cal };
  };

  const foodItems = language === 'tr' 
    ? [selectedItem?.yemek1TR, selectedItem?.yemek2TR, selectedItem?.yemek3TR, selectedItem?.yemek4TR]
    : [
        selectedItem?.yemek1EN || selectedItem?.yemek1TR, 
        selectedItem?.yemek2EN || selectedItem?.yemek2TR, 
        selectedItem?.yemek3EN || selectedItem?.yemek3TR, 
        selectedItem?.yemek4EN || selectedItem?.yemek4TR
      ];

  if (!data || data.length === 0) return null;

  return (
    <View className="flex-1 bg-white" onLayout={onLayout}>
      
      {/* 1. ÜST KISIM (TAB) */}
      {/* Sol üstteki turuncu çıkıntı */}
      <View className="flex-row h-[70px]">
        <View className="w-[60%] bg-orange-600 rounded-tr-[30px] justify-center pl-6 z-10">
            <Text className="text-white text-xl font-bold tracking-wider">
              {dictionary.dining || "Günün Menüsü"}
            </Text>
            <Text className="text-orange-200 text-xs font-medium uppercase tracking-widest">
              {dictionary.bonAppetit || "Afiyet Olsun"}
            </Text>
        </View>
        {/* Sağ taraf boş kalıyor, çünkü burası beyaz olacak */}
      </View>

      {/* 2. ALT KISIM (GÖVDE) */}
      <View className="flex-1 flex-row">
        
        {/* A. SOL SÜTUN (Yemekhane Seçimi / Kategoriler) */}
<View className="w-[35%] bg-white relative z-20"> {/* Parent'a z-20 ekledik */}
    
    {/* --- KIVRIM EFEKTİ --- */}
    {/* pointerEvents="none" EKLEMEK ÇOK ÖNEMLİ: 
        Bu, kullanıcının bu süslemenin arkasındaki veya altındaki 
        öğelere tıklayabilmesini sağlar. */}
    <View 
        pointerEvents="none" 
        className="absolute top-0 right-0 w-full h-[30px] bg-orange-600 z-10"
    >
        <View className="w-full h-full bg-white rounded-tr-[30px]" />
    </View>
    {/* --------------------------------- */}

    <ScrollView 
        className="pt-10 px-2" 
        contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        // ScrollView'ın tıklanabilir olması için zIndex'i yükseltiyoruz
        style={{ zIndex: 30 }} 
    >
        {data.map((item) => {
            const isActive = selectedId === item.yemekhaneId;
            return (
                <TouchableOpacity
                    key={item.yemekhaneId}
                    onPress={() => {
                        console.log("Tıklandı:", item.adTR); // Test için log
                        setSelectedId(item.yemekhaneId);
                    }}
                    activeOpacity={0.7}
                    // Butonların zIndex'ini garantiye alıyoruz
                    className={`p-3 rounded-xl transition-all z-40 ${
                        isActive 
                        ? "bg-orange-100 shadow-sm border border-orange-200" 
                        : "bg-gray-50 border border-gray-100"
                    }`}
                >
                    <Text className={`text-xs font-bold leading-4 ${
                        isActive ? "text-orange-700" : "text-gray-500"
                    }`}>
                        {language === 'tr' ? item.adTR : (item.adEN || item.adTR)}
                    </Text>
                </TouchableOpacity>
            );
        })}
    </ScrollView>
</View>

        {/* B. SAĞ İÇERİK (Menü Detayları) */}
        <View className="flex-1 bg-orange-600 rounded-bl-[30px] p-5 pt-6 shadow-xl relative overflow-hidden">
            
            {/* Dekoratif hafif parlama efekti */}
            
            <View pointerEvents="none" className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500 rounded-full opacity-50" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Başlık */}
                <Text className="text-white text-lg font-extrabold mb-1">
                    {language === 'tr' ? selectedItem.adTR : (selectedItem.adEN || selectedItem.adTR)}
                </Text>
                <View className="h-1 w-12 bg-white/40 rounded-full mb-6" />

                {/* Yemek Listesi */}
                <View className="gap-4">
                    {foodItems.map((item, index) => {
                        if (!item) return null;
                        const { name, cal } = parseFood(item);
                        return (
                            <View 
                                key={index} 
                                className="bg-white/10 border border-white/20 p-3 rounded-2xl backdrop-blur-sm"
                            >
                                <Text className="text-white font-bold text-sm leading-5">
                                    {name}
                                </Text>
                                {cal ? (
                                    <Text className="text-orange-200 text-xs mt-1 font-medium">
                                        🔥 {cal}
                                    </Text>
                                ) : null}
                            </View>
                        );
                    })}
                </View>


            </ScrollView>
        </View>

      </View>
    </View>
  );
};