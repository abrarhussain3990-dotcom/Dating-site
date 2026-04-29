const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "lovedatingapp-70584.firebaseapp.com",
  projectId: "lovedatingapp-70584",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = "";
let selectedUser = "";
let unsubscribeChat = null;

/* ================= DARK MODE ================= */
function toggleDark() {
  document.body.classList.toggle("dark");
}

/* ================= USER ADD (AUTO CHAT READY) ================= */
function addUser() {
  let name = document.getElementById("name").value.trim();
  let photo = document.getElementById("photo").value.trim();

  if (!name) return alert("Enter name!");

  currentUser = name;

  db.collection("users").doc(name).set({
    name,
    photo: photo || "https://randomuser.me/api/portraits/men/1.jpg",
    online: true,
    lastSeen: Date.now()
  });

  document.getElementById("name").disabled = true;
}

/* ================= USERS LIST ================= */
db.collection("users").onSnapshot(snapshot => {
  let div = document.getElementById("usersPanel");
  div.innerHTML = "";

  snapshot.forEach(doc => {
    let u = doc.data();
    if (u.name === currentUser) return;

    div.innerHTML += `
      <div onclick="openChat('${u.name}')">
        <img src="${u.photo}">
        <div><b>${u.name}</b></div>
      </div>
    `;
  });
});

/* ================= AUTO CHAT OPEN ================= */
function openChat(user) {
  selectedUser = user;
  document.getElementById("chatHeader").innerText = "Chat with " + user;
  loadChat();
}

/* ================= AUTO CHAT ID ================= */
function getChatId() {
  return [currentUser, selectedUser].sort().join("_");
}

/* ================= SEND MESSAGE ================= */
function sendMsg() {
  let msg = document.getElementById("msg").value.trim();

  if (!selectedUser) return alert("Select user first!");
  if (!msg) return;

  db.collection("chats")
    .doc(getChatId())
    .collection("messages")
    .add({
      from: currentUser,
      to: selectedUser,
      text: msg,
      type: "text",
      time: Date.now()
    });

  document.getElementById("msg").value = "";
}

/* ================= SEND IMAGE ================= */
function sendImageURL() {
  let url = document.getElementById("imgUrl").value.trim();

  if (!selectedUser) return alert("Select user first!");
  if (!url.startsWith("http")) return alert("Invalid image URL!");

  db.collection("chats")
    .doc(getChatId())
    .collection("messages")
    .add({
      from: currentUser,
      to: selectedUser,
      img: url,
      type: "img",
      time: Date.now()
    });

  document.getElementById("imgUrl").value = "";
}

/* ================= ENTER KEY ================= */
function handleEnter(e) {
  if (e.key === "Enter") sendMsg();
}

/* ================= REAL TIME CHAT ================= */
function loadChat() {

  if (unsubscribeChat) unsubscribeChat();

  unsubscribeChat = db.collection("chats")
    .doc(getChatId())
    .collection("messages")
    .orderBy("time")
    .onSnapshot(snapshot => {

      let chatDiv = document.getElementById("chat");
      chatDiv.innerHTML = "";

      snapshot.forEach(doc => {
        let m = doc.data();

        let cls = m.from === currentUser ? "me" : "other";

        let content = m.type === "text"
          ? m.text
          : `<img src="${m.img}" class="chat-img">`;

        chatDiv.innerHTML += `<div class="msg ${cls}">${content}</div>`;
      });

      chatDiv.scrollTop = chatDiv.scrollHeight;
    });
}
