const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');

router.get('/register', userCtrl.registerForm);
router.post('/register', userCtrl.register);

router.get('/login', userCtrl.loginForm);
router.post('/login', userCtrl.login);

router.get('/logout', userCtrl.logout);
router.get('/', userCtrl.index);

module.exports = router;
