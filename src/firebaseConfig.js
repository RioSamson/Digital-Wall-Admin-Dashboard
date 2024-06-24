// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, prodErrorMap } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyBRBYbrVkLy5MYAcEVsuQzGWGHI75gsIh8",
  authDomain: "digitalwall-cdm.firebaseapp.com",
  projectId: "digitalwall-cdm",
  storageBucket: "digitalwall-cdm.appspot.com",
  messagingSenderId: "52043952974",
  appId: "1:52043952974:web:1753a91f250426b74b241f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const storage = getStorage(app);

export { app, auth, db, storage };
