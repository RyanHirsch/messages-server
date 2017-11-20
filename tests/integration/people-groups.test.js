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

  it('can update a group with a person', async () => {
    const [p1] = await createFakePeople(4);
    const newGroup = fakeGroup();
    const group = await api.post('/groups', { data: newGroup }).then(requestData);
    expect(group).toHaveProperty('people', []);

    const groupWithPerson = await api
      .put(`/groups/${group.id}`, { data: { ...group, people: [p1.id] } })
      .then(requestData);
    expect(groupWithPerson).toHaveProperty('people', [p1.id]);

    const person1 = await api.get(`/people/${p1.id}`).then(requestData);
    expect(person1).toHaveProperty('groups', [group.id]);
  });

  it('can update a group to remove a person', async () => {
    const [p1] = await createFakePeople(1);
    const newGroup = fakeGroup();
    const group = await api
      .post('/groups', { data: { ...newGroup, groups: [p1.id] } })
      .then(requestData);
    expect(group).toHaveProperty('people', [p1.id], 'Person ID is available through the group');

    const person1 = await api.get(`/people/${p1.id}`).then(requestData);
    expect(person1).toHaveProperty('groups', [group.id], 'Group ID is associated with the person');

    const groupWithPerson = await api
      .put(`/groups/${group.id}`, { data: { ...group, people: [] } })
      .then(requestData);
    expect(groupWithPerson).toHaveProperty('people', [], 'Empty People after update');
  });

  it('deleting a group updates the related person', async () => {
    const [p1] = await createFakePeople(1);
    const [g1] = await createFakeGroups(1);

    p1.groups.push(g1);
    await p1.save();
    g1.people.push(p1);
    await g1.save();

    const group = await api.get(`/groups/${g1.id}`).then(requestData);
    expect(group.people).toEqual([p1.id]);

    await api.delete(`/groups/${g1.id}`);
    const person = await api.get(`/people/${p1.id}`).then(requestData);
    expect(person.groups).toEqual([]);
  });

  it('deleting a person updates the related group', async () => {
    const [p1] = await createFakePeople(1);
    const [g1] = await createFakeGroups(1);

    p1.groups.push(g1);
    await p1.save();
    g1.people.push(p1);
    await g1.save();

    const person = await api.get(`/people/${p1.id}`).then(requestData);
    expect(person.groups).toEqual([g1.id]);

    await api.delete(`/people/${p1.id}`);
    const group = await api.get(`/groups/${g1.id}`).then(requestData);
    expect(group.people).toEqual([]);
  });
});
