const axios = require('axios');

// Config
const config = require('../config/apiConfig');

const fetchMovementInfo = id => {
    let endpoint = `${config.apiEndpoint}/public/shared/movement/${id}/`;

    return new Promise((resolve, reject) => {
        axios
            .get(endpoint)
            .then(res => {
                resolve(res.data);
            })
            .catch(err => {
                console.log('error', err);
                reject(err);
            });
    });
}

module.exports = fetchMovementInfo;