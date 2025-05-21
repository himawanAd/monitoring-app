const serverUrl = "http://localhost/moodle/local/monitoring/";
const wsPort = 51107;

const config = {
  serverUrl: serverUrl,
  serverApi: serverUrl + "api.php",
  serverStatusApi: serverUrl + "log.php",
  wsPort: wsPort,
};

export default config;
