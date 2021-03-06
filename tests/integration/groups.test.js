import axios from 'axios';

import startApp from '../../src/app';
import { fakeGroup } from '../utils';
import Group from '../../src/models/group-model';

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
        expect(groups.map(x => x.name)).toContain(group.name);
      });
    }));

  it('can GET a single group', () =>
    Group.findOne()
      .exec()
      .then(group => api.get(`/groups/${group._id}`)) // eslint-disable-line no-underscore-dangle
      .then(({ data }) => {
        expect(data.data.id).toEqual(expect.any(String));
      }));

  it('can DELETE a single group', () =>
    Group.findOne()
      .exec()
      .then(group => api.delete(`/groups/${group._id}`)) // eslint-disable-line no-underscore-dangle
      .then(({ request, status }) => {
        const id = request.path.replace('/api/groups/', '');
        expect(status).toEqual(204);
        return Group.findById(id).exec();
      })
      .then(foundItem => expect(foundItem).toBeNull()));

  it('can POST a single group', () => {
    const groupToPersist = fakeGroup();
    return api
      .post('/groups', { data: groupToPersist })
      .then(({ data, status, headers }) => {
        const { id } = data.data;
        const urlMatch = new RegExp(`/groups/${id}$`);
        expect(status).toEqual(201);
        expect(headers.location).toMatch(urlMatch);
        return api.get(`/groups/${id}`);
      })
      .then(({ data }) => {
        expect(data.data).toMatchObject(groupToPersist);
      });
  });

  it('can PUT a single group', () => {
    const newName = `Foo-${Math.random()}`;
    const groupToPersist = fakeGroup();
    return api
      .post('/groups', { data: groupToPersist })
      .then(resp => {
        const { id } = resp.data.data;
        return api.get(`/groups/${id}`);
      })
      .then(({ data }) => {
        const group = data.data;
        expect(group).toMatchObject(groupToPersist);

        return api.put(`/groups/${group.id}`, {
          data: {
            ...data.attributes,
            id: group.id,
            name: newName,
          },
        });
      })
      .then(resp => {
        const { id } = resp.data.data;
        return api.get(`/groups/${id}`);
      })
      .then(({ data }) => {
        expect(data.data.name).toEqual(newName);
      });
  });

  it('fails with a bad request when no name is given', () =>
    api
      .post('/groups', { data: {} })
      .then(() => expect().toEqual('Should catch with error code'))
      .catch(({ response }) => {
        expect(response.status).toEqual(400);
        expect(response.data).toMatchObject({
          errors: expect.any(Array),
        });
        expect(response.data.errors[0]).toMatchObject({
          title: 'A group must have a name',
        });
      }));
});
