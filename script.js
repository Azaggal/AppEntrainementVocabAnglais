const STORAGE_KEY = 'vocabulaireFlashcards';
let currentWord = null;

async function chargerListeParDefaut() {
    try {
        // 1. Demander le fichier JSON
        const response = await fetch('data.json');
        
        // 2. Vérifier si la requête a réussi (code 200)
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        
        // 3. Parser le contenu en objet JavaScript
        const motsDefaut = await response.json();
        
        return motsDefaut;

    } catch (error) {
        return []; // Retourne un tableau vide en cas d'échec
    }
}  

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
    const tbody = document.querySelector('#tableau-vocabulaire tbody');
    const compteur = document.getElementById('compteur-mots');
    
    // 1. Mettre à jour le compteur
    compteur.textContent = mots.length;

    // 2. Vider le corps du tableau actuel
    tbody.innerHTML = ''; 

    // 3. Générer une ligne (<tr>) pour chaque mot
    mots.forEach((paire, index) => {
        const tr = document.createElement('tr');
        
        // IMPORTANT : Ajouter l'action de suppression lors du clic sur la ligne
        // Nous demandons confirmation avant de supprimer pour éviter les erreurs de clic
        tr.setAttribute('onclick', `supprimerMot(${index})`);
        
        // 4. Créer les cellules (<td>) pour Anglais et Français
        
        // Cellule Anglais
        const tdAnglais = document.createElement('td');
        tdAnglais.textContent = paire.anglais;
        
        // Cellule Français
        const tdFrancais = document.createElement('td');
        tdFrancais.textContent = paire.francais;
        
        // 5. Assembler la ligne
        tr.appendChild(tdAnglais);
        tr.appendChild(tdFrancais);
        
        // 6. Ajouter la ligne au corps du tableau
        tbody.appendChild(tr);
    });

    if (mots.length === 0) {
        const trVide = document.createElement('tr');
        trVide.innerHTML = '<td colspan="2" style="text-align: center;">Votre liste est vide.</td>';
        tbody.appendChild(trVide);
    }
}



const formulaireEntrainement = document.getElementById('formulaire-entrainement');

formulaireEntrainement.addEventListener('submit', function(event) {
    // Empêche le rechargement de la page par défaut
    event.preventDefault(); 
});









