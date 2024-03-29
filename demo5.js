import WebSocket from "ws";
import { promisify } from "util";

const delay = promisify(setTimeout);
const PING_INTERVAL = 20 * 1000;
const HEARTBEAT_INTERVAL = 25 * 1000;
let pingTrigger;
let heartbeatTrigger;
let ws;
let pingFlag = false;


// Main functions
function restart() {
  if (ws) ws.terminate();
  ws = new WebSocket("wss://stream.bybit.com/v5/public/spot");
  ws.on("open", onOpen);
  ws.on("message", onMessage);
  ws.on("pong", onPong);

  clearInterval(pingTrigger);
  pingTrigger = setInterval(() => {
    if (!(ws.readyState === WebSocket.OPEN)) return;
    if (pingFlag) return;
    pingFlag = true;
    ws.ping();
  }, PING_INTERVAL);
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
};

const onPong = () => {
  console.log("WS PONG RECIEVED.")
  clearTimeout(heartbeatTrigger);

  heartbeatTrigger = setTimeout(() => {
    console.log("HEARTBEAT TRIGGERED");
    restart();
  }, HEARTBEAT_INTERVAL);
}

const onMessage = (pl) => {
  console.log(pl.toString());
};

const onError = async (err) => {
  console.log(err);
  await delay(5000);
  restart();
};

// Core Logic
(async () => {
  restart();
  await delay(1000);
  subscribe(["kline.30.BTCUSDT", "kline.D.SOLUSDT"]);
  await delay(5000);
  unsubscribe(["kline.D.SOLUSDT"]);
})();
