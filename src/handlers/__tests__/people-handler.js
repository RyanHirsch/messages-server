import { getHandler, getAllHandler } from '../people-handler';
import { getOneById, getAll } from '../../queries/person-queries';

jest.mock('../../queries/person-queries', () => ({
  getOneById: jest.fn(() => Promise.resolve({ _id: 'as' })),
  getAll: jest.fn(() => Promise.resolve([])),
}));

describe('People API handlers', () => {
  describe('get one', () => {
    it('passes through an id to query for', () => {
      const id = 'asdf';
      return getHandler(id).then(() => {
        expect(getOneById).toHaveBeenCalledTimes(1);
        expect(getOneById).toHaveBeenCalledWith(id);
      });
    });
  });
  describe('get all', () => {
    it('calls getAll query', () =>
      getAllHandler().then(() => {
        expect(getAll).toHaveBeenCalledTimes(1);
        expect(getAll).toHaveBeenCalledWith();
      }));
  });
});
