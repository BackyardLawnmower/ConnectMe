const socket = io();

const messages = document.getElementById("messages");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");
const voiceBtn = document.getElementById("voice");

let userLabel = Math.random() < 0.5 ? "A" : "B";

// Text chat sending
sendBtn.addEventListener("click", () => {
  if (input.value.trim() !== "") {
    socket.emit("chat message", { text: input.value.trim(), user: userLabel });
    input.value = "";
  }
});

input.addEventListener("keypress", e => {
  if (e.key === "Enter") sendBtn.click();
});

// Display incoming text messages
socket.on("chat message", data => {
  const msg = document.createElement("div");
  msg.textContent = `${data.user}: ${data.text}`;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
});

// Voice recording
voiceBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    let chunks = [];

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        socket.emit("voice message", { audio: reader.result, user: userLabel });
      };
      reader.readAsDataURL(blob);
    };

    mediaRecorder.start();
    voiceBtn.textContent = "⏺️";
    setTimeout(() => {
      mediaRecorder.stop();
      voiceBtn.textContent = "📞";
    }, 5000); // Record for 5 seconds max
  } catch (err) {
    alert("Microphone access denied or not available.");
  }
});

// Play incoming voice
socket.on("voice message", data => {
  const msg = document.createElement("div");
  msg.textContent = `${data.user}: [voice message]`;
  messages.appendChild(msg);

  const audio = new Audio(data.audio);
  audio.play();

  messages.scrollTop = messages.scrollHeight;
});
