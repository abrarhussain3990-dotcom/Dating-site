import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBGOFD_ukCDkeg5FPf8z_nP7yAzCZXCV7o",
  authDomain: "dating-app-21c55.firebaseapp.com",
  projectId: "dating-app-21c55",
  storageBucket: "dating-app-21c55.firebasestorage.app",
  messagingSenderId: "101828106221",
  appId: "1:101828106221:web:cdabb70a284a945879f9e4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
