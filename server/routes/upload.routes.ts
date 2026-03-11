/**
 * Upload Routes
 *
 * Route declarations only. Business logic lives in controllers/services.
 */

import { Router } from 'express';
import {
  deleteUpload,
  getStatus,
  signDownload,
  signUpload,
  viewUpload,
} from '../controllers/upload.controller.js';

const router = Router();

router.post('/sign', signUpload);
router.post('/sign-download', signDownload);
router.post('/delete', deleteUpload);
router.get('/status', getStatus);
router.get('/view', viewUpload);

export default router;
