import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 1. Bildirim Davranış Ayarı
// Uygulama açıkken bildirim gelirse ne olsun? (Ses çalsın, uyarı görünsün)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useDailyNotification = () => {
  
  useEffect(() => {
    configureNotifications();
  }, []);

  const configureNotifications = async () => {
    // A. İzin Kontrolü
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Eğer izin verilmemişse izin iste
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // İzin yoksa işlemi durdur
    if (finalStatus !== 'granted') {
      console.log('Bildirim izni verilmedi!');
      return;
    }

    // Android için özel kanal ayarı (Gerekli)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // B. Planlama İşlemi
    await schedulePushNotification();
  };

  const schedulePushNotification = async () => {
    // Önce var olan tüm planlanmış bildirimleri temizle (Çift bildirim gitmesin diye)
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Yeni bildirimi kur
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🍽️ Yemek Vakti!",
        body: "Bugünün yemek listesi belli oldu. Hemen tıkla ve menüyü gör! 😋",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: 11,
        minute: 0,
        repeats: true,
      },
    });

    console.log("📅 Günlük yemek bildirimi saat 11:00'e kuruldu.");
  };
};