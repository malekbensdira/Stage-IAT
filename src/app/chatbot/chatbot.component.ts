import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { ChatbotService } from '../chatbot.service';
import { HttpClient } from '@angular/common/http';

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  const matrix = [];
  let i;
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  let j;
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

@Component({
  selector: 'app-chatbot',
  template: `
    <div class="chatbot-page-container">
      <div class="chatbot-container">
        <div class="chatbot-header">
        <strong>Chatbot RH</strong>
      </div>
        <div class="chatbot-messages">
        <div *ngFor="let msg of messages">
          <div [ngStyle]="{ 'text-align': msg.from === 'user' ? 'right' : 'left', 'margin': '8px 0' }">
            <span [ngStyle]="{ 'background': msg.from === 'user' ? '#1976d2' : '#eee', 'color': msg.from === 'user' ? '#fff' : '#333', 'padding': '8px 12px', 'border-radius': '16px', 'display': 'inline-block' }">
              <span [innerHTML]="msg.text"></span>
            </span>
          </div>
        </div>
      </div>
        <form (ngSubmit)="send()" class="chatbot-form">
          <input [(ngModel)]="input" name="input" required placeholder="Posez votre question..." />
          <button type="submit">Envoyer</button>
      </form>
      </div>
    </div>
  `,
  styles: [`
    .chatbot-page-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding-top: 40px;
      background: transparent;
    }
    .chatbot-container {
      width: 100%;
      max-width: 370px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px #bbb;
      padding: 0;
      display: flex;
      flex-direction: column;
    }
    .chatbot-header {
      padding: 16px 16px 0 16px;
      border-bottom: 1px solid #eee;
      background: #1976d2;
      color: #fff;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .chatbot-messages {
      height: 260px;
      overflow-y: auto;
      background: #f9f9f9;
      padding: 12px;
      border-radius: 0 0 0 0;
      margin-bottom: 8px;
    }
    .chatbot-form {
      display: flex;
      gap: 8px;
      padding: 0 12px 12px 12px;
    }
    .chatbot-form input {
      flex: 1;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }
    .chatbot-form button {
      padding: 8px 16px;
      background: #1976d2;
      color: #fff;
      border: none;
      border-radius: 4px;
    }
    @media (max-width: 600px) {
      .chatbot-container {
        max-width: 98vw;
      }
    }
  `]
})
export class ChatbotComponent {
  messages = [
    { from: 'bot', text: 'Bonjour ! Je suis le chatbot RH. Posez-moi une question.' }
  ];
  input = '';
  keywordsTable: any = null;
  awaitingClarification: any = null;
  awaitingCorrection = false;
  lastCorrected = '';

  constructor(private chatbotService: ChatbotService, private userService: UserService, private router: Router, private http: HttpClient) {
    this.http.get('assets/keywords.json').subscribe(data => {
      this.keywordsTable = data;
    });
  }
  

  async send() {
    if (!this.input.trim()) return;
    // Si une correction a déjà été proposée, envoyer le message
    if (this.awaitingCorrection) {
      this.messages.push({ from: 'user', text: this.input });
      this.awaitingCorrection = false;
      this.lastCorrected = '';
      await this.processInput(this.input);
      this.input = '';
      return;
    }
    // Correction orthographique basée sur la liste de référence
    const correctedInput = await this.correctSpellingWithReference(this.input);
    if (correctedInput !== this.input) {
      this.input = correctedInput;
      this.awaitingCorrection = true;
      this.lastCorrected = correctedInput;
      return; // Attendre la validation de l'utilisateur
    }
    // Pas de correction, envoyer directement
    this.messages.push({ from: 'user', text: this.input });
    await this.processInput(this.input);
    this.input = '';
  }

