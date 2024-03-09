import WebSocket from "ws";
import { promisify } from "util";

const delay = promisify(setTimeout);
let ws;


// Main functions
function restart() {
  if (ws) ws.terminate();
  ws = new WebSocket("wss://stream.bybit.com/v5/public/spot");
  ws.on("open", onOpen)
  ws.on("message", onMessage);
}

function subscribe(topics) {
  if (!(ws.readyState === WebSocket.OPEN)) return;
  ws.send(JSON.stringify({ op: "subscribe", args: topics }));
}

function unsubscribe(topics) {
  if (!(ws.readyState === WebSocket.OPEN)) return;
  ws.send(JSON.stringify({ op: "unsubscribe", args: topics }));
}

// Control Frames
const onOpen = () => {
  console.log("WS OPEN");
  ws.send(JSON.stringify({ op: "subscribe", args: ["kline.30.BTCUSDT"] }));
}

const onMessage = (pl) => {
  console.log(pl.toString());
}

const onError = async (err) => {
  console.log(err);
  await delay(5000)
  restart();
}

// Core Logic
(async () => {
  restart();
  await delay(1000);
  subscribe(["kline.30.BTCUSDT", "kline.D.SOLUSDT"])
  await delay(5000);
  unsubscribe(["kline.D.SOLUSDT"])
})();