export interface Course {
  id: number;
  code: string;
  name: string;
  teacher: string;
  vize: string;
  final: string;
  butunleme: string;
  average: string;
  letterGrade: string;
}

interface LessonRaw {
  ClassId: number;
  LessonCode: string;
  LessonName: string;
  TeacherTitle: string;
  TeacherName: string;
}

interface ExamRaw {
  ExamResult: number | null;
  SharedExamName: string;
}

// Harf Notu Hesaplama Yardımcısı
const calculateLetterGrade = (average: number): string => {
    if (average >= 90) return "AA";
    if (average >= 85) return "BA";
    if (average >= 75) return "BB";
    if (average >= 70) return "CB";
    if (average >= 60) return "CC";
    if (average >= 55) return "DC";
    if (average >= 50) return "DD";
    if (average >= 40) return "FD";
    return "FF";
};

// --- ANA FONKSİYON ---
export const fetchGradesFromApi = async (token: string): Promise<Course[]> => {
    const cleanToken = token.trim();

    // 1. Ders Listesini Çek
    const lessonResponse = await fetch('https://mobil.kastamonu.edu.tr/api/Student/GetStudentLessonInfo', {
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${cleanToken}` },
        body: '' 
    });

    if (!lessonResponse.ok) throw new Error(`Ders listesi hatası: ${lessonResponse.status}`);
    
    const lessonJson = await lessonResponse.json();
    const lessonList: LessonRaw[] = lessonJson.Data || [];

    if (lessonList.length === 0) return [];

    // 2. Her Ders İçin Sınavları Çek (Paralel İstek)
    const combinedData = await Promise.all(
        lessonList.map(async (lesson) => {
            try {
                const examResponse = await fetch('https://mobil.kastamonu.edu.tr/api/Student/GetStudentExamInfo/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${cleanToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ "classId": lesson.ClassId })
                });

                let vize = "-";
                let final = "-";
                let butunleme = "-";

                if (examResponse.ok) {
                    const examJson = await examResponse.json();
                    const exams: ExamRaw[] = examJson.Data || [];

                    exams.forEach(exam => {
                        const result = exam.ExamResult !== null ? exam.ExamResult.toString() : "-";
                        const name = exam.SharedExamName ? exam.SharedExamName.toLowerCase() : "";
                        
                        if (name.includes("vize") || name.includes("ara")) vize = result;
                        else if (name.includes("final") || name.includes("genel")) final = result;
                        else if (name.includes("bütünleme")) butunleme = result;
                    });
                }

                let avgStr = "-";
                let letter = "-";
                const finalGradeStr = (butunleme !== "-") ? butunleme : final;

                if (vize !== "-" && finalGradeStr !== "-") {
                    const v = parseFloat(vize);
                    const f = parseFloat(finalGradeStr);
                    
                    if (!isNaN(v) && !isNaN(f)) {
                        const averageVal = (v * 0.4 + f * 0.6);
                        avgStr = averageVal.toFixed(0);
                        letter = calculateLetterGrade(averageVal);
                    }
                }

                return {
                    id: lesson.ClassId,
                    code: lesson.LessonCode,
                    name: lesson.LessonName,
                    teacher: `${lesson.TeacherTitle} ${lesson.TeacherName}`,
                    vize,
                    final,
                    butunleme,
                    average: avgStr,
                    letterGrade: letter
                };

            } catch (e) {
                console.error(`Ders detayı hatası (${lesson.LessonCode}):`, e);
                return {
                    id: lesson.ClassId,
                    code: lesson.LessonCode,
                    name: lesson.LessonName,
                    teacher: `${lesson.TeacherTitle} ${lesson.TeacherName}`,
                    vize: "-", final: "-", butunleme: "-", average: "-", letterGrade: "-"
                };
            }
        })
    );

    return combinedData;
};