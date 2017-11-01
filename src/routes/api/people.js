import express from 'express';
import { getAll, getOneById } from '../../queries/person-queries';
import PersonSerializer from '../../serializers/person-serializer';

const route = express.Router();

route.get('/', (req, res) => {
  getAll().then(people => {
    res.json(PersonSerializer.serialize(people));
  });
});

route.get('/:id', (req, res) => {
  getOneById(req.params.id).then(person => {
    res.json(PersonSerializer.serialize(person));
  });
});

export default route;
