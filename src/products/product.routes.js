import { Router } from "express";
import { check } from "express-validator";
import { existeProductById } from "../helpers/db-validator.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarUserJWT } from "../middlewares/validar-jwt.js";
import { validatorProduct } from "../middlewares/validator.js";
import { addProduct, getProducts, getProductById, updateProduct, deleteProduct } from "./product.controller.js";

const router = Router();

router.post(
    '/',
    [
        validarUserJWT,
        validatorProduct,
        validarCampos
    ],
    addProduct
);

router.get(
    '/',
    getProducts
);

router.get(
    '/findCategorie/:id',
    [
        check('id', 'No es un ID válido').isMongoId(),
        check('id').custom(existeProductById),
        validarCampos
    ],
    getProductById
);

router.put(
    '/:id',
    [
        validarUserJWT,
        check('id', 'No es un ID válido').isMongoId(),
        check('id').custom(existeProductById),
        validatorProduct,
        validarCampos
    ],
    updateProduct
);

router.delete(
    '/:id',
    [
        validarUserJWT,
        check('id', 'No es un ID válido').isMongoId(),
        check('id').custom(existeProductById),
        validarCampos
    ],
    deleteProduct
);

export default router;