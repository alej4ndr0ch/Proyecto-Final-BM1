import Categorie from './category.model.js';
import Product from '../products/product.model.js';
import { request, response } from 'express';

export const saveCategorie = async (req, res) => {
    try {
        
        const data = req.body;

        const categorie = await Categorie.create({
            name: data.name.toLowerCase(),
            description: data.description
        });

        if (req.user.role !== "ADMIN") {
            return res.status(400).json({
                success: false,
                msg: 'No tienes permisos para guardar categorias'
            });
        }

        res.status(200).json({
            success: true,
            msg: 'Categoría guardada exitosamente',
            categorie
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido guardar la categoria',
            error
        });
    }
}

export const getCategories = async (req = request, res = response) => {
    try {
        
        const { limite = 10, desde = 0 } = req.body;
        const query = { estado: true };

        const [ total, categories ] = await Promise.all([
            Categorie.countDocuments(query),
            Categorie.find(query)
           .skip(Number(desde))
           .limit(Number(limite))
        ])

        res.status(200).json({
            success: true,
            total,
            categories
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido obtener las categorías',
            error
        });
    }
}

export const getCategorieById = async (req, res) => {
    try {
        
        const { id } = req.params;

        const categorie = await Categorie.findById(id);

        if (categorie.estado === false) {
            return res.status(400).json({
                success: false,
                msg: 'Esta categoría no esta disponible'
            });
        }

        if (!categorie) {
            return res.status(400).json({
                success: false,
                msg: 'Categoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            categorie
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido obtener la categoría por ID',
            error
        });
    }
}

export const updateCategorie = async (req, res = response) => {
    try {
        
        const { id } = req.params;
        const { _id, ...data } = req.body;
        let { name } = req.body;

        if (name) {
            name = name.toLowerCase();
            data.name = name;
        }

        const categorie = await Categorie.findById(id);

        if (!categorie) {
            return res.status(400).json({
                success: false,
                msg: 'Categoría no encontrada'
            });
        }

        const categorieGeneral = await Categorie.findOne({ name: "General".toLowerCase() });
        
        if (categorieGeneral && id === categorieGeneral._id.toString()) {
            return res.status(400).json({
                success: false,
                msg: 'Error, no se ha podido editar la categoría por defecto General'
            })
        }
        
        if (categorie.estado === false) {
            return res.status(400).json({
                success: false,
                msg: 'Esta categoría no esta disponible'
            });
        }

        if (req.user.role !== "ADMIN") {
            return res.status(400).json({
                success: false,
                msg: 'Error, permisos denegado para editar categorias'
            });
        }

        const updateCategorie = await Categorie.findByIdAndUpdate(id, data, { new: true });

        res.status(200).json({
            success: true,
            msg: 'Categoría actualizada exitosamente',
            updateCategorie
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido actualizar la categoria',
            error
        });
    }
}

export const deleteCategorie = async (req, res = response) => {
    try {
        
        const { id } = req.params;

        
        const authenticatedCategorie = req.categorie;
        
        if (req.user.role !== "ADMIN") {
            return res.status(400).json({
                success: false,
                msg: 'Error, permisos denegado para eliminar categorias'
            });
        }
        
        const categorieGeneral = await Categorie.findOne({ name: "General".toLowerCase() });
        
        if (categorieGeneral && id === categorieGeneral._id.toString()) {
            return res.status(400).json({
                success: false,
                msg: 'Error, no puedes eliminar la categoría por defecto General'
            })
        }
        
        await Product.updateMany(
            {category : id},
            { $set: {category: categorieGeneral._id} }
        )

        const categorie = await Categorie.findByIdAndUpdate(id, { estado: false }, { new: true });

        res.status(200).json({
            success: true,
            msg: 'Categoría eliminada exitosamente',
            categorie,
            authenticatedCategorie
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido eliminar la categoria',
            error
        })
    }
}

export const restoreCategorie = async (req, res = response) => {
    try {
        
        const { id } = req.params;

        const categorie = await Categorie.findByIdAndUpdate(id, { estado: true }, { new: true });

        const authenticatedCategorie = req.categorie;

        if (req.user.role !== "ADMIN") {
            return res.status(400).json({
                success: false,
                msg: 'No tienes permisos para restaurar categorias'
            });
        }

        res.status(200).json({
            success: true,
            msg: 'Categoría restaurada exitosamente',
            categorie,
            authenticatedCategorie
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido restaurar la categoria',
            error
        })
    }
}

export const defaultCategorie = async () => {
    try {

        const verifyCategorie = await Categorie.findOne({ name: "General".toLowerCase() });

        if (!verifyCategorie) {
            const categorieGeneral = new Categorie({
                name: "General".toLowerCase(),
                description: "Categoría por defecto para publicaciones sin una categoría especifica. No se puede eliminar ni editar"
            });
    
            await categorieGeneral.save();
    
            console.log("La categoria se ha creado");
        } else {
            console.log("Error, la categoria ya se ha creado");
        }


    } catch (error) {
        console.error("Error, no se ha podido crear la categoria", error);
    }
}