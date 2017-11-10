import {
  Serializer as JSONAPISerializer,
  Deserializer as JSONAPIDeserializer,
} from 'jsonapi-serializer';

export default new JSONAPISerializer('users', {
  attributes: ['name'],
});

export function deserialize(obj) {
  return new JSONAPIDeserializer().deserialize(obj);
}
