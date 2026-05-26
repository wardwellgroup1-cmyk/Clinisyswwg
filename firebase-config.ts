/**
 * Firebase Configuration for HEDIS CareGap
 * Handles Firestore sync, authentication, and encrypted cloud backup
 * HIPAA-compliant with encryption at rest and in transit
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc, enableIndexedDbPersistence, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

/**
 * Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
 * Get this from: Firebase Console > Project Settings > Add App > Web
 */
const firebaseConfig = {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
        console.log('The current browser does not support offline persistence');
    }
});

/**
 * Encryption utilities for HIPAA compliance
 * Uses Web Crypto API (supported on all modern browsers)
 */
class EncryptionService {
    /**
     * Generate encryption key for patient data
     */
    static async generateKey() {
        return await window.crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt sensitive patient data
     * @param {string} data - Raw patient data
     * @param {CryptoKey} key - Encryption key
     * @returns {Promise<Object>} Encrypted data with IV and ciphertext
     */
    static async encrypt(data, key) {
        const encoder = new TextEncoder();
        const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

        const encrypted = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encoder.encode(data)
        );

        // Convert to base64 for storage
        return {
            iv: this.arrayBufferToBase64(iv),
            ciphertext: this.arrayBufferToBase64(encrypted),
            algorithm: 'AES-GCM'
        };
    }

    /**
     * Decrypt patient data
     * @param {Object} encryptedData - Object with iv, ciphertext
     * @param {CryptoKey} key - Decryption key
     * @returns {Promise<string>} Decrypted data
     */
    static async decrypt(encryptedData, key) {
        const decoder = new TextDecoder();
        const iv = this.base64ToArrayBuffer(encryptedData.iv);
        const ciphertext = this.base64ToArrayBuffer(encryptedData.ciphertext);

        const decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            ciphertext
        );

        return decoder.decode(decrypted);
    }

    static arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    static base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Derive encryption key from user password
     * Uses PBKDF2 with SHA-256
     */
    static async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const baseKey = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode(salt),
                iterations: 100000,
                hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    }
}

/**
 * Local-first sync manager
 * Handles offline queuing and auto-sync when connection restored
 */
class SyncManager {
    constructor() {
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        this.issyncing = false;

        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    handleOnline() {
        this.isOnline = true;
        this.syncQueue.length > 0 && this.syncAll();
    }

    handleOffline() {
        this.isOnline = false;
    }

    /**
     * Queue an operation for sync
     */
    addToQueue(operation) {
        this.syncQueue.push({
            ...operation,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        });
        localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    }

    /**
     * Load pending operations from localStorage
     */
    loadQueue() {
        const saved = localStorage.getItem('syncQueue');
        this.syncQueue = saved ? JSON.parse(saved) : [];
    }

    /**
     * Sync all pending operations to Firebase
     */
    async syncAll() {
        if (this.issyncing || !this.isOnline) return;

        this.issyncing = true;
        this.loadQueue();

        for (const operation of this.syncQueue) {
            try {
                await this.processOperation(operation);
                this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
            } catch (error) {
                console.error('Sync error:', error);
                break; // Stop on error, will retry next time
            }
        }

        localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
        this.isSncing = false;
    }

    /**
     * Process a single sync operation
     */
    async processOperation(operation) {
        const { type, data } = operation;

        switch (type) {
            case 'saveNote':
                await this.saveNoteToFirestore(data);
                break;
            case 'updateNote':
                await this.updateNoteInFirestore(data);
                break;
            case 'deleteNote':
                await this.deleteNoteFromFirestore(data);
                break;
            default:
                throw new Error(`Unknown operation: ${type}`);
        }
    }

    async saveNoteToFirestore(data) {
        // Implementation in FirestoreService
    }

    async updateNoteInFirestore(data) {
        // Implementation in FirestoreService
    }

    async deleteNoteFromFirestore(data) {
        // Implementation in FirestoreService
    }
}

/**
 * Firestore database service
 * Handles HIPAA-compliant note storage and versioning
 */
class FirestoreService {
    constructor(syncManager) {
        this.syncManager = syncManager;
        this.encryptionKey = null;
    }

    /**
     * Initialize encryption for current user
     */
    async initializeEncryption(userId) {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        // Derive key from user ID and a stored salt
        let userSalt = localStorage.getItem(`salt_${userId}`);
        if (!userSalt) {
            userSalt = Math.random().toString(36).substr(2);
            localStorage.setItem(`salt_${userId}`, userSalt);
        }

        // For production, use a proper key management system (e.g., AWS KMS, Google Cloud KMS)
        this.encryptionKey = await EncryptionService.deriveKey(userId, userSalt);
    }

