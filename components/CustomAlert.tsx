import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

interface CustomAlertProps {
  visible: boolean;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const CustomAlert = ({
  visible,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Tamam",
  cancelText = "İptal"
}: CustomAlertProps) => {
  if (!visible) return null;

  const getTheme = () => {
    switch (type) {
      case 'success':
        return { color: 'bg-green-100', iconColor: '#16a34a', buttonBg: 'bg-green-600', Icon: CheckCircle };
      case 'error':
        return { color: 'bg-red-100', iconColor: '#dc2626', buttonBg: 'bg-red-600', Icon: XCircle };
      case 'warning':
        return { color: 'bg-orange-100', iconColor: '#ea580c', buttonBg: 'bg-orange-600', Icon: AlertCircle };
      default:
        return { color: 'bg-blue-100', iconColor: '#2563eb', buttonBg: 'bg-blue-600', Icon: CheckCircle };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.Icon;

  return (
    <Modal transparent visible={visible} animationType="none">
      {/* Arkaplan Karartması */}
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        
        {/* Modal Kartı */}
        <Animated.View 
          entering={ZoomIn.duration(300)} 
          className="bg-white w-full rounded-3xl p-6 items-center shadow-2xl"
        >
          {/* İkon Alanı */}
          <View className={`w-20 h-20 rounded-full ${theme.color} items-center justify-center mb-4`}>
             <IconComponent size={40} color={theme.iconColor} />
          </View>

          {/* Başlık ve Mesaj */}
          <Text className="text-xl font-bold text-slate-800 text-center mb-2">
            {title}
          </Text>
          <Text className="text-slate-500 text-center text-sm font-medium mb-6 px-2">
            {message}
          </Text>

          {/* Butonlar */}
          <View className="flex-row w-full space-x-3">
            {onCancel && (
              <TouchableOpacity 
                onPress={onCancel}
                className="flex-1 py-3 rounded-xl bg-slate-100 border border-slate-200 items-center"
              >
                <Text className="text-slate-600 font-bold">{cancelText}</Text>
              </TouchableOpacity>
            )}

            {/* Ana Buton */}
            <TouchableOpacity 
              onPress={onConfirm}
              className={`flex-1 py-3 rounded-xl items-center shadow-sm ${theme.buttonBg}`}
            >
              <Text className="text-white font-bold">{confirmText}</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
};