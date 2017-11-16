import axios from 'axios';

import startApp from '../../src/app';
import Group from '../../src/models/group-model';
import Person from '../../src/models/person-model';
import { createFakePeople, createFakeGroups } from '../utils';

describe('People-Groups Relationships', () => {
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

    const [firstGroup] = await api.get('/groups').then(({ data }) => data.data);
    expect(firstGroup.people).toEqual(expect.any(Array));
    expect(firstGroup.people).toEqual([p1.id, p2.id]);

    const people = await api
      .get(`/people?id=${firstGroup.people.join(',')}`)
      .then(({ data }) => data.data);
    expect(people).toHaveLength(2);
    people.forEach(p => {
      expect(p.groups).toEqual(expect.any(Array));
      expect(p.groups).toContain(firstGroup.id);
    });
  });
  it('can create a person then group with relationship');
  it('can create a person then add to an existing group');
});
