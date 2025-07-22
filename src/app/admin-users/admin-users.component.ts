import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../user.service';

@Component({
  selector: 'app-admin-users',
  template: `
    <div class="admin-users-wrapper">
      <h2>Gestion des utilisateurs</h2>
      <button class="add-user-btn" (click)="showAddUser = !showAddUser">Ajouter un utilisateur</button>
      <form *ngIf="showAddUser" (ngSubmit)="addUser()" class="add-user-form">
        <input [(ngModel)]="newUser.nom" name="nom" placeholder="Nom" required>
        <input [(ngModel)]="newUser.prenom" name="prenom" placeholder="Prénom" required>
        <input [(ngModel)]="newUser.email" name="email" placeholder="Email" required type="email">
        <input [(ngModel)]="newUser.motDePasse" name="motDePasse" placeholder="Mot de passe" required type="password">
        <select [(ngModel)]="newUser.role" name="role" required>
          <option value="user">Utilisateur</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Créer</button>
        <button type="button" (click)="showAddUser = false">Annuler</button>
      </form>
      <div *ngIf="addError" class="add-user-error">{{ addError }}</div>
      <table class="users-table" *ngIf="users.length">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <ng-container *ngIf="editingUser?.id !== user.id; else editRow">
              <td>{{ user.nom }}</td>
              <td>{{ user.prenom }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>
                <button class="edit-btn" (click)="editUser(user)">Modifier</button>
                <button class="delete-btn" (click)="deleteUser(user.id)">Supprimer</button>
              </td>
            </ng-container>
            <ng-template #editRow>
              <td><input [(ngModel)]="editingUser.nom" /></td>
              <td><input [(ngModel)]="editingUser.prenom" /></td>
              <td><input [(ngModel)]="editingUser.email" /></td>
              <td>
                <select [(ngModel)]="editingUser.role">
                  <option value="user">Utilisateur</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <button class="save-btn" (click)="saveEdit()">Enregistrer</button>
                <button class="cancel-btn" (click)="cancelEdit()">Annuler</button>
              </td>
            </ng-template>
          </tr>
        </tbody>
      </table>
      <p *ngIf="!users.length">Aucun utilisateur pour le moment.</p>
    </div>
  `,
  styles: [`
    .admin-users-wrapper {
      max-width: 900px;
      margin: 40px auto;
      padding: 32px 24px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 2px 16px #b3c6e0;
      text-align: center;
    }
    h2 {
      color: #1976d2;
      margin-bottom: 24px;
    }
    .add-user-btn {
      background: #1976d2;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 10px 24px;
      font-size: 16px;
      cursor: pointer;
      margin-bottom: 18px;
      transition: background 0.2s;
    }
    .add-user-btn:hover {
      background: #125ea2;
    }
    .add-user-form {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .add-user-form input, .add-user-form select {
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #b3c6e0;
      font-size: 15px;
      min-width: 120px;
    }
    .add-user-form button {
      background: #1976d2;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      font-size: 15px;
      cursor: pointer;
      margin-left: 4px;
      transition: background 0.2s;
    }
    .add-user-form button[type="button"] {
      background: #d32f2f;
    }
    .add-user-form button[type="button"]:hover {
      background: #b71c1c;
    }
    .users-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 18px;
    }
    .users-table th, .users-table td {
      border: 1px solid #e0e7ef;
      padding: 10px 8px;
      font-size: 15px;
    }
    .users-table th {
      background: #f4f6fb;
      color: #1976d2;
    }
    .users-table tr:nth-child(even) {
      background: #f9f9f9;
    }
    .add-user-error { color: #d32f2f; margin-bottom: 12px; font-size: 15px; }
    .edit-btn, .delete-btn, .save-btn, .cancel-btn {
      background: #1976d2;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 6px 14px;
      font-size: 14px;
      cursor: pointer;
      margin-right: 6px;
      transition: background 0.2s;
    }
    .delete-btn { background: #d32f2f; }
    .delete-btn:hover { background: #b71c1c; }
    .edit-btn:hover, .save-btn:hover { background: #125ea2; }
    .cancel-btn { background: #888; }
    .cancel-btn:hover { background: #444; }
    input, select { min-width: 80px; }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  showAddUser = false;
  addError = '';
  newUser: any = { nom: '', prenom: '', email: '', motDePasse: '', role: 'user' };
  editingUser: User | null = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.userService.getAllUsers().subscribe(
      users => {
        this.users = users;
        console.log('Utilisateurs récupérés:', users);
      },
      error => {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        this.users = [];
      }
    );
  }

  addUser() {
    this.addError = '';
    this.userService.register(
      this.newUser.nom,
      this.newUser.prenom,
      this.newUser.email,
      this.newUser.motDePasse
    ).subscribe(err => {
      if (!err) {
        this.fetchUsers();
        this.showAddUser = false;
        this.newUser = { nom: '', prenom: '', email: '', motDePasse: '', role: 'user' };
      } else {
        this.addError = err;
      }
    });
  }

  deleteUser(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.fetchUsers();
      });
    }
  }

  editUser(user: User) {
    this.editingUser = { ...user };
  }

  saveEdit() {
    if (this.editingUser) {
      this.userService.updateUser(this.editingUser).subscribe(() => {
        this.editingUser = null;
        this.fetchUsers();
      });
    }
  }

  cancelEdit() {
    this.editingUser = null;
  }
} 