import { eventsConfig } from '../../apps/client/src/data/eventsConfig.js';
import fs from 'fs';
import path from 'path';

const data = JSON.stringify(eventsConfig, null, 2);
fs.writeFileSync('./apps/client/public/data/events.json', data);
console.log('Migrated events to apps/client/public/data/events.json');
