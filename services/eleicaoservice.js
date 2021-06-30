const axios = require('axios');


module.exports = {

    runEleicao: function (id, info, coord) {

        if (info.eleicao === "valentao") {
            this.runValentao(id, info, coord);
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
            this.setCoordenador(id, info, coord, info.servidores_conhecidos);
        else
            this.unsetCoordenador(id, info, coord, maxId);

    },

    setCoordenador: async function (id, info, coord, servers) {
        info.lider = true;
        coord.coordenador = info.identificacao;
        coord.id_eleicao = id;

        servers.forEach(server => {
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
