const express = require('express');

const app = express();

//const {Router} = express;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const PORT = 8080;

const productos = require('./clases/Productos.js');

const prod = new productos();

app.use(express.static('public'));
app.set('views','./views');
app.set('view engine', 'pug');

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
                mensaje = `<div class="alert alert-primary" role="alert">Producto creado con el ID ${req.query.id}</div>`
                break;
            case 'fallo':
                mensaje = `<div class="alert alert-danger" role="alert">Error al crear el producto</div>`
                break;
            case 'eliminado':
                mensaje = `<div class="alert alert-primary" role="alert">El producto ${req.query.id} fue eliminado</div>`
                break;
          }

        res.render('products_list.pug',{productList: todos, hayProductos: hayProductos, mensaje: mensaje});
      })();
})

app.get('/agregar',(req, res) => {
    res.render('products_form.pug',{product: false, id: ''});
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
            res.render('products_del.pug',{product: true, id: req.params.id, nombre:buscado.title});
        }else{
            res.render('products_del.pug',{product: false, id: '', nombre:''});
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