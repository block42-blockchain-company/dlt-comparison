const got = require('got');

async function main() {
  response = await got('https://api.testnet-0bsnetwork.com/v0/transactions/data?key=Khaleesi', { json: true })
  //console.log(response.body.data[0])
  //console.log(response.body.data[0].data)
  //console.log(response.body.data[0].data.data)
  console.log(response.body.data[0].data.data[0])

  //console.log(decodeBase64(response.body.data[0].data.data[0].value))
}

main()