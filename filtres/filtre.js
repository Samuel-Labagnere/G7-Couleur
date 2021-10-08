// CONCEPTION
// en fr -> en JS
// simplifier le pb
// factorser le code (utilisation de boucle)

// DEBUGAGE ;)
// bug de syntaxe : utiliser le inspecteur  pour la localiser 
// bug de fonctionnement : utiliser les console.log pour la localiser (voir les différences entre le resultat obtenu et celui attendu

"use strict";
function imgLoad(){
	var URL = window.webkitURL || window.URL;
	document.getElementById("photo").src = URL.createObjectURL(document.getElementById("file_input").files[0]);
}

var tr, tg, tb, ta;
var width, height; 
var photo, canvas;
var pix, imgd, context;

function prefilter(artworkName, canvasName){
	
	photo = document.getElementById(artworkName);
	canvas = document.getElementById(canvasName);
	context = canvas.getContext('2d');

	var x = 0;
	var y = 0;
		
	// redimensionne le canevas aux dimensions de l'image
	width = photo.width;
	height = photo.height;
	canvas.width = width;
	canvas.height = height;

	// recopie l'image dans le canevas
	context.drawImage(photo, 0, 0, width, height);
	
	// extrait le tableau de pixels du canevas
	imgd = context.getImageData(0, 0, photo.width, photo.height);
	pix = imgd.data;


	// PASSAGE EN 1D POUR SIMPLIFIER LA GESTION DU VOISINAGE
	// 1 tab 1D -> 4 tab 2D (r,g,b,a) 
	// déclaration de 4 tableaux à 2 dim (de taille width * height)
	tr = new Array(width).fill().map(() => Array(height));
	tg = new Array(width).fill().map(() => Array(height));
	tb = new Array(width).fill().map(() => Array(height));
	ta = new Array(width).fill().map(() => Array(height));
	


	// copie des valeurs
	for (var y = 0; y < height; y++) { 
		for (var x = 0; x < width; x++) {
			tr[x][y] = pix[x*4+y*(width*4)+0];
			tg[x][y] = pix[x*4+y*(width*4)+1];
			tb[x][y] = pix[x*4+y*(width*4)+2];
			ta[x][y] = pix[x*4+y*(width*4)+3];
		}
	}
}

function postfilter(){
	// RETOUR EN 1D POUR AFFICHER LES MODIFICATIONS
	// 4 tab 2D (r,g,b,a) -> 1 tab 1D POUR METTRE A JOUR L'IMAGE
	for (var y = 0; y < height; y++) { 
		for (var x = 0; x < width; x++) {
			pix[x*4+y*(width*4)+0] = tr[x][y];
			pix[x*4+y*(width*4)+1] = tg[x][y];
			pix[x*4+y*(width*4)+2] = tb[x][y];
			pix[x*4+y*(width*4)+3] = ta[x][y];
		}
	}

	// Draw the ImageData at the given (x,y) coordinates.
	context.putImageData(imgd, 0, 0);
	
	var data = canvas.toDataURL('image/png');
	photo.setAttribute('src', data);
}	

function revert(artworkName){
	let revertSrc = "";
	switch(artworkName){
		case 'derainImg':
			revertSrc = 'img/derain.jpg';
		break;
		case 'hokusaiImg':
			revertSrc = 'img/hokusai.jpg';
		break;
		case 'turnerImg':
			revertSrc = 'img/turner.jpg';
		break;
	}
	let pictureToRevert = document.getElementById(artworkName);
	pictureToRevert.setAttribute('src', revertSrc)
}

function negatif(artworkName, canvasName){

	// CHARGEMENT DES TABLEAUX DE PIXELS
	prefilter(artworkName, canvasName);

	// TRAITEMENT / APPLICATION D'UN FILTRE
	// mise en rouge de la moitier gauche
	for (var y = 0; y < height; y++) { 
		for (var x = 0; x < width; x++) {
			tr[x][y] = 255 - tr[x][y];
			tg[x][y] = 255 - tg[x][y];
			tb[x][y] = 255 - tb[x][y];
			// ta[x][y] = ta[x][y];
		}
	}

	// MISE À JOUR DE L'IMAGE
	postfilter();
			
}
	

