FROM 10.248.158.7/library/node:12.17.0-alpine as builder

WORKDIR /opt/ng
COPY package.json package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build:k8s
FROM 10.248.158.7/etc/nginx:1.21.3-logrotate

WORKDIR /

# Remove sym links from nginx image
RUN rm /var/log/nginx/access.log
RUN rm /var/log/nginx/error.log

# Config nginx ATTT
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /opt/ng/dist/ROOT /usr/share/nginx/html
COPY ./nginx-conf/default.conf /etc/nginx/conf.d/default.conf
COPY ./nginx-conf/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx-conf/nginx /etc/logrotate.d/nginx
COPY ./nginx-conf/404_files /usr/share/nginx/html
COPY ./nginx-conf/404.html /usr/share/nginx/html

RUN chmod 644 /etc/logrotate.d/nginx

RUN cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime

# Setup cron job
RUN (crontab -l ; echo "15 0 * * * /usr/sbin/logrotate -vf /etc/logrotate.d/nginx") | crontab

CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && service cron start && nginx -g 'daemon off;' && chmod 755 /var/log/nginx"]
