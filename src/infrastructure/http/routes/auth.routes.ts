import { Router } from 'express';
import { z } from 'zod';
import { AuthService } from '../../../application/use-cases/AuthService';

const LoginBody = z.object({ customerId: z.string(), password: z.string() });
const RefreshBody = z.object({ refreshToken: z.string() });

export const authRouter = (auth: AuthService): Router => {
  const router = Router();

  router.post('/login', async (req, res) => {
    const { customerId, password } = LoginBody.parse(req.body);
    res.json(await auth.login(customerId, password));
  });

  router.post('/refresh', (req, res) => {
    res.json(auth.refresh(RefreshBody.parse(req.body).refreshToken));
  });

  router.post('/logout', (req, res) => {
    auth.logout(RefreshBody.parse(req.body).refreshToken);
    res.status(204).end();
  });

  return router;
};
