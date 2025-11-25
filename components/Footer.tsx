import { View, Text, TouchableOpacity, Linking, LayoutChangeEvent } from 'react-native';
import { Phone, Mail, MapPin, Globe, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react-native';

interface FooterProps {
  onLayout: (event: LayoutChangeEvent) => void;
}

export const Footer = ({ onLayout }: FooterProps) => {

  // Link açma fonksiyonu
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Link açılamadı", err));
  };

  return (
    <View 
      className="bg-blue-950 px-6 py-10 mt-10" 
      onLayout={onLayout} // Konum bildirmek için şart
    >
      
      {/* 1. Logo ve Başlık */}
      <View className="mb-8">
        <Text className="text-white font-extrabold text-2xl tracking-tighter">
          KASTAMONU
        </Text>
        <Text className="text-blue-400 font-bold text-lg -mt-1">
          ÜNİVERSİTESİ
        </Text>
        <View className="h-1 w-12 bg-blue-500 mt-3 rounded-full" />
      </View>

      {/* 2. İletişim Bilgileri */}
      <View className="gap-5 mb-8">
        
        {/* Adres */}
        <View className="flex-row items-start">
          <MapPin color="#60a5fa" size={20} style={{ marginTop: 2 }} />
          <View className="ml-3">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Adres</Text>
            <Text className="text-gray-200 text-sm leading-5">
              Kuzeykent Mahallesi, Orgeneral Atilla Ateş Paşa Cd. No:19, 37150 Kastamonu
            </Text>
          </View>
        </View>

        {/* Telefon */}
        <TouchableOpacity 
          onPress={() => openLink('tel:+903662801000')}
          className="flex-row items-center"
        >
          <Phone color="#60a5fa" size={20} />
          <View className="ml-3">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Santral</Text>
            <Text className="text-white font-bold text-base">+90 (366) 280 10 00</Text>
          </View>
        </TouchableOpacity>

        {/* E-posta */}
        <TouchableOpacity 
          onPress={() => openLink('mailto:iletisim@kastamonu.edu.tr')}
          className="flex-row items-center"
        >
          <Mail color="#60a5fa" size={20} />
          <View className="ml-3">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-1">E-Posta</Text>
            <Text className="text-white font-bold text-base">iletisim@kastamonu.edu.tr</Text>
          </View>
        </TouchableOpacity>

        {/* Web Sitesi */}
        <TouchableOpacity 
          onPress={() => openLink('https://kastamonu.edu.tr')}
          className="flex-row items-center"
        >
          <Globe color="#60a5fa" size={20} />
          <View className="ml-3">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Web Sitesi</Text>
            <Text className="text-blue-300 font-bold text-sm">www.kastamonu.edu.tr</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. Sosyal Medya İkonları */}
      <View className="flex-row gap-4 mb-8 border-t border-blue-900 pt-6">
        <SocialIcon icon={<Twitter size={20} color="white" />} />
        <SocialIcon icon={<Facebook size={20} color="white" />} />
        <SocialIcon icon={<Instagram size={20} color="white" />} />
        <SocialIcon icon={<Linkedin size={20} color="white" />} />
      </View>

      {/* 4. Telif Hakkı */}
      <View className="items-center">
        <Text className="text-gray-500 text-xs text-center">
          © 2025 Kastamonu Üniversitesi Bilgi İşlem Daire Başkanlığı
        </Text>
        <Text className="text-gray-600 text-[10px] mt-1">
          Mobil Uygulama v1.0
        </Text>
      </View>

    </View>
  );
};

// Sosyal Medya İkon Bileşeni
const SocialIcon = ({ icon }: { icon: any }) => (
  <TouchableOpacity className="bg-blue-800 p-3 rounded-full active:bg-blue-700">
    {icon}
  </TouchableOpacity>
);