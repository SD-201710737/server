const express = require('express');
const cors = require('cors');

if (process.env.NODE_ENV !== "production")
    require('dotenv').config();

// const PORT = 3001;
const HOST = '0.0.0.0';

const app = express();
app.use(cors());
app.use(express.json());

var ocupado = false;

var info = {
    componente: "server",
    versao: "0.1",
    descricao: "serve os clientes com os serviços /info, /recurso, /eleicao",
    ponto_de_acesso: "https://sd-jhsq.herokuapp.com",
    status: "up",
    identificacao: 2,
    lider: false,
    eleicao: "valentao",
    servidores_conhecidos: [
        {
            id: 1,
            url: "https://sd-rdm.herokuapp.com"
        },
        {
            id: 2,
            url: "https://sd-201620236.herokuapp.com"
        },
        {
            id: 3,
            url: "https://sd-mgs.herokuapp.com"
        },
    ]
}

var myEleicao = {
    "tipo_de_eleicao_ativa": info.eleicao,
    "eleicao_em_andamento": false
}

var myCoordenador = {
    "coordenador": 2,
    "id_eleicao": "o id da eleição"
}

app.get('/info', (req, res) => {
    res.json(info);
})

app.post('/info', (req, res) => {
    const { status, identificacao, lider, eleicao } = req.body;

    if (req.body.status === "up" || req.body.status === "down")
        info.status = status;

    if (Number.isInteger(req.body.identificacao))
        info.identificacao = identificacao;

    if (typeof (req.body.lider) === "boolean")
        info.lider = lider;

    if (req.body.eleicao === "valentao" || req.body.eleicao === "anel") {
        info.eleicao = eleicao;
        myEleicao.tipo_de_eleicao_ativa = eleicao;
    }

    res.json(info);
})

app.post('/recurso', (req, res) => {
    if (!ocupado) {
        ocupado = true
        res.json({
            ocupado
        })
        setTimeout(() => ocupado = false, 10000)
    } else {
        res.status(409).json({
            ocupado
        })
    }
})

app.get('/recurso', (req, res) => res.json({ ocupado }))

app.get('/eleicao', (req, res) => res.json(myEleicao))

app.post('/eleicao', (req, res) => {
    myEleicao.eleicao_em_andamento = true;

    res.status(200).json(myEleicao);
})

app.post('/eleicao/coordenador', (req, res) => {
    myCoordenador.coordenador = req.body.coordenador;
    myCoordenador.id_eleicao = req.body.id_eleicao;

    res.json(myCoordenador);
})

app.listen(parseInt(process.env.PORT), HOST);