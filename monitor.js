import { WebSocketServer } from "ws";
import { activeWindow } from "get-windows";
import axios from "axios";
import moment from "moment-timezone";

let lastWindow = null;
let isProcessing = false;
let monitoring = false;
let studentId = null;
let sessionId = null;

const toMySQLDatetime = (date) => {
  return moment(date).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
};

const sendData = async (studentId, sessionId, appName, detail, start_time) => {
  try {
    const response = await axios.post("http://elearning.test/api/trackings", {
      student_id: studentId,
      session_id: sessionId,
      app_name: appName,
      detail: detail,
      start_time: toMySQLDatetime(new Date(start_time)),
      end_time: null,
    });
    console.log("New data created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending data:", error);
  }
};

const updateEndTime = async (trackingId, end_time) => {
  try {
    await axios.put(`http://elearning.test/api/trackings/${trackingId}`, {
      end_time: toMySQLDatetime(new Date(end_time)),
    });
    console.log("End time updated successfully.");
  } catch (error) {
    console.error("Error updating end time:", error);
  }
};

const wss = new WebSocketServer({ port: 6001 });

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    const command = JSON.parse(message);
    if (command.command === "startMonitoring") {
      studentId = command.studentId;
      sessionId = command.sessionId;
      monitoring = true;
      console.log("Monitoring Started");
    }
  });
});

setInterval(async () => {
  if (!monitoring || isProcessing) return;
  isProcessing = true;

  const windowData = await activeWindow();

  if (windowData) {
    const appName = windowData.owner.name;
    let detailApp = windowData.title;

    // Membersihkan window title
    const splitTitle = detailApp.split(" - ");
    if (splitTitle.length > 2) {
      detailApp = splitTitle
        .slice(0, splitTitle.length - 2)
        .join(" - ")
        .trim();
    }
    detailApp = detailApp.replace(/and \d+ more page$/, "").trim();
    detailApp = detailApp.replace(/and \d+ more pages$/, "").trim();

    const currentWindow = {
      appName,
      detailApp,
    };

    if (
      !lastWindow ||
      lastWindow.appName !== currentWindow.appName ||
      lastWindow.detailApp !== currentWindow.detailApp
    ) {
      const thisTime = Date.now();
      // Update End time
      if (lastWindow && lastWindow.trackingId) {
        await updateEndTime(lastWindow.trackingId, thisTime);
      }
      // send Data baru
      const sendingData = await sendData(
        studentId,
        sessionId,
        currentWindow.appName,
        currentWindow.detailApp,
        thisTime // date untuk start time
      );

      if (sendingData) {
        const trackingId = sendingData.data.id;
        // console.log("trackingId: ", trackingId);
        // process.exit();
        lastWindow = { ...currentWindow, trackingId };
      }
    }
  }
  isProcessing = false;
}, 1000);
