import { Types } from 'mongoose'
let ObjectId = Types.ObjectId

export default class CommonService {
  constructor (model) {
    this.model = model
  }
  model () {
    return this.model
  }

  save (entity) {
    return this.model.save(entity).then(entity => entity)
  }

  updateById (id, values) {
    if (values.dateCharge) {
      let tmpDate = new Date(values.dateCharge)
      tmpDate.setUTCHours(16)
      values.dateCharge = tmpDate
    }
    return this.model.updateById(id, values).then(entity => entity)
  }

  getById (entityId) {
    return this.model.findById(entityId).then(entity => entity)
  }

  find (filter) {
    return this.model.find(filter).then(entities => entities)
  }

  getByIdAndFilter (id, values) {
    values._id = new ObjectId(id)
    return this.model.findOne(values).then(entity => entity)
  }

  insertMany (arr) {
    return this.model.insertMany(arr).then(docs => docs)
  }
}
