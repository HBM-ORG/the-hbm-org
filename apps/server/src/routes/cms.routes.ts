/**
 * CMS Routes
 *
 * Route declarations only. Business logic lives in controllers/services.
 */

import { Router } from 'express';
import {
  deleteAutomationFlowController,
  getAutomationSettings,
  getEvents,
  getSiteContent,
  postBrevoTestListSubscription,
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
router.post('/brevo-test-list-subscription', postBrevoTestListSubscription);
router.delete('/automation-settings/flows/:id', deleteAutomationFlowController);

export default router;
