## MUWP Beta
https://muwp-pr1mer.vercel.app/

### Deploiement
Afin de déployer le projet, je recommande d'utiliser Vercel. Il suffit de se connecter avec son compte GitHub et de choisir le repository à déployer. Vercel va automatiquement détecter le projet et le déployer. Il est possible de déployer automatiquement à chaque push sur la branche master. Il faut ensuite connecter le project avec Vercel KV.

Enfin, il faut configurer Inngest pour le moteur de swaps. Rien ne fonctionnera sans cette étape. Il faut se rendre sur le site d'Inngest et créer un compte pour ensuite setup ces variables d'environment:
```py
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY
ZERION_API_KEY
VERCEL_TOOLBAR_DEBUG
MASTER_HD # La private key que l'on va utiliser pour deriver les adresses temporaires
```