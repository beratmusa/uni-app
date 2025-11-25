import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { X, User, BookOpen, Calendar, Phone, LogOut, ChevronRight, ChevronDown, Utensils } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';

interface SideMenuProps {
  onClose: () => void;
  onScrollToDining: () => void;
  onScrollToContact: () => void; // <-- YENİ EKLENDİ
}

export const SideMenu = ({ onClose, onScrollToDining, onScrollToContact }: SideMenuProps) => {
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  // Yemek Listesine Git
  const handleDiningClick = () => {
    onClose(); 
    setTimeout(() => onScrollToDining(), 300);
  };

  // İletişime Git (YENİ)
  const handleContactClick = () => {
    onClose();
    setTimeout(() => onScrollToContact(), 300);
  };

  return (
    <Animated.View className="absolute inset-0 z-50">
      <Animated.View entering={FadeIn} exiting={FadeOut} className="absolute inset-0 bg-black/60">
        <TouchableOpacity className="w-full h-full" onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <View className="flex-1 flex-row justify-end">
        <Animated.View entering={SlideInRight.duration(300)} exiting={SlideOutRight.duration(300)} className="w-[80%] h-full bg-white shadow-2xl">
          <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
            <View className="flex-1 p-6">
              
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-2xl font-bold text-blue-900">Menü</Text>
                <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                  <X color="#374151" size={24} />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center mb-8 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center"><Text className="text-white font-bold">Ö</Text></View>
                <View className="ml-3"><Text className="font-bold text-gray-900">Öğrenci Girişi</Text><Text className="text-xs text-blue-600">Giriş Yapılmadı</Text></View>
              </View>

              <View className="gap-2">
                <MenuLink icon={<User size={20} />} title="ÜBYS" />
                
                <TouchableOpacity onPress={handleDiningClick} className="flex-row items-center p-4 rounded-xl active:bg-blue-50 border border-transparent active:border-blue-100">
                    <View className="opacity-60 text-gray-700"><Utensils size={20} /></View>
                    <Text className="ml-3 font-semibold text-gray-700 text-base">Yemek Listesi</Text>
                    <ChevronRight size={16} color="#9ca3af" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

                
                <View>
                  <TouchableOpacity onPress={() => setCalendarOpen(!isCalendarOpen)} className={`flex-row items-center p-4 rounded-xl border border-transparent transition-all ${isCalendarOpen ? "bg-blue-50 border-blue-100" : "active:bg-gray-50"}`}>
                    <View className={`${isCalendarOpen ? "opacity-100 text-blue-600" : "opacity-60 text-gray-700"}`}><Calendar size={20} color={isCalendarOpen ? "#2563eb" : "#374151"} /></View>
                    <Text className={`ml-3 font-semibold text-base ${isCalendarOpen ? "text-blue-700" : "text-gray-700"}`}>Akademik Takvim</Text>
                    {isCalendarOpen ? <ChevronDown size={16} color="#2563eb" style={{ marginLeft: 'auto' }} /> : <ChevronRight size={16} color="#9ca3af" style={{ marginLeft: 'auto' }} />}
                  </TouchableOpacity>

                  {isCalendarOpen && (
                    <View className="ml-4 pl-4 border-l-2 border-blue-100 mt-1 gap-1">
                      <SubMenuLink title="Genel Takvim" onPress={onClose} />
                      <SubMenuLink title="Tıp Fakültesi" onPress={onClose} />
                      <SubMenuLink title="Veteriner Fakültesi" onPress={onClose} />
                    </View>
                  )}
                </View>

                {/* --- İLETİŞİM LİNKİ GÜNCELLENDİ --- */}
                <TouchableOpacity onPress={handleContactClick} className="flex-row items-center p-4 rounded-xl active:bg-gray-50 border border-transparent active:border-gray-200">
                    <View className="opacity-60 text-gray-700"><Phone size={20} /></View>
                    <Text className="ml-3 font-semibold text-gray-700 text-base">İletişim & Rehber</Text>
                    <ChevronRight size={16} color="#9ca3af" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

              </View>

              <View className="mt-auto border-t border-gray-100 pt-6 pb-6">
                <TouchableOpacity className="flex-row items-center p-3 rounded-xl bg-red-50">
                  <LogOut size={20} color="#dc2626" />
                  <Text className="ml-3 font-bold text-red-600">Çıkış Yap</Text>
                </TouchableOpacity>
                <Text className="text-center text-xs text-gray-400 mt-4">v1.0.0 - Kampüs App</Text>
              </View>

            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const MenuLink = ({ icon, title }: { icon: any, title: string }) => (
  <TouchableOpacity className="flex-row items-center p-4 rounded-xl active:bg-gray-50 border border-transparent active:border-gray-200">
    <View className="opacity-60 text-gray-700">{icon}</View>
    <Text className="ml-3 font-semibold text-gray-700 text-base">{title}</Text>
    <ChevronRight size={16} color="#9ca3af" style={{ marginLeft: 'auto' }} />
  </TouchableOpacity>
);

const SubMenuLink = ({ title, onPress }: { title: string, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center p-3 rounded-lg active:bg-blue-50">
    <View className="w-1.5 h-1.5 rounded-full bg-blue-300 mr-3" />
    <Text className="text-gray-600 font-medium text-sm">{title}</Text>
  </TouchableOpacity>
);