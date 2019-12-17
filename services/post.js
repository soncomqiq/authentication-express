const passport = require('passport')

module.exports = (app, db) => {

  app.post('/create-post', passport.authenticate('jwt',
    { session: false }),
    function (req, res) {
      db.post.create({
        user_id: req.user.id,
        message: req.body.message,
        image_url: req.body.image_url
      })
        .then((result) => {
          res.status(201).send(result)
        })
        .catch((err) => {
          console.error(err);
          res.status(400).send({ message: err.message })
        })
    }
  )

}