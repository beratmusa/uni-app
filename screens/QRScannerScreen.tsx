import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, Camera } from "expo-camera";
import { useNavigation } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CustomAlert } from '../components/CustomAlert';

interface AlertState {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string; 
  onConfirm: () => void;
  onCancel?: () => void; 
}

export const QRScannerScreen = () => {
  const { dictionary } = useLanguage();
  const { token } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const isProcessing = useRef(false);
  const navigation = useNavigation<any>();

  const [alertConfig, setAlertConfig] = useState<AlertState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    confirmText: 'Tamam',
    cancelText: undefined, 
    onConfirm: () => {},
    onCancel: undefined
  });

  const t = dictionary.qr || {
    overlay: "Karekodu okutunuz",
    permissionRequest: "Kamera izni gerekiyor",
    noPermission: "Kamera izni yok",
    successTitle: "Başarılı",
    errorTitle: "Hata",
    sessionExpired: "Oturum süreniz dolmuş.",
    serverError: "Sunucu hatası.",
    successMessage: "Yoklamaya katıldınız!",
    invalidCode: "Geçersiz veya hatalı karekod.",
    expiredCode: "Bu karekodun süresi dolmuş.",
    ok: "Tamam",
    retry: "Tekrar Dene",
    exit: "Çık"
  };

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  const handleClose = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Main"); 
    }
  };

  const handleReset = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
    setScanned(false);
    setTimeout(() => {
      isProcessing.current = false;
    }, 1000);
  };

  const showAlert = (type: 'success' | 'error', title: string, message: string, isRetryable: boolean = false) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      confirmText: isRetryable ? (t.retry || "Tekrar Dene") : (t.ok || "Tamam"),
      cancelText: isRetryable ? (t.exit || "Çık") : undefined,
      onConfirm: isRetryable ? handleReset : handleClose,
      onCancel: isRetryable ? handleClose : undefined
    });
  };

  // --- ÖĞRENCİ ID'SİNİ ÇEKEN YARDIMCI FONKSİYON ---
  const fetchMyStudentId = async (): Promise<number | null> => {
    try {
        const response = await fetch('https://mobil.kastamonu.edu.tr/api/Student/GetMyStudentInfo', {
            method: 'GET', 
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: ''
        });

        if (!response.ok) return null;

        const json = await response.json();
        
        const dataList = Array.isArray(json) ? json : (json.Data || []);

        if (Array.isArray(dataList) && dataList.length > 0) {
            return dataList[0].StudentId;
        }

        return null;
    } catch (e) {
        console.error("Öğrenci bilgisi hatası:", e);
        return null;
    }
  };

  // --- QR OKUMA VE DOĞRULAMA MANTIĞI ---
  const handleBarCodeScanned = async ({ type, data }: any) => {
    if (isProcessing.current || scanned) return; 
    isProcessing.current = true;
    setScanned(true);

    if (!token) {
        showAlert('error', t.errorTitle, t.sessionExpired);
        return;
    }

    try {
        let qrData;
        try {
            qrData = JSON.parse(data);
        } catch (e) {
            console.error("JSON Parse Hatası:", e);
            showAlert('error', t.errorTitle, t.invalidCode, true);
            return;
        }

        if (qrData.timestamp) {
            const createTime = new Date(qrData.timestamp).getTime(); 
            const now = new Date().getTime(); 
            
            const diffInMinutes = (now - createTime) / 1000 / 60;

            if (diffInMinutes > 5) {                 
                showAlert(
                    'error', 
                    t.errorTitle, 
                    "QR kodun süresi (5dk) dolmuş. Lütfen hocanızdan yenilemesini isteyin.", 
                    true
                );
                
                return; 
            }
        }


        const studentId = await fetchMyStudentId();

        if (!studentId) {
            showAlert('error', t.errorTitle, "Öğrenci bilgilerinize erişilemedi. Lütfen tekrar giriş yapın.");
            return;
        }

        

        const response = await fetch('https://ubys.kastamonu.edu.tr/Framework/Integration/api/IntegratedService/Service', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                serviceName: "SaveStudentAttendancyForStudent",
                serviceCriteria: {
                    scheduleId: qrData.scheduleId,
                    IsAttended: true,
                    scheduleorder: qrData.scheduleorder,
                    studentId: studentId,
                    isblock: qrData.isblock
                }
            })
        });

        const json = await response.json();

        const successMessage = json.Data?.Data?.Result;
        const isSuccessBool = json.Data?.IsSuccessful;

        if (!json.Data?.ExceptionMessage && (successMessage || isSuccessBool === true)) {
            showAlert(
                'success', 
                t.successTitle, 
                successMessage || json.Data?.Message || t.successMessage
            );
        } else {
            const errorMsg = json.Data?.ExceptionMessage || json.Data?.Message || t.invalidCode;
            showAlert('error', t.errorTitle, errorMsg, true);
        }

    } catch (error) {
        console.error("QR Process Hatası:", error);
        showAlert('error', t.errorTitle, t.serverError, true);
    }
  };

  if (hasPermission === null) return <View className="flex-1 bg-black justify-center items-center"><Text className="text-white">{t.permissionRequest}</Text></View>;
  if (hasPermission === false) return <View className="flex-1 bg-black justify-center items-center"><Text className="text-white">{t.noPermission}</Text></View>;

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <TouchableOpacity onPress={handleClose} className="absolute top-12 right-6 bg-black/50 p-3 rounded-full">
        <X size={24} color="white" />
      </TouchableOpacity>

      <View className="absolute inset-0 justify-center items-center pointer-events-none">
        <View className="w-64 h-64 border-2 border-white/60 rounded-3xl bg-transparent" />
        <Text className="text-white mt-4 font-bold bg-black/40 px-4 py-2 rounded-full overflow-hidden">
          {t.overlay}
        </Text>
      </View>

      <CustomAlert 
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});