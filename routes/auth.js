const express = require('express');
const User = require('../models/user');
const router = express.Router();

router.get('/register', (req, res) => res.render('auth/register', { title: 'Создать аккаунт' }));
router.post('/register', async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    if (!/^[\p{L}\p{N}_-]{3,24}$/u.test(username)) {
      req.session.flash = { type: 'error', message: 'Имя должно содержать от 3 до 24 букв, цифр, дефисов или подчёркиваний.' };
      return res.status(400).render('auth/register', { title: 'Создать аккаунт', username });
    }
    if (password.length < 8) {
      req.session.flash = { type: 'error', message: 'Пароль должен содержать не менее 8 символов.' };
      return res.status(400).render('auth/register', { title: 'Создать аккаунт', username });
    }
    if (await User.exists({ username: new RegExp(`^${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') })) {
      req.session.flash = { type: 'error', message: 'Это имя уже занято. Попробуйте другое.' };
      return res.status(409).render('auth/register', { title: 'Создать аккаунт', username });
    }
    const user = new User({ username });
    user.setPassword(password);
    await user.save();
    req.session.userId = user.id;
    req.session.flash = { type: 'success', message: 'Аккаунт создан. Добро пожаловать!' };
    return res.redirect('/');
  } catch (error) {
    if (error.code === 11000) {
      req.session.flash = { type: 'error', message: 'Это имя уже занято. Попробуйте другое.' };
      return res.status(409).render('auth/register', { title: 'Создать аккаунт', username: req.body.username });
    }
    return next(error);
  }
});

router.get('/login', (req, res) => res.render('auth/login', { title: 'Войти' }));
router.post('/login', async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const user = await User.findOne({ username: new RegExp(`^${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    if (!user || !user.checkPassword(String(req.body.password || ''))) {
      req.session.flash = { type: 'error', message: 'Проверьте имя пользователя и пароль.' };
      return res.status(401).render('auth/login', { title: 'Войти', username });
    }
    req.session.userId = user.id;
    req.session.flash = { type: 'success', message: `С возвращением, ${user.username}!` };
    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    return res.redirect(returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/');
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('core.sid');
    return res.redirect('/');
  });
});

module.exports = router;
