let apiEndpoint;

if (process.env.NODE_ENV === 'dev') {
    apiEndpoint = 'https://api-dev.gatego.io';
} else if (process.env.NODE_ENV === 'beta') {
    apiEndpoint = 'https://api-beta.gatego.io';
} else {
    apiEndpoint = 'https://api.gatego.io';
};

module.exports = {
    apiEndpoint
}