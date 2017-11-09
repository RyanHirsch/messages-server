import express from 'express';
import { getAllHandler, getHandler } from '../../handlers/people-handler';

const route = express.Router();

route.get('/', (req, res) => {
  getAllHandler().then(people => res.json(people));
});

route.get('/:id', (req, res) => {
  getHandler(req.params.id).then(person => res.json(person));
});

export default route;
