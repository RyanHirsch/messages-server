import express from 'express';
import { getAllHandler, getHandler, postHandler } from '../../handlers/groups-handler';

const route = express.Router();

route.get('/', (req, res) => {
  getAllHandler().then(groups => res.json(groups));
});

route.get('/:id', (req, res) => {
  getHandler(req.params.id).then(group => res.json(group));
});

route.post('/', (req, res) => {
  postHandler(req.body).then(group =>
    res
      .status(201)
      .location(`${req.baseUrl}/${group.data.id}`)
      .json(group)
  );
});

export default route;
