const express = require("express");
const { connectToDB, disconnectFromMongoDB, getCollection} = require("./src/mongodb");
const app = express();
const PORT = process.env.PORT || 3000;
const PRODUCT_REQUIRED_FIELDS=["codigo", "nombre", "precio", "categoria"];

app.use(express.json());

// Middleware para establecer el encabezado Content-Type en las respuestas
app.use((req, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});

// Ruta de inicio
app.get("/", (req, res) => {
  res.status(200).end("Bienvenido a la API de Computacion");
});

// Ruta para obtener todas los productos
app.get("/productos", async (req, res) => {
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

  // Obtener la colección de productos y convertir los documentos a un array
  const db = client.db("productos");
  const productos = await db.collection("productos").find().toArray();
  res.json(productos);
} catch (error) {
  // Manejo de errores al obtener los productos
  res.status(500).send("Error al obtener los productos de la base de datos");
} finally {
  // Desconexión de la base de datos
  await disconnectFromMongoDB();
}
});

// Ruta para obtener un producto por su ID
app.get("/productos/:id", async (req, res) => {
  const productoId = parseInt(req.params.id);
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

// Obtener la colección de productos y buscar el producto por su ID
    const db = client.db("productos");
    const producto = await db.collection("productos").findOne({ codigo: productoId });
    if (producto) {
      res.json(producto);
    } else {
      res.status(404).send("Producto no encontrado");
    }
  } catch (error) {
    // Manejo de errores al obtener el producto
    res.status(500).send("Error al obtener el producto de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});  
   
// Ruta para obtener un producto por su nombre
app.get("/productos/nombre/:nombre", async (req, res) => {
  const productoQuery = req.params.nombre;
  let productoNombre = RegExp(productoQuery, "i");
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de productos y buscar el producto por su Nombre
    const db = client.db("productos");
    const producto = await db
      .collection("productos")
      .find({ nombre: productoNombre })
      .toArray();

    if (producto.length > 0) {
      res.json(producto);
    } else {
      res.status(404).send("Producto no encontrado");
    }
  } catch (error) {
    // Manejo de errores al obtener el producto
    res.status(500).send("Error al obtener el producto de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});
    

// Ruta para obtener un producto por su precio
app.get("/productos/precio/:precio", async (req, res) => {
  const productoPrecio = parseFloat(req.params.precio);
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de productos y buscar el producto por su precio
    const db = client.db("productos");
    const producto = await db
      .collection("productos")
      .find({ precio: { $gte: productoPrecio } })
      .toArray();

    if (producto.length > 0) {
      res.json(producto);
    } else {
      res.status(404).send("Producto no encontrado");
    }
  } catch (error) {
    // Manejo de errores al obtener el producto
    res.status(500).send("Error al obtener el producto de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para obtener productos por su categoría
app.get("/productos/categoria/:categoria", async (req, res) => {
  const categoriaQuery = req.params.categoria;
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de productos y buscar productos por su categoría
    const db = client.db("productos");
    const productos = await db
      .collection("productos")
      .find({ categoria: categoriaQuery })
      .toArray();

    if (productos.length > 0) {
      res.json(productos);
    } else {
      res.status(404).send("No se encontraron productos en la categoría especificada");
    }
  } catch (error) {
    // Manejo de errores al obtener los productos
    res.status(500).send("Error al obtener los productos de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para agregar un nuevo producto
app.post("/productos", async (req, res) => {
  const nuevoProducto = req.body;
  try {
    if (!nuevoProducto) {
      res.status(400).send("Error en el formato de datos a crear.");
      return;
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    const db = client.db("productos");
    const collection = db.collection("productos");
    await collection.insertOne(nuevoProducto);
    console.log("Nuevo producto creado");
    res.status(201).send(nuevoProducto);
  } catch (error) {
    // Manejo de errores al agregar el producto
    res.status(500).send("Error al intentar agregar un nuevo producto");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para modificar un producto existente
app.put("/productos/:id", async (req, res) => {
  const idProducto = parseInt(req.params.id);
  const nuevosDatos = req.body;
  try {
    if (!nuevosDatos) {
      res.status(400).send("Error en el formato de datos a crear.");
      return;
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    const db = client.db("productos");
    const collection = db.collection("productos");

    await collection.updateOne({ codigo: idProducto }, { $set: nuevosDatos });

    console.log("Producto modificado");

    res.status(200).send(nuevosDatos);
  } catch (error) {
    // Manejo de errores al modificar el producto
    res.status(500).send("Error al modificar el producto");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para modificar un campo en un recurso
app.patch("/productos/:id", async (req, res) => {
  const idProducto = parseInt(req.params.id);
  const nuevosDatos = req.body;
  try {
    if (!nuevosDatos) {
      res.status(400).send("Error en el formato de datos a crear.");
      return;
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    const db = client.db("productos");
    const collection = db.collection("productos");

    await collection.updateOne({ codigo: idProducto }, { $set: nuevosDatos });

    console.log("Producto Modificado");

    res.status(200).send(nuevosDatos);
  } catch (error) {
    // Manejo de errores al modificar el producto
    res.status(500).send("Error al modificar el producto");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para eliminar un recurso
app.delete("/productos/:id", async (req, res) => {
  const idProducto = parseInt(req.params.id);
  try {
    if (!idProducto) {
      res.status(400).send("Error en el formato de datos a crear.");
      return;
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de productos, buscar el producto por su ID y eliminarlo
    const db = client.db("productos");
    const collection = db.collection("productos");
    const resultado = await collection.deleteOne({ codigo: idProducto });
    if (resultado.deletedCount === 0) {
      res
        .status(404)
        .send("No se encontró ningún producto con el id seleccionado.");
    } else {
      console.log("Producto Eliminado");
      res.status(204).send();
    }
  } catch (error) {
    // Manejo de errores al eliminar el producto
    res.status(500).send("Error al eliminar el producto");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});