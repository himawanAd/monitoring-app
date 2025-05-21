// import module / library
import { WebSocketServer } from "ws"; //membuat server webSocket
import { activeWindow } from "get-windows"; //mengambil data jendela
import axios from "axios"; //library untuk HTTP requests
import moment from "moment-timezone"; //menyesuaikan timezone
import fs from "fs"; //memanggil file sistem

// fungsi logging
const logFilePath = "./monitor.log";
function log(message) {
  const timestamp = moment().tz("Asia/Jakarta").format("DD-MM-YYYY HH:mm:ss");
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFile(logFilePath, logMessage, () => {});
}

// membaca konfigurasi config.js
import config from "./config.js";
// let config = JSON.parse(fs.readFileSync("config.json", "utf8"));
let serverApi = config.serverApi;
let serverStatusApi = config.serverStatusApi;

// variabel global yang digunakan
let lastWindow = null; //menyimpan data jendela aktif terakhir
let isProcessing = false; //penanda setInterval sedang running / stopped
let monitoring = false; //penanda monitoring sedang aktif / mati
let studentId = null; //data studentId yang didapat dari server
let sessionId = null; //data sessionId yang didapat dari server
let stopTime = null;

log("Monitor.js is running");

// konversi waktu sesuai zona
const toMySQLDatetime = (date) => {
  return moment(date).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
};

// fungsi pengiriman data ke server
const sendData = async (studentId, sessionId, appName, detail, start_time) => {
  try {
    const response = await axios.post(serverApi, {
      student_id: studentId,
      session_id: sessionId,
      app_name: appName,
      detail: detail,
      start_time: toMySQLDatetime(new Date(start_time)),
      end_time: null,
    });
    console.log("New data send successfully:", response.data);
    return response.data;
  } catch (error) {
    log("Error sending data:", error);
  }
};

// fungsi update endtime
const updateEndTime = async (trackingId, end_time) => {
  try {
    await axios.put(serverApi, {
      tracking_id: trackingId,
      end_time: toMySQLDatetime(new Date(end_time)),
    });
    console.log("End time updated successfully.");
  } catch (error) {
    log("Error updating end time:", error);
  }
};

// mengirim status monitoring ke db
const sendMonitoringLogToDB = async (status) => {
  try {
    if (!studentId || !sessionId) return;

    const response = await axios.post(serverStatusApi, {
      student_id: studentId,
      session_id: sessionId,
      status: status,
      timestamp: toMySQLDatetime(new Date()),
    });

    console.log("Monitoring log sent:", response.data);
  } catch (error) {
    log("Error sending monitoring log:", error);
  }
};

// membuat koneksi websocket untuk menerima command start/stop monitoring
const wss = new WebSocketServer({ port: config.wsPort });

wss.on("connection", function connection(ws) {
  log("Client connected");
  ws.send("ready");

  // Event ketika client terputus
  ws.on("close", async () => {
    log("Client disconnected");
    if (monitoring) {
      monitoring = false;
      const thisTime = Date.now();

      if (lastWindow && lastWindow.trackingId) {
        await updateEndTime(lastWindow.trackingId, thisTime);
      }
      lastWindow = null;

      await sendMonitoringLogToDB("left");

      log(
        "Monitoring Stopped due to client disconnect for student:",
        studentId,
        "in session:",
        sessionId
      );
    }
  });

  ws.on("message", async function incoming(message) {
    try {
      const command = JSON.parse(message);
      console.log("Received:", command);

      if (command.command === "startMonitoring") {
        studentId = command.studentId;
        sessionId = command.sessionId;
        stopTime = Number(command.stopTime) * 1000;
        monitoring = true;
        ws.send("running");
        log(
          "Monitoring Started for student:",
          studentId,
          "in session:",
          sessionId,
          "until:",
          stopTime
        );
      } else if (command.command === "stopMonitoring") {
        monitoring = false;
        const thisTime = Date.now();
        if (lastWindow && lastWindow.trackingId) {
          await updateEndTime(lastWindow.trackingId, thisTime);
        }
        lastWindow = null;
        await sendMonitoringLogToDB("left");
        ws.send("stopped");
        log(
          "Monitoring Stopped for student:",
          studentId,
          "in session:",
          sessionId
        );
        process.exit(), 10000;
      }
    } catch (error) {
      log("Error parsing WebSocket message:", error);
    }
  });
});

// perintah interval 1 detik
setInterval(async () => {
  // jika monitoring tidak aktif / interval sedang berjalan -> return
  if (!monitoring || isProcessing) return;

  const currentTime = Date.now();
  if (stopTime && currentTime >= stopTime) {
    monitoring = false;
    if (lastWindow && lastWindow.trackingId) {
      await updateEndTime(lastWindow.trackingId, currentTime);
    }
    lastWindow = null;
    log("Monitoring has stopped because time expired.");
    process.exit(), 10000;
  }

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
        const trackingId = sendingData.id;
        console.log("trackingId: ", trackingId);
        lastWindow = { ...currentWindow, trackingId };
      }
    }
  }
  isProcessing = false;
}, 1000);
