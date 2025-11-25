const STORAGE_KEY = 'vocabulaireFlashcards';
let currentWord = null;

// Charge tous les mots depuis le localStorage
function chargerMots() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Sauvegarde le tableau de mots dans le localStorage
function sauvegarderMots(mots) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mots));
}

// Fonction CLÉ : Affiche la liste des mots et crée les boutons de suppression
function afficherListeMots() {
    const mots = chargerMots();
    const listeVocabulaire = document.getElementById('liste-vocabulaire');
    const compteur = document.getElementById('compteur-mots');
    
    // 1. Mettre à jour le compteur
    compteur.textContent = mots.length;

    // 2. Vider la liste actuelle
    listeVocabulaire.innerHTML = ''; 

    // 3. Générer le nouvel HTML pour chaque mot
    mots.forEach((paire, index) => {
        const li = document.createElement('li');
        // Utilisation de l'index dans la liste pour cibler le mot à supprimer
        li.dataset.index = index; 
        
        li.innerHTML = `
            Anglais: <strong>${paire.anglais}</strong> 
            – Français: <strong>${paire.francais}</strong>
            <button class="bouton-supprimer" onclick="supprimerMot(${index})">Supprimer</button>
        `;
        listeVocabulaire.appendChild(li);
    });

    if (mots.length === 0) {
        listeVocabulaire.innerHTML = '<p>Votre liste de vocabulaire est vide. Ajoutez des mots !</p>';
    }
}

const formulaireAjout = document.getElementById('formulaire-ajout');

formulaireAjout.addEventListener('submit', function(event) {
    // Empêche le rechargement de la page par défaut
    event.preventDefault(); 
});


const formulaireEntrainement = document.getElementById('formulaire-entrainement');

formulaireEntrainement.addEventListener('submit', function(event) {
    // Empêche le rechargement de la page par défaut
    event.preventDefault(); 
});













// Modification : Appeler l'affichage après l'ajout
function ajouterMot() {
    const conteneurAnglais = document.getElementById('input-anglais')
    const conteneurFrancais = document.getElementById('input-francais')
    
    const anglais = conteneurAnglais.value.trim();
    const francais = conteneurFrancais.value.trim();

    if (anglais) {
        conteneurAnglais.classList.remove('missing');
    }
    else {
        conteneurAnglais.classList.add('missing');
    }

    if (francais) {
        conteneurFrancais.classList.remove('missing');
    }
    else {
        conteneurFrancais.classList.add('missing');
    }

    if (anglais && francais) {
        const mots = chargerMots();
        mots.push({ anglais: anglais, francais: francais });
        sauvegarderMots(mots);
        
        document.getElementById('input-anglais').value = '';
        document.getElementById('input-francais').value = '';
        // IMPORTANT: Mettre à jour la liste affichée
        afficherListeMots();

        inputAnglais.focus();
    }
}

// Nouvelle Fonction : Supprimer un mot
function supprimerMot(indexASupprimer) {
    
    let mots = chargerMots();
    
    // Utiliser la méthode splice pour retirer l'élément à l'index spécifié
    mots.splice(indexASupprimer, 1);
    
    sauvegarderMots(mots);
    
    // IMPORTANT: Mettre à jour la liste affichée
    afficherListeMots(); 
}

// ... Les fonctions commencerTest(), verifierReponse(), exporterMots(), et importerMots() restent les mêmes ...


// ... fonctions précédentes (chargerMots, sauvegarderMots, ajouterMot) ...

/**
 * Exporte toutes les paires de mots dans un fichier JSON téléchargeable.
 */
function exporterMots() {
    const mots = chargerMots();
    if (mots.length === 0) {
        alert("Rien à exporter. La liste est vide !");
        return;
    }
    
    // 1. Convertir les données en chaîne JSON (lisible par l'humain)
    const dataStr = JSON.stringify(mots, null, 2); 
    
    // 2. Créer un objet Blob (pour le téléchargement)
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    // 3. Créer un lien temporaire pour déclencher le téléchargement
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards_vocabulaire.json'; // Nom du fichier
    
    // 4. Déclencher le clic et nettoyer
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Libérer l'objet URL
}


// ... fonctions précédentes (exporterMots, commencerTest, verifierReponse) ...

/**
 * Importe des paires de mots depuis un fichier JSON sélectionné par l'utilisateur.
 * @param {Event} event - L'événement de changement de fichier (onchange).
 */
function importerMots(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const contenu = e.target.result;
            const motsImportes = JSON.parse(contenu);
            
            if (Array.isArray(motsImportes)) {
                // Option 1: Écraser l'ancienne liste (la plus simple)
                sauvegarderMots(motsImportes);
                alert(`✅ ${motsImportes.length} paires de mots importées avec succès !`);
                window.location.reload(); // Recharger la page pour mettre à jour
                
                /* // Option 2: Fusionner avec la liste existante
                const motsActuels = chargerMots();
                const motsFusionnes = [...motsActuels, ...motsImportes];
                sauvegarderMots(motsFusionnes);
                alert(`✅ ${motsImportes.length} paires ajoutées à la liste existante !`);
                window.location.reload();
                */
            } else {
                throw new Error("Le format du fichier JSON n'est pas un tableau.");
            }
        } catch (error) {
            alert("❌ Erreur lors de l'importation. Assurez-vous que le fichier est un JSON valide contenant un tableau de mots.");
            console.error(error);
        }
    };

    reader.readAsText(file); // Lire le contenu du fichier comme texte
}

// Fonction pour démarrer le test
function commencerTest() {
    const mots = chargerMots();
    if (mots.length === 0) {
        return;
    }
    
    // Afficher la zone de test
    document.getElementById('zone-test').style.display = 'block';

    // Choisir un mot aléatoirement
    const randomIndex = Math.floor(Math.random() * mots.length);
    currentWord = mots[randomIndex];

    // On tire aléatoirement si on demande la traduction Anglais -> Français ou l'inverse
    const sens = Math.random() < 0.5 ? 'anglais' : 'francais';

    if (sens === 'anglais') {
        document.getElementById('mot-a-traduire').textContent = currentWord.anglais;
        currentWord.expected = currentWord.francais;
    } else {
        document.getElementById('mot-a-traduire').textContent = currentWord.francais;
        currentWord.expected = currentWord.anglais;
    }
    
    document.getElementById('input-guess').value = '';
    document.getElementById('input-guess').classList = '';
    document.getElementById('resultat').textContent = '';
}

// Fonction pour vérifier la réponse
function verifierReponse() {
    if (!currentWord) {
        alert("Cliquez sur 'Commencer le test' d'abord.");
        return;
    }
    
    const guess = document.getElementById('input-guess').value.trim().toLowerCase();
    const expected = currentWord.expected.toLowerCase();
    
    if (guess === expected) {
        document.getElementById('resultat').textContent = "✅ Correct !";
        document.getElementById('input-guess').classList.add('rp_correct');
    } else {
        document.getElementById('resultat').textContent = `❌ Faux. La réponse était : ${currentWord.expected}`;
        document.getElementById('input-guess').classList.add('rp_fausse');
    }
    
    // Après vérification, préparer le prochain mot
    setTimeout(commencerTest, 1000); // 2 secondes de pause avant le prochain mot
}

// Au chargement, vérifier si des mots existent et afficher un message
window.onload = () => {
    afficherListeMots();
};
