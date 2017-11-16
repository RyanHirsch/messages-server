import axios from 'axios';

import startApp from '../../src/app';
import Person from '../../src/models/person-model';
import { fakePerson } from '../utils';

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

  it('can DELETE a single group', () =>
    Person.findOne()
      .exec()
      .then(person => api.delete(`/people/${person._id}`)) // eslint-disable-line no-underscore-dangle
      .then(({ request, status }) => {
        const id = request.path.replace('/api/people/', '');
        expect(status).toEqual(204);
        return Person.findById(id).exec();
      })
      .then(foundItem => expect(foundItem).toBeNull()));
  it('can PUT a single person', () => {
    const newName = `Foo-${Math.random()}`;
    const personToPersist = fakePerson();
    return api
      .post('/people', { data: personToPersist })
      .then(resp => {
        const { id } = resp.data.data;
        return api.get(`/people/${id}`);
      })
      .then(({ data }) => {
        const person = data.data;
        expect(person).toMatchObject(personToPersist);

        return api.put(`/people/${person.id}`, {
          data: {
            ...data.attributes,
            id: person.id,
            name: newName,
          },
        });
      })
      .then(resp => {
        const { id } = resp.data.data;
        return api.get(`/people/${id}`);
      })
      .then(({ data }) => {
        expect(data.data.name).toEqual(newName);
      });
  });
});
