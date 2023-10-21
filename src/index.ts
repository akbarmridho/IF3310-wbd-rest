import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import {errorHandler} from './middlewares/errorHandler';
import {validationErrorHandler} from './middlewares/validationErrorHandler';
import {unauthorizedErrorHandler} from './middlewares/unauthorizedErrorHandler';
import {pageNotFound} from './controllers/pageNotFound';
import helloRouter from './routes/hello';
import streamRouter from './routes/stream';
import uploaderRouter from './routes/uploader';
import {db, postgresClient} from './database/db';
import {migrate} from 'drizzle-orm/node-postgres/migrator';

require('express-async-errors');

async function main() {
  // connect client
  await postgresClient.connect();

  await migrate(db, {
    migrationsFolder: 'drizzle',
  });

  console.log('Migration success');

  // migrate db
  const app = express();
  const port: number =
    process.env.PORT === undefined ? 8080 : parseInt(process.env.PORT);

  app.use(helmet());
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

  app.use('/', helloRouter);
  app.use('/', streamRouter);
  app.use('/', uploaderRouter);

  // not found handler
  app.use(pageNotFound);

  // error handlers
  app.use(unauthorizedErrorHandler);
  app.use(validationErrorHandler);
  app.use(errorHandler);

  const server = app.listen(port, () => {
    console.log(`Listwibuku rest service listening on port ${port}`);
  });

  process.on('SIGINT', () => {
    server.close();
  });
}

void main();
