import mongoose from 'mongoose'
import config from '@/config/environment'

const schema = {
  id: { type: String, required: true },
  seq: { type: String, required: true }
}

let sequenceModel

export default class SequenceModel {
  constructor () {
    this.schema = new mongoose.Schema(schema)
    this.Model = mongoose.model(
      'sequence',
      this.schema,
      config.mongo.prefix + 'secuences'
    )
  }

  static getInstance (name) {
    if (!sequenceModel) {
      sequenceModel = new SequenceModel()
    }
    return new Promise((resolve, reject) => {
      this.Model.findOneAndUpdate({ _id: name }, {$set: {seq: 'Naomi'}}, {new: true}, function (err, doc) {
        if (err) {
          console.log('Something wrong when updating data!')
        }

        console.log(doc)
      })
    })
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
}
