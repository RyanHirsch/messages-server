import { getAll, getOneById } from '../queries/person-queries';
import personSerializer from '../serializers/generic-serializer';

export function getAllHandler() {
  return getAll().then(people => personSerializer(people));
}
export function getHandler(id) {
  return getOneById(id).then(person => personSerializer(person));
}
