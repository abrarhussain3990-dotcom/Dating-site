import { db, storage } from "./firebase.js";
import {
  collection, addDoc, getDocs, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

let myName = "";
window.myName = "";
let currentChat = "";

// 🔥 ENTER FUNCTION (MAIN FIX)
window.enter = async function(){

  const name = document.getElementById("name").value;
  const file = document.getElementById("photo").files[0];
  const s = document.getElementById("status");

  if(!name || !file){
    s.innerText="❌ Fill all";
    return;
  }

  try{
    s.innerText="⏳ Uploading...";

    const storageRef = ref(storage,"photos/"+Date.now());
    await uploadBytes(storageRef,file);
    const url = await getDownloadURL(storageRef);

    await addDoc(collection(db,"users"),{
      name:name,
      photo:url
    });

    myName = name;
    window.myName = name;

    s.innerText="✅ Entered";

    loadUsers();

  }catch(e){
    s.innerText="❌ "+e.message;
  }
};

// LOAD USERS
async function loadUsers(){
  const snap = await getDocs(collection(db,"users"));
  const div = document.getElementById("users");
  div.innerHTML="";

  snap.forEach(doc=>{
    const u = doc.data();

    if(u.name !== myName){
      div.innerHTML += `
      <div class="card">
        <img src="${u.photo}">
        <h3>${u.name}</h3>
        <button onclick="likeUser('${u.name}')">Like ❤️</button>
      </div>`;
    }
  });
}

// LIKE
window.likeUser = async function(name){
  await addDoc(collection(db,"likes"),{
    from:myName,
    to:name
  });

  checkMatch(name);
};

// CHECK MATCH
async function checkMatch(name){
  const snap = await getDocs(collection(db,"likes"));
  let match=false;

  snap.forEach(doc=>{
    const l = doc.data();
    if(l.from===name && l.to===myName){
      match=true;
    }
  });

  if(match){
    startChat(name);
  }else{
    alert("Liked ❤️ Waiting...");
  }
}

// CHAT
window.startChat = function(name){
  currentChat=name;

  document.getElementById("chat").style.display="block";
  document.getElementById("chatWith").innerText=name;

  const id=[myName,name].sort().join("_");

  const q=query(collection(db,"messages"),orderBy("time"));

  onSnapshot(q,snap=>{
    const box=document.getElementById("messages");
    box.innerHTML="";

    snap.forEach(d=>{
      const m=d.data();
      if(m.chatId===id){
        box.innerHTML+=`<p><b>${m.sender}:</b> ${m.text}</p>`;
      }
    });
  });
};

// SEND
window.send = async function(){
  const msg=document.getElementById("msg").value;
  if(!msg)return;

  const id=[myName,currentChat].sort().join("_");

  await addDoc(collection(db,"messages"),{
    chatId:id,
    sender:myName,
    text:msg,
    time:Date.now()
  });

  document.getElementById("msg").value="";
};
