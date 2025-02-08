# dse_advisory_docker

Di seguito verranno mostrati ii file utili per la configurazione sia del backend che del frontend.

## Directory principale del progetto
A seguito del problema riscontrato durante il deploy, è stato utile aggiungere, all'interno del `docker-compose.yml`, il servizio `nginx` e nella directory principale del progetto si trova anche il file di configurazione del servizio:
- `nginx.conf` è il file di configurazione di nginx, da modificare in caso di necessità. Questo file è utile perchè permette la gestione delle rotte direttamente da parte di React, in quanto con l'istruzione `try_files $uri /index.html;` demanda la gestione delle rotte interne del frontend al file che funge da entry per il frontend.
- `docker-compose.yml`, ora ha commentata tutta la parte del servizio `frontend`, in quanto si fornisce già la versione buildata (quindi contenente file statici) di tutto il frontend; è stata aggiunta la parte del servizio nginx, con le seguenti direttive principali:
     - `./frontend/build:/usr/share/nginx/html:ro`, che monta la cartella `build` contenuta all'interno della directory `/frontend` e che contiene il codice compilato del frontend.
     - `./nginx.conf:/etc/nginx/conf.d/default.conf:ro`, che carica il file `nginx.conf` spiegato sopra.

## Backend
Nel backend ci sono quattro file di configurazione nella directory principale del backend:
- `.env` che contiene tutte le variabili di ambiente utili per la connessione al database; i valori di default per la mail, come l'indirizzo e la password e il server SMTP; l'indirizzo del server CAS e l'indirizzo di callback.
- `login_cretentials.py` che serve ad importare i valori di .env dedicati alle credenziali
- `config.py` che è il file di configurazione vero e proprio, che contiene anche la chiave di codifica e decodifica dei token JWT.
- `app.py` che è l'entry principale dell'applicazione per il backend, in cui si importano tutte le variabili precedenti e si rendono effettive all'interno del backend.

La parte dell'invio di mail multiple non è stato possibile testarla a dovere, come già detto, a causa di limitazioni dovute al metodo di autenticazione utilizzato da me per la mia mail personale (autenticazione a due fattori resa obbligatoria). Prima di questa modifica obbligatoria, l'invio della mail funzionava perfettamente.

### Importante per il backend
- Creare una cartella `uploaded_docs` all'interno della directory principale del progetto, che verrà montata in fase di creazione del container e nella quale verranno memorizzati tutti i documenti caricati nell'applicazione. Non è stata inclusa nel repository, per evitare di occupare troppo spazio inutilmente.
- All'interno del file `.env` ho aggiunto anche una variabile `FRONTEND_URL` che memorizza l'indirizzo base per il frontend, poichè ci sono alcune funzioni che utilizzano la direttiva _redirect_ di Python. Quindi, modificare questa variabile con l'indirizzo del server dove girerà il frontend.

## Frontend
Il frontend ha un solo file di configurazione, all'interno della directory `/src`:
- `config.js`, che contiene il base URL per tutte le richieste al backend, da modificare in fase di deploy con l'URL del server del backend.

Inoltre viene aggiunta la cartella `/build`, creata in seguito all'utilizzo del comando
### `npm run build`
contenente i file statici del frontend e che verrà utilizzata dal servizio nginx spiegato all'inizio.

### Importante per il frontend
Qualsiasi modifica effettuata al frontend comporta il dover buildare di nuovo il frontend. Quindi, se si dovesse modificare il file `config.js` con valori nuovi, si dovrà effettuare di nuovo la build del frontend, che sovrascriverà la precedente all'interno della cartella `/build`. 
Per fare ciò si devono seguire i seguenti passi:
- scaricare `Node.js`
- installare le dipendenze con il comando:
### `npm install --legacy-peer-deps`
o alternativamente, se dovessero sorgere problemi col comando precedente, con:
### `npm ci`
- eseguire la build del frontend con il comando:
### `npm run build`
che creerà la cartella `/build` che sovrascriverà la precedente.


## Database
Nella cartella `/db` c'è un dump del database in cui sono presenti solo gli schemi, senza i record e senza l'owner.
 
