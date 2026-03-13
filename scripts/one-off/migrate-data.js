import { eventsConfig } from '../../apps/site/src/data/eventsConfig.js';
import fs from 'fs';
import path from 'path';

const data = JSON.stringify(eventsConfig, null, 2);
fs.writeFileSync('./apps/site/public/data/events.json', data);
console.log('Migrated events to apps/site/public/data/events.json');
