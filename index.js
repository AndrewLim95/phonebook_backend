const express = require('express')
const app = express()
var morgan = require('morgan')

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

morgan.token('phonebook', (req, res) => {
  return `"Name": "${req.body.name}", "Number": "${req.body.number}"`;
});

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] :response-time ms {:phonebook}'));

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
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

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})