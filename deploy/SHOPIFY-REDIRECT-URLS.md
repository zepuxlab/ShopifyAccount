# URL-адреса перенаправления в Shopify

В настройках Custom App (Customer Account API) укажи **ровно эти два** адреса в поле **URL-адреса перенаправления** / **Redirect URLs**:

## Список для ввода

```
http://localhost:5173/callback
https://account.ampriomilano.com/callback
```

- **Первый** — для локальной разработки (логин с `npm run dev` на порту 5173).
- **Второй** — для продакшена (после входа пользователя Shopify редиректит сюда).

## Где вводить

- **Shopify Partners** → твоё приложение → **App setup** / **Customer Account API** → **Redirect URLs**.
- Или **Shopify Admin** → **Settings** → **Apps and sales channels** → **Develop apps** → нужное приложение → **Configuration** → **Customer Account API** → **Redirect URLs**.

Можно добавить оба в один список (через запятую или по одному на строку — как интерфейс позволяет). **URL приложения** укажи: **https://account.ampriomilano.com**.

---

На сервере для nginx фронт должен слушать порт **3600**. В `docker-compose.yml` для продакшена поменяй маппинг фронта на `"3600:80"`.
