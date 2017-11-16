import faker from 'faker';

import Group from '../src/models/group-model';
import Person from '../src/models/person-model';

export function fakeGroup() {
  return {
    name: `${faker.hacker.noun()}`,
  };
}

export function createFakeGroups(count) {
  const groups = [...Array(count)].map(fakeGroup);
  const testGroups = groups.map(model => new Group(model).save());
  return Promise.all(testGroups);
}

export function fakePerson() {
  return {
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  };
}

export function createFakePeople(count) {
  const people = [...Array(count)].map(fakePerson);
  const testPeople = people.map(model => new Person(model).save());
  return Promise.all(testPeople);
}
