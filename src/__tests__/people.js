import request from 'supertest';
import faker from 'faker';

import db from '../../src/db';
import app from '../../src/app';
import Person from '../../src/models/person-model';

function fakePerson() {
  return {
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  };
}

describe('Acceptance: /api/people', () => {
  const testSize = 4;
  const people = [...Array(testSize)].map(fakePerson);
  beforeAll(() =>
    Person.remove()
      .exec()
      .then(() => {
        const testPeople = people.map(model => new Person(model).save());
        return Promise.all(testPeople);
      })
  );

  afterAll(() => {
    db.close();
  });

  it('returns expected shape', () =>
    request(app)
      .get('/api/people')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(resp => {
        expect(resp.body).toEqual(expect.any(Object));
        expect(resp.body.data).toEqual(expect.any(Array));
      }));

  it('can GET all people', () =>
    request(app)
      .get('/api/people')
      .then(resp => {
        expect(resp.body.data.length).toEqual(testSize);
        resp.body.data.forEach(person => {
          expect(people.map(x => x.name)).toContain(person.attributes.name);
        });
      }));

  it('can GET a single person', () =>
    Person.findOne()
      .exec()
      .then(person => request(app).get(`/api/people/${person._id}`)) // eslint-disable-line no-underscore-dangle
      .then(resp => {
        expect(resp.body.data.id).toEqual(expect.any(String));
      }));
});
