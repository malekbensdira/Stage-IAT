import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../user.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-messenger',
  template: `
    <div class="messenger-wrapper">
      <h2>Messagerie privée</h2>
      <div class="users-list">
        <h3>Utilisateurs</h3>
        <ul>
          <li *ngFor="let user of users" (click)="selectUser(user)" [class.selected]="selectedUser?.id === user.id">
            {{ user.prenom }} {{ user.nom }}
            <span *ngIf="user.unreadCount > 0" class="badge">{{ user.unreadCount }}</span>
          </li>
        </ul>
      </div>
      <div class="chat-area" *ngIf="selectedUser">
        <app-private-chat [currentUserId]="currentUser.id" [otherUser]="selectedUser"></app-private-chat>
      </div>
      <div *ngIf="!selectedUser" class="no-chat">Sélectionnez un utilisateur pour discuter.</div>
    </div>
  `,
  styles: [`
    .messenger-wrapper {
      max-width: 900px;
      margin: 40px auto;
      padding: 32px 24px;
      background: rgba(255,255,255,0.85);
      border-radius: 16px;
      box-shadow: 0 2px 16px #b3c6e0;
      min-height: 400px;
      display: flex;
      flex-direction: row;
      gap: 32px;
    }
    .users-list {
      min-width: 200px;
      border-right: 1px solid #e0e7ef;
      padding-right: 24px;
    }
    .users-list ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .users-list li {
      padding: 10px 8px;
      cursor: pointer;
      border-radius: 6px;
      margin-bottom: 6px;
      transition: background 0.2s;
      position: relative;
    }
    .users-list li.selected, .users-list li:hover {
      background: #e3f0ff;
      color: #1976d2;
    }
    .chat-area {
      flex: 1;
      min-width: 0;
    }
    .no-chat {
      color: #888;
      font-size: 18px;
      margin: auto;
    }
    .badge {
      background: red;
      color: white;
      border-radius: 50%;
      padding: 0.2em 0.6em;
      margin-left: 0.5em;
      font-weight: bold;
      font-size: 0.9em;
      animation: bounce 0.5s;
      display: inline-block;
    }
    @keyframes bounce {
      0%   { transform: scale(1); }
      30%  { transform: scale(1.3); }
      50%  { transform: scale(0.9); }
      70%  { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    @media (max-width: 900px) {
      .messenger-wrapper {
        flex-direction: column;
        gap: 12px;
        padding: 12px 2vw;
      }
      .users-list {
        border-right: none;
        border-bottom: 1px solid #e0e7ef;
        padding-right: 0;
        padding-bottom: 12px;
        min-width: 0;
      }
    }
  `]
})
export class MessengerComponent implements OnInit {
  users: User[] = [];
  currentUser: User;
  selectedUser: User | null = null;

  constructor(private userService: UserService, private http: HttpClient) {
    this.currentUser = this.userService.getCurrentUser()!;
  }

  ngOnInit() {
    this.userService.getUserList().subscribe(users => {
      this.users = users.filter(u => u.id !== this.currentUser.id);
      // Récupère les messages non lus pour l'utilisateur courant
      this.http.get<{ sender_id: number, unread: number }[]>(`http://localhost:3000/api/messages/unread/${this.currentUser.id}`)
        .subscribe(unreadList => {
          for (const unread of unreadList) {
            const user = this.users.find(u => u.id === unread.sender_id);
            if (user) {
              (user as any).unreadCount = unread.unread;
            }
          }
        });
    });
  }

  selectUser(user: User) {
    this.selectedUser = user;
    // Marquer les messages comme lus
    this.http.post('http://localhost:3000/api/messages/markAsRead', {
      from: user.id, // l'expéditeur
      to: this.currentUser.id // le destinataire (utilisateur courant)
    }).subscribe(() => {
      // Mets à jour le badge localement
      const u = this.users.find(u => u.id === user.id);
      if (u) {
        (u as any).unreadCount = 0;
      }
    });
  }
} 