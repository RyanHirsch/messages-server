import Group from '../models/group-model';
import Person from '../models/person-model';

export function getAll(query) {
  return Group.find(query).exec();
}

export function getOne(query) {
  return Group.findOne(query).exec();
}

export function getOneById(id) {
  return getOne({ _id: id });
}

export function getByIds(ids) {
  return getAll({ _id: { $in: ids } });
}

function addGroupToPeople(people = [], group) {
  return Promise.all(
    people.map(p =>
      Person.findById(p)
        .exec()
        .then(person => {
          person.groups.push(group);
          return person.save();
        })
    )
  ).then(() => group);
}

function removeGroupFromPeople(people = [], group) {
  return Promise.all(
    people.map(p =>
      Person.findById(p)
        .exec()
        .then(person => {
          person.groups.pull(group);
          return person.save();
        })
    )
  ).then(() => group);
}
export function create(group) {
  return new Group(group).save().then(savedGroup => addGroupToPeople(group.people, savedGroup));
}

export function update(id, group) {
  return getOneById(id)
    .then(original =>
      Promise.all([original, Group.findOneAndUpdate({ _id: id }, group, { new: true }).exec()])
    )
    .then(([original, updated]) => {
      const toAdd = original.people.reduce((add, p) => add.filter(x => x !== p), [
        ...updated.people,
      ]);
      const toRemove = updated.people.reduce((remove, p) => remove.filter(x => x !== p), [
        ...original.people,
      ]);

      return Promise.all([
        addGroupToPeople(toAdd, updated),
        removeGroupFromPeople(toRemove, updated),
      ]).then(([g]) => g);
    });
}

export function deleteById(id) {
  return Promise.all([getOneById(id), Person.find({ groups: id }).exec()])
    .then(([group, people]) => [group, removeGroupFromPeople(people, group)])
    .then(([group]) => group.remove());
}
