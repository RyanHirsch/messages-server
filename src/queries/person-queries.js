import Person from '../models/person-model';
import Group from '../models/group-model';

export function getAll(query) {
  return Person.find(query).exec();
}

export function getOne(query) {
  return Person.findOne(query).exec();
}

export function getOneById(id) {
  return getOne({ _id: id });
}

export function getByIds(ids) {
  return getAll({ _id: { $in: ids } });
}

export function create(person) {
  return new Person(person).save().then(savedPerson =>
    Promise.all(
      (person.groups || []).map(g =>
        Group.findById(g)
          .exec()
          .then(group => {
            group.people.push(savedPerson);
            return group.save();
          })
      )
    ).then(() => savedPerson)
  );
}

export function update(id, person) {
  return getOneById(id)
    .then(original =>
      Promise.all([original, Person.findOneAndUpdate({ _id: id }, person, { new: true }).exec()])
    )
    .then(([original, updated]) => {
      console.log({ original, updated });
    });
}

export function deleteById(id) {
  return Person.findByIdAndRemove(id).exec();
}
