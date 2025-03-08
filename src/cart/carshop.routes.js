import { Router } from "express";
import { validarUserJWT } from "../middlewares/validar-jwt.js";
import { addCartShop, getCartShop, editCartShop, deleteCartShop } from "./carshop.controller.js"

const router = Router();

router.post(
    '/',
    [
        validarUserJWT
    ],
    addCartShop
);

router.get(
    '/',
    [
        validarUserJWT
    ],
    getCartShop
);

router.put(
    '/',
    [
        validarUserJWT
    ],
    editCartShop
);

router.delete(
    '/',
    [
        validarUserJWT
    ],
    deleteCartShop
);

export default router;