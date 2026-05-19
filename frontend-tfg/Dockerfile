
# Etapa 1: Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# Etapa 2: Producción
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Runtime env
COPY env.js /usr/share/nginx/html/env.js

# Inyectar env.js en index.html generado por Vite
RUN sed -i 's|</head>|<script src="/env.js"></script></head>|' /usr/share/nginx/html/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
