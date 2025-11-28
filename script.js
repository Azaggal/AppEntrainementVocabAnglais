const STORAGE_KEY = 'vocabulaireFlashcards';
let currentWord = null;

// ====================================================================
// GESTION DU STOCKAGE ET DE L'INITIALISATION
// ====================================================================

// Charge la liste par défaut de manière asynchrone (depuis data.json)
async function chargerListeParDefaut() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        const motsDefaut = await response.json();
        return motsDefaut;
    } catch (error) {
        console.error("Erreur lors du chargement de la liste par défaut:", error);
        // Utiliser une alerte uniquement si l'application est vide
        if (chargerMots().length === 0) {
             alert("Impossible de charger le fichier data.json. La liste sera vide.");
        }
        return []; 
    }
}  

// Charge tous les mots depuis le localStorage
function chargerMots() {
    const data = localStorage.getItem(STORAGE_KEY);
    // Assurez-vous toujours que le format retourné est un tableau, même s'il est vide.
    return data ? JSON.parse(data) : [];
}

// Sauvegarde le tableau de mots dans le localStorage
function sauvegarderMots(mots) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mots));
}

// ====================================================================
// GESTION DE L'AFFICHAGE ET DE LA SUPPRESSION
// ====================================================================

// Affiche la liste des mots dans un tableau HTML
function afficherListeMots() {
    const mots = chargerMots();
    const tbody = document.querySelector('#tableau-vocabulaire tbody');
    const compteur = document.getElementById('compteur-mots');
    
    compteur.textContent = mots.length;
    tbody.innerHTML = ''; 

    mots.forEach((paire, index) => {
        const tr = document.createElement('tr');
        
        // Affichage des tableaux de traductions (jointes par une virgule pour la lisibilité)
        const anglaisStr = Array.isArray(paire.anglais) ? paire.anglais.join(', ') : paire.anglais;
        const francaisStr = Array.isArray(paire.francais) ? paire.francais.join(', ') : paire.francais;
        
        // Ajout de l'action de suppression lors du clic sur la ligne
        tr.setAttribute('onclick', `supprimerMot(${index})`);
        
        const tdAnglais = document.createElement('td');
        tdAnglais.textContent = anglaisStr;
        
        const tdFrancais = document.createElement('td');
        tdFrancais.textContent = francaisStr;
        
        tr.appendChild(tdAnglais);
        tr.appendChild(tdFrancais);
        tbody.appendChild(tr);
    });

    if (mots.length === 0) {
        const trVide = document.createElement('tr');
        trVide.innerHTML = '<td colspan="2" style="text-align: center; font-style: italic;">Votre liste est vide.</td>';
        tbody.appendChild(trVide);
    }
}

// Supprimer un mot
function supprimerMot(indexASupprimer) {
    let mots = chargerMots();
    mots.splice(indexASupprimer, 1);
    sauvegarderMots(mots);
    afficherListeMots(); 
}



function attacherEcouteurEntree(inputElement) {
    inputElement.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault(); // Empêche tout comportement par défaut du navigateur
            ajouterMot();
        }
    });
}

const formulaireEntrainement = document.getElementById('formulaire-entrainement');

formulaireEntrainement.addEventListener('submit', function(event) {
    // Empêche le rechargement de la page par défaut
    event.preventDefault(); 
});

// ====================================================================
// GESTION DE L'AJOUT DYNAMIQUE ET VALIDATION
// ====================================================================

