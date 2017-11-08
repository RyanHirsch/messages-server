import axios from 'axios';
import faker from 'faker';

import startApp from '../../src/app';
import config from '../../src/config';
import Person from '../../src/models/person-model';

function fakePerson() {
  return {
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  };
}

describe('Acceptance: /api/people', () => {
  let app;
  const { port } = config;
  const api = axios.create({
    baseURL: `http://localhost:${port}/api`,
  });
  const testSize = 4;
  const people = [...Array(testSize)].map(fakePerson);
  beforeAll(async () => {
    app = await startApp(port);
    await Person.remove()
      .exec()
      .then(() => {
        const testPeople = people.map(model => new Person(model).save());
        return Promise.all(testPeople);
      });
  });

  afterAll(done => {
    app.close(done);
  });

  it('returns expected shape', () =>
    api.get('/people').then(resp => {
      expect(resp.data).toEqual(expect.any(Object));
      expect(resp.data.data).toEqual(expect.any(Array));
    }));

  it('can GET all people', () =>
    api.get('/people').then(resp => {
      expect(resp.data.data.length).toEqual(testSize);
      resp.data.data.forEach(person => {
        expect(people.map(x => x.name)).toContain(person.attributes.name);
      });
    }));

  it('can GET a single person', () =>
    Person.findOne()
      .exec()
      .then(person => api.get(`/people/${person._id}`)) // eslint-disable-line no-underscore-dangle
      .then(resp => {
        expect(resp.data.data.id).toEqual(expect.any(String));
      }));
});
