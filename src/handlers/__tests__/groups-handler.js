import { getHandler, getAllHandler } from '../groups-handler';
import { getOneById, getAll } from '../../queries/group-queries';

jest.mock('../../queries/group-queries', () => ({
  getOneById: jest.fn(() => Promise.resolve({ _id: 'as' })),
  getAll: jest.fn(() => Promise.resolve([])),
}));

describe('Groups API handlers', () => {
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
