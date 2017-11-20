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

function addUserToGroups(groups = [], user) {
  return Promise.all(
    groups.map(g =>
      Group.findById(g)
        .exec()
        .then(group => {
          group.people.push(user);
          return group.save();
        })
    )
  ).then(() => user);
}

function removeUserFromGroups(groups = [], user) {
  return Promise.all(
    groups.map(g =>
      Group.findById(g)
        .exec()
        .then(group => {
          group.people.pull(user);
          return group.save();
        })
    )
  ).then(() => user);
}

export function create(person) {
  return new Person(person).save().then(savedPerson => addUserToGroups(person.groups, savedPerson));
}

export function update(id, person) {
  return getOneById(id)
    .then(original =>
      Promise.all([original, Person.findOneAndUpdate({ _id: id }, person, { new: true }).exec()])
    )
    .then(([original, updated]) => {
      const toAdd = original.groups.reduce((add, g) => add.filter(x => x !== g), [
        ...updated.groups,
      ]);
      const toRemove = updated.groups.reduce((remove, g) => remove.filter(x => x !== g), [
        ...original.groups,
      ]);

      return Promise.all([
        addUserToGroups(toAdd, updated),
        removeUserFromGroups(toRemove, updated),
      ]).then(([p]) => p);
    });
}

export function deleteById(id) {
  return Person.findByIdAndRemove(id).exec();
}
