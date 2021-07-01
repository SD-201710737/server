const express = require('express');
const cors = require('cors');

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// const PORT = 3001;
const HOST = '0.0.0.0';

const app = express();
app.use(cors());
app.use(express.json());

const elecService = require('./services/eleicaoservice.js');

var ocupado = false;

var info = {
    componente: "server",
    versao: "0.1",
    descricao: "serve os clientes com os serviços /info, /recurso, /eleicao",
    ponto_de_acesso: "https://sd-jhsq.herokuapp.com",
    status: "up",
    identificacao: 5,
    lider: false,
    eleicao: "anel",
    servidores_conhecidos: [
        {
            id: 1,
            url: "https://sd-rdm.herokuapp.com"
        },
        // {
        //     id: 2,
        //     url: "https://sd-201620236.herokuapp.com"
        // },
        // {
        //     id: 3,
        //     url: "https://sd-mgs.herokuapp.com"
        // },
        // {
        //     id: 4,
        //     url: "https://sd-dmss.herokuapp.com"
        // },
        {
            id: 5,
            url: "https://sd-app-server-jesulino.herokuapp.com"
        }
    ]
}

var myEleicao = {
    tipo_de_eleicao_ativa: info.eleicao,
    eleicao_em_andamento: false
}

var myCoordenador = {
    coordenador: -1,
    id_eleicao: ""
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
    const { id } = req.body;

    if (myEleicao.eleicao_em_andamento === false || info.eleicao === "anel") {
        myEleicao.eleicao_em_andamento = true;
        elecService.runEleicao(id, info, myCoordenador, myEleicao);
    } else {
        console.error("Eleicao negada. Já existe uma eleição em andamento.")
        res.status(409).json(myEleicao);
    }

    if(info.lider)
        myEleicao.eleicao_em_andamento = false;

    res.status(200).json(myCoordenador);
})

app.post('/eleicao/coordenador', (req, res) => {
    myCoordenador.coordenador = req.body.coordenador;
    myCoordenador.id_eleicao = req.body.id_eleicao;
    myEleicao.eleicao_em_andamento = false;
    
    if(req.body.coordenador === info.identificacao)
        info.lider = true;
    else
        info.lider = false;

    res.json(myCoordenador);
})

app.get('/eleicao/coordenador', (req, res) => {
    res.json(myCoordenador);
})

app.get('/eleicao/reset', (req, res) => {
    myCoordenador.coordenador = 0;
    myCoordenador.id_eleicao = '';
    myEleicao.eleicao_em_andamento = false;
    res.json(myCoordenador);
})

app.listen(parseInt(process.env.PORT), HOST);
