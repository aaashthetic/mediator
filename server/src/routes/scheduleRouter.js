import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import * as scheduleController from '../controllers/scheduleController.js';

const router = express.Router();

// Restful endpoints feeding the frontend Big Calendar hooks directly
router.route('/')
  .get(requireAuth, scheduleController.getSchedules)
  .post(requireAuth,scheduleController.createSchedule);

router.route('/:id')
  .delete(requireAuth, scheduleController.deleteSchedule);

export default router;