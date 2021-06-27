import axios from 'axios';

export function runEleicao(id, urls, electionType, myId) {
    let hasCompetition;

    if (electionType === "valentao") {
        urls.forEach(async server => {
            const response = await runValentao(id, server.url, myId);
            
            if(response === true) {
                hasCompetition = response;
            }
        })
    }

    return hasCompetition;
}

async function runValentao(id, url, myId) {
    let hasCompetition = false;
    const { data } = await axios(`${url}/info`).catch(err => console.log(`Connection error! ${err}`));

    if (data.identificacao > myId) {
        hasCompetition = true;
        axios.post(`${url}/eleicao`, { id }).catch(err => console.error(err.message));
    }

    return hasCompetition;
}

export function handleCoordenador(info, coord, id) {
    info.lider = true;
    coord.coordenador = info.identificacao;
    coord.id_eleicao = id;
}