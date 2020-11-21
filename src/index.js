const express = require('express')
const bodyParser = require('body-parser')

const db = require('./db')
const port = process.env.PORT || 5010

const app = express()

// AUTHENTIFICATION requirements
const path = require('path')
const session = require('express-session')
const sessionFileStore = require('session-file-store')
const FileStore = sessionFileStore(session)
const secret =
  process.env.SESSION_SECRET ||
  console.log('missing SESSION_SECRET!') ||
  'je suis un beau secret'
// AUTHENTIFICATION function
const mustBeSignIn = (request, response, next) => {
  console.log('session:', request.session)
  if (!request.session.user) return next(Error('must be sign-in'))
  next()
}

// MIDDLEWARES
const publicPath = path.join(__dirname, '/client/build')
console.log(publicPath)
app.use(express.static(publicPath))

app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', request.headers.origin)
  response.header('Access-Control-Allow-Credentials', 'true') // important
  response.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE') // important
  response.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  )
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// AUTHENTIFICATION Setup session handler
app.use(
  session({
    secret,
    cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 },
    saveUninitialized: false,
    resave: true,
    store: new FileStore({ path: path.join(__dirname, '../sessions'), secret }),
  }),
)

// AUTHENTIFICATION route de sign in

app.post('/sign-in', (request, response, next) => {
  const username = request.body.username
  const password = request.body.password

  db.getUser()
    .then((users) => {
      const userFound = users.find((user) => user.username === username)

      if (!userFound) {
        throw Error('User not found')
      }
      if (userFound.password !== password) {
        throw Error('Wrong password')
      }

      request.session.user = userFound
      console.log('user', userFound.username, 'connected with great success')
      response.json('ok')
    })
    .catch(next)
})

app.get('/sign-out', (req, res, next) => {
  req.session = null

  res.json('ok')
})

// ROUTES
// Articles

app.get('/articles/:id', (req, res, next) => {
  db.readArticles
    .byId(req.params.id)
    .then((article) => res.json(article))
    .catch(next)
})

app.get('/articles', (request, response, next) => {
  console.log(publicPath)
  db.getArticles()
    .then((articles) => response.json(articles))
    .catch(next)
})

app.post('/articles', mustBeSignIn, (request, response, next) => {
  const article = request.body

  db.writeArticle(article)
    .then(() => response.json('ok'))
    .catch(next)
})

app.put('/articles/:id', mustBeSignIn, (request, response, next) => {
  const article = request.body
  article.id = request.params.id

  db.updateArticle(article)
    .then(() => response.json('ok'))
    .catch(next)
})

app.delete('/articles/:id', mustBeSignIn, (req, res, next) => {
  const articleId = req.params.id
  db.deleteArticle(articleId)
    .then(() => res.json('ok'))
    .catch(next)
})

// ROUTES
// filters

app.get('/filters/:id', (req, res, next) => {
  db.readFilters
    .byId(req.params.id)
    .then((filter) => res.json(filter))
    .catch(next)
})

app.get('/filters', (request, response, next) => {
  db.getFilters()
    .then((filters) => response.json(filters))
    .catch(next)
})

app.post('/filters', mustBeSignIn, (request, response, next) => {
  const filter = request.body

  db.writeFilter(filter)
    .then(() => response.json('ok'))
    .catch(next)
})

app.put('/filters/:id', mustBeSignIn, (request, response, next) => {
  const filter = request.body
  filter.id = request.params.id

  db.updateFilter(filter)
    .then(() => response.json('ok'))
    .catch(next)
})

app.delete('/filters/:id', mustBeSignIn, (req, res, next) => {
  const filterId = req.params.id
  db.deleteFilter(filterId)
    .then(() => res.json('ok'))
    .catch(next)
})

// ROUTES
// equipe

app.get('/equipe/:id', (req, res, next) => {
  db.readMembers
    .byId(req.params.id)
    .then((member) => res.json(member))
    .catch(next)
})

app.get('/equipe', (request, response, next) => {
  db.getMembers()
    .then((members) => response.json(members))
    .catch(next)
})

app.post('/equipe', mustBeSignIn, (request, response, next) => {
  const member = request.body

  db.writeMember(member)
    .then(() => response.json('ok'))
    .catch(next)
})

app.put('/equipe/:id', mustBeSignIn, (request, response, next) => {
  const member = request.body
  member.id = request.params.id

  db.updateMember(member)
    .then(() => response.json('ok'))
    .catch(next)
})

app.delete('/equipe/:id', mustBeSignIn, (req, res, next) => {
  const memberId = req.params.id
  db.deleteMember(memberId)
    .then(() => res.json('ok'))
    .catch(next)
})

// ROUTES
// thanks

app.get('/thanks/:id', (req, res, next) => {
  db.readThanks
    .byId(req.params.id)
    .then((thank) => res.json(thank))
    .catch(next)
})

app.get('/thanks', (request, response, next) => {
  db.getThanks()
    .then((thanks) => response.json(thanks))
    .catch(next)
})

app.post('/thanks', mustBeSignIn, (request, response, next) => {
  const thank = request.body

  db.writeThank(thank)
    .then(() => response.json('ok'))
    .catch(next)
})

app.put('/thanks/:id', mustBeSignIn, (request, response, next) => {
  const thank = request.body
  thank.id = request.params.id

  db.updateThank(thank)
    .then(() => response.json('ok'))
    .catch(next)
})

app.delete('/thanks/:id', mustBeSignIn, (req, res, next) => {
  const thankId = req.params.id
  db.deleteThank(thankId)
    .then(() => res.json('ok'))
    .catch(next)
})

// ROUTES
// contact

app.get('/contact', (request, response, next) => {
  db.getContact()
    .then((contact) => {
      response.json(contact[0])
    })
    .catch(next)
})

app.put('/contact', mustBeSignIn, (request, response, next) => {
  const contact = request.body
  db.updateContact(contact)
    .then(() => response.json('ok'))
    .catch(next)
})

// ROUTES
// partenaires

app.get('/partenaires/:id', (req, res, next) => {
  db.readPartenaires
    .byId(req.params.id)
    .then((partenaire) => res.json(partenaire))
    .catch(next)
})

app.get('/partenaires', (request, response, next) => {
  db.getPartenaires()
    .then((partenaires) => response.json(partenaires))
    .catch(next)
})

app.post('/partenaires', mustBeSignIn, (request, response, next) => {
  const partenaire = request.body

  db.writePartenaire(partenaire)
    .then(() => response.json('ok'))
    .catch(next)
})

app.put('/partenaires/:id', mustBeSignIn, (request, response, next) => {
  const partenaire = request.body
  partenaire.id = request.params.id

  db.updatePartenaire(partenaire)
    .then(() => response.json('ok'))
    .catch(next)
})

app.delete('/partenaires/:id', mustBeSignIn, (req, res, next) => {
  const partenaireId = req.params.id
  db.deletePartenaire(partenaireId)
    .then(() => res.json('ok'))
    .catch(next)
})

app.get('*', (req, res) => {
  console.log('HERE', req.originalUrl)
  res.sendFile(`${publicPath}/index.html`)
})

app.listen(port, () => console.log(`Server started on port ${port}!`))
