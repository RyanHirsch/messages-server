import {
  create,
  deleteById,
  getAll,
  getByIds,
  getOneById,
  update,
} from '../queries/person-queries';
import personSerializer from '../serializers/generic-serializer';

export function getAllHandler(query) {
  if (query && query.id) {
    return getByIds(query.id.split(',')).then(people => personSerializer(people));
  }
  return getAll().then(people => personSerializer(people));
}
export function getHandler(id) {
  return getOneById(id).then(person => personSerializer(person));
}

export function postHandler(newPerson) {
  return create(newPerson.data).then(person => personSerializer(person));
}

export function putHandler(id, updatedPerson) {
  return update(id, updatedPerson.data).then(personSerializer);
}

export function deleteHandler(id) {
  return deleteById(id);
}
