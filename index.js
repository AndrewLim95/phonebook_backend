require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('phonebook', (request, response) => {
  return `"Name": "${request.body.name}", "Number": "${request.body.number}"`;
})

// handler of requests with result to errors
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } 

  next(error)
}

// handler of requests with unknown endpoint (unsupported routes)
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler for json parser should be the first middleware loaded
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] :response-time ms {:phonebook}'));
app.use(cors())
app.use(express.static('build'))

app.get('/info', (request, response) => {
  Person.countDocuments({})
  .then (count => {
    response.write(`<p>Phonebook has info for ${count} people</p>`)
    response.write(`${new Date()}`)
    response.end()
  })
  .catch(error => next(error))
})
  
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})


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
  const person = new Person({
    name: body.name,
    number: body.number,
    date: new Date()
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })

})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
    date: new Date()
  }

  Person.findByIdAndUpdate(
    request.params.id, 
    person,
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})