import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyAALjxZmhZgW1ukewezN96-P8MEVuk6ZNQ",
  authDomain: "startsmart-app-75b1d.firebaseapp.com",
  projectId: "startsmart-app-75b1d",
  storageBucket: "startsmart-app-75b1d.firebasestorage.app",
  messagingSenderId: "828377786956",
  appId: "1:828377786956:web:c11be2cd03a62f5936a2e9",
  measurementId: "G-2FZ0XDR9L5"
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)

export const analytics = getAnalytics(app)
