# Пошаговая история проекта

Исходный код уже собран в базовом коммите. Ниже каждый учебный этап сохранён отдельным коммитом; запись указывает, какие части готового проекта относятся к пункту.

## 4_1 — Подготовка Express-проекта с EJS

app.js, package.json, views/

## 4_2 — Разделение логики по маршрутам

routes/auth.js, routes/catalog.js

## 4_3 — Создание страниц каталога и аккаунта

views/home.ejs, views/catalog/, views/auth/

## 4_4 — Общий шаблон страниц

views/layout.ejs, ejs-mate

## 5_1 — Оформление и адаптивные стили

public/css/style.css

## 5_2 — Навигация и состояние пользователя

views/partials/nav.ejs

## 6_1 — Подключение MongoDB

app.js, MONGODB_URI

## 6_2 — Подготовка моделей данных

models/coreStyle.js, models/user.js

## 6_3 — Начальное наполнение каталога

scripts/seed.js

## 7_1 — Работа с MongoDB через Mongoose

models/

## 7_2 — Описание схемы эстетики

models/coreStyle.js

## 7_3 — Модели эстетики и пользователя

models/coreStyle.js, models/user.js

## 8_1 — Подключение данных к веб-приложению

app.js, mongoose.connect

## 8_2 — Маршрут отдельного направления

routes/catalog.js, /core/:slug

## 8_3 — Поиск и чтение данных из базы

routes/catalog.js, CoreStyle.find()

## 8_4 — Поиск и представление каталога

views/catalog/index.ejs, routes/catalog.js

## 9_1 — Настройка пользовательских сессий

app.js, express-session

## 9_2 — Настройка cookie браузера

app.js, httpOnly и sameSite

## 9_3 — Хранение сессий в MongoDB

app.js, connect-mongo

## 9_4 — Счётчик посещений из пособия

Отмечен отдельным пунктом истории; счётчик в текущем коде не реализован.

