// appels des modules
var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

// Lecture/Ecriture fichier FS
var fs = require("fs");
var contenu = "";
var histo = "";

// Chargement et gestion de la page index.html
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) { 
        pseudo = ent.encode(pseudo);
        socket.set('pseudo', pseudo);
		
		var maintenant=new Date();
		var months = ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'];
		
		var jour=maintenant.getDate();
		var mois=months[maintenant.getMonth()];
		var heure=maintenant.getHours();
		var minute=maintenant.getMinutes();
				
		console.log('L\'utilisateur',pseudo,'s\'est connecté');
		
		contenu += pseudo + " s\'est connecté le "+ jour + " " + mois + " à " + heure + ":" + minute + "\n";
		fs.writeFileSync("log.txt", contenu, "UTF-8");
		
        socket.broadcast.emit('nouveau_client', pseudo);
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message) {
        socket.get('pseudo', function (error, pseudo) { // récupération pseudo
            //message = ent.encode(message);
			
			histo += pseudo + " : " + message + "\n";
			fs.writeFileSync("historique.txt", histo, "UTF-8");
			
            socket.broadcast.emit('message', {pseudo: pseudo, message: message});
        });
    }); 
	
	// déconnexion d'un utilisateur
	socket.on('disconnect', function (message2) {
		socket.get('pseudo', function (error, pseudo) {
			var maintenant=new Date();
			var months = ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'];
			
			var jour=maintenant.getDate();
			var mois=months[maintenant.getMonth()];
			var heure=maintenant.getHours();
			var minute=maintenant.getMinutes();
					
			console.log('L\'utilisateur',pseudo,'s\'est déconnecté');
			
			//contenu += "L\'utilisateur '" + pseudo + "' s\'est déconnecté \n";
			contenu += pseudo + " s\'est déconnecté le "+ jour + " " + mois + " à " + heure + ":" + minute + "\n";
			fs.writeFileSync("log.txt", contenu, "UTF-8");
			
			socket.broadcast.emit('message2', {pseudo: pseudo, message: message2});
		});
    }); 
	
});

server.listen(8080);
