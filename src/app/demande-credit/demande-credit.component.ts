import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChatbotService } from '../chatbot.service';

@Component({
  selector: 'app-demande-credit',
  templateUrl: './demande-credit.component.html',
  styleUrls: ['./demande-credit.component.css']
})
export class DemandeCreditComponent {
  jours: number|null = null;
  cause: string = '';
  dateDebut: string = '';
  dateFin: string = '';
  message: string = '';
  loading = false;

  constructor(private router: Router, private chatbotService: ChatbotService) {}

  today(): string {
    return new Date().toISOString().split('T')[0];
  }

  envoyerDemande() {
    if (!this.jours || !this.cause.trim() || !this.dateDebut || !this.dateFin) {
      this.message = 'Veuillez remplir tous les champs.';
      return;
    }
    if (this.dateDebut < this.today()) {
      this.message = 'La date de début ne peut pas être antérieure à aujourd\'hui.';
      return;
    }
    if (this.dateFin < this.dateDebut) {
      this.message = 'La date de fin doit être après la date de début.';
      return;
    }
    this.loading = true;
    this.chatbotService.envoyerDemandeCredit({
      jours: this.jours,
      cause: this.cause,
      dateDebut: this.dateDebut,
      dateFin: this.dateFin
    }).subscribe({
      next: () => {
        this.message = 'Votre demande a été envoyée à l\'administrateur.';
        this.jours = null;
        this.cause = '';
        this.dateDebut = '';
        this.dateFin = '';
        this.loading = false;
      },
      error: (err) => {
        this.message = err?.error?.error || 'Erreur lors de l\'envoi de la demande.';
        this.loading = false;
      }
    });
  }
} 