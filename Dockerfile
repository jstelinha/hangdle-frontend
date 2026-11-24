# Rubrica de Devops - Configuração docker
# Etapa 1: compila o front (tsc -b && vite build) e gera o dist/.
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: só o dist/, servido pelo nginx. O Node e o node_modules ficam na etapa 1.
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
