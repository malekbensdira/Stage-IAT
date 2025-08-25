import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private horaires = "Nous travaillons de 9h à 17h du lundi au vendredi.";

  constructor(private http: HttpClient, private userService: UserService) {}

  getResponse(question: string): Promise<string> {
    const q = question.toLowerCase();

    if (q.includes('horaire') && q.includes('travail')) {
      return Promise.resolve(this.horaires);
    }

    if (q.includes('congé') || q.includes('jours restants')) {
      const user = this.userService.getCurrentUser();
      if (!user || !user.id) {
        return Promise.resolve("Je n'arrive pas à récupérer votre compte utilisateur.");
      }
      return this.http.get<{ joursRestants: number }>(`/api/conges/${user.id}`)
        .toPromise()
        .then(data => `Il vous reste ${data.joursRestants} jours de congé.`)
        .catch(() => "Impossible de récupérer vos jours de congé pour le moment.");
    }

    if (q.includes('augmentation')) {
      return Promise.resolve("Pour demander une augmentation, veuillez contacter le service RH ou votre manager.");
    }

    // Nouvelles questions/réponses types d'entreprise
    if (q.includes('prime')) {
      return Promise.resolve("Les primes sont attribuées en fonction des performances et validées par le service RH. Pour plus d'informations, contactez le service RH.");
    }
    if (q.includes('manager')) {
      return Promise.resolve("Votre manager direct est indiqué dans votre fiche utilisateur. Pour plus d'informations, contactez le service RH.");
    }
    if (q.includes('avantage') || q.includes('mutuelle')) {
      return Promise.resolve("L'entreprise propose une mutuelle santé, des tickets restaurant, des primes de fin d'année et un plan d'épargne entreprise.");
    }
    if (q.includes('congé') || (q.includes('demander') && q.includes('congé'))) {
      return Promise.resolve("Pour poser un congé, rendez-vous dans la section 'Congés' de votre espace personnel ou contactez votre manager.");
    }
    if (q.includes('bulletin de paie') || q.includes('fiche de paie')) {
      return Promise.resolve("Votre bulletin de paie est disponible dans votre espace personnel, rubrique 'Documents'.");
    }
    if (q.includes('remboursement') && q.includes('frais')) {
      return Promise.resolve("Pour demander un remboursement de frais, remplissez le formulaire dédié dans l'intranet et joignez les justificatifs.");
    }
    if (q.includes('formation')) {
      return Promise.resolve("Pour connaître les formations disponibles, consultez le catalogue sur l'intranet ou contactez le service formation.");
    }
    if (q.includes('contact rh') || (q.includes('contacter') && q.includes('rh'))) {
      return Promise.resolve("Vous pouvez contacter le service RH à l'adresse rh@entreprise.com ou via le formulaire de contact sur l'intranet.");
    }
    if (q.includes('mot de passe') && (q.includes('oublie') || q.includes('réinitialiser'))) {
      return Promise.resolve("Pour réinitialiser votre mot de passe, cliquez sur 'Mot de passe oublié' à la connexion ou contactez le support informatique.");
    }
    if (q.includes('télétravail')) {
      return Promise.resolve("Le télétravail est possible selon votre poste et l'accord de votre manager. Renseignez-vous auprès de votre responsable.");
    }
    if (q.includes('adresse entreprise') || q.includes('où se trouve l\'entreprise')) {
      return Promise.resolve("L'entreprise est située au 123 rue de l'Innovation, 75000 Paris.");
    }
    if (q.includes('parking')) {
      return Promise.resolve("Un parking est disponible pour les employés. Demandez un badge d'accès au service accueil.");
    }
    if (q.includes('cantine') || q.includes('restauration')) {
      return Promise.resolve("Une cantine d'entreprise est ouverte de 11h30 à 14h30 du lundi au vendredi.");
    }
    if (q.includes('arrêt maladie')) {
      return Promise.resolve("En cas d'arrêt maladie, informez votre manager et envoyez votre justificatif au service RH dans les 48h.");
    }
    if (q.includes('procédure') && q.includes('sécurité')) {
      return Promise.resolve("Les procédures de sécurité sont disponibles sur l'intranet, rubrique 'Sécurité'.");
    }

    return Promise.resolve("Désolé, je n'ai pas compris votre question. Essayez de demander les horaires de travail, vos congés restants, ou des informations RH.");
  }

  envoyerDemandeCredit(demande: { jours: number, cause: string, dateDebut: string, dateFin: string }) {
    return this.http.post<any>('/api/demandes', demande);
  }
}
