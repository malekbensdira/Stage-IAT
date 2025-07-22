import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from '../user.service';

interface Demande {
  id: number;
  id_user: number;
  cause: string;
  jours: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  date_demande: string;
  Nom: string;
  Prenom: string;
  Email: string;
}

@Component({
  selector: 'app-admin-demandes',
  templateUrl: './admin-demandes.component.html',
  styleUrls: ['./admin-demandes.component.css']
})
export class AdminDemandesComponent implements OnInit {
  demandes: Demande[] = [];
  loading = false;
  error = '';

  constructor(private http: HttpClient, private userService: UserService) {}

  ngOnInit() {
    this.fetchDemandes();
  }

  fetchDemandes() {
    this.loading = true;
    this.error = '';
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<Demande[]>('http://localhost:3000/api/demandes', { headers }).subscribe({
      next: (data) => {
        this.demandes = data;
        this.loading = false;
        console.log('Demandes récupérées:', data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des demandes:', err);
        this.error = err?.error?.error || 'Erreur lors du chargement des demandes.';
        this.loading = false;
      }
    });
  }

  majStatut(demande: Demande, statut: 'accepte' | 'refuse') {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.put('http://localhost:3000/api/demandes/' + demande.id, { statut }, { headers }).subscribe({
      next: () => {
        demande.statut = statut;
        console.log(`Statut de la demande ${demande.id} mis à jour vers: ${statut}`);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du statut:', err);
        alert(err?.error?.error || 'Erreur lors de la mise à jour du statut.');
      }
    });
  }
}
