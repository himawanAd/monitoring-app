# 🎓 Student Device Activity Monitoring System

### 🖥️ Sistem Pemantauan Aktivitas Perangkat Peserta Didik

This system is developed to monitor student device activity during designated online learning sessions. It is designed to run in the background and connect to the learning platform (e.g., Moodle) via WebSocket for real-time data exchange.  
_Sistem ini dikembangkan untuk memantau aktivitas perangkat peserta didik selama sesi pembelajaran daring yang telah ditentukan. Sistem dirancang untuk berjalan di latar belakang dan terhubung dengan platform pembelajaran (misalnya, Moodle) melalui WebSocket untuk pertukaran data secara real-time._

---

## 📚 Overview / Ringkasan

- Includes a Node.js-based monitoring script (`monitor.js`) that captures active window information on the student device.  
  _Mencakup skrip pemantauan berbasis Node.js (`monitor.js`) yang menangkap informasi jendela aplikasi aktif pada perangkat peserta didik._
- Uses a **custom protocol handler** (`monapp:`) to automatically trigger monitoring when a student accesses a monitored session.  
  _Menggunakan **custom protocol handler** (`monapp:`) untuk memicu proses pemantauan secara otomatis saat peserta didik mengakses sesi yang dipantau._
- Streams activity data to the server in real-time, allowing educators to track student engagement.  
  _Data aktivitas dikirim secara real-time ke server, memungkinkan pengajar untuk memantau keterlibatan peserta didik._

---

## ⚙️ Installation / Instalasi

> This installer is bundled with a portable Node.js runtime and required configuration files.  
> _Instalasi ini sudah dibundel dengan runtime Node.js portabel dan file konfigurasi yang dibutuhkan._

### Steps / Langkah-langkah:

1. Run the following application as **Administrator**:  
   _Jalankan aplikasi berikut sebagai **Administrator**:_
   ```
   monitoringapp-setup.exe
   ```
2. The installer will:  
   _Installer akan:_
   - Install Node.js (portable, based on the required version) locally  
     _Menginstal Node.js (portabel, sesuai dengan versi yang dibutuhkan) secara lokal_
   - Register the `monapp:` custom URI scheme  
     _Mendaftarkan skema URI khusus `monapp:`_
   - Configure `monitor.js` to run automatically when the URI is invoked
     _Mengatur agar `monitor.js` berjalan otomatis saat URI tersebut dipanggil_

> Once installed, the system will be ready for activation when the URI `monapp:` is invoked by the configured learning platform.  
> _Setelah terinstal, sistem akan siap diaktifkan ketika URI `monapp:` dipanggil oleh platform pembelajaran yang telah dikonfigurasi._

---

## 📤 Sample Data Payload / Contoh Payload Data

> The collected data consists of application window information displayed during the session, as illustrated below:  
> _Data yang dikumpulkan terdiri dari informasi jendela aplikasi yang ditampilkan selama sesi, seperti contoh berikut:_

```json
{
  "student_id": "1",
  "module_id": "1",
  "app_name": "Google Chrome",
  "detail": "SPADA UNS",
  "start_time": "2025-01-01T08:30:00Z",
  "end_time": "2025-01-01T08:45:00Z"
}
```

---

## 🔎 Check if Monitoring is Running / Cek Status Pemantauan

This monitoring system is **designed to operate only when monitoring is required and has been approved by the device user**. It will automatically terminate once it is no longer needed. However, if you suspect the monitoring process is running outside of the intended session, you can verify whether the monitoring script is active, open Command Prompt and run:  
_Sistem pemantauan ini **berjalan hanya ketika pemantauan dibutuhkan dan dengan persetujuan pengguna perangkat**. Ini akan berhenti secara otomatis jika telah tidak diperlukan. Bagaimanapun, jika Anda curiga proses pemantauan berjalan di luar sesi yang seharusnya, Anda bisa memastikan apakah skrip pemantauan sedang berjalan, buka Command Prompt dan jalankan:_

```bash
wmic process where "name='node.exe'" get CommandLine,ProcessId
```

If there is a monitoring process running and you want to stop it, run:
_Jika terdapat proses pemantauan berjalan dan Anda ingin menghentikannya, jalankan:_

```bash
start monapp:stop
```

Or, you can open the `stop.vbs` located in this system directory.
_Atau Anda dapat membuka `stop.vbs` yang terletak pada direktori sistem ini._

---

## ⚠️ Notes / Catatan

- An internet connection is required during monitoring sessions.  
  _Koneksi internet dibutuhkan selama sesi pemantauan._
- Browsers may ask for confirmation when launching the app via the `monapp:` protocol — this is expected behavior for security reasons.  
  _Browser mungkin akan meminta konfirmasi saat meluncurkan aplikasi melalui protokol `monapp:` — ini merupakan perilaku normal demi keamanan._
- Monitoring is only active during the session and will automatically stop when the session ends or the monitoring page is closed.  
  _Pemantauan hanya aktif selama sesi berlangsung dan akan berhenti otomatis saat sesi berakhir atau halaman pemantauan ditutup._
- The system **only collects active application window data during the session**, including the window title, application name, and timestamps when it was active. It **does not** record screen content or activities within the applications.
  _Sistem **hanya mengumpulkan data jendela aplikasi yang diaktifkan selama sesi**, termasuk judul jendela, nama aplikasi, serta waktu saat aplikasi tersebut aktif. Sistem ini **tidak** merekam konten layar maupun aktivitas di dalam aplikasi._

---

## 📄 License / Lisensi

This project is developed by **Himawan Addillah** as part of an undergraduate final project in Informatics at **Universitas Sebelas Maret**.  
_Proyek ini dikembangkan oleh **Himawan Addillah** sebagai bagian dari tugas akhir program sarjana Informatika di **Universitas Sebelas Maret**._

---
