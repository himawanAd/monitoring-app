import { activeWindow } from "get-windows";
import axios from "axios";
import moment from "moment-timezone";

const activeWindows = [];
let lastActiveWindow = null;

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

    const lastEntry = activeWindows[activeWindows.length - 1];
    if (windowTitle !== lastActiveWindow) {
      const startRun = lastEntry ? lastEntry.endRun : Date.now();
      activeWindows.push({
        startRun: startRun,
        detail: windowTitle,
        appName: appName,
        endRun: Date.now(),
      });
      lastActiveWindow = windowTitle;
    } else {
      lastEntry.endRun = Date.now();
    }
  }

  return activeWindows;
};

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

setInterval(async () => {
  const windowData = await getActiveWindowData();

  if (windowData.length > 0) {
    const lastWindow = windowData[windowData.length - 1];
    await sendData(
      "3", // Ganti student_id yg sesuai
      "1", // Ganti session_id yg sesuai
      lastWindow.appName,
      lastWindow.detail,
      new Date(lastWindow.startRun),
      new Date(lastWindow.endRun)
    );
  }
}, 1000);
