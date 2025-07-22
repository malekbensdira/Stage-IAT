import { Component, OnInit } from '@angular/core';

interface DemandeIT {
  categorie: string;
  typeChangement: string;
  typeDemande: string;
  preautorise: boolean;
  responsableHierarchique: boolean;
  commentaire: string;
  utilisateur: string;
  statut: string;
  dateSoumission: string;
}

@Component({
  selector: 'app-admin-it-demandes',
  templateUrl: './admin-it-demandes.component.html',
  styleUrls: ['./admin-it-demandes.component.css']
})
export class AdminItDemandesComponent implements OnInit {
  demandes: DemandeIT[] = [];

  ngOnInit() {
    this.loadDemandes();
  }

  loadDemandes() {
    const d = localStorage.getItem('demandesIT');
    this.demandes = d ? JSON.parse(d) : [];
  }

  majStatut(demande: DemandeIT, statut: 'Approuvée' | 'Refusée') {
    demande.statut = statut;
    this.saveDemandes();
  }

  saveDemandes() {
    localStorage.setItem('demandesIT', JSON.stringify(this.demandes));
    this.loadDemandes();
  }
}
