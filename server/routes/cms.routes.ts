/**
 * CMS Routes
 *
 * Route declarations only. Business logic lives in controllers/services.
 */

import { Router } from 'express';
import {
  getAutomationSettings,
  getEvents,
  getSiteContent,
  saveAutomationSettings,
  saveEvents,
  saveSiteContent,
} from '../controllers/cms.controller.js';

const router = Router();

router.get('/events', getEvents);
router.post('/save-events', saveEvents);
router.get('/site-content', getSiteContent);
router.post('/site-content', saveSiteContent);
router.get('/automation-settings', getAutomationSettings);
router.post('/automation-settings', saveAutomationSettings);

export default router;
