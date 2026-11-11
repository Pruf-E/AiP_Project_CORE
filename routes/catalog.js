const express = require('express');
const CoreStyle = require('../models/coreStyle');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const search = String(req.query.q || '').trim().slice(0, 60);
    const filter = search ? { $or: [
      { title: { $regex: escapeRegex(search), $options: 'i' } },
      { category: { $regex: escapeRegex(search), $options: 'i' } },
      { tagline: { $regex: escapeRegex(search), $options: 'i' } }
    ] } : {};
    const styles = await CoreStyle.find(filter).sort({ title: 1 }).lean();
    return res.render('catalog/index', { title: 'Каталог эстетик', styles, search });
  } catch (error) { return next(error); }
});

router.get('/new', requireAuth, (req, res) => res.render('catalog/new', { title: 'Добавить направление', form: {} }));
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const title = String(req.body.title || '').trim();
    const category = String(req.body.category || '').trim();
    const tagline = String(req.body.tagline || '').trim();
    const description = String(req.body.description || '').trim();
    if (!title || !category || !tagline || !description) {
      req.session.flash = { type: 'error', message: 'Заполните все обязательные поля.' };
      return res.status(400).render('catalog/new', { title: 'Добавить направление', form: req.body });
    }
    const slug = `${slugify(title)}-${Date.now().toString(36)}`;
    const palette = String(req.body.palette || '').split(',').map((color) => color.trim()).filter((color) => /^#[0-9a-f]{6}$/i.test(color)).slice(0, 5);
    const symbols = String(req.body.symbols || '').split(',').map((item) => item.trim()).filter(Boolean).slice(0, 6);
    const style = await CoreStyle.create({ title, slug, category, tagline, description, palette, symbols, cover: 'custom', createdBy: req.session.userId });
    req.session.flash = { type: 'success', message: 'Направление добавлено в каталог.' };
    return res.redirect(`/core/${style.slug}`);
  } catch (error) { return next(error); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const style = await CoreStyle.findOne({ slug: req.params.slug }).populate('createdBy', 'username').lean();
    if (!style) return res.status(404).render('error', { title: 'Не найдено', message: 'Такого направления пока нет в каталоге.' });
    return res.render('catalog/show', { title: style.title, style });
  } catch (error) { return next(error); }
});

function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function slugify(value) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 48) || 'core-style';
}

module.exports = router;
