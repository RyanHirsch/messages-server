import Person from '../models/person-model';

export function getAll(query) {
  return Person.find(query).exec();
}

export function getOne(query) {
  return Person.findOne(query).exec();
}

export function getOneById(id) {
  return getOne({ _id: id });
}
