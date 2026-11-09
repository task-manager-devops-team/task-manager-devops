# Étape 1 : construire l'application Angular
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build

# Étape 2 : servir les fichiers avec Nginx (sans root)
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/taskmanager-ui/browser /usr/share/nginx/html
EXPOSE 8080