import { eventsConfig } from './src/data/eventsConfig.js';
import fs from 'fs';
import path from 'path';

const data = JSON.stringify(eventsConfig, null, 2);
fs.writeFileSync('./public/data/events.json', data);
console.log('Migrated events to public/data/events.json');
