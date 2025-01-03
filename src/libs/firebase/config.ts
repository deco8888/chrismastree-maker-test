import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig: {
	[key: string]: string | undefined
} = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
export const firebaseApp = getApps().length === 0 ? initializeApp( firebaseConfig ) : ( getApps()[ 0 ] as FirebaseApp );

// Initialize Auth
export const auth = getAuth( firebaseApp );

// Initialize Firestore
export const db = getFirestore( firebaseApp );

// Initialize Auth Providers
export const provider = new GoogleAuthProvider();

// Initialize Storage
export const storage = getStorage( firebaseApp );

// Enable emulators in development
// if ( process.env.NODE_ENV === 'development' ) {

// 	connectAuthEmulator( auth, 'http://localhost:9099' );
// 	connectFirestoreEmulator( db, 'localhost', 8080 );

// }
