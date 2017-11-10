import {
  Serializer as JSONAPISerializer,
  Deserializer as JSONAPIDeserializer,
} from 'jsonapi-serializer';

export default new JSONAPISerializer('users', {
  attributes: ['name'],
});

export function deserializer(obj) {
  return new Promise((resolve, reject) =>
    new JSONAPIDeserializer().deserialize(obj, (err, groups) => {
      console.log(groups);
      if (err) {
        return reject(err);
      }
      return resolve(groups);
    })
  );
}
