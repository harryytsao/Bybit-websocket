import WebSocket from "ws";

let ws;

ws = new WebSocket("wss://stream.bybit.com/v5/public/spot");

ws.on("open", () => {
    console.log("WS OPEN");
})