const Cloud = require('@google-cloud/storage')
const path = require('path')
const serviceKey = path.join(__dirname, './capstone-repoth-14f9c6482f40.json') // bucket creds

const { Storage } = Cloud
const storage = new Storage({
    keyFilename: serviceKey,
    projectId: 'capstone-repoth',
})

module.exports = storage