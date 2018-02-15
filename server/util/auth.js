// import config from '@/config/environment'
import Redis from '@/db/redis'
import jwt from 'jsonwebtoken'

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */

function serverTokenAuthenticated (req) {
  let token
  // allow access_token to be passed through query parameter as well
  if (req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.query && req.query.hasOwnProperty('token')) {
    token = req.query.token
  } else if (req.body && req.body.token) {
    token = req.body.token
  } else if (req.query && req.query.hasOwnProperty('access_token')) {
    token = req.query.token
  }
  return token
}

let secret

export function setCredential (credential) {
  secret = credential
}

export function revoke (req, res, next) {
  if (!secret) {
    throw new Error('first must set cretendials, use fn setCredential')
  }
  let token = serverTokenAuthenticated(req)
  if (!token) {
    return res.sendStatus(401)
  }
  const decoded = jwt.decode(token)
  if (decoded) {
    Redis.del(decoded.user.email)
  }
  next()
}

export function validate (req, res, next) {
  if (!secret) {
    throw new Error('first must set cretendials, use fn setCredential')
  }
  let token = serverTokenAuthenticated(req)
  if (!token) {
    return res.sendStatus(401)
  }
  jwt.verify(token, secret, (error, decoded) => {
    if (error) {
      return res.status(500).json({error, message: 'invalid token'})
    }
    Redis.get(decoded.user.email).then(value => {
      if (token !== value) return res.sendStatus(401)
      req.user = decoded.user
      next()
    }).catch(reason => {
      res.sendStatus(500).json(reason)
    })
  })
}
