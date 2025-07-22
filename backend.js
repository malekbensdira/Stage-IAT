const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');

const app = express();
const JWT_SECRET = 'votre_secret';
const port = 3000;

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sitest'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connecté à MySQL');
});

// Middleware pour vérifier token et rôle admin
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token manquant' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token invalide' });
    req.user = decoded;
    next();
  });
}

function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
}

// Route inscription - rôle par défaut 'user'
app.post('/api/register', (req, res) => {
  const { Nom, Prenom, Email, MotDePasse } = req.body;
  if (!Nom || !Prenom || !Email || !MotDePasse) {
    return res.status(400).json({ error: 'Champs requis' });
  }

  db.query('SELECT * FROM user WHERE Email = ?', [Email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (results.length > 0) return res.status(400).json({ error: 'Utilisateur déjà existant' });

    const hash = bcrypt.hashSync(MotDePasse, 10);
    // Insérer avec rôle 'user' par défaut
    db.query(
      'INSERT INTO user (Nom, Prenom, Email, MotDePasse, ConfirmMotDePasse, IDfonction, Enabled, Interim, role) VALUES (?, ?, ?, ?, ?, 1, 1, 0, ?)',
      [Nom, Prenom, Email, hash, hash, 'user'],
      (err2) => {
        if (err2) return res.status(500).json({ error: 'Erreur serveur' });
        res.json({ success: true });
      }
    );
  });
});


// Route login - renvoie token avec rôle
app.post('/api/login', (req, res) => {
  const { Email, MotDePasse } = req.body;
  db.query('SELECT * FROM user WHERE Email = ?', [Email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (results.length === 0) return res.status(400).json({ error: 'Utilisateur non trouvé' });

    const user = results[0];
    if (!bcrypt.compareSync(MotDePasse, user.MotDePasse)) {
      return res.status(400).json({ error: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      {
        id: user.IDuser,
        email: user.Email,
        nom: user.Nom,
        prenom: user.Prenom,
        role: user.role || 'user' // role défini en base
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.IDuser,
        nom: user.Nom,
        prenom: user.Prenom,
        email: user.Email,
        role: user.role || 'user'
      }
    });
  });
});

// Route admin pour ajouter congés (protégée)
app.post('/api/admin/conges', verifyToken, isAdmin, (req, res) => {
  const { IDuser, TotalConges, JoursPris } = req.body;
  db.query(
    'INSERT INTO conges (IDuser, TotalConges, JoursPris) VALUES (?, ?, ?)',
    [IDuser, TotalConges, JoursPris],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      res.json({ success: true });
    }
  );
});

// Route admin pour ajouter primes (protégée)
app.post('/api/admin/primes', verifyToken, isAdmin, (req, res) => {
  const { IDuser, montant, description } = req.body;
  db.query(
    'INSERT INTO primes (IDuser, montant, description) VALUES (?, ?, ?)',
    [IDuser, montant, description],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      res.json({ success: true });
    }
  );
});

// Autres routes publiques ou avec auth simple (exemple congés utilisateur)
app.get('/api/conges/:id', verifyToken, (req, res) => {
  const userId = req.params.id;

  // Un utilisateur ne peut voir que ses congés sauf admin
  if (req.user.role !== 'admin' && req.user.id != userId) {
    return res.status(403).json({ error: "Accès interdit" });
  }

  db.query(
    'SELECT TotalConges - JoursPris AS JoursRestants FROM conges WHERE IDuser = ?',
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      if (results.length === 0) return res.status(404).json({ error: 'Aucun congé trouvé' });

      res.json({ joursRestants: results[0].JoursRestants });
    }
  );
});

// Nouvelle route publique pour la messagerie (liste des utilisateurs)
app.get('/api/userlist', verifyToken, (req, res) => {
  db.query('SELECT IDuser as id, Prenom as prenom, Nom as nom, Email as email, role FROM user', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(results);
  });
});

// Route pour envoyer un message privé
app.post('/api/messages', verifyToken, (req, res) => {
  console.log('POST /api/messages', req.body); // Ajout log debug
  const { from, to, text } = req.body;
  if (!from || !to || !text) {
    return res.status(400).json({ error: 'Champs manquants' });
  }
  db.query(
    'INSERT INTO messages (sender_id, receiver_id, content, timestamp) VALUES (?, ?, ?, NOW())',
    [from, to, text],
    (err) => {
      if (err) {
        console.error('Erreur SQL:', err); // Ajout log erreur SQL
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json({ success: true });
    }
  );
});

// Route pour récupérer la conversation privée entre deux utilisateurs
app.get('/api/messages', verifyToken, (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }
  db.query(
    'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp ASC',
    [from, to, to, from],
    (err, results) => {
      if (err) {
        console.error('Erreur SQL:', err); // Ajout log erreur SQL
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json(results);
    }
  );
});

// Marquer tous les messages d'un expéditeur comme lus pour le destinataire courant
app.post('/api/messages/markAsRead', verifyToken, (req, res) => {
  const { from, to } = req.body; // from = expéditeur, to = destinataire (utilisateur courant)
  db.query(
    'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
    [from, to],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      res.json({ success: true, affectedRows: result.affectedRows });
    }
  );
});

