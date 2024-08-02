#Build
FROM node:latest AS frontend
WORKDIR /app
COPY . /app
RUN ls
RUN cd /app && npm install --legacy-peer-deps && npm run build
#Running
FROM nginx:stable-alpine
COPY --from=frontend /app/dist /usr/share/nginx/html
