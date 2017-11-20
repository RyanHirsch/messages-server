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

function addPersonToGroups(groups = [], person) {
  return Promise.all(
    groups.map(g =>
      Group.findById(g)
        .exec()
        .then(group => {
          group.people.push(person);
          return group.save();
        })
    )
  ).then(() => person);
}

function removePersonFromGroups(groups = [], person) {
  return Promise.all(
    groups.map(g =>
      Group.findById(g)
        .exec()
        .then(group => {
          group.people.pull(person);
          return group.save();
        })
    )
  ).then(() => person);
}

export function create(person) {
  return new Person(person)
    .save()
    .then(savedPerson => addPersonToGroups(person.groups, savedPerson));
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
        addPersonToGroups(toAdd, updated),
        removePersonFromGroups(toRemove, updated),
      ]).then(([p]) => p);
    });
}

export function deleteById(id) {
  return Promise.all([getOneById(id), Group.find({ people: id }).exec()])
    .then(([person, groups]) => [person, removePersonFromGroups(groups, person)])
    .then(([person]) => person.remove());
}
