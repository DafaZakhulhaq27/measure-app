// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAGFLqQGkekCxd1xSYXudEdTyTOtbJ7mfI",
  authDomain: "measure-app-4217d.firebaseapp.com",
  projectId: "measure-app-4217d",
  storageBucket: "measure-app-4217d.appspot.com",
  messagingSenderId: "944822212007",
  appId: "1:944822212007:web:8904e8667d5fa2b3ebd282",
  measurementId: "G-PPTT4FCYZD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
