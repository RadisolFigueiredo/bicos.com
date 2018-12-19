const express = require("express");

const router = express.Router();
const nodemailer = require("nodemailer");
const Announce = require('../models/announce');
const RefusedAnnounce = require('../models/refused-announce');
const PendingAnnounce = require('../models/pending-announce');

router.get("/", (req, res, next) => {
  res.render("index");
});

router.get('/announce/:id', (req, res,  next) => {
  const announceId = req.params.id;
  Announce.findOne({'_id': announceId})
  .then(announce => {
    if (req.session.currentUser) {
      let userId = req.session.currentUser._id;
      if((announce.creatorId).toString() !== userId && (announce.employerId).toString() === undefined) {
        announce.arrayOfCandidates.forEach((candidate) => {
          if(candidate === userId) {
            userId = undefined;
          }
        });
        announce.deniedCandidates.forEach((candidate) => {
          if(candidate === userId) {
            userId = undefined;
          }
        });
        res.render("announce-detail", { userId, announce });
      } else {
        res.render("announce-detail", { announce });
      }
    } else {
      res.render("announce-detail", { announce });
    }
  })
  .catch(error => {
    console.log(error);
  })
});

router.get("/search", (req, res, next) => {
  Announce.find({ title: req.query.content, location: req.query.location })
  .then((announces) => {
    if(announces.length === 0) {
      res.render("search", { announces, message: "Sua pesquisa nao retornou resultados" });
    } else {
      res.render("search", { announces });
    }
  })
  .catch(error => {
    console.log(error);
  })
});

router.use((req, res, next) => {
  if (req.session.currentUser) {
    next();
  } else {
    res.redirect("/login");
  }
});

router.get('/admin', (req, res, next) => {
  let user = req.session.currentUser;

  if (user.isAdmin) {
    PendingAnnounce.find()
    .then((announces) => {
      res.render('private/admin', { announces });
    })
    .catch((error) => {
      console.log(error);
    })
  } else {
    res.redirect("/profile");
  }
});

router.post('/admin/:id', (req, res,  next) => {
  const announceId = req.params.id;
  const buttonHandler = req.body.buttonHandler;

  let user = req.session.currentUser;

  if (user.isAdmin) {
    switch(buttonHandler) {
      case 'Aceitar':
        PendingAnnounce.findOne({ '_id': announceId })
        .populate({ path: 'creatorId', select: 'email' })
        .then((announce) => {
          const message = "O administrador do site adicionou o seu anuncio.";
          const subject = "Anuncio: " + announce.title + " aceito"
          const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
              user: 'danielferrarireyvpn@gmail.com',
              pass: 'pudim123'
            }
          });
          transporter.sendMail({
            from: '"Bicos.com" <admin@bicos.com>',
            to: announce.creatorId.email,
            subject,
            text: message,
            html: `<b>${message}</b>`
          })    
          .then(() => {
            const addAnnounce = new Announce({
              creatorId: announce.creatorId,
              title: announce.title,
              description: announce.description,
              value: announce.value,
              location: announce.location
            });
            announce.remove()
            .then(() => {
              addAnnounce.save()
              .then(() => {
                res.redirect("/admin");
              })
              .catch((error) => {
                console.log(error);
              })
            })
            .catch((error) => {
            console.log(error);
            })
          })
          .catch((error) => {
          console.log(error);
          })
        })
        .catch((error) => {
          console.log(error);
        })
        break;
      case 'Recusar':
        PendingAnnounce.findOne({ '_id': announceId })
        .populate({ path: 'creatorId', select: 'email' })
        .then((announce) => {
          const message = "O administrador do site nao adicionou seu anuncio, pois o titulo, descricao ou valor nao se adequam as normais do site.";
          const subject = "Anuncio: " + announce.title + " recusado"
          const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
              user: 'danielferrarireyvpn@gmail.com',
              pass: 'pudim123'
            }
          });
          transporter.sendMail({
            from: '"Bicos.com" <admin@bicos.com>',
            to: announce.creatorId.email,
            subject,
            text: message,
            html: `<b>${message}</b>`
          })    
          .then(() => {
            const addAnnounce = new RefusedAnnounce({
              creatorId: announce.creatorId,
              title: announce.title,
              description: announce.description,
              value: announce.value,
              location: announce.location
            });
            announce.remove()
            .then(() => {
              addAnnounce.save()
              .then(() => {
                res.redirect("/admin");
              })
              .catch((error) => {
                console.log(error);
              })
            })
            .catch((error) => {
            console.log(error);
            })
          })
          .catch((error) => {
          console.log(error);
          })
        })
        .catch((error) => {
          console.log(error);
        })
        break;
      default:
        res.redirect("/admin");
        break;
    }
  } else {
    res.redirect("/profile");
  }
});

