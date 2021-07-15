const axios = require('axios');


module.exports = {

    askPermission: async function (servers) {
        let leaderIsBusy = false;
        let leaderUrl;

        for (const server of servers) {
            const { data } = await axios.get(`${server.url}/info`)
                .catch(err => console.log(`Connection error! ${err.message}`));

            if (!data.lider) {
                await axios.get(`${server.url}/recurso`)
                    .catch(err => {
                        if (err.status === 409)
                            leaderIsBusy = true;
                    });
            } else {
                leaderUrl = data.ponto_de_acesso;
            }
        }

        if (!leaderIsBusy) {
            await axios.post(`${leaderUrl}/recurso`)
                .catch(err => {
                    if (err.status === 409) {
                        console.log("O líder está ocupado!")
                        leaderIsBusy = true;
                    }
                })
        }

        return leaderIsBusy;
    },

    getLeaderId: async function (servers) {
        for (const server of servers) {
            const { data } = await axios.get(`${server.url}/info`)
                .catch(err => console.log(`Connection error! ${err.message}`));

            if (data.lider) {
                return data.identificacao;
            }
        }
    }
}