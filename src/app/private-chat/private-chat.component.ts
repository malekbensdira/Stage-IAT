import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-private-chat',
  template: `
    <div class="private-chat">
      <div class="messages" #messagesContainer>
        <div *ngFor="let msg of messages" [ngClass]="{'mine': msg.sender_id === currentUserId, 'theirs': msg.sender_id !== currentUserId}">
          <div class="bubble">
            <span>{{ msg.content }}</span>
            <div class="meta">{{ msg.sender_id === currentUserId ? 'Moi' : otherUser.prenom }} • {{ msg.timestamp | date:'short' }}</div>
          </div>
        </div>
      </div>
      <form (ngSubmit)="send()" class="chat-form">
        <input [(ngModel)]="input" name="input" required placeholder="Votre message...">
        <button type="submit">Envoyer</button>
      </form>
    </div>
  `,
  styles: [`
    .private-chat { display: flex; flex-direction: column; height: 400px; }
    .messages { flex: 1; overflow-y: auto; padding: 8px; background: #f9f9f9; border-radius: 8px; }
    .bubble { max-width: 70%; margin-bottom: 8px; padding: 10px 14px; border-radius: 16px; position: relative; }
    .mine { text-align: right; }
    .mine .bubble { background: #1976d2; color: #fff; margin-left: 30%; }
    .theirs .bubble { background: #eee; color: #222; margin-right: 30%; }
    .meta { font-size: 11px; color: #888; margin-top: 2px; }
    .chat-form { display: flex; gap: 8px; margin-top: 8px; }
    .chat-form input { flex: 1; padding: 8px; border-radius: 4px; border: 1px solid #ccc; }
    .chat-form button { padding: 8px 16px; background: #1976d2; color: #fff; border: none; border-radius: 4px; }
  `]
})
export class PrivateChatComponent implements OnInit, OnDestroy {
  @Input() currentUserId!: number;
  @Input() otherUser!: any;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  messages: any[] = [];
  input = '';
  interval: any;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.loadMessages();
    this.interval = setInterval(() => this.loadMessages(), 2000);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  loadMessages() {
    this.messageService.getConversation(this.currentUserId, this.otherUser.id).subscribe(msgs => {
      this.messages = msgs;
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  send() {
    if (!this.input.trim()) return;
    this.messageService.sendMessage(this.currentUserId, this.otherUser.id, this.input).subscribe(() => {
      this.input = '';
      this.loadMessages();
    });
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
