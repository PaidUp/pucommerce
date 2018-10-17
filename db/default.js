const db = 0

db.pu_commerce_invoices.createIndex({
  invoiceId: 'text',
  beneficiaryFirstName: 'text',
  beneficiaryLastName: 'text',
  'user.userFirstName': 'text',
  'user.userLastName': 'text',
  'user.userEmail': 'text'
},
{
  name: 'text-search'
})
