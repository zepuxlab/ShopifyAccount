# ShopifyAccount

Frontend (Vite + React) и backend (Node) для личного кабинета на Shopify.

## Env

Один файл **`.env`** в корне — и для фронта, и для бэка. Шаблон: `.env.docker.example`. Создай `.env` и заполни переменные (OAuth, Admin API, Storefront, Store). Для локального запуска обязательно нужны **SHOPIFY_CLIENT_ID** и **SHOPIFY_CLIENT_SECRET** (OAuth из Dev Dashboard), иначе обмен кода на токен даст «client credentials invalid».

## Запуск

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

Backend: порт 3601. Frontend: порт 5173.
