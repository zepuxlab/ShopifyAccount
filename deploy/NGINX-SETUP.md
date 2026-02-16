# Nginx на сервере (account.ampriomilano.com)

## Куда положить конфиг

На сервере конфиг должен лежать там, откуда nginx его подхватывает. Обычно:

- **Amazon Linux / RHEL:** `/etc/nginx/conf.d/account.ampriomilano.com.conf`
- Файлы из `conf.d` подключаются из главного `/etc/nginx/nginx.conf`.

## Как открыть и отредактировать

```bash
ssh amprio
sudo nano /etc/nginx/conf.d/account.ampriomilano.com.conf
```

Или скопировать конфиг с машины на сервер:

```bash
scp deploy/nginx-account.ampriomilano.com.conf amprio:/tmp/
ssh amprio 'sudo cp /tmp/nginx-account.ampriomilano.com.conf /etc/nginx/conf.d/account.ampriomilano.com.conf'
```

## Что дописать не нужно

Текущий `deploy/nginx-account.ampriomilano.com.conf` уже содержит всё нужное: HTTP→HTTPS, SSL (Let's Encrypt), прокси на frontend (3600) и backend (3601).

## После изменения конфига

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Если папки `options-ssl-nginx.conf` или `ssl-dhparams.pem` нет (старые системы), certbot создаёт их при первом `certbot certonly`. Пути в конфиге: `/etc/letsencrypt/options-ssl-nginx.conf` и `/etc/letsencrypt/ssl-dhparams.pem`.
