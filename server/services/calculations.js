import { Math } from 'pu-common'

export default class Calculations {
  static card (product, due) {
    const cardFee = product.processingFees.cardFee / 100
    const cardFeeFlat = product.processingFees.cardFeeFlat
    const paidUpFee = product.collectionFees.fee / 100
    const paidUpFeeFlat = product.collectionFees.feeFlat
    const price = due.amount
    const processing = product.payFees.processing
    const collect = product.payFees.collect

    var result = {
      paidupFee: 0,
      priceBase: 0
    }

    if (!processing && collect) {
      result.priceBase = Math.round((price - paidUpFeeFlat) / (1 + paidUpFee))
    } else if (!processing && !collect) {
      result.priceBase = Math.round(price)
    } else if (processing && collect) {
      result.priceBase = Math.round((price - price * cardFee - paidUpFeeFlat - cardFeeFlat) / (1 + paidUpFee))
    } else if (processing && !collect) {
      result.priceBase = Math.round(price - price * cardFee - cardFeeFlat)
    }

    result.paidupFee = Math.round(result.priceBase * paidUpFee + paidUpFeeFlat)

    return result
  }

  static bank (product, due) {
    const achFeeCap = product.processingFees.achFeeCap
    const achFee = (product.processingFees.achFee / 100)
    const achFeeFlat = product.processingFees.achFeeFlat
    const paidUpFee = product.collectionFees.fee / 100
    const paidUpFeeFlat = product.collectionFees.feeFlat
    const price = due.amount
    const collect = product.payFees.collect
    const processing = product.payFees.processing

    var result = {
      priceBase: 0,
      paidupFee: 0
    }

    if (!processing && collect) {
      result.priceBase = Math.round((price - paidUpFeeFlat) / (1 + paidUpFee))
    } else if (!processing && !collect) {
      result.priceBase = Math.round(price)
    } else if (processing && collect) {
      if (price <= (achFeeCap / achFee)) {
        result.priceBase = Math.round((price - price * achFee - paidUpFeeFlat - achFeeFlat) / (1 + paidUpFee))
      } else {
        result.priceBase = Math.round((price - achFeeCap - paidUpFeeFlat) / (1 + paidUpFee))
      }
    } else if (processing && !collect) {
      if (price <= (achFeeCap / achFee)) {
        result.priceBase = Math.round(price - price * achFee - achFeeFlat)
      } else {
        result.priceBase = Math.round(price - achFeeCap - achFeeFlat)
      }
    }

    result.paidupFee = Math.round(result.priceBase * paidUpFee + paidUpFeeFlat)

    return result
  }
}
