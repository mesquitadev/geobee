#Build
FROM node:latest AS frontend
WORKDIR /app
COPY . /app
RUN ls
RUN cd /app && npm install && npm run build
#Running
FROM nginx:stable-alpine
COPY --from=frontend /app/dist /usr/share/nginx/html
# COPY --from=frontend /app/nginx.conf /etc/nginx/conf.d/default.conf
