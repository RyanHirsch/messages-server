import { create, deleteById, getAll, getOneById, update } from '../queries/group-queries';
import GroupSerializer, { deserialize } from '../serializers/group-serializer';

export function getAllHandler() {
  return getAll().then(groups => GroupSerializer.serialize(groups));
}

export function getHandler(id) {
  return getOneById(id).then(group => GroupSerializer.serialize(group));
}

export function postHandler(newGroup) {
  return deserialize(newGroup)
    .then(create)
    .then(group => GroupSerializer.serialize(group));
}

export function putHandler(id, updatedGroup) {
  return update(id, updatedGroup.data).then(group => GroupSerializer.serialize(group));
}

export function deleteHandler(id) {
  return deleteById(id);
}
