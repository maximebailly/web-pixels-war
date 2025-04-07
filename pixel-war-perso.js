// Il faut de quoi se connecter au serveur
// En particulier on veut savoir sur quel serveur se connecter
// et sur quelle carte

//même chose que document.querySelector("#adresse").value
const adresse = document.getElementById("adresse").value
const carte = document.getElementById("carte").value;
const couleur = document.getElementById("couleur_selecteur").value;
console.log({adresse, carte, couleur});

const tuyau = document.getElementById("tuyau");
const couleur_selecteur = document.getElementById("couleur_selecteur");

tuyau.addEventListener("click", () => {
    // classe "active" pour afficher/masquer le sélecteur
    if (couleur_selecteur.classList.contains("active")) {
        couleur_selecteur.classList.remove("active");
    } else {
        couleur_selecteur.classList.add("active");
    }
});


const mapElement = document.getElementById("map")

// on va se connecter à l'API du serveur
async function preinit() { // async car on a pas beosin d'attendre la réponse pour continuer le code
    //comme async, on peut utiliser await pour attendre la réponse de la requête
    const res = await fetch(`${adresse}/api/v1/${carte}/preinit`, {credentials: "include"})
    // await met la fonction en pause jusqu'à ce que la réponse arrive
    console.log(res); // on affiche la réponse dans la console
    // Le contenu de la réponse est au format JSON
    const {key} = await res.json()

    init(key); // on appelle la fonction init avec la clé
}

async function init(key) { // async car on a pas beosin d'attendre la réponse pour continuer le code
    //comme async, on peut utiliser await pour attendre la réponse de la requête
    const res = await fetch(`${adresse}/api/v1/${carte}/init?key=${key}`, {credentials: "include"});
    const {id, timeout, nx, ny, data} = await res.json();
    
    let contenu = ""; // on initialise une variable vide pour le contenu de la carte
    for (let ligne = 0; ligne < ny; ligne++) { // on parcourt les lignes de la carte
        for (let colonne = 0; colonne < nx; colonne++) { // on parcourt les colonnes de la carte
            const [r,g,b] = data[colonne][ligne]; // on récupère la couleur de la case
            contenu += `<div class="pixel" id="l${ligne}_c${colonne}" style="background-color: rgb(${r}, ${g}, ${b})"></div>`
            // ou alors mapElement.style.backgroundColor = couleur;
        }
    }
    mapElement.innerHTML = contenu; // on ajoute le contenu à la carte dans le HTML
    mapElement.style.gridTemplateColumns = `repeat(${nx}, 1fr)`; // on définit le nombre de colonnes de la carte
    mapElement.style.gridTemplateRows = `repeat(${ny}, 1fr)`; // on définit le nombre de lignes de la carte

    setInterval(() => deltas(id), 200); // on appelle la fonction deltas toutes les 1s
}

preinit(); // on appelle la fonction preinit pour lancer le code

async function deltas(id) {
    const res = await fetch(`${adresse}/api/v1/${carte}/deltas?id=${id}`, {credentials: "include"});
    const {deltas} = await res.json(); // on récupère les deltas

    for (const [x, y, r, g, b] of deltas) { // on parcourt les deltas
        console.log("delta", [x, y, r, g, b]); // on affiche le delta dans la console
        // On chgange la couleur du pixel correspondant pour actualiser la carte
        const pixel = document.getElementById(`l${y}_c${x}`); // on récupère le pixel
        pixel.style.backgroundColor = `rgb(${r}, ${g}, ${b})`; // on change la couleur du pixel
    }
}

async function change_pixel(id) { // on récupère le pixel
    // On récupère la clé
    const res3 = await fetch(`${adresse}/api/v1/${carte}/preinit`, {credentials: "include"});
    const {key} = await res3.json();
    // On récupère son user_id
    const res2 = await fetch(`${adresse}/api/v1/${carte}/init?key=${key}`, {credentials: "include"});
    const data2 = await res2.json();
    const user_id = data2.id; // on récupère l'id de l'utilisateur

    const [ligne, colonne] = id.split("_").map(e => e.substring(1)); // on sépare l'id en ligne et colonne

    // Il faut convertir la couleur en RGB
    const couleur = document.getElementById("couleur_selecteur").value
    let r = couleur.slice(1,3); // on récupère la couleur rouge
    let g = couleur.slice(3,5);
    let b = couleur.slice(5,7);

    r = parseInt(r, 16); // on convertit rouge en entier
    g = parseInt(g, 16);
    b = parseInt(b, 16);

    // on envoie la requête pour changer la couleur du pixel
    await fetch(`${adresse}/api/v1/${carte}/set/${user_id}/${colonne}/${ligne}/${r}/${g}/${b}`, {credentials: "include"});

    // Manque à implémenter le fait qu'on doit pas pouvoir en modifier à moins de 10s d'intervalle
}

addEventListener("click", async (e) => { // on écoute le clic sur la carte
    const {target} = e; // on récupère l'élément sur lequel on a cliqué
    if (target.classList.contains("pixel")) { // si c'est un pixel
        const id = target.id; // on récupère l'id du pixel
        change_pixel(id); // on appelle la fonction getpixel avec l'id du pixel
    }
});
