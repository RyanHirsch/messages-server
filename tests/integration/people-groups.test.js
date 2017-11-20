import axios from 'axios';

import startApp from '../../src/app';
import Group from '../../src/models/group-model';
import Person from '../../src/models/person-model';
import { createFakePeople, createFakeGroups, fakePerson, fakeGroup } from '../utils';

describe('People-Groups Relationships', () => {
  const requestData = ({ data }) => data.data;
  let app;
  const port = Math.floor(Math.random() * 2000) + 3500;
  const api = axios.create({
    baseURL: `http://localhost:${port}/api`,
  });
  beforeAll(async () => {
    app = await startApp(port);
    await Group.remove().exec();
    await Person.remove().exec();
  });
  afterAll(() => {
    app.close();
  });

  it('can get a group then all people', async () => {
    const [p1, p2] = await createFakePeople(4);
    const [group] = await createFakeGroups(1);

    p1.groups.push(group);
    await p1.save();
    p2.groups.push(group);
    await p2.save();
    group.people.push(p1);
    group.people.push(p2);
    await group.save();

    const [firstGroup] = await api.get('/groups').then(requestData);
    expect(firstGroup.people).toEqual(expect.any(Array));
    expect(firstGroup.people).toEqual([p1.id, p2.id]);

    const people = await api.get(`/people?id=${firstGroup.people.join(',')}`).then(requestData);
    expect(people).toHaveLength(2);
    people.forEach(p => {
      expect(p.groups).toEqual(expect.any(Array));
      expect(p.groups).toContain(firstGroup.id);
    });
  });

  it('can create a person then a group with relationship', async () => {
    const newPerson = fakePerson();
    const newGroup = fakeGroup();
    const person = await api.post('/people', { data: newPerson }).then(requestData);
    const group = await api
      .post('/groups', { data: { ...newGroup, people: [person.id] } })
      .then(requestData);
    expect(group).toHaveProperty('people', [person.id]);
    const personWithGroup = await api.get(`/people/${person.id}`).then(requestData);
    expect(personWithGroup).toHaveProperty('groups', [group.id]);
  });

  it('can create a group then person with relationship', async () => {
    const newPerson = fakePerson();
    const newGroup = fakeGroup();
    const group = await api.post('/groups', { data: newGroup }).then(requestData);
    const person = await api
      .post('/people', { data: { ...newPerson, groups: [group.id] } })
      .then(requestData);
    expect(person).toHaveProperty('groups', [group.id]);
    const groupWithPerson = await api.get(`/groups/${group.id}`).then(requestData);
    expect(groupWithPerson).toHaveProperty('people', [person.id]);
  });

  it('can create a person then add to an existing group', async () => {
    const [group] = await createFakeGroups(1);
    const newPerson = fakePerson();

    const person = await api.post('/people', { data: newPerson }).then(requestData);
    const updatedPerson = await api
      .put(`/people/${person.id}`, { data: { ...person, groups: [group.id] } })
      .then(requestData);

    expect(updatedPerson).toHaveProperty('groups', [group.id]);
    const groupWithPerson = await api.get(`/groups/${group.id}`).then(requestData);
    expect(groupWithPerson).toHaveProperty('people', [person.id]);
  });

  it('can create a group then person with relationship, then remove them from the group', async () => {
    const newPerson = fakePerson();
    const newGroup = fakeGroup();
    const group = await api.post('/groups', { data: newGroup }).then(requestData);
    const person = await api
      .post('/people', { data: { ...newPerson, groups: [group.id] } })
      .then(requestData);
    expect(person).toHaveProperty('groups', [group.id]);
    const groupWithPerson = await api.get(`/groups/${group.id}`).then(requestData);
    expect(groupWithPerson).toHaveProperty('people', [person.id]);
    const personWithoutGroups = await api
      .put(`/people/${person.id}`, { data: { ...person, groups: [] } })
      .then(requestData);
    expect(personWithoutGroups).toHaveProperty('groups', []);
    const groupWithPeople = await api.get(`/groups/${group.id}`).then(requestData);
    expect(groupWithPeople).toHaveProperty('people', []);
  });

  it('can create a group with multiple existing people', async () => {
    const [p1, p2] = await createFakePeople(4);
    const newGroup = fakeGroup();
    const group = await api
      .post('/groups', { data: { ...newGroup, people: [p1.id, p2.id] } })
      .then(requestData);
    expect(group).toHaveProperty('people', [p1.id, p2.id]);

    const person1 = await api.get(`/people/${p1.id}`).then(requestData);
    expect(person1).toHaveProperty('groups', [group.id]);

    const person2 = await api.get(`/people/${p2.id}`).then(requestData);
    expect(person2).toHaveProperty('groups', [group.id]);
  });
});