router.post('/announce/:id', (req, res,  next) => {
  let userId = req.session.currentUser._id;
  const announceId = req.params.id;
  const buttonHandler = req.body.buttonHandler;

  switch(buttonHandler) {
    case 'Aplicar':
      Announce.findOne({'_id': announceId})
      .then((announce) => {
      announce.arrayOfCandidates.forEach((candidate) => {
        if(candidate === userId) {
          userId = undefined;
        }
      });
      announce.deniedCandidates.forEach((candidate) => {
        if(candidate === userId) {
          userId = undefined;
        }
      });
        if (userId && (announce.creatorId).toString() !== userId && (announce.employerId).toString() === undefined) {
          Announce.update({ _id: announceId }, { $push: { arrayOfCandidates: userId } })
          .then(() => {
            res.render("announce-detail", { announce, message: "Voce aplicou para a vaga" });
          })
          .catch((error) => {
          console.log(error);
          })
        } else {
          res.render("announce-detail", { announce, message: "Nao foi possivel aplicar para a vaga" });
        }
      })
      .catch((error) => {
        console.log(error);
      })
      break;
    default:
      res.redirect("/announce/" + announceId);
      break;
  }
});


router.get("/announces", (req, res, next) => {
  const userId = req.session.currentUser._id;
  Announce.find({ creatorId: userId })
  .populate({ path: 'employerId', select: 'name phone' })
  .then((announces) => {
    res.render("private/announces", { announces });
  })
  .catch(error => {
    console.log(error);
  })
});

router.post('/announces/', (req, res, next) => {
  const userId = req.session.currentUser._id;
  const buttonHandler = req.body.buttonHandler;
  switch(buttonHandler) {
    case 'Criar':
      const newAnnounce = new PendingAnnounce({
        creatorId: userId,
        title: req.body.title,
        description: req.body.description,
        value: req.body.value,
        location: req.body.location,
        show: true
      });

      newAnnounce.save()
      .then(() => {
          Announce.find({ creatorId: userId })
          .populate({ path: 'employerId', select: 'name phone' })
          .then((announces) => {
            res.render("private/announces", { announces, message: 'Seu anuncio foi recebido e estara disponivel em algumas horas.' });
          })
          .catch(error => {
            console.log(error);
          })
      })
      .catch((error) => {
        console.log(error);
      })
      break;
      default:
      res.redirect("/announces");
      break;
  }
});

router.post('/announces/:id/:eid', (req, res, next) => {
  const userId = req.session.currentUser._id;
  const announceId = req.params.id;
  const employerId = req.params.eid;
  const buttonHandler = req.body.buttonHandler;
  switch(buttonHandler) {
    case 'Remover Empregado':
      Announce.findOne({'_id': announceId})
      .then((announce) => {
        if(announce.show === false) {
          userId = undefined;
        }
        announce.deniedCandidates.forEach((candidate) => {
          if(candidate === employerId) {
            userId = undefined;
          }
        });
        if (userId === (announce.creatorId).toString()) {
          Announce.update({ _id: announce._id }, { $unset: { employerId: 1 } })
          .then(() => {
            Announce.update({ _id: announce._id }, { $push: { deniedCandidates: employerId } })
            .then(() => {
              Announce.update({ _id: announce._id }, { $push: { oldEmployers: employerId } })
              .then(() => {
                res.redirect("/announces");
              })
              .catch((error) => {
                console.log(error);
              })
            })
            .catch((error) => {
              console.log(error);
            })
          })
          .catch((error) => {
          console.log(error);
          })
        }
      })
      .catch((error) => {
        console.log(error);
      })
      break;
    case 'Finalizar Anuncio':
      Announce.findOne({'_id': announceId})
      .then((announce) => {
        if (userId === (announce.creatorId).toString() && announce.show) {
          Announce.update({ _id: announce._id }, { $set: { show: false } })
          .then(() => {
            res.redirect("/announces");
          })
          .catch((error) => {
          console.log(error);
          })
        }
      })
      .catch((error) => {
        console.log(error);
      })
      break;
    default:
      res.redirect("/announces");
      break;
  }
});

