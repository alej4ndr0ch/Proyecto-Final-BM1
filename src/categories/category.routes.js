import { Router } from "express";
import { check } from "express-validator";
import { existeCategorieById } from "../helpers/db-validator.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarUserJWT } from "../middlewares/validar-jwt.js";
import { validatorCategorie } from "../middlewares/validator.js";
import { saveCategorie, getCategories, getCategorieById, updateCategorie, deleteCategorie, restoreCategorie } from "./category.controller.js";

const router = Router();

router.post(
    '/',
    [
        validarUserJWT,
        validatorCategorie,
        validarCampos
    ],
    saveCategorie
);

router.get(
    '/',
    getCategories
);

router.get(
    '/findCategorie/:id',
    [
        check('id', 'No es un ID válido').isMongoId(),
        check('id').custom(existeCategorieById),
        validarCampos
    ],
    getCategorieById
);

router.put(
    '/:id',
    [
        validarUserJWT,
        check('id', 'No es un ID válido').isMongoId(),
        check('id').custom(existeCategorieById),
        validatorCategorie,
        validarCampos
    ],
    updateCategorie
);

router.delete(
    '/:id',
    [
        validarUserJWT,
        check('id', 'No es un ID válido').isMongoId(),
        check('id').custom(existeCategorieById),
        validarCampos
    ],
    deleteCategorie
);

router.put(
    '/restore/:id',
    [
        validarUserJWT,
        check('id', 'No es un ID válido').isMongoId(),
        check('id').custom(existeCategorieById),
        validarCampos
    ],
    restoreCategorie
);

export default router;