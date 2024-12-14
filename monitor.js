import { activeWindow } from "get-windows";
import axios from "axios";
import moment from "moment-timezone";

let lastSentData = null; // Menyimpan data terakhir yang dikirim untuk perbandingan

const toMySQLDatetime = (date) => {
  return moment(date).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
};

const sendData = async (
  studentId,
  sessionId,
  appName,
  detail,
  startTime,
  endTime
) => {
  try {
    // Periksa apakah data terakhir di server sama
    const response = await axios.get(
      `http://elearning.test/api/trackings/last?student_id=${studentId}&session_id=${sessionId}`
    );

    const lastTracking = response.data;

    if (
      lastTracking &&
      lastTracking.app_name === appName &&
      lastTracking.detail === detail
    ) {
      // Jika data sama, hanya update end_time
      await axios.put(
        `http://elearning.test/api/trackings/${lastTracking.id}`,
        {
          end_time: toMySQLDatetime(new Date(endTime)),
        }
      );
      console.log("End time updated successfully.");
    } else {
      // Jika data berbeda, buat data baru
      const newResponse = await axios.post(
        "http://elearning.test/api/trackings",
        {
          student_id: studentId,
          session_id: sessionId,
          app_name: appName,
          detail: detail,
          start_time: toMySQLDatetime(new Date(startTime)),
          end_time: toMySQLDatetime(new Date(endTime)),
        }
      );
      console.log("New data created successfully:", newResponse.data);
    }
  } catch (error) {
    console.error("Error sending data:", error);
  }
};

const updateEndTime = async (trackingId, endTime) => {
  try {
    await axios.put(`http://elearning.test/api/trackings/${trackingId}`, {
      end_time: toMySQLDatetime(new Date(endTime)),
    });
    console.log("End time updated successfully.");
  } catch (error) {
    console.error("Error updating end time:", error);
  }
};

setInterval(async () => {
  const windowData = await activeWindow();

  if (windowData) {
    const appName = windowData.owner.name;
    let windowTitle = windowData.title;

    // Membersihkan window title
    const splitTitle = windowTitle.split(" - ");
    if (splitTitle.length > 2) {
      windowTitle = splitTitle
        .slice(0, splitTitle.length - 2)
        .join(" - ")
        .trim();
    }
    windowTitle = windowTitle.replace(/and \d+ more page$/, "").trim();
    windowTitle = windowTitle.replace(/and \d+ more pages$/, "").trim();

    const currentData = {
      studentId: "3", // Ganti student_id yang sesuai
      sessionId: "1", // Ganti session_id yang sesuai
      appName,
      detail: windowTitle,
    };

    if (
      !lastSentData || // Jika data belum pernah dikirim
      lastSentData.appName !== currentData.appName || // Jika app_name berubah
      lastSentData.detail !== currentData.detail // Jika detail berubah
    ) {
      // Kirim data baru
      const trackingId = await sendData(
        currentData.studentId,
        currentData.sessionId,
        currentData.appName,
        currentData.detail,
        Date.now(), // Start time
        Date.now() // End time
      );

      if (trackingId) {
        lastSentData = { ...currentData, trackingId, startTime: Date.now() };
      }
    } else {
      // Perbarui end_time dari data terakhir
      await updateEndTime(lastSentData.trackingId, Date.now());
    }
  }
}, 1000);
