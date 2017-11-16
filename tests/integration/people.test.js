import axios from 'axios';
import faker from 'faker';

import startApp from '../../src/app';
import Person from '../../src/models/person-model';

function fakePerson() {
  return {
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  };
}

describe('Acceptance: /api/people', () => {
  let app;
  const port = Math.floor(Math.random() * 2000) + 3500;
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
    api.get('/people').then(({ data }) => {
      expect(data).toEqual(expect.any(Object));
      expect(data.data).toEqual(expect.any(Array));
    }));

  it('can GET all people', () =>
    api.get('/people').then(({ data }) => {
      expect(data.data.length).toEqual(testSize);
      data.data.forEach(person => {
        expect(people.map(x => x.name)).toContain(person.name);
      });
    }));

  it('can GET a single person', () =>
    Person.findOne()
      .exec()
      .then(person => api.get(`/people/${person._id}`)) // eslint-disable-line no-underscore-dangle
      .then(({ data }) => {
        expect(data.data.id).toEqual(expect.any(String));
      }));

  it('can POST a single person', () => {
    const personToPersist = fakePerson();
    return api
      .post('/people', { data: personToPersist })
      .then(({ data, status, headers }) => {
        const { id } = data.data;
        const urlMatch = new RegExp(`/people/${id}$`);
        expect(status).toEqual(201);
        expect(headers.location).toMatch(urlMatch);
        return api.get(`/people/${id}`);
      })
      .then(({ data }) => {
        expect(data.data).toMatchObject(personToPersist);
      });
  });
});