// Supprimer un utilisateur (admin uniquement) - doit être AVANT le GET !
app.delete('/api/users/:id', verifyToken, isAdmin, (req, res) => {
  db.query('DELETE FROM user WHERE IDuser = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ success: true });
  });
});

// Modifier un utilisateur (admin uniquement)
app.put('/api/users/:id', verifyToken, isAdmin, (req, res) => {
  const { nom, prenom, email, role } = req.body;
  db.query(
    'UPDATE user SET Nom = ?, Prenom = ?, Email = ?, role = ? WHERE IDuser = ?',
    [nom, prenom, email, role, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      res.json({ success: true });
    }
  );
});

// Liste tous les utilisateurs (admin uniquement)
app.get('/api/users', verifyToken, isAdmin, (req, res) => {
  db.query('SELECT IDuser as id, Nom as nom, Prenom as prenom, Email as email, role FROM user', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(results);
  });
});

// Nombre total d'utilisateurs
app.get('/api/stats/users', verifyToken, isAdmin, (req, res) => {
  db.query('SELECT COUNT(*) as count FROM user', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json({ count: results[0].count });
  });
});

// Nombre d'admins
app.get('/api/stats/admins', verifyToken, isAdmin, (req, res) => {
  db.query('SELECT COUNT(*) as count FROM user WHERE role = \"admin\"', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json({ count: results[0].count });
  });
});

// Nombre de messages
app.get('/api/stats/messages', verifyToken, isAdmin, (req, res) => {
  db.query('SELECT COUNT(*) as count FROM messages', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json({ count: results[0].count });
  });
});
app.get('/api/messages/unread/:userId', verifyToken, (req, res) => {
  const userId = req.params.userId;
  db.query(
    'SELECT sender_id, COUNT(*) as unread FROM messages WHERE receiver_id = ? AND is_read = 0 GROUP BY sender_id',
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      res.json(results); // [{sender_id: 12, unread: 3}, ...]
    }
  );
});

// Route de test pour vérifier que le serveur fonctionne
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend fonctionne correctement' });
});

// Route de debug pour vérifier les utilisateurs admin
app.get('/api/debug/admins', (req, res) => {
  db.query('SELECT IDuser, Nom, Prenom, Email, role FROM user WHERE role = "admin"', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json({ admins: results, count: results.length });
  });
});

// Route de debug pour vérifier la structure de la table demandes
app.get('/api/debug/demandes', (req, res) => {
  db.query('DESCRIBE demandes', (err, results) => {
    if (err) {
      console.error('Erreur structure demandes:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ structure: results });
  });
});

// Route de debug pour voir toutes les demandes sans jointure
app.get('/api/debug/demandes-all', (req, res) => {
  db.query('SELECT * FROM demandes', (err, results) => {
    if (err) {
      console.error('Erreur demandes all:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ demandes: results, count: results.length });
  });
});

// Route pour récupérer toutes les demandes de congé (admin uniquement)
app.get('/api/demandes', verifyToken, isAdmin, (req, res) => {
  db.query(`
    SELECT 
      d.id,
      d.id_user,
      d.cause,
      d.jours,
      d.date_debut,
      d.date_fin,
      d.statut,
      d.date_demande,
      u.Nom,
      u.Prenom,
      u.Email
    FROM demandes d
    JOIN user u ON d.id_user = u.IDuser
    ORDER BY d.date_demande DESC
  `, (err, results) => {
    if (err) {
      console.error('Erreur SQL demandes:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(results);
  });
});

// Route pour mettre à jour le statut d'une demande de congé (admin uniquement)
app.put('/api/demandes/:id', verifyToken, isAdmin, (req, res) => {
  const { statut } = req.body;
  const demandeId = req.params.id;
  
  db.query(
    'UPDATE demandes SET statut = ? WHERE id = ?',
    [statut, demandeId],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Demande non trouvée' });
      res.json({ success: true });
    }
  );
});

// Route pour qu'un utilisateur soumette une demande de congé
app.post('/api/demandes', verifyToken, (req, res) => {
  const { jours, cause, dateDebut, dateFin } = req.body;
  const id_user = req.user.id;
  if (!jours || !cause || !dateDebut || !dateFin) {
    return res.status(400).json({ error: 'Champs manquants' });
  }
  db.query(
    'INSERT INTO demandes (id_user, cause, jours, date_debut, date_fin, statut, date_demande) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [id_user, cause, jours, dateDebut, dateFin, 'en_attente'],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      res.json({ success: true });
    }
  );
});

// Lancement serveur
app.listen(port, () => console.log(`API backend démarrée sur http://localhost:${port}`));
