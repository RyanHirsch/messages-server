import axios from 'axios';
import faker from 'faker';

import startApp from '../../src/app';
import Group from '../../src/models/group-model';
import GroupSerializer from '../../src/serializers/group-serializer';

function fakeGroup() {
  return {
    name: `${faker.hacker.noun()}`,
  };
}

describe('Acceptance: /api/groups', () => {
  let app;
  const port = Math.floor(Math.random() * 2000) + 3500;
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

  it('can POST a single group', () => {
    const groupToPersist = fakeGroup();
    return api
      .post('/groups', GroupSerializer.serialize(groupToPersist))
      .then(resp => {
        const { id } = resp.data.data;
        const urlMatch = new RegExp(`/groups/${id}$`);
        expect(resp.status).toEqual(201);
        expect(resp.headers.location).toMatch(urlMatch);
        return api.get(`/groups/${id}`);
      })
      .then(({ data }) => {
        expect(data.data.attributes).toEqual(groupToPersist);
      });
  });

  it('can PUT a single group', () => {
    const newName = `Foo-${Math.random()}`;
    const groupToPersist = fakeGroup();
    return api
      .post('/groups', GroupSerializer.serialize(groupToPersist))
      .then(resp => {
        const { id } = resp.data.data;
        return api.get(`/groups/${id}`);
      })
      .then(({ data }) => {
        const { id, attributes } = data.data;
        expect(attributes).toEqual(groupToPersist);

        return api.put(`/groups/${id}`, {
          data: {
            ...data.attributes,
            id,
            name: newName,
          },
        });
      })
      .then(resp => {
        const { id } = resp.data.data;
        return api.get(`/groups/${id}`);
      })
      .then(({ data }) => {
        const { attributes } = data.data;
        expect(attributes.name).toEqual(newName);
      });
  });
});
