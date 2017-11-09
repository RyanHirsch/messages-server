import { getAll, getOneById } from '../queries/group-queries';
import GroupSerializer from '../serializers/group-serializer';

export function getAllHandler() {
  return getAll().then(groups => GroupSerializer.serialize(groups));
}

export function getHandler(id) {
  return getOneById(id).then(group => GroupSerializer.serialize(group));
}
