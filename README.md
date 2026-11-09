# task-manager-devops

Application de gestion des tâches avec pipeline CI/CD et déploiement automatisé
(Spring Boot, Angular, PostgreSQL, Docker, GitHub Actions).

## Structure du dépôt

- `backend/` : API Spring Boot (Java 21, Maven)
- `frontend/` : application Angular
- `docker/` : Dockerfiles et configuration
- `infra/` : scripts d'infrastructure et de déploiement
- `.github/workflows/` : pipelines CI/CD

## Prérequis

- Java 21
- Docker
- Node.js 22 (pour le frontend)
- Git

## Lancer le backend en local

1. Démarrer PostgreSQL dans un conteneur :

```bash
docker run -d --name pg-tasks -p 5432:5432 \
  -e POSTGRES_DB=tasks \
  -e POSTGRES_USER=tasks_user \
  -e POSTGRES_PASSWORD=<mot_de_passe> \
  postgres:16
```

Sous PowerShell, remplace le `\` de fin de ligne par un accent grave `` ` ``.
Si le conteneur existe déjà : `docker start pg-tasks`.

2. Définir les variables d'environnement (jamais de mot de passe dans le code).
Seul `DB_PASSWORD` est obligatoire (il doit être identique à `POSTGRES_PASSWORD`),
les autres ont une valeur par défaut :

| Variable | Rôle | Valeur par défaut |
| --- | --- | --- |
| `DB_PASSWORD` | Mot de passe de la base | aucune (obligatoire) |
| `DB_USER` | Utilisateur de la base | `tasks_user` |
| `DB_URL` | URL JDBC de la base | `jdbc:postgresql://localhost:5432/tasks` |

Linux / macOS :

```bash
export DB_PASSWORD=<mot_de_passe>
```

PowerShell :

```powershell
$env:DB_PASSWORD = "<mot_de_passe>"
```

3. Lancer l'application :

```bash
cd backend
./mvnw spring-boot:run
```

4. Vérifier :

- `GET http://localhost:8080/api/health` renvoie `{"status":"ok"}`
- `GET http://localhost:8080/actuator/health` renvoie `"status":"UP"`

## Lancer le frontend en local

Le backend doit tourner sur `http://localhost:8080` (voir plus haut).

```bash
cd frontend
npm ci
npx ng serve
```

Ouvrir `http://localhost:4200`. En développement, l'application appelle l'API sur `http://localhost:8080/api`.

Tests et build du frontend :

```bash
cd frontend
npx ng test --watch=false
npx ng build
```

Image Docker du frontend (Nginx, utilisateur non-root, port 8080) :

```bash
docker build -t taskmanager-ui:local frontend
docker run --rm -p 8081:8080 taskmanager-ui:local
```

Nginx relaie `/api` vers un service nommé `backend` (prévu dans le futur `docker-compose.yml`).

## Lancer les tests

```bash
cd backend
./mvnw -B verify
```

## Règles d'équipe

- `main` est protégé : aucune modification directe, tout passe par une pull request.
- Branches courtes : `feature/xxx`, `fix/xxx`, `docs/xxx`.
- Chaque PR est relue et approuvée par l'autre membre, et la CI doit être verte.
- Commits conventionnels : `feat:`, `fix:`, `ci:`, `docker:`, `docs:`.
- Une issue par tâche, suivie dans le GitHub Project « Taskflow - Backlog ».

## CI/CD

Le workflow `.github/workflows/ci.yml` build et teste le projet à chaque push et chaque pull request.

Le job `frontend` de `ci.yml` installe les dépendances (`npm ci`), audite celles de production (`npm audit`, seuil high), lance les tests puis construit l'application.

Le workflow `.github/workflows/frontend-image.yml` construit l'image du frontend, la scanne avec Trivy (failles HIGH et CRITICAL corrigeables), puis la publie sur `ghcr.io/task-manager-devops-team/taskflow-frontend` avec les tags `sha-<commit>` et `latest` à chaque fusion dans `main`.