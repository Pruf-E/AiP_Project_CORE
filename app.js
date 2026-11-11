require('dotenv').config();
const express = require('express');
const path = require('node:path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const currentUser = require('./middleware/currentUser');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
app.use(session({
  name: 'core.sid',
  secret: process.env.SESSION_SECRET || 'local-development-secret-change-before-deploy',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/core_catalog' }),
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 }
}));
app.use(currentUser);
app.use((req, res, next) => {
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  res.locals.currentPath = req.path;
  next();
});

app.get('/', async (req, res, next) => {
  try {
    const CoreStyle = require('./models/coreStyle');
    const featured = await CoreStyle.find().sort({ createdAt: -1 }).limit(3).lean();
    return res.render('home', { title: 'Эстетики со смыслом', featured });
  } catch (error) { return next(error); }
});
app.use('/', require('./routes/auth'));
app.use('/core', require('./routes/catalog'));
app.use((req, res) => res.status(404).render('error', { title: 'Страница не найдена', message: 'Похоже, эта страница затерялась в другом эстетическом измерении.' }));
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  return res.status(500).render('error', { title: 'Что-то пошло не так', message: 'Не удалось обработать запрос. Проверьте подключение к базе данных и попробуйте ещё раз.' });
});

async function start() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/core_catalog');
  app.listen(port, () => console.log(`Core catalog is ready at http://localhost:${port}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Не удалось подключиться к MongoDB:', error.message);
    process.exitCode = 1;
  });
}

module.exports = app;
