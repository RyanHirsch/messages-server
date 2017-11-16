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

export function create(person) {
  return new Person(person).save();
}

export function update(id, person) {
  return Person.findOneAndUpdate({ _id: id }, person, { new: true })
    .exec()
    .then(result => result);
}

export function deleteById(id) {
  return Person.findByIdAndRemove(id).exec();
}
