import { Modal, View, Text, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { X, Share2 } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PdfModalProps {
  visible: boolean;
  url: string | null;
  title?: string;
  onClose: () => void;
}

export const PdfModal = ({ visible, url, title = "Doküman", onClose }: PdfModalProps) => {
  const insets = useSafeAreaInsets();

  if (!url) return null;

  // ANDROID İÇİN PDF HİLESİ:
  // Android WebView direkt PDF açamaz, Google Docs Viewer üzerinden açıyoruz.
  const finalUrl = Platform.OS === 'android' && url.endsWith('.pdf')
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`
    : url;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        
        {/* --- HEADER --- */}
        <View 
          className="flex-row justify-between items-center px-4 pb-3 border-b border-gray-200 bg-gray-50 z-10"
          style={{ paddingTop: insets.top + 10 }}
        >
          <TouchableOpacity onPress={onClose} className="p-2 bg-white rounded-full border border-gray-200">
            <X color="#1f2937" size={24} />
          </TouchableOpacity>

          <Text className="font-bold text-gray-700 text-sm w-60 text-center" numberOfLines={1}>
            {title}
          </Text>

          {/* Görsel denge için boş veya paylaş butonu */}
          <View className="w-10" /> 
        </View>

        {/* --- WEBVIEW (PDF GÖSTERİCİ) --- */}
        <WebView 
          source={{ uri: finalUrl }}
          className="flex-1"
          startInLoadingState={true}
          renderLoading={() => (
            <View className="absolute inset-0 justify-center items-center bg-white">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-gray-500 mt-4 text-xs">Doküman Yükleniyor...</Text>
            </View>
          )}
        />

      </View>
      <StatusBar style="dark" />
    </Modal>
  );
};