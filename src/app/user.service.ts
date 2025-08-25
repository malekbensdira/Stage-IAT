import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = '/api';
  private currentUser: User | null = null;
  private token: string | null = null;

  constructor(private http: HttpClient) {
    // Restaurer la session si elle existe
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      this.currentUser = JSON.parse(user);
      this.token = token;
    }
  }

  login(email: string, motDePasse: string): Observable<string | null> {
    return this.http.post<any>(`${this.apiUrl}/login`, { Email: email, MotDePasse: motDePasse })
      .pipe(
        map(res => {
          if (!res.user) return 'Réponse du serveur invalide';
          this.token = res.token;
          this.currentUser = res.user;
          localStorage.setItem('token', this.token!);
          localStorage.setItem('user', JSON.stringify(this.currentUser));
          return null;
        }),
        catchError(err => of(err.error?.error || 'Erreur serveur'))
      );
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  verifyToken(token: string): Observable<boolean> {
    return this.http.get<{ valid: boolean }>(`${this.apiUrl}/verify-token`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(response => response.valid),
      catchError(() => of(false))
    );
  }

  logout() {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // --- Statistiques pour le dashboard admin ---
  getUserCount() {
    return this.http.get<{ count: number }>(`${this.apiUrl}/stats/users`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
  }
  getMessageCount() {
    return this.http.get<{ count: number }>(`${this.apiUrl}/stats/messages`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
  }
  getAdminCount() {
    return this.http.get<{ count: number }>(`${this.apiUrl}/stats/admins`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
  }

  // --- Gestion des utilisateurs (admin) ---
  getAllUsers() {
    return this.http.get<User[]>(`${this.apiUrl}/users`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
  }
  getUserList() {
    return this.http.get<User[]>(`${this.apiUrl}/userlist`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
  }
  addUser(user: Partial<User>) {
    return this.http.post(`${this.apiUrl}/users`, user, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
  }
  register(nom: string, prenom: string, email: string, motDePasse: string) {
    return this.http.post<any>(`${this.apiUrl}/register`, { Nom: nom, Prenom: prenom, Email: email, MotDePasse: motDePasse })
      .pipe(
        map(() => null),
        catchError(err => of(err.error?.error || 'Erreur serveur'))
      );
  }
  deleteUser(id: number) {
    return this.http.delete(`${this.apiUrl}/users/${id}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
  }
  updateUser(user: User) {
    return this.http.put(`${this.apiUrl}/users/${user.id}`, user, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
  }
}
