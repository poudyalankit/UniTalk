import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { v4 as uuidv4 } from 'uuid';
import { ChatService } from "../chat.service";
import { TranslationService } from '../translation.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest, firstValueFrom } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface Message {
  userId: string;
  content: string;
  timestamp: number;
  userName: string;
  originalLanguage: string;
}

interface User {
  id: string;
  username: string;
  defaultLanguage: string;
}

interface UserData {
  language?: string;
  username?: string;
  defaultLanguage?: string;
}

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  leftSidebarCollapsed: boolean = false;
  rightSidebarCollapsed: boolean = true;
  showSettingsModal: boolean = false;
  showJoinChatModal: boolean = false;
  showToast: boolean = false;
  chatUUID: string = '';
  username: string = localStorage.getItem('username') || '';
  uuid: string = localStorage.getItem('uuid') || '';
  showLanguageDropdown: boolean = false;
  messages: Message[] = [];
  users: User[] = [];
  rooms: any[] = [];
  chatUsers: User[] = [];
  isInitialCheck: boolean = true;
  activeChatId: string | null = null;
  messagesSubscription: Subscription | null = null;
  usersSubscription: Subscription | null = null;
  selectedLanguage: string = '';
  selectedLanguageName: string = '';
  languages: any[] = [];
  languageSearch: string = '';

  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private firestore: AngularFirestore,
      private chatService: ChatService,
      private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.checkUser();
    this.loadUserRooms();
    this.loadLanguages().then(() => {
      this.route.paramMap.subscribe(params => {
        this.activeChatId = params.get('id');
        if (this.activeChatId) {
          this.loadUserLanguage().then(() => {
            this.loadMessages().then(() => {
              this.loadChatUsers();
            });
          });
        } else {
          this.messages = [];
          this.chatUsers = [];
        }
      });
    });
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }

  toggleLeftSidebar(): void {
    this.leftSidebarCollapsed = !this.leftSidebarCollapsed;
  }

  toggleRightSidebar(): void {
    this.rightSidebarCollapsed = !this.rightSidebarCollapsed;
  }

  toggleLanguageDropdown(): void {
    this.showLanguageDropdown = !this.showLanguageDropdown;
  }

  openSettingsModal(): void {
    this.showSettingsModal = true;
  }

  closeSettingsModal(): void {
    if (this.isInitialCheck && (!this.username.trim() || !localStorage.getItem('uuid'))) {
      return;
    }
    this.showSettingsModal = false;
    this.isInitialCheck = false;
  }

  saveSettings(): void {
    if (this.username.trim()) {
      localStorage.setItem('username', this.username);
      const uuid = localStorage.getItem('uuid');
      if (uuid) {
        this.firestore.collection('users').doc(uuid).set({
          username: this.username,
          uuid: uuid
        }, { merge: true });
      }
      this.showSettingsModal = false;
      this.isInitialCheck = false;
    }
  }

  openJoinChatModal(): void {
    this.showJoinChatModal = true;
  }

  closeJoinChatModal(): void {
    this.showJoinChatModal = false;
  }

  async joinChat(): Promise<void> {
    if (this.chatUUID.trim()) {
      try {
        const roomDoc = await this.firestore.collection('rooms').doc(this.chatUUID).get().toPromise();
        if (roomDoc?.exists) {
          await this.chatService.addUserToRoom(this.chatUUID, this.uuid);
          await this.router.navigate([`/chat/${this.chatUUID}`]);
          this.closeJoinChatModal();
        } else {
          console.error('Room not found!');
        }
      } catch (err) {
        console.error('Error joining chat:', err);
      }
    }
  }

  async createChat() {
    const chatRoomId = uuidv4();
    await this.chatService.createChatRoom(chatRoomId, this.uuid);
    try {
      const success = await this.router.navigate([`/chat/${chatRoomId}`]);
      if (!success) {
        console.error('Navigation failed!');
      }
    } catch (err) {
      console.error('Navigation error:', err);
    }
  }

  async sendMessage(input: HTMLInputElement): Promise<void> {
    if (input.value.trim() && this.activeChatId && this.uuid) {
      const originalMessage = input.value.trim();
      const timestamp = new Date().getTime();

      await this.firestore.collection('rooms').doc(this.activeChatId).collection('messages').add({
        userId: this.uuid,
        content: originalMessage,
        timestamp,
        userName: this.username,
        originalLanguage: this.selectedLanguage
      });

      input.value = '';
    }
  }

  copyUUID(): void {
    if (this.activeChatId) {
      navigator.clipboard.writeText(this.activeChatId).then(() => {
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 3000);
      }).catch(err => {
        console.error('Could not copy UUID:', err);
      });
    }
  }

  async setSelectedLanguage(language: any): Promise<void> {
    this.selectedLanguage = language.code;
    this.selectedLanguageName = language.name;

    if (this.uuid && this.activeChatId) {
      // Update the language in the user's rooms subcollection for the specific room
      await this.firestore.collection('users')
          .doc(this.uuid)
          .collection('rooms')
          .doc(this.activeChatId)
          .set({ language: language.code }, { merge: true });

      await this.loadMessages();
    }
  }

  private getLanguageName(languageCode: string): string {
    const language = this.languages.find(lang => lang.code === languageCode);
    return language ? language.name : 'Unknown';
  }

  private checkUser(): void {
    let uuid = localStorage.getItem('uuid');
    let username = localStorage.getItem('username');
    if (!uuid || !username) {
      this.promptForUsernameAndUUID();
    } else {
      firstValueFrom(this.firestore.collection('users').doc(uuid).get())
          .then(doc => {
            if (!doc.exists) {
              this.promptForUsernameAndUUID();
            }
          })
          .catch(error => {
            console.error('Error checking user:', error);
            this.promptForUsernameAndUUID();
          });
    }
  }

  private promptForUsernameAndUUID(): void {
    const uuid = uuidv4();
    localStorage.setItem('uuid', uuid);
    this.username = '';
    this.uuid = uuid;
    localStorage.removeItem('username');
    this.isInitialCheck = true;
    this.showSettingsModal = true;
  }

  private loadUserRooms(): void {
    if (this.uuid) {
      this.firestore.collection('users').doc(this.uuid).collection('rooms').snapshotChanges().subscribe(userRoomSnapshots => {
        const roomIds = userRoomSnapshots.map(doc => doc.payload.doc.id);
        if (roomIds.length > 0) {
          const roomPromises = roomIds.map(roomId => this.firestore.collection('rooms').doc(roomId).get().toPromise());
          Promise.all(roomPromises).then(roomDocs => {
            this.rooms = roomDocs
                .filter(doc => doc && doc.exists)
                .map(doc => {
                  const data = doc!.data() as any;
                  return {
                    id: doc!.id,
                    name: data?.name || 'Unnamed Room'
                  };
                });
          });
        } else {
          this.rooms = [];
        }
      });
    }
  }

  private async loadMessages(): Promise<void> {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }

    if (this.activeChatId && this.uuid) {
      this.messagesSubscription = this.firestore.collection('rooms')
          .doc(this.activeChatId)
          .collection('messages', ref => ref.orderBy('timestamp'))
          .snapshotChanges()
          .pipe(
              switchMap(async messageSnapshots => {
                const messages = [];
                for (const snapshot of messageSnapshots) {
                  const messageDoc = snapshot.payload.doc;
                  const messageData = messageDoc.data() as Message;

                  if (messageData.originalLanguage === this.selectedLanguage) {
                    // If the original language matches the selected language, use the original content
                    messages.push(messageData);
                  } else {
                    // Otherwise, get the translated message
                    const translatedMessage = await this.getTranslatedMessage(messageDoc.id, messageData);
                    messages.push(translatedMessage);
                  }
                }
                return messages;
              })
          )
          .subscribe(translatedMessages => {
            this.messages = translatedMessages;
          });
    } else {
      this.messages = [];
    }
  }


  private async getTranslatedMessage(messageId: string, messageData: Message): Promise<Message> {
    const translationRef = this.firestore.collection('rooms')
        .doc(this.activeChatId!)
        .collection('messages')
        .doc(messageId)
        .collection('translated')
        .doc(this.selectedLanguage);

    const translationDoc = await firstValueFrom(translationRef.get());
    let translatedContent: string;

    if (translationDoc.exists) {
      translatedContent = translationDoc.data()?.['content'];
    } else {
      translatedContent = await this.translationService.translate(messageData.content, this.selectedLanguage);
      await translationRef.set({ content: translatedContent });
    }

    return {
      ...messageData,
      content: translatedContent
    };
  }


  private loadChatUsers(): void {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
    if (this.activeChatId) {
      this.usersSubscription = this.firestore.collection('rooms').doc(this.activeChatId).collection('users').snapshotChanges().pipe(
          switchMap(userSnapshots => {
            const userIds = userSnapshots.map(snapshot => snapshot.payload.doc.id);
            const userPromises = userIds.map(userId => this.firestore.collection('users').doc(userId).get().toPromise());
            return combineLatest(userPromises);
          }),
          map(userDocs => userDocs.map(doc => ({
            id: doc!.id,
            username: (doc!.data() as User)['username'],
            defaultLanguage: (doc!.data() as User)['defaultLanguage'] || 'en'
          })))
      ).subscribe(users => {
        this.chatUsers = users;
      });
    } else {
      this.chatUsers = [];
    }
  }

  private async loadUserLanguage(): Promise<void> {
    if (this.uuid && this.activeChatId) {
      try {
        const userRoomDoc = await firstValueFrom(this.firestore.collection('users')
            .doc(this.uuid)
            .collection('rooms')
            .doc(this.activeChatId)
            .get());

        const userData = userRoomDoc.data() as UserData | undefined;
        if (userData?.language) {
          this.selectedLanguage = userData.language;
          this.selectedLanguageName = this.getLanguageName(userData.language);
        }
      } catch (error) {
        console.error('Error loading user language:', error);
      }
    }
  }

  private async loadLanguages(): Promise<void> {
    const storedLanguages = localStorage.getItem('languages');
    const storedExpiration = localStorage.getItem('languagesExpiration');

    if (storedLanguages && storedExpiration && new Date(storedExpiration) > new Date()) {
      this.languages = JSON.parse(storedLanguages);
      return;
    }

    try {
      const languages = await this.translationService.getLanguages();
      this.languages = languages;
      localStorage.setItem('languages', JSON.stringify(languages));
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 1);
      localStorage.setItem('languagesExpiration', expirationDate.toISOString());
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  }

  isActiveChat(roomId: string): boolean {
    return this.activeChatId === roomId;
  }

  get filteredLanguages() {
    if (!this.languageSearch.trim()) {
      return this.languages;
    }
    return this.languages.filter(language => language.name.toLowerCase().includes(this.languageSearch.trim().toLowerCase()));
  }
}
