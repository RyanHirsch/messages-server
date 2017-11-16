import express from 'express';
import * as Handlers from '../../handlers/people-handler';

const route = express.Router();

route.get('/', (req, res) => {
  Handlers.getAllHandler().then(people => res.json(people));
});

route.get('/:id', (req, res) => {
  Handlers.getHandler(req.params.id).then(person => res.json(person));
});

route.post('/', (req, res) => {
  Handlers.postHandler(req.body).then(person =>
    res
      .status(201)
      .location(`${req.baseUrl}/${person.data.id}`)
      .json(person)
  );
});

export default route;
