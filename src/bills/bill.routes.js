import { Router } from "express";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarUserJWT } from "../middlewares/validar-jwt.js";
import { addBill, getBill, updateBill, historyBill } from "../bills/bill.controller.js";

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
    validarUserJWT,
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

router.get('/history', 
    validarUserJWT, 
    historyBill
);

export default router;