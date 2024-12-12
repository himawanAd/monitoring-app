const Service = require("node-windows").Service;

const svc = new Service({
  name: "MonitoringApp",
  description: "Layanan untuk memantau aktivitas perangkat",
  script: require("path").join(__dirname, "monitor.js"),
});

// Mendaftarkan layanan
svc.on("install", function () {
  svc.start();
});

svc.install();
