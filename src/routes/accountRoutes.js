import { Router } from "express";

const router = Router();

router.get("/balance", (request, response) => {
  response.json({
    balance: request.user.balance,
  });
});

export default router;
