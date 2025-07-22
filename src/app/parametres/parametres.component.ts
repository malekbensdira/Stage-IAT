import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-parametres',
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.css']
})
export class ParametresComponent implements OnInit {
  user: any = {};
  nom: string = '';
  prenom: string = '';
  email: string = '';
  motDePasse: string = '';
  nouveauMotDePasse: string = '';
  message: string = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.user = this.userService.getCurrentUser();
    if (this.user) {
      this.nom = this.user.nom;
      this.prenom = this.user.prenom;
      this.email = this.user.email;
    }
  }

  enregistrer() {
    if (!this.nom.trim() || !this.prenom.trim()) {
      this.message = 'Nom et prénom obligatoires.';
      return;
    }
    // Simuler la mise à jour dans localStorage
    const user = { ...this.user, nom: this.nom, prenom: this.prenom };
    localStorage.setItem('user', JSON.stringify(user));
    this.userService['currentUser'] = user;
    this.message = 'Profil mis à jour !';
  }

  changerMotDePasse() {
    if (!this.motDePasse || !this.nouveauMotDePasse) {
      this.message = 'Veuillez remplir les deux champs de mot de passe.';
      return;
    }
    // Simuler la vérification et la mise à jour du mot de passe
    // (En vrai, il faudrait appeler une API)
    this.message = 'Mot de passe modifié (simulation).';
    this.motDePasse = '';
    this.nouveauMotDePasse = '';
  }
}
