import axios from 'axios';

export function runEleicao(id, info, coord) {

    if (info.eleicao === "valentao") {
        runValentao(id, info, coord);
    }
}

async function runValentao(id, info, coord) {
    var hasCompetition = false;

    for(const server of info.servidores_conhecidos) {
        try {
            const { data } = await axios(`${server.url}/info`).catch(err => console.log(`Connection error! ${err.message}`));

            if (data.identificacao > info.identificacao) {
                hasCompetition = true;
                axios.post(`${server.url}/eleicao`, { id }).catch(err => console.error(err.message));
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    if(!hasCompetition)
        handleCoordenador(id, info, coord);
}

export function handleCoordenador(id, info, coord) {
    info.lider = true;
    coord.coordenador = info.identificacao;
    coord.id_eleicao = id;
}