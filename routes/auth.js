// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');

const User = require('../models/user');

const router = express.Router();
const bcryptSalt = 10;

router.get('/signup', (req, res, next) => {
  if (req.session.currentUser) {
    res.redirect('/profile');
  } else {
    res.render('auth/signup', {
      errorMessage: ''
    });
  }
});

router.post('/signup', (req, res, next) => {
  const nameInput = req.body.name;
  const phoneInput = req.body.phone;
  const emailInput = req.body.email;
  const passwordInput = req.body.password;

  if (emailInput === '' || passwordInput === '' || phoneInput === '') {
    res.render('auth/signup', {
      errorMessage: 'Entre o email e password para se cadastrar.'
    });
    return;
  }

  User.findOne({ email: emailInput }, '_id', (err, existingUser) => {
    if (err) {
      next(err);
      return;
    }

    if (existingUser !== null) {
      res.render('auth/signup', {
        errorMessage: `O email ${emailInput} ja esta em uso.`
      });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashedPass = bcrypt.hashSync(passwordInput, salt);

    const userSubmission = {
      name: nameInput,
      email: emailInput,
      phone: phoneInput,
      password: hashedPass
    };

    const theUser = new User(userSubmission);

    theUser.save((err) => {
      if (err) {
        res.render('auth/signup', {
          errorMessage: 'Algum erro ocorreu. Tente novamente mais tarde.'
        });
        return;
      }

    req.session.currentUser = theUser;
    res.redirect('/profile');
    });
  });
});

router.get('/login', (req, res, next) => {
  if (req.session.currentUser) {
    res.redirect('/profile');
  } else {
    res.render('auth/login', {
      errorMessage: ''
    });
  }
});

router.post('/login', (req, res, next) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;

  if (emailInput === '' || passwordInput === '') {
    res.render('auth/login', {
      errorMessage: 'Entre o email e password para logar.'
    });
    return;
  }

  User.findOne({ email: emailInput }, (err, theUser) => {
    if (err || theUser === null) {
      res.render('auth/login', {
        errorMessage: `Nao existe uma conta com o email ${emailInput}.`
      });
      return;
    }

    if (!bcrypt.compareSync(passwordInput, theUser.password)) {
      res.render('auth/login', {
        errorMessage: 'Password invalido.'
      });
      return;
    }

    req.session.currentUser = theUser;
    res.redirect('/profile');
  });
});

router.get('/logout', (req, res, next) => {
  if (!req.session.currentUser) {
    res.redirect('/');
    return;
  }

  req.session.destroy((err) => {
    if (err) {
      next(err);
      return;
    }

    res.redirect('/');
  });
});


module.exports = router;
