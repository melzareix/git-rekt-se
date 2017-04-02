const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const validationSchemas = require('../../../../services/shared/validation');
const Mailer = require('../../../../services/shared/Mailer');
const Client = require('../../../../models/client/Client');
const ClientAuthenticator = require('../../../../services/client/ClientAuthenticator');
const Strings = require('../../../../services/shared/Strings');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


const router = express.Router();
mongoose.Promise = Promise;

require('dotenv')
  .config();

const JWT_KEY = process.env.JWT_KEY;

/**
 * Body Parser Middleware
 */

router.use(bodyParser.json());
router.use(expressValidator({}));

/**
 * Client signup route
 */

router.post('/signup', (req, res, next) => {
  /**
   * Body Inputs
   */

  const userInfo = {
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    mobile: req.body.mobile,
    gender: req.body.gender,
    birthdate: req.body.birthdate,
  };

  /**
   * Form Validation.
   */

  req.checkBody(validationSchemas.clientSignupValidation);
  req.checkBody('confirmPassword')
    .equals(req.body.password)
    .withMessage(Strings.clientValidationErrors.passwordMismatch);

  req.getValidationResult()
    .then((result) => {
      if (result.isEmpty()) {
        new Client(userInfo)
          .save()
          .then(() => {
            ClientAuthenticator.generateConfirmationToken(req.body.email)
              .then((token) => {
                Mailer.clientConfirmEmail(req.body.email, req.hostname, token)
                  .then(() => {
                    res.json({
                      message: Strings.clientSuccess.signup,
                    });
                  })
                  .catch(e => next([e]));
              })
              .catch(e => next([e]));
          })
          .catch(() => next([Strings.clientValidationErrors.userExists]));
      } else {
        next(result.array());
      }
    });
});

/**
 * Send Confirmation Mail Route
 * For resending a confirmation Mail to User
 */

router.post('/confirmation/send', (req, res, next) => {
  req.checkBody(validationSchemas.clientConfirmEmailValidation);
  req.getValidationResult()
    .then((result) => {
      if (result.isEmpty()) {
        ClientAuthenticator.generateConfirmationToken(req.body.email)
          .then((token) => {
            Mailer.clientConfirmEmail(req.body.email, req.hostname, token)
              .then(() => {
                res.json({
                  message: Strings.clientSuccess.emailConfirmation,
                });
              })
              .catch(e => next([e]));
          })
          .catch(e => next([e]));
      } else {
        next(result.array());
      }
    });
});

/**
 * Client reset password
 */

router.post('/reset', (req, res, next) => {
  const resetToken = req.body.token;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;


    // Check If any required field are missing
  if (!(password && confirmPassword && resetToken)) {
    next(Strings.INCOMPLETE_INFORMATION);
  }

    // Check if password and confirmation mismatch
  // if (password !== confirmPassword) {
  //   next(Strings.PASSWORD_MISMATCH);
  // }

    // Check that password satisfies password conditions
    // The password must be at least 8 characters and includes at least a digit
    //  and a special character.
    // http://stackoverflow.com/questions/19605150/

  // const passwordRegex = /(?=.*\d)(?=.*[$@$!%*#?.&])[A-Za-z\d$@$!%*#?.&]{8,}$/;
  // if (!passwordRegex.test(password)) {
  //   next(Strings.INVALID_PASSWORD);
  // }

  jwt.verify(resetToken, JWT_KEY, (payload) => {
    const email = payload.email;
    const creationDate = new Date(parseInt(payload.iat, 10) * 1000);

    Client.findOne({
      email,
      passwordResetTokenDate: {
        $lte: creationDate,
      },
    }, (client) => {
      if (!client) {
        console.log(1);
        next(Strings.INVALID_RESET_TOKEN);
      }

      client.passwordResetTokenDate = undefined; // Disable the token
      client.passwordChangeDate = Date.now(); // Invalidate Login Tokens
      client.password = password; // Reset password

      client.save().exec().then(() => res.json({
        message: Strings.PASSWORD_RESET_SUCCESS,
      }));
    }).catch(err => next([err]));
  }).catch(err => next([Strings.INVALID_RESET_TOKEN, err]));
});


/**
 * Confirm Email Route
 */

router.post('/confirmation/:token/confirm', (req, res, next) => {

});

/**
 *  Error Handling Middlewares.
 */

router.use((err, req, res, next) => {
  res.status(400)
    .json({
      errors: err,
    });
});

module.exports = router;
