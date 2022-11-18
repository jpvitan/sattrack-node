/*

sattrack-node
RESTful API for retrieving useful satellite information.

LICENSE: MIT License
Created by Justine Paul Sanchez Vitan.
Copyright © 2022 Justine Paul Sanchez Vitan. All rights reserved.

*/

const express = require('express')
const bcrypt = require('bcrypt')
const auth = require('./auth')
const Account = require('../models/account')

const router = express.Router()

router.get('/', auth.checkAuthentication, async (req, res) => {
    const { type } = req.query
    const query = {}

    const field = { username: 1 }
    if (req.user.type === 'admin') {
        field.email = 1
        field.name = 1
        field.type = 1
        if (type) {
            query.type = type
        }
    }

    const accounts = await Account.find(query, field)
    return res.status(200).json(accounts)
})

router.post('/', async (req, res) => {
    try {
        const email = req.body.email
        const username = req.body.username
        const password = req.body.password
        const name = req.body.name

        const user = await Account.findOne({ email: email })
        if (user) return res.status(409).json({ message: 'Account Exists' })

        const hashedPassword = await bcrypt.hash(password, 10)

        const account = new Account({ email: email, username: username, password: hashedPassword, name: name })
        account.save((error, result) => {
            if (error) {
                return res.status(500).json({ message: 'Internal Server Error' })
            } else {
                return res.status(201).json({ message: 'Account Created' })
            }
        })
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' })
    }
})

module.exports = router
