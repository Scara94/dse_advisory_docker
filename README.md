# dse_advisory_docker

Di seguito verranno mostrati ii file utili per la configurazione sia del backend che del frontend.

## Backend
Nel backend ci sono tre file di configurazione nella directory principale del backend:
- .env che contiene tutte le variabili di ambiente utili per la connessione al database; i valori di default per la mail, come l'indirizzo e la password e il server SMTP; l'indirizzo del server CAS e l'indirizzo di callback.
- login_cretentials.py che serve ad importare i valori di .env dedicati alle credenziali
- config.py che è il file di configurazione vero e proprio, che contiene anche la chiave di codifica e decodifica dei token JWT
Infine vi è il file app.py che è l'entry principale dell'applicazione per il backend, in cui si importano tutte le variabili precedenti e si rendono effettive all'interno del backend.
La parte dell'invio di mail multiple non è stato possibile testarla a dovere, come già detto, a causa di limitazioni dovute al metodo di autenticazione utilizzato da me per la mia mail personale (autenticazione a due fattori resa obbligatoria). Prima di questa modifica obbligatoria, l'invio della mail funzionava perfettamente.


## Frontend
Il frontend ha un solo file di configurazione, all'interno della directory /src:
- config.js, che contiene il base URL per tutte le richieste al backend, da modificare in fase di deploy con l'URL del server del backend.
 
