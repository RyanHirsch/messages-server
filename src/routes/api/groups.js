import express from 'express';
import { getAll, getOneById } from '../../queries/group-queries';
import GroupSerializer from '../../serializers/group-serializer';

const route = express.Router();

route.get('/', (req, res) => {
  getAll().then(groups => {
    res.json(GroupSerializer.serialize(groups));
  });
});

route.get('/:id', (req, res) => {
  getOneById(req.params.id).then(group => {
    res.json(GroupSerializer.serialize(group));
  });
});

export default route;
