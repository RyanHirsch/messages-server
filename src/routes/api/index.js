import express from 'express';
import people from './people';
import groups from './groups';

const route = express.Router();

route.use('/people', people);
route.use('/groups', groups);
route.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  if (err && err.statusCode) {
    res.status(err.statusCode).json({
      errors: [
        {
          status: err.statusCode,
          title: err.message,
        },
      ],
    });
  }
});

export default route;
