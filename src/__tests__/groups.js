import request from 'supertest';
import faker from 'faker';

import app from '../../src/app';
import Group from '../../src/models/group-model';
import db from '../../src/db';

function fakeGroup() {
  return {
    name: `${faker.hacker.noun()}`,
  };
}

describe('Acceptance: /api/groups', () => {
  const testSize = 2;
  const groups = [...Array(testSize)].map(fakeGroup);
  beforeAll(() =>
    Group.remove()
      .exec()
      .then(() => {
        const testGroups = groups.map(model => new Group(model).save());
        return Promise.all(testGroups);
      })
  );

  afterAll(() => {
    db.close();
  });

  it('returns expected shape', () =>
    request(app)
      .get('/api/groups')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(resp => {
        expect(resp.body).toEqual(expect.any(Object));
        expect(resp.body.data).toEqual(expect.any(Array));
      }));

  it('can GET all groups', () =>
    request(app)
      .get('/api/groups')
      .then(resp => {
        expect(resp.body.data.length).toEqual(testSize);
        resp.body.data.forEach(group => {
          expect(groups.map(x => x.name)).toContain(group.attributes.name);
        });
      }));

  it('can GET a single group', () =>
    Group.findOne()
      .exec()
      .then(group => request(app).get(`/api/groups/${group._id}`)) // eslint-disable-line no-underscore-dangle
      .then(resp => {
        expect(resp.body.data.id).toEqual(expect.any(String));
      }));
});
