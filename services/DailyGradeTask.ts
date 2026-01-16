import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchGradesFromApi, Course } from './gradeApi'; 

const TASK_NAME = 'DAILY_GRADE_CHECK';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const now = new Date().toLocaleTimeString();
    console.log(`[${now}] 🔄 Arka plan görevi tetiklendi!`);

    // 1. Token Kontrolü
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
        console.log("Token yok, görev atlandı.");
        return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // 2. Eski (Cache) Veriyi Getir
    const oldGradesStr = await AsyncStorage.getItem('cachedGrades');
    const oldGrades: Course[] = oldGradesStr ? JSON.parse(oldGradesStr) : [];

    // 3. Yeni Veriyi API'den Çek
    console.log("API'den notlar çekiliyor...");
    const currentGrades = await fetchGradesFromApi(token);

    // 4. Karşılaştırma
    let hasNewGrade = false;
    let changedCourseName = "";

    // Basit kıyaslama (JSON string farkı)
    if (JSON.stringify(oldGrades) !== JSON.stringify(currentGrades)) {
        // Detaylı kontrol
        for (const newCourse of currentGrades) {
            const oldCourse = oldGrades.find(o => o.id === newCourse.id);
            if (!oldCourse) continue;

            if (oldCourse.vize !== newCourse.vize || 
                oldCourse.final !== newCourse.final || 
                oldCourse.butunleme !== newCourse.butunleme ||
                oldCourse.letterGrade !== newCourse.letterGrade) {
                
                hasNewGrade = true;
                changedCourseName = newCourse.name;
                break;
            }
        }
    }

    if (hasNewGrade) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Not Açıklandı! 🔔",
                body: `${changedCourseName} notu sisteme girildi veya güncellendi.`,
                sound: true,
                data: { screen: 'CourseList' }
            },
            trigger: null,
        });
        
        console.log(`📢 BİLDİRİM GÖNDERİLDİ: ${changedCourseName}`);
        
        // Yeni veriyi kaydet
        await AsyncStorage.setItem('cachedGrades', JSON.stringify(currentGrades));
        return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    console.log("✅ Değişiklik yok.");
    return BackgroundFetch.BackgroundFetchResult.NoData;

  } catch (error) {
    console.error("❌ Arka plan hatası:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// --- GÖREVİ KAYDETME ---
export async function registerDailyTask() {
  try {
    // Arka plan işlemleri destekleniyor mu?
    const status = await BackgroundFetch.getStatusAsync();
    console.log("Mevcut Arka Plan Durumu:", status);
    // --- DÜZELTME BURADA YAPILDI (Status -> BackgroundFetchStatus) ---
    // if (status === BackgroundFetch.BackgroundFetchStatus.Restricted || status === BackgroundFetch.BackgroundFetchStatus.Denied) {
    //     console.log("⚠️ Arka plan işlemleri kısıtlı veya reddedildi!");
    //     return;
    // }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (isRegistered) {
        console.log("Görev zaten kayıtlı, tekrar kaydedilmiyor.");
        return;
    }

    // Görevi Kaydet
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
        minimumInterval: 60 * 15, // Test için 15 dakika (Normalde: 60*60*24)
        stopOnTerminate: false,   
        startOnBoot: true,        
    });
    
    console.log("📅 Not kontrol görevi sisteme kaydedildi (Her 15 dk).");
  } catch (err) {
    console.log("Görev kaydı başarısız:", err);
  }
}