import Product from './product.model.js';
import Category from '../categories/category.model.js';
import { request, response } from 'express';

export const addProduct = async (req, res) => {
    try {
        
        const data = req.body;

        const categoryDoc = await Category.findOne({ name: data.category });

        if (!categoryDoc) {
            return res.status(400).json({
                success: false,
                msg: `La categoría "${data.category}" no existe`
            });
        }

        const product = await Product.create({
            name: data.name.toLowerCase(),
            description: data.description,
            precio: data.precio,
            stock: data.stock,
            category: categoryDoc._id
        });

        if (req.user.role !== "ADMIN") {
            return res.status(400).json({
                success: false,
                msg: 'No tienes permisos para guardar productos'
            });
        }

        res.status(200).json({
            success: true,
            msg: 'Categoría guardada exitosamente',
            product
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido guardar el producto',
            error
        });
    }
}

export const getProducts = async (req = request, res = response) => {
    try {
        const { limite = 10, desde = 0, stock, name } = req.body;
        const query = { estado: true };
        let sortCriteria = {};

        if (name) {
            query.name = name.toLowerCase();
        }

        if (stock === "0") {
            query.stock = 0;
        } 
        else if (stock === "1") {
            sortCriteria = { stock: 1 };
        }

        const [total, products] = await Promise.all([
            Product.countDocuments(query),
            Product.find(query)
                .sort(sortCriteria)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.status(200).json({
            success: true,
            total,
            products
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido obtener los productos',
            error
        });
    }
};


export const getProductById = async (req, res) => {
    try {
        
        const { id } = req.params;

        const product = await Product.findById(id);

        if (product.estado === false) {
            return res.status(400).json({
                success: false,
                msg: 'Error, Este producto no esta disponible'
            });
        }

        if (!product) {
            return res.status(400).json({
                success: false,
                msg: 'Error, producto no encontrada'
            });
        }

        if (product.stock === 0) {
            return res.status(400).json({
                success: false,
                msg: 'Este producto está agotado'
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido obtener el producto por ID',
            error
        });
    }
}

export const updateProduct = async (req, res = response) => {
    try {
        
        const { id } = req.params;
        const { _id, ...data } = req.body;
        let { name, category } = req.body;

        if (name) {
            name = name.toLowerCase();
            data.name = name;
        }

        if (category) {
            const categoryDoc = await Category.findOne({ name: category });

            if (!categoryDoc) {
                return res.status(400).json({
                    success: false,
                    msg: `La categoría "${category}" no existe`
                });
            }

            data.category = categoryDoc._id;
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(400).json({
                success: false,
                msg: 'Error, producto no encontrad0'
            });
        }

        if (product.estado === false) {
            return res.status(400).json({
                success: false,
                msg: 'Error, Este producto no esta disponible'
            });
        }

        if (req.user.role !== "ADMIN") {
            return res.status(400).json({
                success: false,
                msg: 'Error, No tienes autorizacion para editar los productos'
            });
        }

        const updateProduct = await Product.findByIdAndUpdate(id, data, { new: true });

        res.status(200).json({
            success: true,
            msg: 'Producto actualizada exitosamente',
            updateProduct
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido actualizar el producto',
            error
        });
    }
}

export const deleteProduct = async (req, res = response) => {
    try {
        
        const { id } = req.params;

        
        const authenticatedProduct = req.product;
        
        if (req.user.role !== "ADMIN") {
            return res.status(400).json({
                success: false,
                msg: 'Error, no tienes autorizacion para eliminar el producto'
            });
        }
        
        const product = await Product.findByIdAndUpdate(id, { estado: false }, { new: true });

        res.status(200).json({
            success: true,
            msg: 'producto eliminada exitosamente',
            product,
            authenticatedProduct
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido eliminar la categoria',
            error
        })
    }
} 