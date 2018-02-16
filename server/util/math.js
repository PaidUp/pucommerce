import mathjs from 'mathjs'

export default class Math {
  static round (num) {
    return mathjs.round(num, 2)
  }
}
