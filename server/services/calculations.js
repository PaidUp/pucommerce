import mathjs from 'mathjs'

function round (num) {
  return mathjs.round(num, 2)
}

function card (product, amount) {
  const cardFee = product.processingFees.cardFee / 100
  const cardFeeFlat = product.processingFees.cardFeeFlat
  const paidUpFee = product.collectionFees.fee / 100
  const paidUpFeeFlat = product.collectionFees.feeFlat
  const basePrice = amount

  let result = {
    paidupFee: 0,
    processingFee: 0,
    price: 0,
    totalFee: 0
  }

  const tmpPrice = cardFeeFlat + (basePrice / (1 - cardFee))
  result.price = round(Math.ceil((tmpPrice) * 100) / 100)
  result.paidupFee = round(Math.ceil((basePrice * paidUpFee + paidUpFeeFlat) * 100) / 100)
  result.processingFee = round((tmpPrice * cardFee + cardFeeFlat))
  result.totalFee = round(result.paidupFee + result.processingFee)
  return result
}

function bank (product, amount) {
  // const achFeeCap = product.processingFees.achFeeCap
  const achFee = (product.processingFees.achFee / 100)
  const achFeeFlat = product.processingFees.achFeeFlat
  const paidUpFee = product.collectionFees.fee / 100
  const paidUpFeeFlat = product.collectionFees.feeFlat
  const basePrice = amount

  let result = {
    paidupFee: 0,
    processingFee: 0,
    price: 0,
    totalFee: 0
  }

  result.price = round(basePrice)
  result.processingFee = round(Math.ceil((result.price * achFee + achFeeFlat) * 100) / 100)
  result.paidupFee = round(Math.ceil((basePrice * paidUpFee + paidUpFeeFlat - result.processingFee) * 100) / 100)
  result.totalFee = result.paidupFee

  return result
}

export default class Calculations {
  static exec (product, type, amount) {
    let result
    if (type === 'card') {
      result = card(product, amount)
    } else if (type === 'bank_account') {
      result = bank(product, amount)
    }
    return result
  }
}
