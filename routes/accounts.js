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

  const filter = {}

  const projection = { username: 1 }

  const options = {}

  if (req.user.type === 'admin') {
    if (type) filter.type = type
    projection.email = 1
    projection.name = 1
    projection.type = 1
  }

  const accounts = await Account.find(filter, projection, options)
  return res.status(200).json(accounts)
})

router.post('/', async (req, res) => {
  try {
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password
    const name = req.body.name

    const user = await Account.findOne({ email })
    if (user) return res.status(409).json({ message: 'Account Exists' })

    const hashedPassword = await bcrypt.hash(password, 10)

    const account = new Account({ email, username, password: hashedPassword, name })
    account.save((error, result) => {
      if (error) return res.status(500).json({ message: 'Internal Server Error' })
      else return res.status(201).json({ message: 'Account Created' })
    })
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
})

module.exports = router
