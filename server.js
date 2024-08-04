const express = require('express')
const path = require('path');

const app = express()

const port = 8088

app.set('views', path.join(__dirname, 'static/views'));
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.render('index', { message: 'Olá, mundo!' });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});