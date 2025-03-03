import { Router } from "express";
import { check } from "express-validator";
import { existeUserById } from "../helpers/db-validator.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarUserJWT } from "../middlewares/validar-jwt.js";
import { deleteFileOnError } from "../middlewares/delete-file-on-error.js"
import { login, register, getUsers, getUserById, updateUser, deleteUser } from "./user.controller.js";
import { validatorRegister, validatorLogin } from "../middlewares/validator.js";

const router = Router();

router.post(
    '/login',
    validatorLogin,
    deleteFileOnError,
    login
);

router.post(
    '/register',
    validatorRegister,
    deleteFileOnError,
    register
);

router.get(
    '/',
    getUsers
);

router.get(
    '/:id',
    [
        check('id', 'No es ID válido').isMongoId(),
        check('id').custom(existeUserById),
        validarCampos
    ],
    getUserById
);

router.put(
    '/:id',
    [
        validarUserJWT,
        check('id', 'No es ID válido').isMongoId(),
        check('id').custom(existeUserById),
        validarCampos
    ],
    updateUser
);

router.delete(
    '/:id',
    [
        validarUserJWT,
        check('id', 'No es ID válido').isMongoId(),
        check('id').custom(existeUserById),
        validarCampos,
    ],
    deleteUser
);

export default router;