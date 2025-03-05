import { Router } from "express";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarUserJWT } from "../middlewares/validar-jwt.js";
import { addBill, getBill, updateBill } from "../bills/bill.controller.js";

const router = Router();

router.post(
    '/',
    [
        validarUserJWT,
    ],
    addBill
);

router.get(
    '/',
    getBill
);

router.put(
    '/:id',
    [
        validarUserJWT,
        validarCampos
    ],
    updateBill
);

export default router;