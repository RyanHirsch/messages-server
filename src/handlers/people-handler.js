import { getAll, getOneById } from '../queries/person-queries';
import PersonSerializer from '../serializers/person-serializer';

export function getAllHandler() {
  return getAll().then(people => PersonSerializer.serialize(people));
}
export function getHandler(id) {
  return getOneById(id).then(person => PersonSerializer.serialize(person));
}