// Génère dynamiquement les champs de saisie, conservant les valeurs
function genererChamps() {
    const countAnglais = parseInt(document.getElementById('count-anglais').value) || 1;
    const countFrancais = parseInt(document.getElementById('count-francais').value) || 1;
    const container = document.getElementById('champs-dynamiques');
    
    // 1. SAUVEGARDE DES VALEURS ACTUELLES
    const valeursAnglaisSauvees = Array.from(document.querySelectorAll('.input-anglais')).map(input => input.value);
    const valeursFrancaisSauvees = Array.from(document.querySelectorAll('.input-francais')).map(input => input.value);
    
    container.innerHTML = ''; // Vider le conteneur

    // --- Génération des champs Anglais ---
    // 💡 IMPORTANT : Utiliser DIV pour éviter les conflits de formulaire imbriqué
    const divAnglais = document.createElement('div');
    divAnglais.id = 'div-anglais';
    divAnglais.className = 'div-langue';
    divAnglais.innerHTML = '<h3>Mots Anglais :</h3>';
    for (let i = 0; i < countAnglais; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `input-anglais-${i}`;
        input.className = 'input-anglais input_txt';
        input.placeholder = `Mot Anglais ${i + 1}`;
        input.setAttribute('autocomplete', 'off');

        if (valeursAnglaisSauvees[i] !== undefined) {
            input.value = valeursAnglaisSauvees[i];
        }

        attacherEcouteurEntree(input);

        divAnglais.appendChild(input);
        divAnglais.appendChild(document.createElement('br'));
    }
    container.appendChild(divAnglais);

    // --- Génération des champs Français ---
    // 💡 IMPORTANT : Utiliser DIV
    const divFrancais = document.createElement('div');
    divFrancais.id = 'div-francais';
    divFrancais.className = 'div-langue';
    divFrancais.innerHTML = '<h3>Mots Français :</h3>';
    for (let i = 0; i < countFrancais; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `input-francais-${i}`;
        input.className = 'input-francais input_txt';
        input.placeholder = `Mot Français ${i + 1}`;
        input.setAttribute('autocomplete', 'off');

        if (valeursFrancaisSauvees[i] !== undefined) {
            input.value = valeursFrancaisSauvees[i];
        }

        attacherEcouteurEntree(input);

        divFrancais.appendChild(input);
        divFrancais.appendChild(document.createElement('br'));
    }
    
    // Ajout du bouton dynamique
    const boutonDynamique = document.createElement('button');
    boutonDynamique.textContent = 'Ajouter la paire (Cliquez ou Entrée)';
    boutonDynamique.type = 'button'; 
    boutonDynamique.setAttribute('onclick', 'ajouterMot()');
    
    const divBouton = document.createElement('div');
    divBouton.classList.add('div-bouton-ajout');
    divBouton.appendChild(boutonDynamique);
    divBouton.appendChild(document.createElement('br'));
    
    divFrancais.appendChild(divBouton); 
    container.appendChild(divFrancais);

}

// Gère l'ajout des mots et la validation
function ajouterMot() {
    const inputsAnglais = document.querySelectorAll('.input-anglais');
    const inputsFrancais = document.querySelectorAll('.input-francais');

    const countAn = document.getElementById("count-anglais").value;
    const countFr = document.getElementById("count-francais").value;
    
    
    const motsAnglais = [];
    const motsFrancais = [];
    
    // Collecte et validation Anglais
    inputsAnglais.forEach(input => {
        const value = input.value.trim();
        if (value) {
            motsAnglais.push(value);
            input.classList.remove('missing');
        } else {
            input.classList.add('missing');
        }
    });

    // Collecte et validation Français
    inputsFrancais.forEach(input => {
        const value = input.value.trim();
        if (value) {
            motsFrancais.push(value);
            input.classList.remove('missing');
        } else {
            input.classList.add('missing');
        }
    });


    // Vérification finale
    if (motsAnglais.length != countAn || motsFrancais.length != countFr) {
        
        // L'ajout de la classe 'missing' met en évidence les champs vides
        return; 
    }

    // Stockage de la nouvelle paire
    const mots = chargerMots();
    mots.push({ anglais: motsAnglais, francais: motsFrancais });
    sauvegarderMots(mots);
    
    // Nettoyage des valeurs et affichage
    inputsAnglais.forEach(input => input.value = '');
    inputsFrancais.forEach(input => input.value = '');

    afficherListeMots();
    document.getElementById('input-anglais-0')?.focus(); 
}

// ====================================================================
// GESTION DU MODE ENTRAÎNEMENT
// ====================================================================

