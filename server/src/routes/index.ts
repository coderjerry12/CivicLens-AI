import { Router } from 'express';
import healthRouter from './health.js';

const router = Router();

router.use(healthRouter);

// Future feature routes will be registered here:
// router.use('/issues', issuesRouter);
// router.use('/users', usersRouter);
// router.use('/ai', aiRouter);

export default router;
