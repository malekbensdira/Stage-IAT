import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  sendMessage(from: number, to: number, text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages`, { from, to, text });
  }

  getConversation(from: number, to: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/messages?from=${from}&to=${to}`);
  }
} 