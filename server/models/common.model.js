import mongoose from 'mongoose'
import config from '@/config/environment'

export default class CommonModel {
  constructor (name, document, schemaObj) {
    schemaObj['createOn'] = { type: Date, default: Date.now }
    schemaObj['updateOn'] = { type: Date, default: Date.now }
    this.schema = new mongoose.Schema(schemaObj)
    this.Model = mongoose.model(
      name,
      this.schema,
      config.mongo.prefix + document
    )
  }

  get collection () {
    return this.Model
  }

  save (pp) {
    return new Promise((resolve, reject) => {
      try {
        let model = new this.Model(pp)
        model.save((err, data) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        })
      } catch (error) {
        return reject(error)
      }
    })
  }

  find (filter) {
    return new Promise((resolve, reject) => {
      try {
        this.Model.find(filter, (err, data) => {
          if (err) return reject(err)
          resolve(data)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  findOne (filter) {
    return new Promise((resolve, reject) => {
      this.Model.findOne(filter, (err, data) => {
        try {
          if (err) return reject(err)
          resolve(data)
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  updateById (id, value) {
    value['$inc'] = {__v: 1}
    return new Promise((resolve, reject) => {
      try {
        this.Model.findByIdAndUpdate(id, value, { new: true }, (err, data) => {
          if (err) return reject(err)
          resolve(data)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  findById (_id) {
    return this.Model.findById(_id).exec()
  }

  removeById (_id) {
    return new Promise((resolve, reject) => {
      this.Model.findByIdAndRemove(_id, (err, doc) => {
        if (err) return reject(err)
        resolve(doc)
      })
    })
  }

  insertMany (arr) {
    return new Promise((resolve, reject) => {
      this.Model.insertMany(arr, (error, docs) => {
        if (error) return reject(error)
        resolve(docs)
      })
    })
  }
}