  async processInput(userInput: string) {
    if (this.keywordsTable) {
      const userMsg = normalize(userInput);
      let serviceDirectTrouve = null;
      let lienDirect = null;
      for (const motCle in this.keywordsTable) {
        const entry = this.keywordsTable[motCle];
        const motCleNorm = normalize(motCle);
        const regexMotCle = new RegExp(`\\b${motCleNorm}\\b`, 'i');
        if (regexMotCle.test(userMsg)) {
          if (entry.redirection) {
            serviceDirectTrouve = motCle;
            lienDirect = entry.redirection;
            break;
          }
        }
        if (entry.synonymes) {
          for (const syn of entry.synonymes) {
            const synNorm = normalize(syn);
            const regexSyn = new RegExp(`\\b${synNorm}\\b`, 'i');
            if (regexSyn.test(userMsg)) {
              if (entry.redirection) {
                serviceDirectTrouve = motCle;
                lienDirect = entry.redirection;
                break;
              }
            }
          }
        }
        if (serviceDirectTrouve) break;
      }
      const champDeclarationBesoin = [
        'suite microsoft office', 'symantec manager',
        'microsoft project', 'visio', 'visual studio',
        'jira', 'bugzilla', 'redmine', 'testlink', 'tortoise svn', 'filezilla',
        'putty', 'anydesk', 'fortinet client',
        'ordinateurs', 'clavier', 'souris', 'onduleurs',
        'déplacement', 'réaffectation', 'équipement', 'matériel', 'remplacement',
        'serveurs', 'stockage', 'sauvegarde', 'routeur', 'modem', 'switch', 'câblage',
        'session', 'email', 'dossier', 'utilisateur',
        'accès réseau', 'connexion au réseau', 'wifi', 'local',
        'autorisation des équipements extérieurs',
        'réinitialisation de mot de passe',
        'création', 'modification', 'suppression', 'transfert de compte de messagerie',
        'accès serveurs', 'accès aux serveurs de sauvegarde', 'accès au serveur de stockage',
        'documentation', 'information publique', 'information limitée',
        'accès à une documentation', 'information publique ou interne',
        'documentation confidentielle', 'accès à une documentation confidentielle',
        'application', 'outils', 'poste de travail', 'matériel','configuration','installation'
      ];
      let countBesoin = 0;
      for (const mot of champDeclarationBesoin) {
        const motNorm = normalize(mot);
        const regexBesoin = new RegExp(`\\b${motNorm}\\b`, 'i');
        if (regexBesoin.test(userMsg)) {
          countBesoin++;
        }
      }
      if (countBesoin >= 1) {
        this.awaitingClarification = null;
        this.messages.push({ from: 'bot', text: `<b>Déclaration de besoin</b> : <a href='http://10.68.5.204/iat/' target='_blank'>Lien vers Déclaration de besoin</a>` });
        return;
      }
      if (serviceDirectTrouve && lienDirect) {
        const nomService = serviceDirectTrouve.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        this.awaitingClarification = null;
        this.messages.push({ from: 'bot', text: `<b>${nomService}</b> : <a href='${lienDirect}' target='_blank'>Lien vers le service</a>` });
        return;
      }
    }
    this.chatbotService.getResponse(userInput).then(response => {
      this.messages.push({ from: 'bot', text: response });
    });
  }

  getReferenceWords(): string[] {
    const refWords = new Set<string>();
    // Champ lexical (déclaration de besoin)
    const champDeclarationBesoin = [
      'suite microsoft office', 'symantec manager',
      'microsoft project', 'visio', 'visual studio',
      'jira', 'bugzilla', 'redmine', 'testlink', 'tortoise svn', 'filezilla',
      'putty', 'anydesk', 'fortinet client',
      'ordinateurs', 'clavier', 'souris', 'onduleurs',
      'déplacement', 'réaffectation', 'équipement', 'matériel', 'remplacement',
      'serveurs', 'stockage', 'sauvegarde', 'routeur', 'modem', 'switch', 'câblage',
      'session', 'email', 'dossier', 'utilisateur',
      'accès réseau', 'connexion au réseau', 'wifi', 'local',
      'autorisation des équipements extérieurs',
      'réinitialisation de mot de passe',
      'création', 'modification', 'suppression', 'transfert de compte de messagerie',
      'accès serveurs', 'accès aux serveurs de sauvegarde', 'accès au serveur de stockage',
      'documentation', 'information publique', 'information limitée',
      'accès à une documentation', 'information publique ou interne',
      'documentation confidentielle', 'accès à une documentation confidentielle',
      'application', 'outils', 'poste de travail', 'matériel','configuration','installation'
    ];
    for (const expr of champDeclarationBesoin) {
      for (const w of expr.split(' ')) {
        refWords.add(normalize(w));
      }
    }
    // Keywords et synonymes de keywords.json
    if (this.keywordsTable) {
      for (const motCle in this.keywordsTable) {
        refWords.add(normalize(motCle));
        const entry = this.keywordsTable[motCle];
        if (entry.synonymes) {
          for (const syn of entry.synonymes) {
            for (const w of syn.split(' ')) {
              refWords.add(normalize(w));
            }
          }
        }
      }
    }
    return Array.from(refWords);
  }

  async correctSpellingWithReference(text: string): Promise<string> {
    const refWords = this.getReferenceWords();
    const words = text.split(/\s+/);
    let correctedWords = words.map(word => {
      const normWord = normalize(word);
      let bestMatch = normWord;
      let minDist = 3;
      for (const ref of refWords) {
        const dist = levenshtein(normWord, ref);
        if (dist < minDist) {
          minDist = dist;
          bestMatch = ref;
        }
      }
      // Si on a trouvé un mot de référence proche (distance <=2), on corrige
      if (minDist <= 2 && bestMatch !== normWord) {
        return bestMatch;
      }
      return word;
    });
    return correctedWords.join(' ');
  }

  async correctSpelling(text: string): Promise<string> {
    const url = 'https://api.languagetool.org/v2/check';
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('language', 'fr');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await response.json();
    let corrected = text;
    if (data.matches && data.matches.length > 0) {
      // Appliquer les corrections de droite à gauche pour ne pas décaler les indices
      const corrections = data.matches
        .filter((m: any) => m.replacements && m.replacements.length > 0)
        .map((m: any) => ({
          offset: m.offset,
          length: m.length,
          replacement: m.replacements[0].value
        }))
        .sort((a: any, b: any) => b.offset - a.offset);
      for (const c of corrections) {
        corrected = corrected.slice(0, c.offset) + c.replacement + corrected.slice(c.offset + c.length);
      }
    }
    return corrected;
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }
}
