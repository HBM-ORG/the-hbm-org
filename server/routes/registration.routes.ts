/**
 * Registration Routes
 *
 * Route declarations only. Business logic lives in controllers/services.
 */

import { Router } from "express";
import { createRegistrationController } from "../controllers/registration.controller.js";
import type { TriggerAutomationByEvent } from "../services/registration.service.js";

type RegistrationRoutesDeps = {
  triggerAutomationByEvent: TriggerAutomationByEvent;
};

export function createRegistrationRoutes({
  triggerAutomationByEvent,
}: RegistrationRoutesDeps) {
  const router = Router();
  const controller = createRegistrationController({ triggerAutomationByEvent });

  router.post("/register", controller.register);
  router.post("/newsletter", controller.newsletter);
  router.post("/contact", controller.contact);
  router.get("/registrations", controller.list);
  router.delete("/registrations/:id", controller.remove);
  router.delete("/registrations/by-contact", controller.removeByContact);
  router.get("/registrations/stats", controller.stats);

  return router;
}
