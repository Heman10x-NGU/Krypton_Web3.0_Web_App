//  https://eth-ropsten.alchemyapi.io/v2/7Yl7ZGDYQsr6-1nUa7x64FpDz4NCYYJg


require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: '0.8.0',
  networks:{
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/7Yl7ZGDYQsr6-1nUa7x64FpDz4NCYYJg',
      accounts:[ 'c72a5a7b013793a35495b1ea0d765c5436b0cf4faf6f2e478486721068e521cd']

    }
  }
}