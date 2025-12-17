import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';

interface AttendanceCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
}

export const AttendanceCodeModal = ({ visible, onClose, onSubmit }: AttendanceCodeModalProps) => {
  const { dictionary } = useLanguage();
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    if (code.trim().length > 0) {
      onSubmit(code);
      setCode('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center items-center bg-black/60 px-4"
      >
        <View className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl">
          
          {/* Başlık */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-slate-900">
              {dictionary.attendanceCodeTitle}
            </Text>
            <TouchableOpacity onPress={onClose} className="bg-slate-100 p-2 rounded-full">
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Açıklama */}
          <Text className="text-slate-500 text-sm mb-4">
            {dictionary.attendanceCodeDesc}
          </Text>

          {/* Input */}
          <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6">
            <TextInput
              placeholder={dictionary.codePlaceholder}
              placeholderTextColor="#94a3b8"
              value={code}
              onChangeText={setCode}
              className="text-lg font-bold text-slate-900 text-center tracking-widest"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus={true} 
            />
          </View>

          {/* Buton */}
          <TouchableOpacity 
            onPress={handleSubmit}
            activeOpacity={0.8}
            className="bg-blue-600 rounded-xl py-4 flex-row justify-center items-center shadow-lg shadow-blue-200"
          >
            <Check size={20} color="white" className="mr-2" />
            <Text className="text-white font-bold text-base">
              {dictionary.joinButton}
            </Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};