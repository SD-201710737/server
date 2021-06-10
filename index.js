const express = require('express');
const cors = require('cors');

if(process.env.NODE_ENV !== "production")
    require('dotenv').config();

// const PORT = 3001;
const HOST = '0.0.0.0';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/info', (req, res) => {
    res.json({
        "componente": "server",
        "descrição": "serve os clientes com os serviços X, Y e Z",
        "versao": "0.1"
    });
})

app.listen(parseInt(process.env.PORT), HOST);