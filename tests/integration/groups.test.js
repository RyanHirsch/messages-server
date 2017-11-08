import axios from 'axios';
import faker from 'faker';

import startApp from '../../src/app';
import config from '../../src/config';
import Group from '../../src/models/group-model';

function fakeGroup() {
  return {
    name: `${faker.hacker.noun()}`,
  };
}

describe('Acceptance: /api/groups', () => {
  let app;
  const { port } = config;
  const api = axios.create({
    baseURL: `http://localhost:${port}/api`,
  });
  const testSize = 2;
  const groups = [...Array(testSize)].map(fakeGroup);
  beforeAll(async () => {
    app = await startApp(port);
    await Group.remove()
      .exec()
      .then(() => {
        const testGroups = groups.map(model => new Group(model).save());
        return Promise.all(testGroups);
      });
  });

  afterAll(() => {
    app.close();
  });

  it('returns expected shape', () =>
    api.get('/groups').then(response => {
      expect(response.data).toEqual(expect.any(Object));
      expect(response.data.data).toEqual(expect.any(Array));
    }));

  it('can GET all groups', () =>
    api.get('/groups').then(response => {
      expect(response.data.data.length).toEqual(testSize);
      response.data.data.forEach(group => {
        expect(groups.map(x => x.name)).toContain(group.attributes.name);
      });
    }));

  it('can GET a single group', () =>
    Group.findOne()
      .exec()
      .then(group => api.get(`/groups/${group._id}`)) // eslint-disable-line no-underscore-dangle
      .then(({ data }) => {
        expect(data.data.id).toEqual(expect.any(String));
      }));
});