// Modification : Appeler l'affichage après l'ajout
function ajouterMot() {
    // 1. Récupérer tous les champs Anglais et Français générés
    const inputsAnglais = document.querySelectorAll('.input-anglais');
    const inputsFrancais = document.querySelectorAll('.input-francais');
    
    const motsAnglais = [];
    const motsFrancais = [];
    let isValid = true;

    // 2. Parcourir et valider les champs Anglais
    inputsAnglais.forEach(input => {
        const value = input.value.trim();
        if (value) {
            motsAnglais.push(value);
        }
        // Validation simple : s'assurer qu'au moins un mot a été saisi
        // NOTE: On peut ignorer si l'utilisateur a défini 3 inputs mais n'en a rempli qu'un.
    });

    // 3. Parcourir et valider les champs Français

    inputsFrancais.forEach(input => {
        const value = input.value.trim();
        if (value) {
            motsFrancais.push(value);
        }
    });



    if (motsAnglais.length === 0) {
            inputsAnglais.forEach(input => {
                input.classList.add('missing');
            });
        }
    else {
        inputsAnglais.forEach(input => {
                input.classList.remove('missing');
            });
    }

        if (motsFrancais.length === 0) {
            inputsFrancais.forEach(input => {
                input.classList.add('missing');
            });
        }

    else {
        inputsFrancais.forEach(input => {
                input.classList.remove('missing');
            });
    }

    // 4. Vérification finale
    if (motsAnglais.length === 0 || motsFrancais.length === 0) {
        return;
    }

    // 5. Stockage de la nouvelle paire
    const mots = chargerMots();
    mots.push({ anglais: motsAnglais, francais: motsFrancais });
    sauvegarderMots(mots);
    
    // 6. Nettoyage et Affichage
    
    // Vider tous les champs après l'ajout
    inputsAnglais.forEach(input => input.value = '');
    inputsFrancais.forEach(input => input.value = '');


    afficherListeMots();
    // Le focus sur le premier champ anglais est conservé (si vous le remettez manuellement après le clear)
    document.querySelector('.div-anglais')?.focus(); 
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
// Fonction pour démarrer le test (MISE À JOUR pour une sélection aléatoire du mot source)


function genererChamps() {
    const countAnglais = parseInt(document.getElementById('count-anglais').value) || 1;
    const countFrancais = parseInt(document.getElementById('count-francais').value) || 1;
    const container = document.getElementById('champs-dynamiques');


    const valeursAnglaisSauvees = [];
    document.querySelectorAll('.input-anglais').forEach(input => {
        valeursAnglaisSauvees.push(input.value);
    });

    const valeursFrancaisSauvees = [];
    document.querySelectorAll('.input-francais').forEach(input => {
        valeursFrancaisSauvees.push(input.value);
    });


    container.innerHTML = ''; // Vider le conteneur
    console.log(`Génération de ${countAnglais} champs Anglais et ${countFrancais} champs Français.`);

    // --- Génération des champs Anglais ---
    const divAnglais = document.createElement('form');
    divAnglais.id = 'div-anglais';
    divAnglais.innerHTML = '<h3>Mots Anglais :</h3>';
    const buttonAN = document.createElement('button');
    buttonAN.type = "button";
    buttonAN.setAttribute('onclick', 'ajouterMot()');
    buttonAN.style.display = "none";

    divAnglais.appendChild(buttonAN)
    for (let i = 0; i < countAnglais; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `input-anglais-${i}`;
        input.className = 'input-anglais input_txt'; // Classe pour la récupération facile
        input.placeholder = `Mot Anglais ${i + 1}`;
        input.setAttribute('autocomplete', 'off'); // Pour désactiver l'historique

        if (valeursAnglaisSauvees[i] !== undefined) {
            input.value = valeursAnglaisSauvees[i];
        }

        divAnglais.appendChild(input);
        divAnglais.appendChild(document.createElement('br'));
    }
    container.appendChild(divAnglais);

    // --- Génération des champs Français ---
    const divFrancais = document.createElement('form');
    divFrancais.id = 'div-francais';
    divFrancais.innerHTML = '<h3>Mots Français :</h3>';
    const buttonFR = document.createElement('button');
    buttonFR.type = "button";
    buttonFR.setAttribute('onclick', 'ajouterMot()');
    buttonFR.style.display = "none";

    divFrancais.appendChild(buttonFR)
    for (let i = 0; i < countFrancais; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `input-francais-${i}`;
        input.className = 'input-francais input_txt'; // Classe pour la récupération facile
        input.placeholder = `Mot Français ${i + 1}`;
        input.setAttribute('autocomplete', 'off');

        if (valeursFrancaisSauvees[i] !== undefined) {
            input.value = valeursFrancaisSauvees[i];
        }

        divFrancais.appendChild(input);
        divFrancais.appendChild(document.createElement('br'));
    }
    container.appendChild(divFrancais);
}




function commencerTest() {
    const mots = chargerMots();
    if (mots.length === 0) {
        alert("Ajoutez d'abord des mots pour commencer le test !");
        return;
    }
    
    // Afficher la zone de test
    document.getElementById('zone-test').style.display = 'block';

    // 1. Choisir aléatoirement une paire de mots (ex: {anglais: [...], francais: [...]})
    const randomIndex = Math.floor(Math.random() * mots.length);
    currentWord = mots[randomIndex];

    // 2. Tirer aléatoirement le sens du test (Anglais -> Français ou Français -> Anglais)
    const sens = Math.random() < 0.5 ? 'anglais' : 'francais';

    let motADisplay;
    let expectedArray;

    if (sens === 'anglais') {
        // Source : le tableau des mots anglais
        const sourceArray = currentWord.anglais;
        expectedArray = currentWord.francais;
        
        // 3. Choisir un index aléatoire dans ce tableau source
        const randomSourceIndex = Math.floor(Math.random() * sourceArray.length);
        motADisplay = sourceArray[randomSourceIndex]; // Affiche le mot à cet index aléatoire

    } else { // sens === 'francais'
        // Source : le tableau des mots français
        const sourceArray = currentWord.francais;
        expectedArray = currentWord.anglais;

        // 3. Choisir un index aléatoire dans ce tableau source
        const randomSourceIndex = Math.floor(Math.random() * sourceArray.length);
        motADisplay = sourceArray[randomSourceIndex]; // Affiche le mot à cet index aléatoire
    }
    
    // 4. Afficher le mot choisi aléatoirement et définir la réponse attendue (le tableau complet)
    document.getElementById('mot-a-traduire').textContent = motADisplay;
    currentWord.expected = expectedArray;
    
    document.getElementById('input-guess').value = '';
    document.getElementById('resultat').textContent = '';
}

// Fonction pour vérifier la réponse
// Fonction pour vérifier la réponse (MODIFIÉE)
function verifierReponse() {
    if (!currentWord) {
        alert("Cliquez sur 'Commencer le test' d'abord.");
        return;
    }
    
    const guess = document.getElementById('input-guess').value.trim().toLowerCase();
    const resultatElement = document.getElementById('resultat');

    // La réponse attendue est maintenant un TABLEAU de chaînes (anglais ou français)
    const expectedArray = currentWord.expected.map(word => word.toLowerCase());
    
    let isCorrect = false;

    // Parcourir toutes les traductions possibles
    if (expectedArray.includes(guess)) {
        isCorrect = true;
    }

    // Affichage du résultat
    if (isCorrect) {
        resultatElement.textContent = "✅ Correct !";
    } else {
        // Afficher toutes les réponses acceptées
        const reponsesPossibles = expectedArray.join(', ');
        resultatElement.textContent = `❌ Faux. Les réponses acceptées étaient : ${reponsesPossibles}`;
    }
    
    // Après vérification, préparer le prochain mot
    setTimeout(commencerTest, 2000); 
}

// Au chargement, vérifier si des mots existent et afficher un message
window.onload = async () => {
    if (chargerMots().length === 0) {
        // Si vide, sauvegarder la liste par défaut
        const listeChargee = await chargerListeParDefaut();
        sauvegarderMots(listeChargee);
    }


    afficherListeMots();
};


document.addEventListener('DOMContentLoaded', () => {
    genererChamps(); // Ajout de l'appel pour afficher les champs par défaut (1 Anglais, 1 Français)
    const formAnglais = document.getElementById('div-anglais');
    
formAnglais.addEventListener('submit', function(event) {
    // Empêche le rechargement de la page par défaut
    ajouterMot();
    event.preventDefault(); 
});

const formFrancais = document.getElementById('div-francais');

formFrancais.addEventListener('submit', function(event) {
    // Empêche le rechargement de la page par défaut
    ajouterMot();
    event.preventDefault(); 
});
});