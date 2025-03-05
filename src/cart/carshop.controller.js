import Cartshop  from "./carshop.model.js";
import User from "../users/user.model.js";
import Product from "../products/product.model.js";

export const addCartShop = async (req, res) => {
    const { product, precio, stock } = req.body;
    const userId = req.user._id;

    try {
        if (!Array.isArray(product) || !Array.isArray(precio) || !Array.isArray(stock) || 
            product.length !== precio.length || product.length !== stock.length) {
            return res.status(400).json({ 
                msg: "Datos inválidos, los arrays de productos, precios y cantidades no coinciden" 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                msg: 'Error, Usuario no ha sido encontrado'
            });
        }

        if (user.estado === false) {
            return res.status(400).json({
                success: false,
                msg: 'Error, Este usuario no está disponible'
            });
        }

        let cartshop = await Cartshop.findOne({ user: userId });
        if (!cartshop) {
            cartshop = new Cartshop({
                user: userId,
                products: []
            });
        }

        for (let i = 0; i < product.length; i++) {
            const producto = await Product.findById(product[i]);

            if (!producto) {
                return res.status(404).json({
                    success: false,
                    msg: `Producto con ID ${product[i]} no encontrado`
                });
            }

            if (producto.stock < stock[i]) {
                return res.status(400).json({
                    success: false,
                    msg: `No hay suficiente stock del producto ${producto.name} (${producto.stock} disponibles)`
                });
            }

            producto.stock -= stock[i];
            await producto.save();

            const item = {
                product: producto._id, 
                precio: precio[i],
                cantidad: stock[i]
            };

            cartshop.products.push(item);
        }

        await cartshop.save();

        res.status(200).json({
            success: true,
            msg: 'Los productos han sido agregados al carrito con éxito',
            cartshop
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido agregar el producto al carrito',
            error: error.message
        });
    }
};

export const getCartShop = async (req, res) => {
    const userId = req.user._id;

    try {
        const cartshop = await Cartshop.findOne({ user: userId }).populate("products.product");

        if (!cartshop) {
            return res.status(404).json({
                success: false,
                msg: 'Error, no se ha encontrado el carrito'
            });
        }

        const products = cartshop.products || [];

        const total = products.reduce((total, item) => {
            const precio = item.precio || 0;
            const cantidad = item.cantidad || 1;
            return total + (precio * cantidad);
        }, 0);

        res.status(200).json({
            success: true,
            msg: 'El carrito ha sido obtenido con éxito',
            cartshop: {
                products,
                total
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido obtener el carrito',
            error: error.message
        });
    }
};

export const editCartShop = async (req, res) => {
    const { product, cantidad } = req.body;
    const userId = req.user._id;

    try {
        if (!Array.isArray(product) || !Array.isArray(cantidad) || product.length !== cantidad.length) {
            return res.status(400).json({ 
                msg: "Datos inválidos, las arrays de productos y cantidades no son correctas" 
            });
        }

        let cartshop = await Cartshop.findOne({ user: userId });

if (!cartshop) {
    cartshop = new Cartshop({
        user: userId,
        products: [] 
    });
}

if (!cartshop.products) {
    cartshop.products = []; 
}

for (let i = 0; i < product.length; i++) {
    const productoId = product[i];
    const nuevaCantidad = cantidad[i];

    const producto = await Product.findById(productoId);
    if (!producto) {
        return res.status(404).json({
            success: false,
            msg: `Producto con ID ${productoId} no encontrado`
        });
    }

    const carritoItem = cartshop.products.find(item => item.product.toString() === productoId.toString());

    if (carritoItem) {
    } else {
        cartshop.products.push({
            product: productoId,
            cantidad: nuevaCantidad,
            precio: producto.precio
        });

        if (producto.stock < nuevaCantidad) {
            return res.status(400).json({
                success: false,
                msg: `No hay suficiente stock de ${producto.name}. Solo quedan ${producto.stock} unidades.`
            });
        }

        producto.stock -= nuevaCantidad;
    }

        await producto.save();
    }

    await cartshop.save();


        res.status(200).json({
            success: true,
            msg: 'El carrito ha sido actualizado correctamente',
            cartshop
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido actualizar el carrito',
            error: error.message
        });
    }
};

export const deleteCartShop = async (req, res) => {
    const userId = req.user._id;

    try {
        let cartshop = await Cartshop.findOneAndDelete({ user: userId });
        
        if (!cartshop) {
            return res.status(404).json({
                success: false,
                msg: 'No se ha encontrado el carrito para este usuario.'
            });
        }

        for (let i = 0; i < cartshop.products.length; i++) { 
            const productId = cartshop.products[i].product;
            const cantidad = cartshop.products[i].cantidad;

            const producto = await Product.findById(productId);
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    msg: `Producto con ID ${productId} no encontrado en el inventario.`
                });
            }

            producto.stock += cantidad;
            await producto.save();
        }

        res.status(200).json({
            success: true,
            msg: 'El carrito ha sido eliminado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido eliminar el carrito',
            error: error.message
        });
    }
};