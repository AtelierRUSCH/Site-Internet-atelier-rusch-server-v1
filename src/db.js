const mysql = require('mysql2/promise')

const url = process.env.DATABASE_URL || 'mysql://root@localhost/rusch'
console.log(`MySQL connecting to: ${url}`)
const pool = mysql.createPool(`${url}?waitForConnections=true&connectionLimit=10&queueLimit=0`)

// Helpers

pool.execute('select * from user')
  .then(console.log)
  .catch(console.error)

// pool
//   .then(() => console.log('Database connected successfully'))
//   .catch(err => console.log('failed to connect to the database', err))

//pool
//  .then(() => console.log('Database connected successfully'))
//  .catch(err => console.log('failed to connect to the database', err))

const first = async q => (await q)[0]
const exec = (query, params) => {
  console.log('SQL - ', { query, params })
  return first(pool.execute(query, params))
}

const exec1 = (query, params) => first(exec(`${query} LIMIT 1`, params))

// CRUD

// Users

const getUser = () => exec('SELECT * FROM user')

// Articles

const getArticles = async () => {
  const articles = await exec('SELECT * FROM articles ORDER BY date DESC')

  return articles.map(article => {
    article.tags = JSON.parse(article.tags)
    article.partners = JSON.parse(article.partners)
    try {
      article.content = JSON.parse(article.content)
    } catch (err) {
      article.content = []
      console.error('Unable to parse')
      console.log(article.content)
    }
    return article
  })
}

const readArticles = async () => {
  const articles = await exec('SELECT * FROM articles ORDER BY date DESC')

  return articles.map(article => {
    article.content = JSON.parse(article.content)
    article.tags = JSON.parse(article.tags)
    article.partners = JSON.parse(article.partners)
    return article
  })
}

readArticles.byId = async id => {
  const article = await exec1(`SELECT * FROM articles ORDER BY date DESC WHERE id=?`, [ id ])

  article.content = JSON.parse(article.content)
  article.tags = JSON.parse(article.tags)
  article.partners = JSON.parse(article.partners)
  return article
}

const writeArticle = article => exec(`
  INSERT INTO articles (section, title, date, client, place, type, headerImage, shortDescription, projectLink, hasStar, hasImage, tags, content, partners, isDraft)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [ article.section, article.title, article.date, article.client, article.place, article.type, article.headerImage, article.shortDescription, article.projectLink, article.hasStar, article.hasImage, JSON.stringify(article.tags), JSON.stringify(article.content), JSON.stringify(article.partners), article.isDraft ], console.log(article))

const updateArticle = article => exec(`
  UPDATE articles
  SET section=?, title=?, date=?, client=?, place=?, type=?, headerImage=?, shortDescription=?, projectLink=?, hasStar=?, hasImage=?, tags=?, content=?, partners=?, isDraft=?
  WHERE id=?`, [ article.section, article.title, article.date, article.client, article.place, article.type, article.headerImage, article.shortDescription, article.projectLink, article.hasStar, article.hasImage, JSON.stringify(article.tags), JSON.stringify(article.content), JSON.stringify(article.partners), article.isDraft, article.id ])

const deleteArticle = id => exec(`DELETE FROM articles WHERE id=?`, [ id ])

// Filters

const readFilters = () => exec('SELECT * FROM filters ORDER BY createdAt DESC')
readFilters.byId = id => exec1(`SELECT * FROM filters ORDER BY createdAt DESC WHERE id=?`, [ id ])

const getFilters = () => exec('SELECT * FROM filters ORDER BY createdAt DESC')

const writeFilter = filter => exec(`
  INSERT INTO filters (section, filterTag)
  VALUES (?, ?)`, [ filter.section, filter.filterTag ])

const updateFilter = filter => exec(`
  UPDATE filters
  SET section=?, filterTag=?
  WHERE id=?`, [ filter.section, filter.filterTag, filter.id ])

const deleteFilter = id => exec(`DELETE FROM filters WHERE id=?`, [ id ])

// Équipe members

const readMembers = () => exec('SELECT * FROM equipe ORDER BY createdAt DESC')
readMembers.byId = id => exec1(`SELECT * FROM equipe ORDER BY createdAt DESC WHERE id=?`, [ id ])

const getMembers = () => exec('SELECT * FROM equipe ORDER BY createdAt DESC')

const writeMember = member => exec(`
  INSERT INTO equipe (name, image, position, description, carreer, linkedIn)
  VALUES (?, ?, ?, ?, ?, ?)`, [ member.name, member.image, member.position, member.description, member.carreer, member.linkedIn ])

const updateMember = member => exec(`
  UPDATE equipe
  SET name=?, image=?, position=?, description=?, carreer=?, linkedIn=?
  WHERE id=?`, [ member.name, member.image, member.position, member.description, member.carreer, member.linkedIn, member.id ])

const deleteMember = id => exec(`DELETE FROM equipe WHERE id=?`, [ id ])

// Équipe thanks

const readThanks = () => exec('SELECT * FROM thanks ORDER BY createdAt DESC')
readThanks.byId = id => exec1(`SELECT * FROM thanks ORDER BY createdAt DESC WHERE id=?`, [ id ])

const getThanks = () => exec('SELECT * FROM thanks ORDER BY createdAt DESC')

const writeThank = thank => exec(`
  INSERT INTO thanks (name, url)
  VALUES (?, ?)`, [ thank.name, thank.url ])

const updateThank = thank => exec(`
  UPDATE thanks
  SET name=?, url=?
  WHERE id=?`, [ thank.name, thank.url, thank.id ])


const deleteThank = id => exec(`DELETE FROM thanks WHERE id=?`, [ id ])

// Partenaires

const readPartenaires = () => exec('SELECT * FROM partenaires ORDER BY createdAt DESC')
readPartenaires.byId = id => exec1(`SELECT * FROM partenaires ORDER BY createdAt DESC WHERE id=?`, [ id ])

const getPartenaires = () => exec('SELECT * FROM partenaires ORDER BY createdAt DESC')

const writePartenaire = partenaire => exec(`
  INSERT INTO partenaires (name, shortDescription, image)
  VALUES (?, ?, ?)`, [ partenaire.name, partenaire.shortDescription, partenaire.image ])

const updatePartenaire = partenaire => exec(`
  UPDATE partenaires
  SET name=?, shortDescription=?, image=?
  WHERE id=?`, [ partenaire.name, partenaire.shortDescription, partenaire.image, partenaire.id ])

const deletePartenaire = id => exec(`DELETE FROM partenaires WHERE id=?`, [ id ])

module.exports = {
  readArticles,
  getArticles,
  writeArticle,
  updateArticle,
  deleteArticle,
  readFilters,
  getFilters,
  writeFilter,
  updateFilter,
  deleteFilter,
  readMembers,
  getMembers,
  writeMember,
  updateMember,
  deleteMember,
  readThanks,
  getThanks,
  writeThank,
  updateThank,
  deleteThank,
  readPartenaires,
  getPartenaires,
  writePartenaire,
  updatePartenaire,
  deletePartenaire,
  getUser
}
