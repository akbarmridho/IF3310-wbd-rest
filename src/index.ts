import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import {errorHandler} from './middlewares/errorHandler';
import {validationErrorHandler} from './middlewares/validationErrorHandler';
import {unauthorizedErrorHandler} from './middlewares/unauthorizedErrorHandler';
import {pageNotFound} from './controllers/pageNotFound';
import animeRouter from './routes/anime';
import episodeRouter from './routes/episode';
import uploaderRouter from './routes/uploader';
import usersRouter from './routes/users';
import {db} from './database/db';
import {migrate} from 'drizzle-orm/postgres-js/migrator';
import helmet from 'helmet';
import cors from 'cors';

require('express-async-errors');

async function main() {
  // migrate db
  await migrate(db, {
    migrationsFolder: 'drizzle',
  });

  const app = express();
  const port: number =
    process.env.PORT === undefined ? 3000 : parseInt(process.env.PORT);

  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },
    })
  );

  app.use(
    // fuck cors
    cors({
      credentials: true,
      origin(_, callback) {
        callback(null, true);
      },
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  app.use(cookieParser());

  app.use(
    morgan('combined', {
      skip: (req, res): boolean => {
        if (process.env.NODE_ENV === 'production') {
          if (res.statusCode < 400) {
            return true;
          }
        }

        return false;
      },
    })
  );

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.use('/', usersRouter);
  app.use('/anime', animeRouter);
  // jgn diganti prefixnya
  app.use('/anime', episodeRouter);
  app.use('/', uploaderRouter);

  // not found handler
  app.use(pageNotFound);

  // error handlers
  app.use(unauthorizedErrorHandler);
  app.use(validationErrorHandler);
  app.use(errorHandler);

  const server = app.listen(port, () => {
    console.log(`Wibu Watch rest service listening on port ${port}`);
  });

  process.on('SIGINT', () => {
    server.close();
  });
}

void main();
