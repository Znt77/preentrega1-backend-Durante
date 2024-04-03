const express = require('express')
const fs = require('fs').promises

const app = express();
const PORT = 8080;

app.use(express.json());

const productsRouter = express.Router();

productsRouter.get('/', async (req, res) => {
    try {
        const data = await fs.readFile('productos.json', 'utf8')
        const productos = JSON.parse(data)
        res.json(productos)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Hubo un error al obtener los productos' })
    }
});

productsRouter.get('/:pid', async (req, res) => {
    const pid = req.params.pid
    try {
        const data = await fs.readFile('productos.json', 'utf8')
        const productos = JSON.parse(data)
        const producto = productos.find(p => p.id == pid)
        if (producto) {
            res.json(producto)
        } else {
            res.status(404).json({ error: 'Producto no encontrado' })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Hubo un error al obtener el producto' })
    }
});

productsRouter.post('/', async (req, res) => {
    const newProduct = req.body
    try {
        const data = await fs.readFile('productos.json', 'utf8')
        let productos = JSON.parse(data)
        newProduct.id = productos.length + 1
        productos.push(newProduct)
        await fs.writeFile('productos.json', JSON.stringify(productos, null, 2))
        res.status(201).json({ message: 'Producto agregado correctamente', producto: newProduct })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Hubo un error al agregar el producto' })
    }
})

productsRouter.put('/:pid', async (req, res) => {
    const pid = req.params.pid
    const updatedProduct = req.body
    try {
        const data = await fs.readFile('productos.json', 'utf8')
        let productos = JSON.parse(data);
        const index = productos.findIndex(p => p.id == pid)
        if (index !== -1) {
            productos[index] = { ...productos[index], ...updatedProduct }
            await fs.writeFile('productos.json', JSON.stringify(productos, null, 2))
            res.json({ message: 'Producto actualizado correctamente', producto: productos[index] })
        } else {
            res.status(404).json({ error: 'Producto no encontrado' })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Hubo un error al actualizar el producto' })
    }
});
productsRouter.delete('/:pid', async (req, res) => {
    const pid = req.params.pid;
    try {
        const data = await fs.readFile('productos.json', 'utf8');
        let productos = JSON.parse(data)
        const index = productos.findIndex(p => p.id == pid);
        if (index !== -1) {
            productos.splice(index, 1)
            await fs.writeFile('productos.json', JSON.stringify(productos, null, 2))
            res.json({ message: 'Producto eliminado correctamente' })
        } else {
            res.status(404).json({ error: 'Producto no encontrado' })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al eliminar el producto' })
    }
})

app.use('/api/products', productsRouter)

const cartsRouter = express.Router()

cartsRouter.post('/', async (req, res) => {
    const newCart = {
        id: Math.floor(Math.random() * 1000),
        products: []
    }
    try {
        await fs.writeFile('carrito.json', JSON.stringify(newCart, null, 2));
        res.status(201).json({ message: 'Carrito creado correctamente', carrito: newCart })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Hubo un error al crear el carrito' })
    }
})

cartsRouter.get('/:cid', async (req, res) => {
    const cid = req.params.cid;
    try {
        const data = await fs.readFile('carrito.json', 'utf8')
        const carrito = JSON.parse(data)
        res.json(carrito.products)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Hubo un error al obtener los productos del carrito' })
    }
});

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params
    const { quantity } = req.body
    try {
        const data = await fs.readFile('carrito.json', 'utf8');
        let carrito = JSON.parse(data)
        const productIndex = carrito.products.findIndex(p => p.id == pid)
        if (productIndex !== -1) {
            carrito.products[productIndex].quantity += quantity
        } else {
            carrito.products.push({ id: pid, quantity })
        }
        await fs.writeFile('carrito.json', JSON.stringify(carrito, null, 2));
        res.json({ message: 'Producto agregado al carrito correctamente', carrito });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al agregar el producto al carrito' })
    }
})

app.use('/api/carts', cartsRouter)

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})
