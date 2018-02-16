import Math from './math'

export default class Calculations {
  static card (inputs) {
    const cardFee = inputs.stripePercent / 100
    const cardFeeFlat = inputs.stripeFlat
    const paidUpFee = inputs.paidUpFee / 100
    const paidUpFeeFlat = inputs.paidUpFeeFlat
    const price = inputs.originalPrice
    const processing = inputs.payProcessing
    const collect = inputs.payCollecting

    var result = {
      feePaidUp: 0,
      basePrice: 0
    }

    if (!processing && collect) {
      result.basePrice = Math.round((price - paidUpFeeFlat) / (1 + paidUpFee))
    } else if (!processing && !collect) {
      result.basePrice = Math.round(price)
    } else if (processing && collect) {
      result.basePrice = Math.round((price - price * cardFee - paidUpFeeFlat - cardFeeFlat) / (1 + paidUpFee))
    } else if (processing && !collect) {
      result.basePrice = Math.round(price - price * cardFee - cardFeeFlat)
    }

    result.feePaidUp = Math.round(result.basePrice * paidUpFee + paidUpFeeFlat)

    return result
  }

  static bank (inputs) {
    const achFeeCap = inputs.achFeeCap
    const achFee = (inputs.achFee / 100)
    const achFeeFlat = inputs.achFeeFlat
    const paidUpFee = inputs.paidUpFee / 100
    const paidUpFeeFlat = inputs.paidUpFeeFlat
    const price = inputs.price
    const collect = inputs.payCollecting
    const processing = inputs.payProcessing

    var result = {
      basePrice: 0,
      feePaidUp: 0
    }

    if (!processing && collect) {
      result.basePrice = Math.round((price - paidUpFeeFlat) / (1 + paidUpFee))
    } else if (!processing && !collect) {
      result.basePrice = Math.round(price)
    } else if (processing && collect) {
      if (price <= (achFeeCap / achFee)) {
        result.basePrice = Math.round((price - price * achFee - paidUpFeeFlat - achFeeFlat) / (1 + paidUpFee))
      } else {
        result.basePrice = Math.round((price - achFeeCap - paidUpFeeFlat) / (1 + paidUpFee))
      }
    } else if (processing && !collect) {
      if (price <= (achFeeCap / achFee)) {
        result.basePrice = Math.round(price - price * achFee - achFeeFlat)
      } else {
        result.basePrice = Math.round(price - achFeeCap - achFeeFlat)
      }
    }

    result.feePaidUp = Math.round(result.basePrice * paidUpFee + paidUpFeeFlat)
  }
}
