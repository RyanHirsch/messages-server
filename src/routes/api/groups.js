import express from 'express';
import { getAllHandler, getHandler } from '../../handlers/groups-handler';

const route = express.Router();

route.get('/', (req, res) => {
  getAllHandler().then(groups => res.json(groups));
});

route.get('/:id', (req, res) => {
  getHandler(req.params.id).then(group => res.json(group));
});

export default route;