function noir(){

	// CHARGEMENT DES TABLEAUX DE PIXELS
	prefilter();

	// TRAITEMENT / APPLICATION D'UN FILTRE
	// mise en rouge de la moitier gauche
	for (var y = 0; y < height; y++) { 
		for (var x = 0; x < width; x++) {
			tr[x][y] = 0;
			tg[x][y] = 0;
			tb[x][y] = 0;
			// ta[x][y] = ta[x][y];
		}
	}

	// MISE À JOUR DE L'IMAGE
	postfilter();
			
}
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////// NOS FILTRES /////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///// SAMUEL
function blueToRed(artworkName, canvasName){
	// CHARGEMENT DES TABLEAUX DE PIXELS
	prefilter(artworkName, canvasName);

	// TRAITEMENT / APPLICATION D'UN FILTRE
	// remplacement du bleu par du rouge

	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			//// BLEU EN ROUGE
			if(tb[x][y] >= tr[x][y] && tb[x][y] >= tg[x][y]){
				tr[x][y] = tb[x][y];
				tb[x][y] = 0;
				tg[x][y] = 0;
			}
			//// NUANCES SUR LES VAGUES ASSOMBRIES
			if(tr[x][y] < tb[x][y] && tr[x][y] < tg[x][y]){
				if(tb[x][y] > tg[x][y]){
					tr[x][y] = tb[x][y];
					tg[x][y] = tb[x][y];
				}else{
					tr[x][y] = tg[x][y];
					tb[x][y] = tg[x][y];
				}
			}
		}
	}

	//// ASSOMBRIR LE CIEL BEIGE
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < 180; y++) {
			//// CAN BE MODIFIED ////
			let tolerance = 25;
			let shade = 25;

			let defColorR = 248;
			let defColorG = 228;
			let defColorB = 183;
			/////////////////////////

			let defColorRmin = defColorR - tolerance;
			let defColorRmax = defColorR + tolerance;
			let defColorGmin = defColorG - tolerance;
			let defColorGmax = defColorG + tolerance;
			let defColorBmin = defColorB - tolerance;
			let defColorBmax = defColorB + tolerance;

			if((defColorRmin <= tr[x][y] &&  tr[x][y]  <= defColorRmax) && (defColorGmin <= tg[x][y] && tg[x][y] <= defColorGmax) && (defColorBmin <= tb[x][y] && tb[x][y] <= defColorBmax)){
				tr[x][y] -= shade;
				tg[x][y] -= shade;
				tb[x][y] -= shade;
			}
		}
	}

	// MISE À JOUR DE L'IMAGE
	postfilter();
}

///// RÉGIS
function binarisation(artworkName, canvasName){
	// CHARGEMENT DES TABLEAUX DE PIXELS
	prefilter(artworkName, canvasName);

	// TRAITEMENT / APPLICATION D'UN FILTRE
	// remplacement du bleu par du rouge
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			var tglobal = (tr[x][y]+tg[x][y]+tb[x][y])/3;
			if(tglobal <= 128){
				tr[x][y] = 0;
				tg[x][y] = 0;
				tb[x][y] = 0;
			}else{
				tr[x][y] = 255;
				tg[x][y] = 255;
				tb[x][y] = 255;
			}
		}
	}

	for (var y = 1; y < height-1; y++) { 
		for (var x = 1; x < width-1; x++) {

			var moyr = (tr[x][y + 1] + tr[x + 1][y + 1] + tr[x - 1][y + 1] + 
						tr[x][y]   + tr[x + 1][y]   + tr[x - 1][y] + 
						tr[x][y - 1] + tr[x + 1][y - 1] + tr[x - 1][y - 1])/9;

			var moyb = (tb[x][y + 1] + tb[x + 1][y + 1] + tb[x - 1][y + 1] + 
					   tb[x][y] + tb[x + 1][y] + tb[x - 1][y] + 
					   tb[x][y - 1] + tb[x + 1][y - 1] + tb[x - 1][y - 1])/9;

			var moyg = (tg[x][y + 1]+tg[x+1][y+1]+tg[x-1][y+1]+
					   tg[x][y]+tg[x+1][y]+tg[x-1][y]+
					   tg[x][y-1]+tg[x+1][y-1]+tg[x-1][y-1])/9;

			tr[x][y] = moyr;
			tb[x][y] = moyb;
			tg[x][y] =moyg;
			//ta[x][y] = 50;
		}
	}

	// MISE À JOUR DE L'IMAGE
	postfilter();
}

///// YANI
function nomDuFiltre(artworkName, canvasName){
    // CHARGEMENT DES TABLEAUX DE PIXELS
    prefilter(artworkName, canvasName);

    // TRAITEMENT / APPLICATION D'UN FILTRE

    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {

            //// CHANGEMENT TEINTE EN BLEU
            //     let blue = tb[x][y];
            //     tb[x][y] = tg[x][y];
            //     tr[x][y] = 0;
            //     tg[x][y] = blue;

                //// CHANGEMENT TEINTE EN VIOLET
                    // tb[x][y] = tr[x][y];
                    // tr[x][y] = tg[x][y];
                    // tg[x][y] = 0;

                // //// CHANGEMENT TEINTE EN ROUGE
                // tb[x][y] = 0;
                // tr[x][y] = tg[x][y];
                // tg[x][y] = 0;


                if(tb[x][y] < tg[x][y] < tr[x][y]) {

                     let blue = tb[x][y];
                     tb[x][y] = tr[x][y];
                    tr[x][y] = blue;

                 }


                let tglobal = (tr[x][y]+tg[x][y]+tb[x][y])/3;
                if(tglobal < 128){
                    tr[x][y] = tr[x][y] + 10;
                    tg[x][y] = tg[x][y] + 10;
                    tb[x][y] = tb[x][y] + 10;

                }

        }
    }

    // MISE À JOUR DE L'IMAGE
    postfilter();
}
