const express = require('express');
const router = express.Router();
const { isCommunicationAvailable } = require('../services/communicationService');

router.get('/check-connection', (req, res) => {
    if (isCommunicationAvailable()) {
        res.sendStatus(200);
    } else {
        res.sendStatus(503);
    }
});

module.exports = router;