function commencerTest() {
    const mots = chargerMots();
    if (mots.length === 0) {
        alert("Ajoutez d'abord des mots pour commencer le test !");
        return;
    }
    
    document.getElementById('zone-test').style.display = 'block';

    // 1. Choisir aléatoirement une paire
    const randomIndex = Math.floor(Math.random() * mots.length);
    currentWord = mots[randomIndex];

    // 2. Tirer aléatoirement le sens du test (Anglais -> Français ou Français -> Anglais)
    const sens = Math.random() < 0.5 ? 'anglais' : 'francais';

    let motADisplay;
    let expectedArray;

    if (sens === 'anglais') {
        const sourceArray = currentWord.anglais;
        expectedArray = currentWord.francais;
        
        // 3. Choisir un mot aléatoire parmi les sources
        const randomSourceIndex = Math.floor(Math.random() * sourceArray.length);
        motADisplay = sourceArray[randomSourceIndex];

    } else { // sens === 'francais'
        const sourceArray = currentWord.francais;
        expectedArray = currentWord.anglais;

        // 3. Choisir un mot aléatoire parmi les sources
        const randomSourceIndex = Math.floor(Math.random() * sourceArray.length);
        motADisplay = sourceArray[randomSourceIndex];
    }
    
    document.getElementById('mot-a-traduire').textContent = motADisplay;
    currentWord.expected = expectedArray;
    
    const inputGuess = document.getElementById('input-guess');
    inputGuess.value = '';
    inputGuess.classList = '';
    document.getElementById('resultat').textContent = '';
    document.getElementById('input-guess').focus();
}


function toggleFeedback() {
    const container = document.getElementById('feedback-container');
    const button = document.querySelector('button[onclick="toggleFeedback()"]'); // Cibler le bouton par son onclick
    
    if (container.style.display === 'none') {
        // Si c'est caché, afficher et changer le texte du bouton
        container.style.display = 'block';
        button.textContent = 'Fermer le Feedback';
    } else {
        // Si c'est affiché, cacher et changer le texte du bouton
        container.style.display = 'none';
        button.textContent = 'Ouvrir le Feedback';
    }
}

function verifierReponse() {
    if (!currentWord) {
        alert("Cliquez sur 'Commencer le test' d'abord.");
        return;
    }
    
    const inputGuess = document.getElementById('input-guess');
    const guess = inputGuess.value.trim().toLowerCase();
    const resultatElement = document.getElementById('resultat');

    // Mettre toutes les réponses attendues en minuscules pour la comparaison
    const expectedArray = currentWord.expected.map(word => String(word).trim().toLowerCase());
    
    let isCorrect = expectedArray.includes(guess);

    if (isCorrect) {
        inputGuess.classList.add('rp_correct');
        resultatElement.textContent = "✅ Correct !";
    } else {
        const reponsesPossibles = expectedArray.join(', ');
        inputGuess.classList.add('rp_fausse');
        resultatElement.textContent = `❌ Faux. Les réponses acceptées étaient : ${reponsesPossibles}`;
    }
    
    // Après vérification, préparer le prochain mot
    setTimeout(commencerTest, 2000); 
}

// ====================================================================
// IMPORT / EXPORT (Portabilité)
// ====================================================================

// Exporte les mots dans un fichier JSON
function exporterMots() {
    const mots = chargerMots();
    if (mots.length === 0) {
        alert("Rien à exporter. La liste est vide !");
        return;
    }
    
    const dataStr = JSON.stringify(mots, null, 2); 
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards_vocabulaire.json'; 
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); 
}

// Importe les mots depuis un fichier JSON
function importerMots(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const contenu = e.target.result;
            const motsImportes = JSON.parse(contenu);
            
            if (Array.isArray(motsImportes)) {
                // Écrase l'ancienne liste
                sauvegarderMots(motsImportes);
                alert(`✅ ${motsImportes.length} paires de mots importées avec succès !`);
                window.location.reload(); 
            } else {
                throw new Error("Le format du fichier JSON n'est pas un tableau.");
            }
        } catch (error) {
            alert("❌ Erreur lors de l'importation. Assurez-vous que le fichier est un JSON valide.");
            console.error(error);
        }
    };

    reader.readAsText(file); 
}

// ====================================================================
// INITIALISATION
// ====================================================================

// Appel initial (au chargement complet de la page)
window.onload = async () => {
    // 1. Chargement de la liste par défaut si le stockage est vide
    if (chargerMots().length === 0) {
        const listeChargee = await chargerListeParDefaut();
        // Si la liste par défaut n'est pas vide (data.json a fonctionné)
        if (listeChargee.length > 0) {
            sauvegarderMots(listeChargee);
        }
    }

    // 2. Affichage initial des mots
    afficherListeMots();
};

// Appel après que le DOM est prêt (pour générer les premiers champs)
document.addEventListener('DOMContentLoaded', () => {
    // Génère les champs d'input par défaut (1 Anglais, 1 Français)
    genererChamps(); 
});