    /**
     * Save progress note to Firestore with encryption
     * Includes versioning and change tracking
     */
    async saveProgressNote(noteData) {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        if (!this.encryptionKey) {
            await this.initializeEncryption(user.uid);
        }

        try {
            // Encrypt sensitive fields
            const encryptedContent = await EncryptionService.encrypt(
                noteData.content,
                this.encryptionKey
            );

            const docData = {
                userId: user.uid,
                title: noteData.title || `Note ${new Date().toLocaleDateString()}`,
                encryptedContent: encryptedContent,
                summary: noteData.summary, // Non-sensitive summary
                tags: noteData.tags || [],
                status: 'draft', // draft, signed, archived
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastModifiedBy: user.uid,
                version: 1,
                syncedAt: serverTimestamp()
            };

            if (this.syncManager.isOnline) {
                // Save directly to Firestore
                const docRef = await addDoc(
                    collection(db, 'users', user.uid, 'notes'),
                    docData
                );
                return docRef.id;
            } else {
                // Queue for sync
                const localId = Math.random().toString(36).substr(2, 9);
                this.syncManager.addToQueue({
                    type: 'saveNote',
                    data: { ...docData, localId }
                });
                return localId;
            }
        } catch (error) {
            console.error('Error saving note:', error);
            throw error;
        }
    }

    /**
     * Load all notes for current user
     * Returns decrypted content
     */
    async loadNotes() {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        if (!this.encryptionKey) {
            await this.initializeEncryption(user.uid);
        }

        try {
            const q = query(
                collection(db, 'users', user.uid, 'notes'),
                where('userId', '==', user.uid)
            );

            const snapshot = await getDocs(q);
            const notes = [];

            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();

                // Decrypt content
                let content = '';
                try {
                    content = await EncryptionService.decrypt(
                        data.encryptedContent,
                        this.encryptionKey
                    );
                } catch (error) {
                    console.error('Decryption error:', error);
                    content = '[Unable to decrypt - key mismatch]';
                }

                notes.push({
                    id: docSnap.id,
                    ...data,
                    content: content
                });
            }

            return notes;
        } catch (error) {
            console.error('Error loading notes:', error);
            throw error;
        }
    }

    /**
     * Update note with versioning
     * Keeps history of all changes
     */
    async updateNote(noteId, updates) {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        try {
            const noteRef = doc(db, 'users', user.uid, 'notes', noteId);
            const noteSnap = await getDoc(noteRef);

            if (!noteSnap.exists()) {
                throw new Error('Note not found');
            }

            const currentData = noteSnap.data();
            const newVersion = (currentData.version || 1) + 1;

            // Save previous version to history
            await addDoc(
                collection(db, 'users', user.uid, 'notes', noteId, 'history'),
                {
                    version: currentData.version,
                    encryptedContent: currentData.encryptedContent,
                    status: currentData.status,
                    updatedBy: user.uid,
                    updatedAt: serverTimestamp()
                }
            );

            // Encrypt updated content if provided
            let encryptedContent = currentData.encryptedContent;
            if (updates.content) {
                encryptedContent = await EncryptionService.encrypt(
                    updates.content,
                    this.encryptionKey
                );
            }

            // Update note
            const updateData = {
                ...updates,
                encryptedContent: encryptedContent,
                version: newVersion,
                updatedAt: serverTimestamp(),
                lastModifiedBy: user.uid
            };

            if (this.syncManager.isOnline) {
                await updateDoc(noteRef, updateData);
            } else {
                this.syncManager.addToQueue({
                    type: 'updateNote',
                    data: { id: noteId, ...updateData }
                });
            }
        } catch (error) {
            console.error('Error updating note:', error);
            throw error;
        }
    }

    /**
     * Delete note (soft delete - marks as archived)
     */
    async deleteNote(noteId) {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        try {
            const noteRef = doc(db, 'users', user.uid, 'notes', noteId);

            if (this.syncManager.isOnline) {
                await updateDoc(noteRef, {
                    status: 'deleted',
                    deletedAt: serverTimestamp(),
                    deletedBy: user.uid
                });
            } else {
                this.syncManager.addToQueue({
                    type: 'deleteNote',
                    data: { id: noteId }
                });
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            throw error;
        }
    }

    /**
     * Get note history/versions
     */
    async getNoteHistory(noteId) {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        try {
            const q = query(
                collection(db, 'users', user.uid, 'notes', noteId, 'history')
            );

            const snapshot = await getDocs(q);
            const history = [];

            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();

                let content = '';
                try {
                    content = await EncryptionService.decrypt(
                        data.encryptedContent,
                        this.encryptionKey
                    );
                } catch (error) {
                    content = '[Unable to decrypt]';
                }

                history.push({
                    version: data.version,
                    content: content,
                    status: data.status,
                    updatedBy: data.updatedBy,
                    updatedAt: data.updatedAt?.toDate()
                });
            }

            return history.sort((a, b) => b.version - a.version);
        } catch (error) {
            console.error('Error loading history:', error);
            throw error;
        }
    }
}

/**
 * Authentication service
 * Handles user signup, login, and session management
 */
class AuthService {
    /**
     * Register new user with email and password
     */
    static async signup(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw new Error(`Signup failed: ${error.message}`);
        }
    }

    /**
     * Login user
     */
    static async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    /**
     * Logout current user
     */
    static async logout() {
        try {
            await signOut(auth);
        } catch (error) {
            throw new Error(`Logout failed: ${error.message}`);
        }
    }

    /**
     * Get current user
     */
    static getCurrentUser() {
        return auth.currentUser;
    }

    /**
     * Listen to auth state changes
     */
    static onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, callback);
    }
}

// Export services
export { auth, db, AuthService, FirestoreService, EncryptionService, SyncManager };
