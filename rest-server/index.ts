import express from 'express';
import { readFile } from 'fs/promises';
import { Talk } from './types';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.get('/talks', async (req, res) => {
  const data = await readFile('./talks.json', { encoding: 'utf8' });
  const talks: Talk[] = JSON.parse(data);
  res.send(talks);
});

app.listen(3000);
