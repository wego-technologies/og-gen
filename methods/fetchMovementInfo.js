const axios = require('axios');

// Config
const config = require('../config/apiConfig');

const fetchMovementInfo = id => {
    let endpoint = `${config.apiEndpoint}/api/public/shared/movement/${id}/`;

    return new Promise((resolve, reject) => {
        axios
            .get(endpoint)
            .then(res => {
                resolve(res.data);
            })
            .catch(err => {
                reject(err);
            });
    });
}

module.exports = fetchMovementInfo;