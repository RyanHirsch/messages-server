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

export function create(group) {
  return new Group(group).save().then(savedGroup =>
    Promise.all(
      (group.people || []).map(p =>
        Person.findById(p)
          .exec()
          .then(person => {
            person.groups.push(savedGroup);
            return person.save();
          })
      )
    ).then(() => savedGroup)
  );
}

export function update(id, group) {
  return Group.findOneAndUpdate({ _id: id }, group, { new: true })
    .exec()
    .then(result => result);
}

export function deleteById(id) {
  return Group.findByIdAndRemove(id).exec();
}
