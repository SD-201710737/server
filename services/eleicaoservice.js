const axios = require('axios');


module.exports = {

    runEleicao: function (id, info, coord, eleicao) {

        if (info.eleicao === "valentao") {
            this.runValentao(id, info, coord);
        } else if (info.eleicao === "anel") {
            this.runAnel(id, info, coord, eleicao);
        }
    },

    runValentao: async function (id, info, coord) {
        var hasCompetition = false;
        var maxId = 0;

        for (const server of info.servidores_conhecidos) {
            try {
                const { data } = await axios(`${server.url}/info`).catch(err => console.log(`Connection error! ${err.message}`));

                if (data.identificacao > info.identificacao && data.status === "up") {
                    hasCompetition = true;
                    if (data.identificacao > maxId)
                        maxId = data.identificacao;

                    axios.post(`${server.url}/eleicao`, { id }).catch(err => console.error(err.message));
                }
            } catch (err) {
                console.error(err.message);
            }
        }

        if (!hasCompetition)
            this.setCoordenador(id, info, coord);
        else
            this.unsetCoordenador(id, info, coord, maxId);

    },

    runAnel: async function (id, info, coord, eleicao) {
        let ids = id.split("-");
        ids.shift();
        ids = ids.map(filteredId => parseInt(filteredId));

        if (ids[0] === info.identificacao) {
            const maxId = Math.max(...ids);

            if (maxId === info.identificacao)
                this.setCoordenador(id, info, coord);
            else {
                this.unsetCoordenador(id, info, coord, maxId);

                for (const server of info.servidores_conhecidos) {
                    axios.post(`${server.url}/eleicao/coordenador`, {
                        coordenador: maxId,
                        id_eleicao: id
                    }).catch(err => console.error(err.message));
                }

                eleicao.eleicao_em_andamento = false;
            }
        } else {
            if (!ids.some(elem => elem === info.identificacao))
                id = id.concat(`-${info.identificacao}`);

            let servers = [];
            for (const server of info.servidores_conhecidos) {
                const { data } = await axios(`${server.url}/info`)
                    .catch(err => console.log(`Connection error! ${err.message}`));

                if (data.status === "up" && data.eleicao === "anel")
                    servers.push({
                        identificacao: data.identificacao,
                        url: server.url
                    })
            }

            const serverIds = servers.map(server => server.identificacao);

            if (Math.max(info.identificacao, ...serverIds) === info.identificacao) {
                const minId = Math.min(...serverIds);
                const selectedServer = servers.filter(server => {
                    if (server.identificacao === minId)
                        return server;
                });
                axios.post(`${selectedServer[0].url}/eleicao`, { id }).catch(err => console.error(err.message));
            }
            else {
                const maxId = Math.max(info.identificacao, ...serverIds);
                const selectedServer = servers.filter(server => {
                    if (server.identificacao === maxId)
                        return server;
                });
                axios.post(`${selectedServer[0].url}/eleicao`, { id }).catch(err => console.error(err.message));
            }

        }
    },

    setCoordenador: async function (id, info, coord) {
        info.lider = true;
        coord.coordenador = info.identificacao;
        coord.id_eleicao = id;

        info.servidores_conhecidos.forEach(server => {
            axios.post(`${server.url}/eleicao/coordenador`, {
                coordenador: info.identificacao,
                id_eleicao: id
            }).catch(err => console.error(err.message));
        })
    },

    unsetCoordenador: function (id, info, coord, maxId) {
        info.lider = false;
        coord.coordenador = maxId;
        coord.id_eleicao = id;
    }
}
