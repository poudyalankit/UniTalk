  import { Injectable } from '@angular/core';
  import { AngularFirestore } from '@angular/fire/compat/firestore';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  import { v4 as uuidv4 } from 'uuid';

  interface Message {
    userId: string;
    content: string;
    timestamp: number;
  }

  @Injectable({
    providedIn: 'root'
  })
  export class ChatService {
    constructor(private firestore: AngularFirestore) {}

    async sendMessage(chatRoomId: string, content: string): Promise<void> {
      const timestamp = new Date().getTime();
      const messageId = uuidv4();
      await this.firestore.collection(`rooms/${chatRoomId}/messages`).doc(messageId).set({
        userId: this.getUserId(),
        content,
        timestamp
      });
    }

    getMessages(chatRoomId: string): Observable<Message[]> {
      return this.firestore.collection(`rooms/${chatRoomId}/messages`, ref => ref.orderBy('timestamp')).snapshotChanges().pipe(
          map(actions => actions.map(a => {
            const data = a.payload.doc.data() as Message;
            const id = a.payload.doc.id;
            return { id, ...data };
          }))
      );
    }

    async createChatRoom(chatRoomId: string, uuid: string): Promise<void> {
      const roomRef = this.firestore.collection('rooms').doc(chatRoomId).ref;
      const userRoomRef = this.firestore.collection('users').doc(uuid).collection('rooms').doc(chatRoomId).ref;
      const roomUserRef = roomRef.collection('users').doc(uuid);

      await this.firestore.firestore.runTransaction(async (transaction) => {
        transaction.set(roomRef, {
          created: new Date().getTime(),
          name: "New Chat"
        });

        transaction.set(userRoomRef, { language: 'en' });

        transaction.set(roomUserRef, {
          joined: new Date().getTime()
        });
      });
    }

    async addUserToRoom(chatRoomId: string, userId: string): Promise<void> {
      const roomRef = this.firestore.collection('rooms').doc(chatRoomId).ref;
      const userRoomRef = this.firestore.collection('users').doc(userId).collection('rooms').doc(chatRoomId).ref;
      const roomUserRef = roomRef.collection('users').doc(userId);

      await this.firestore.firestore.runTransaction(async (transaction) => {
        transaction.set(userRoomRef, { language: 'en' });
        transaction.set(roomUserRef, {
          joined: new Date().getTime()
        });
      });
    }

    private getUserId(): string {
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = uuidv4();
        localStorage.setItem('userId', userId);
      }
      return userId;
    }
  }
