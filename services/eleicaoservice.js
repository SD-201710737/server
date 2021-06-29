const axios = require('axios');


module.exports = {

    runEleicao: function (id, info, coord) {

        if (info.eleicao === "valentao") {
            this.runValentao(id, info, coord);
        }
    },

    runValentao: async function (id, info, coord) {
        var hasCompetition = false;

        for (const server of info.servidores_conhecidos) {
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

        if (!hasCompetition)
            this.handleCoordenador(id, info, coord);
    },

    handleCoordenador: function (id, info, coord) {
        info.lider = true;
        coord.coordenador = info.identificacao;
        coord.id_eleicao = id;
    }
}
