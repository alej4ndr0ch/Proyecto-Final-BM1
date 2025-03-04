import Carshop from "./carshop.model";
import User from "../users/user.model";
import Product from "../products/product.model";
import Bill from "../bills/bill.model";

export const addCartShop = async (req, res) => {

    const { product, precio, stock } = req.body;
    const userId = req.user._id;

    try {

        if (!Array.isArray(product) || !Array.isArray(precio) || !Array.isArray(stock) || 
            product.length !== precio.length || product.length !== stock.length) {
            return res.status(400).json({ 
                msg: "Datos inválidos, las arrays de productos, precios y cantidades no son correctas" 
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

        let cartshop = await Carshop.findOne({ User: userId });
        if (!cartshop) {
            cartshop = new Carshop({
                User: userId,
                productos: []
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
                cantidad: cantidad[i]
            };

            cartshop.productos.push(item);
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
        const cartshop = await Carshop.findOne({ User: userId });
        
        
        if (!cartshop) {
            return res.status(404).json({
                success: false,
                msg: 'Error, no se ha encontrado el carrito'
            });
        }
        const carshopData = {
            productos: cartshop.productos,
            total: cartshop.productos.reduce((total, item) => total + item.precio, 0), 
        };

        res.status(200).json({
            success: true,
            msg: 'El carrito ha sido obtenido con éxito',
            cartshop: carshopData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido obtener el carrito',
            error: error.message
        })
    }
}

export const editCartShop = async (req, res) => {
    const { product, cantidad } = req.body;
    const userId = req.user._id;

    try {
        if (!Array.isArray(product) || !Array.isArray(cantidad) || product.length !== cantidad.length) {
            return res.status(400).json({ 
                msg: "Datos inválidos, las arrays de productos y cantidades no son correctas" 
            });
        }

        let cartshop = await Carshop.findOne({ User: userId });

        if (!cartshop) {
            return res.status(404).json({
                success: false,
                msg: 'No se ha encontrado el carrito para este usuario.'
            });
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

            const carritoItem = cartshop.productos.find(item => item.product.toString() === productoId.toString());

            if (carritoItem) {
                if (nuevaCantidad > carritoItem.cantidad) {
                    const stockRestante = producto.stock - nuevaCantidad;
                    if (stockRestante < 0) {
                        return res.status(400).json({
                            success: false,
                            msg: `No hay suficiente stock de ${producto.name}. Solo quedan ${producto.stock} unidades.`
                        });
                    }
                    producto.stock -= (nuevaCantidad - carritoItem.cantidad);
                }else if (nuevaCantidad < carritoItem.cantidad) {
                    producto.stock += (carritoItem.cantidad - nuevaCantidad);
                }

                carritoItem.cantidad = nuevaCantidad;
            } else {
                cartshop.productos.push({
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

        let cartshop = await Carshop.findOneAndDelete({ User: userId });
        
        if (!cartshop) {
            return res.status(404).json({
                success: false,
                msg: 'No se ha encontrado el carrito para este usuario.'
            });
        }

        for (let i = 0; i < cartshop.productos.length; i++) {
            const productId = cartshop.productos[i].product;
            const cantidad = cartshop.productos[i].cantidad;

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

        await Carshop.deleteOne({ User: userId });

        res.status(200).json({
            success: true,
            msg: 'El carrito ha sido eliminado correctamente'
        });

    }catch(error){
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido eliminar el carrito',
            error: error.message
        });
    }
}

export const processCheckout = async (req, res) => {
    const userId = req.user._id;
    try {

        const cartshop = await Carshop.findOne({ User: userId });
        if (!cartshop || cartshop.productos.length === 0) {
            return res.status(400).json({
                success: false,
                msg: 'El carrito está vacío o no existe.'
            });
        }


        for (let i = 0; i < cartshop.productos.length; i++) {
            const product = cartshop.productos[i];
            const productInDb = await Product.findById(product.product);
            if (!productInDb || productInDb.stock < 1) {
                return res.status(400).json({
                    success: false,
                    msg: `El producto ${productInDb.name} no tiene stock suficiente.`
                });
            }
        }

        const bill = await new Bill({
            user: userId,
            productos: cartshop.productos.map(item => ({
                product: item.product,
                precio: item.precio
            })),
            fecha: new Date()
        });
        
        await bill.save();

        for (let i = 0; i < cartshop.productos.length; i++) {
            const product = cartshop.productos[i];
            const productInDb = await Product.findById(product.product);
            productInDb.stock -= 1;
            await productInDb.save();
        }

        await Carshop.deleteOne({ User: userId });


        res.status(200).json({
            success: true,
            msg: 'La compra se realizó con éxito.',
            bill
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha completado el procesar de compra.',
            error: error.message
        });
    }
};
