import { WebSocketServer } from "ws";

// Inisialisasi WebSocket Server di port 8080
const wss = new WebSocketServer({ port: 8080 });

console.log("WebSocket server is running on ws://localhost:8080");

// Event ketika client terhubung
wss.on("connection", (ws) => {
  console.log("Client connected");

  // Kirim pesan selamat datang ke client
  ws.send(JSON.stringify({ message: "Welcome to the WebSocket Server!" }));

  // Event ketika server menerima pesan dari client
  ws.on("message", (data) => {
    // Konversi buffer ke string
    const message = data.toString(); // Konversi buffer ke string
    console.log("Received:", message);
  });

  // Event ketika client terputus
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
