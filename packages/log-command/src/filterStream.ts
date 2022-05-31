import { Transform } from 'stream';

export const createFilterStream = (filter: (chunk: string) => string) =>
  new Transform({
    transform: (chunk, _, next) => {
      const result = filter(chunk.toString());
      if (result !== '') {
        next(null, result);
      } else {
        next();
      }
    },
  });
