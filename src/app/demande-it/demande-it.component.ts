import { Component, OnInit } from '@angular/core';

interface SousType {
  nom: string;
  typeDemande: string;
  preautorise: boolean;
  responsableHierarchique: boolean;
}

interface Categorie {
  categorie: string;
  sousTypes: SousType[];
}

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
  selector: 'app-demande-it',
  templateUrl: './demande-it.component.html',
  styleUrls: ['./demande-it.component.css']
})
export class DemandeItComponent implements OnInit {
  data: Categorie[] = [
    {
      categorie: 'Applicatif / Outils',
      sousTypes: [
        { nom: 'Suite Microsoft Office', typeDemande: 'Accès à, installation et configuration de licences existantes', preautorise: true, responsableHierarchique: false },
        { nom: 'Symantec Manager', typeDemande: 'Accès à, installation et configuration de licences existantes', preautorise: true, responsableHierarchique: false },
        { nom: 'Microsoft Project', typeDemande: 'Accès à, installation et configuration de licences existantes', preautorise: false, responsableHierarchique: true },
        { nom: 'Visio', typeDemande: 'Accès à, installation et configuration de licences existantes', preautorise: false, responsableHierarchique: true },
        { nom: 'Visual Studio', typeDemande: 'Accès à, installation et configuration de licences existantes', preautorise: false, responsableHierarchique: true },
        { nom: 'Jira', typeDemande: 'Accès à, installation et configuration de licences existantes', preautorise: false, responsableHierarchique: true },
        { nom: 'Bugzilla', typeDemande: 'Accès à, installation et configuration de licences existantes', preautorise: false, responsableHierarchique: true },
        { nom: 'Redmine', typeDemande: 'Accès à, installation et configuration de licences existantes', preautorise: false, responsableHierarchique: true },
        { nom: 'TestLink', typeDemande: 'Accès à, installation et configuration de licences existantes', preautorise: false, responsableHierarchique: true },
        { nom: 'Tortoise SVN', typeDemande: 'Accès à, installation et configuration de licences existantes', preautorise: false, responsableHierarchique: true },
        { nom: 'FileZilla', typeDemande: 'Accès à, installation et configuration de licences existantes', preautorise: false, responsableHierarchique: true },
        { nom: 'Putty', typeDemande: 'Accès à, installation et configuration de licences existantes', preautorise: false, responsableHierarchique: true },
        { nom: 'Anydesk', typeDemande: 'Accès à, installation et configuration de licences existantes', preautorise: false, responsableHierarchique: true },
        { nom: 'Fortinet Client', typeDemande: 'Accès à, installation et configuration de licences existantes', preautorise: false, responsableHierarchique: true },
      ]
    },
    {
      categorie: 'Infrastructure IT',
      sousTypes: [
        { nom: 'Postes de travail', typeDemande: 'Fourniture et configuration d’un équipement standard (poste de travail)', preautorise: false, responsableHierarchique: true },
        { nom: 'Déplacement ou réaffectation interne', typeDemande: 'Déplacement ou réaffectation en interne d’équipement ou de matériel', preautorise: false, responsableHierarchique: true },
        { nom: 'Remplacement équipement', typeDemande: 'Remplacement d’un équipement standard', preautorise: false, responsableHierarchique: true },
        { nom: 'Ajout configuration', typeDemande: 'Ajout de configuration (session, email, dossier, utilisateur, etc.)', preautorise: false, responsableHierarchique: true },
      ]
    },
    {
      categorie: "Identités & Droits d'accès",
      sousTypes: [
        { nom: 'Connexion au réseau', typeDemande: 'Connexion au réseau (WiFi ou local)', preautorise: true, responsableHierarchique: false },
        { nom: 'Autorisation équipements extérieurs', typeDemande: 'Autorisation des équipements extérieurs', preautorise: false, responsableHierarchique: true },
        { nom: 'Réinitialisation mot de passe', typeDemande: 'Réinitialisation mot de passe', preautorise: true, responsableHierarchique: false },
        { nom: 'Gestion messagerie', typeDemande: 'Création, modification, suppression ou transfert de compte de messagerie', preautorise: false, responsableHierarchique: true },
        { nom: 'Accès serveurs', typeDemande: 'Accès aux serveurs de sauvegarde', preautorise: false, responsableHierarchique: true },
        { nom: 'Accès serveur de stockage', typeDemande: 'Accès au serveur de stockage', preautorise: false, responsableHierarchique: true },
      ]
    },
    {
      categorie: 'Information / Documentation',
      sousTypes: [
        { nom: 'Documentation publique', typeDemande: 'Accès à une documentation / information publique ou interne', preautorise: true, responsableHierarchique: false },
        { nom: 'Documentation confidentielle', typeDemande: 'Accès à une documentation confidentielle', preautorise: false, responsableHierarchique: true },
      ]
    },
    {
      categorie: "Demande d'achat",
      sousTypes: [
        { nom: 'Achat', typeDemande: 'Achat', preautorise: false, responsableHierarchique: true },
      ]
    }
  ];

  categorie: string = '';
  sousType: string = '';
  sousTypes: SousType[] = [];
  typeDemande: string = '';
  preautorise: boolean = false;
  responsableHierarchique: boolean = false;
  commentaire: string = '';

  demandes: DemandeIT[] = [];

  utilisateur: string = '';

  ngOnInit() {
    // Simuler l'utilisateur courant (à remplacer par l'utilisateur connecté)
    this.utilisateur = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).email : 'utilisateur.demo';
    this.loadDemandes();
  }

  onCategorieChange() {
    const cat = this.data.find(c => c.categorie === this.categorie);
    this.sousTypes = cat ? cat.sousTypes : [];
    this.sousType = '';
    this.typeDemande = '';
    this.preautorise = false;
    this.responsableHierarchique = false;
  }

  onSousTypeChange() {
    const st = this.sousTypes.find(s => s.nom === this.sousType);
    if (st) {
      this.typeDemande = st.typeDemande;
      this.preautorise = st.preautorise;
      this.responsableHierarchique = st.responsableHierarchique;
    } else {
      this.typeDemande = '';
      this.preautorise = false;
      this.responsableHierarchique = false;
    }
  }

  soumettre() {
    if (!this.categorie || !this.sousType) return;
    const demande: DemandeIT = {
      categorie: this.categorie,
      typeChangement: this.sousType,
      typeDemande: this.typeDemande,
      preautorise: this.preautorise,
      responsableHierarchique: this.responsableHierarchique,
      commentaire: this.commentaire,
      utilisateur: this.utilisateur,
      statut: 'En attente',
      dateSoumission: new Date().toISOString().split('T')[0]
    };
    this.demandes.unshift(demande);
    this.saveDemandes();
    this.commentaire = '';
    alert('Demande soumise !');
  }

  saveDemandes() {
    localStorage.setItem('demandesIT', JSON.stringify(this.demandes));
  }

  loadDemandes() {
    const d = localStorage.getItem('demandesIT');
    this.demandes = d ? JSON.parse(d) : [];
  }
}
