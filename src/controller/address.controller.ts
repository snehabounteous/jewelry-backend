import { Request, Response } from "express";
import * as addressService from "../services/address.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js"; 

export async function getAddresses(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const addresses = await addressService.getAddresses(userId);
    res.json(addresses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getDefaultAddress(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const address = await addressService.getDefaultAddress(userId);
    res.json(address);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function addAddress(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const address = await addressService.addAddress(userId, req.body);
    res.json(address);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateAddress(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const addressId = req.params.id;
    const updated = await addressService.updateAddress(userId, addressId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteAddress(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const addressId = req.params.id;
    const deleted = await addressService.deleteAddress(userId, addressId);
    res.json(deleted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
