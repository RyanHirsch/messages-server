import { create, deleteById, getAll, getOneById, update } from '../queries/group-queries';
import groupSerializer from '../serializers/generic-serializer';

export function getAllHandler() {
  return getAll().then(groupSerializer);
}

export function getHandler(id) {
  return getOneById(id).then(groupSerializer);
}

export function postHandler(newGroup) {
  if (newGroup.data && newGroup.data.name) {
    return create(newGroup.data).then(groupSerializer);
  }
  const err = new Error('A group must have a name');
  err.statusCode = 400;
  return Promise.reject(err);
}

export function putHandler(id, updatedGroup) {
  return update(id, updatedGroup.data).then(groupSerializer);
}

export function deleteHandler(id) {
  return deleteById(id);
}
