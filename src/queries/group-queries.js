import Group from '../models/group-model';

export function getAll(query) {
  return Group.find(query).exec();
}

export function getOne(query) {
  return Group.findOne(query).exec();
}

export function getOneById(id) {
  return getOne({ _id: id });
}

export function create(group) {
  return new Group(group).save();
}
