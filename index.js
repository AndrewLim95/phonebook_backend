const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

morgan.token('phonebook', (req, res) => {
  return `"Name": "${req.body.name}", "Number": "${req.body.number}"`;
});

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] :response-time ms {:phonebook}'));
app.use(cors())
app.use(express.static('build'))

let persons = [
  {
    id: 1,
    name: "Andrew",
    number: "9183"
  },
  {
   id: 2,
   name: "Bryan",
   number: "9184"
  }
]

app.get('/', (req, res) => {
  res.send('<h1>My Phone book app</h1>')
})

app.get('/info', (req, res) => {
    res.write(`<p>Phonebook has info for ${persons.length} people</p>`)
    res.write(`${new Date()}`)
  })
  
app.get('/api/persons', (req, res) => {
  res.json(persons)
})

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name && !body.number) {
    return response.status(400).json({ 
      error: 'name and number missing' 
    })
  }
  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }
  if (!body.number) {
    return response.status(400).json({ 
        error: 'number missing' 
      })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
    date: new Date(),
  }

  persons = persons.concat(person)

  response.json(person)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }

  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})