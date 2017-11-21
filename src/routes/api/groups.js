import express from 'express';
import * as Handlers from '../../handlers/groups-handler';

const route = express.Router();

route.get('/', (req, res) => {
  Handlers.getAllHandler().then(groups => res.json(groups));
});

route.get('/:id', (req, res) => {
  Handlers.getHandler(req.params.id).then(group => res.json(group));
});

route.post('/', (req, res, next) => {
  Handlers.postHandler(req.body)
    .then(group =>
      res
        .status(201)
        .location(`${req.baseUrl}/${group.data.id}`)
        .json(group)
    )
    .catch(next);
});

route.put('/:id', (req, res) => {
  Handlers.putHandler(req.params.id, req.body).then(group => res.json(group));
});

route.delete('/:id', (req, res) => {
  Handlers.deleteHandler(req.params.id).then(() => res.status(204).send());
});

export default route;