router.get("/profile", (req, res, next) => {
  const userId = req.session.currentUser._id;
  const userName = req.session.currentUser.name;
  const userEmail = req.session.currentUser.email;
  const userPhone = req.session.currentUser.phone;

  Announce.find({ creatorId: userId, arrayOfCandidates: { $not: { $size: 0 } }, employerId: { $exists: false } })
  .populate({ path: 'arrayOfCandidates', select: 'name' })
  .then((announces) => {
    res.render("private/profile", { userName, userEmail, userPhone, announces });
  })
  .catch((error) => {
    console.log(error);
  })
});

router.post('/profile/:id/:eid', (req, res,  next) => {
  let userId = req.session.currentUser._id;
  const announceId = req.params.id;
  const employerId = req.params.eid;
  const buttonHandler = req.body.buttonHandler;

  switch(buttonHandler) {
    case 'Aceitar':
      Announce.findOne({ creatorId: userId, '_id': announceId, employerId: { $exists: false } })
      .then((announce) => {
          if(announce.arrayOfCandidates.indexOf(employerId) !== -1) {
            Announce.update({ _id: announceId }, { $set: { employerId } })
            .then(() => {
              Announce.update({ _id: announceId }, { $pull: { arrayOfCandidates: employerId } })
              .then(() => {
                res.redirect("/profile");
              })
              .catch((error) => {
              console.log(error);
              })
            })
            .catch((error) => {
            console.log(error);
            })
          }
      })
      .catch((error) => {
        console.log(error);
      })
      break;
    case 'Recusar':
      Announce.findOne({ creatorId: userId, '_id': announceId, employerId: { $exists: false } })
      .then((announce) => {
          if(announce.arrayOfCandidates.indexOf(employerId) !== -1 && announce.deniedCandidates.indexOf(employerId) === -1) {
            Announce.update({ _id: announceId }, { $push: { deniedCandidates: employerId } })
            .then(() => {
              Announce.update({ _id: announceId }, { $pull: { arrayOfCandidates: employerId } })
              .then(() => {
                res.redirect("/profile");
              })
              .catch((error) => {
              console.log(error);
              })
            })
            .catch((error) => {
            console.log(error);
            })
          }
      })
      .catch((error) => {
        console.log(error);
      })
      break;
    default:
      res.redirect("/profile");
      break;
  }
});

router.get("/appointments", (req, res, next) => {
  const userId = req.session.currentUser._id;

  Announce.find({ employerId: userId })
  .populate({ path: 'creatorId', select: 'name phone' })
  .then((announces) => {
      res.render("private/appointments.hbs", { announces });
  })
  .catch((error) => {
    console.log(error);
  })

  res.render("private/appointments");
});

router.post('/appointments/:id/:eid', (req, res,  next) => {
  let userId = req.session.currentUser._id;
  const announceId = req.params.id;
  const employerId = req.params.eid;
  const buttonHandler = req.body.buttonHandler;

  switch(buttonHandler) {
    case 'Desistir':
      Announce.findOne({'_id': announceId})
      .then((announce) => {
        if(announce.show === false) {
          userId = undefined;
        }
        announce.deniedCandidates.forEach((candidate) => {
          if(candidate === userId) {
            userId = undefined;
          }
        });
        if (userId === employerId) {
          Announce.update({ _id: announce._id }, { $unset: { employerId: 1 } })
          .then(() => {
            Announce.update({ _id: announce._id }, { $push: { deniedCandidates: employerId } })
            .then(() => {
              Announce.update({ _id: announce._id }, { $push: { oldEmployers: employerId } })
              .then(() => {
                res.redirect("/appointments");
              })
              .catch((error) => {
                console.log(error);
              })
            })
            .catch((error) => {
              console.log(error);
            })
          })
          .catch((error) => {
          console.log(error);
          })
        }
      })
      .catch((error) => {
        console.log(error);
      })
      break;
    default:
      res.redirect("/appointments");
      break;
  }
});

router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/login");
  });
});


module.exports = router;
