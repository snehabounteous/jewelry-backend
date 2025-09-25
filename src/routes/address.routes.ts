import { Router } from "express";
import * as addressController from "../controller/address.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, addressController.getAddresses);
router.get("/default", authenticate, addressController.getDefaultAddress);
router.post("/", authenticate, addressController.addAddress);
router.put("/:id", authenticate, addressController.updateAddress);
router.delete("/:id", authenticate, addressController.deleteAddress);

export default router;
