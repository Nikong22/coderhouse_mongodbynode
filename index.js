const express = require('express');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');

const app = express();
const PORT = 8080;
const router = express.Router();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api', router);

app.use(express.static('public'));

const server = http.listen(PORT,
  () => console.log('escuchando en puerto 8080'));
server.on('error', error=>console.log('Error en servidor', error));

const productos = [

];

const mensajes = [

];

const URI = 'mongodb://localhost:27017/ecommerce';

const MensajeSchema = mongoose.Schema({
  autor: {type: String, require: true, minLength: 1, maxLength: 35},
  texto: {type: String, require: true, minLength: 1, maxLength: 25},
  fecha: {type: String, require: true, minLength: 1},
});
const MensajeDB = mongoose.model('mensajes', MensajeSchema)

mongoose.connect(URI, 
    { 
      serverSelectionTimeoutMS: 1000
    }, 
    (error) => {
        if (error) {
            throw  'Error al conectarse a la base de datos';
        } else {
          ProductoDB.find({})
          .then((productosDB) => {
            for (let producto of productosDB) {
              productos.push(producto)
            }
            console.log(productos)
          })
            MensajeDB.find({})
              .then((mensajesDB) => {
                for (let mensaje of mensajesDB) {
                  mensajes.push(mensaje)
                }
                console.log(mensajes)
              })
        }
  });

  const ProductoSchema = mongoose.Schema({
    id: {type: Number, require: true},
    title: {type: String, require: true, minLength: 1, maxLength: 50},
    price: {type: String, require: true, minLength: 1, maxLength: 25},
    thumbnail: {type: String, require: true, minLength: 1},
  });
  const ProductoDB = mongoose.model('productos', ProductoSchema)

router.get('/', (req,res)=>{
  const objRes = 
  {msg: "Sitio principal de productos"};
  res.json(objRes);
});

router.get("/productos/listar", (req, res) => {
    if (productos.length = 0) {
        return res.status(404).json({ error: "no hay productos cargados" });
      }
    ProductoDB.find({})
    .then((productosDB) => {
      for (let producto of productosDB) {
        productos.push(producto)
      }
      console.log(productos)
      res.json(productos);
    })
});
  
router.get("/productos/listar/:id", (req, res) => {
    const { id } = req.params;
    const producto = productos.find((producto) => producto.id == id);
    if (!producto) {
        return res.status(404).json({ error: "producto no encontrado" });
      }
    res.json(producto);
});
  
router.put("/productos/actualizar/:id", (req, res) => {
  const { id } = req.params;
  let { title, price, thumbnail } = req.body;
  let producto = productos.find((producto) => producto.id == id);
  if (!producto) {
    return res.status(404).json({ msg: "Usuario no encontrado" });
  }
  (producto.title = title), (producto.price = price), (producto.thumbnail = thumbnail);
ProductoDB.updateOne({ "_id": id}, {'title': title, 'price': price, 'thumbnail':thumbnail})
.then(productos=>{
    console.log('Producto acutalizado')
    res.status(200).json(producto);
})
});

router.delete("/productos/borrar/:id", (req, res) => {
  const { id } = req.params;
  const producto = productos.find((producto) => producto.id == id);

  if (!producto) {
    return res.status(404).json({ msg: "Usuario no encontrado" });
  }

  const index = productos.findIndex((producto) => producto.id == id);
  productos.splice(index, 1);
      ProductoDB.deleteOne({id: id})
      .then(()=>{
            console.log('producto borrado')
        })
    res.status(200).end();
});

app.engine(
    "hbs",
    handlebars({
        extname: ".hbs",
        defaultLayout: "index.hbs",
        layoutsDir: __dirname + "/views/layouts",
        partialsDir: __dirname + "/views/partials"
    })
);

app.set('views', './views'); // especifica el directorio de vistas
app.set('view engine', 'hbs'); // registra el motor de plantillas

app.get('/productos/vista', function(req, res) {
  console.log(productos)
  let tieneDatos;
  if(productos.length > 0){
    tieneDatos = true
  }else{
    tieneDatos = false
  }
  res.render('main', { productos: productos, listExists: tieneDatos });
});

io.on('connection', (socket) => {
    console.log('alguien se está conectado...');
    
    io.sockets.emit('listar', productos);
    
    socket.on('notificacion', (titulo, precio, imagen) => {
      const producto = {
        title: titulo,
        price: precio,
        thumbnail: imagen,
      };

      console.log(producto)

      ProductoDB.create(producto,(error)=>{
        if (error) {
            throw "Error al grabar productos " + error;
        } else {
          productos.push(producto);
          io.sockets.emit('listar', productos)
        }
      });
  })
        io.sockets.emit('mensajes', mensajes);
        
        socket.on('nuevo', (mensaje)=>{
      MensajeDB.insertMany(mensaje,(error)=>{
        if (error) {
            throw "Error al grabar mensajes " + error;
        } else {
          mensajes.push(mensaje);
          io.sockets.emit('mensajes', mensajes)
          console.log(`Mensajes grabados...`);
        }
      });
    })
});