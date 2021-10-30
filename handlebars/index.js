const express = require('express');
const handlebars = require("express-handlebars");

const app = express();

//const {Router} = express;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const PORT = 8080;

const productos = require('./clases/Productos.js');

const prod = new productos();

app.use(express.static('public'));

app.engine(
    "hbs",
    handlebars({
        extname: ".hbs",
        defaultLayout: "index.hbs",
        layoutsDir: __dirname + "/views/layouts",
        partialsDir: __dirname + "views/partials/"
    })
);

app.get('/',(req, res) => {
    res.redirect(`/productos`);
})

app.get('/productos',(req, res) => {
    (async() => {
        let todos = await prod.getAll();
        let hayProductos = false;
        let mensaje = null;
        if(todos){
            hayProductos = true;
        }
        switch(req.query.estado) {
            case 'exito':
                mensaje = `<div class="alert alert-primary col-sm-4" role="alert">Producto creado con el ID ${req.query.id}</div>`
                break;
            case 'fallo':
                mensaje = `<div class="alert alert-danger col-sm-4" role="alert">Error al crear el producto</div>`
                break;
            case 'eliminado':
                mensaje = `<div class="alert alert-primary col-sm-4" role="alert">El producto ${req.query.id} fue eliminado</div>`
                break;
          }

        res.render('products_list.hbs',{productList: todos, hayProductos: hayProductos, mensaje: mensaje});
      })();
})

app.get('/agregar',(req, res) => {
    res.render('products_form.hbs',{product: false, id: ''});
})

app.post('/agregar',(req, res)=>{
    (async() => {
        let nuevo = await prod.save(req.body);
        if(nuevo){
            res.redirect(`/productos?estado=exito&id=${nuevo}`);
        }else{
            res.redirect(`/productos?estado=fallo`);
        }
      })();
})

app.get('/eliminar/:id',(req, res) => {
    (async() => {
        let buscado = await prod.getById(req.params.id);
        if(buscado){
            res.render('products_del.hbs',{product: true, id: req.params.id, nombre:buscado.title});
        }else{
            res.render('products_del.hbs',{product: false, id: '', nombre:''});
        }
      })();
    
})

app.post('/eliminar',(req, res)=>{
    (async() => {
        if(req.body.submit == 'S'){
            await prod.deleteById(req.body.idProduct);
            res.redirect(`/productos?estado=eliminado&id=${req.body.idProduct}`);
        }else{
            res.redirect(`/productos`);
        }
      })();
})

const server = app.listen(PORT, () => {
    console.log(`test en el puesto ${server.address().port}`);
});