import { activeWindow } from "get-windows";
import axios from "axios";

const activeWindows = []; // Objek untuk menyimpan waktu aktif setiap jendela
let lastActiveWindow = null;

// Fungsi untuk mendapatkan dan menampilkan metadata jendela aktif
const getActiveWindowData = async () => {
  const windowData = await activeWindow();

  if (windowData) {
    const appName = windowData.owner.name;
    let windowTitle = windowData.title;

    const splitTitle = windowTitle.split(" - ");
    if (splitTitle.length > 2) {
      windowTitle = splitTitle
        .slice(0, splitTitle.length - 2)
        .join(" - ")
        .trim();
    }
    windowTitle = windowTitle.replace(/and \d+ more page$/, "").trim();
    windowTitle = windowTitle.replace(/and \d+ more pages$/, "").trim();

    // Jika jendela sama, perbarui endRun dari entri terakhir
    const lastEntry = activeWindows[activeWindows.length - 1];
    // Cek apakah jendela saat ini berbeda dari jendela terakhir
    if (windowTitle !== lastActiveWindow) {
      const startRun = lastEntry ? lastEntry.endRun : Date.now();
      // Jika jendela berbeda, simpan data jendela baru
      activeWindows.push({
        startRun: startRun,
        detail: windowTitle,
        appName: appName,
        endRun: Date.now(),
      });
      lastActiveWindow = windowTitle; // Perbarui lastWindowTitle dengan jendela baru
    } else {
      lastEntry.endRun = Date.now();
    }
  }

  // Kembalikan semua data aplikasi yang sedang aktif
  return activeWindows;
};

const toMySQLDatetime = (date) => {
  return date.toISOString().slice(0, 19).replace("T", " ");
};

// Fungsi untuk mengirim data ke server Laravel
const sendData = async (
  studentId,
  sessionId,
  appName,
  detail,
  startTime,
  endTime
) => {
  try {
    const response = await axios.post("http://elearning.test/api/trackings", {
      student_id: studentId,
      session_id: sessionId,
      app_name: appName,
      detail: detail,
      start_time: toMySQLDatetime(new Date(startTime)),
      end_time: toMySQLDatetime(new Date(endTime)),
    });
    console.log("Data sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending data:", error);
  }
};

// Interval untuk memantau jendela aktif setiap detik
setInterval(async () => {
  const windowData = await getActiveWindowData();

  if (windowData.length > 0) {
    const lastWindow = windowData[windowData.length - 1];
    await sendData(
      "4", // Ganti dengan student_id yang sesuai
      "2", // Ganti dengan session_id yang sesuai
      lastWindow.appName,
      lastWindow.detail,
      new Date(lastWindow.startRun),
      new Date(lastWindow.endRun)
    );
  }
}, 1000);
