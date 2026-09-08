FROM nginx:stable-alpine

RUN mkdir -p /var/log/nginx \
    && chown -R nginx:nginx /var/log/nginx

COPY conf.d/prod.conf /etc/nginx/conf.d/prod.conf
COPY nginx.conf /etc/nginx/nginx.conf