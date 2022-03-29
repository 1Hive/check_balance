// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

BigInt.prototype.toJSON = function() { return this.toString()  }

/* eslint-disable no-unused-vars */

// [START functions_helloworld_http]
// const escapeHtml = require('escape-html');

// [END functions_helloworld_http]

// [START functions_helloworld_get]
const functions = require('@google-cloud/functions-framework');

const {getEtherBalances}= require('@mycrypto/eth-scan');
const { ServerClient } = require('postmark');
require('dotenv').config()
const fs = require('fs');
// Register an HTTP function with the Functions Framework that will be executed
// when you make an HTTP request to the deployed function's endpoint.
functions.http('notify_low_balance', async (req, res) => {
  const {POSTMARK_SERVER_API_TOKEN, EMAIL_FROM_DEFAULT, EMAIL_TO_DEFAULT} = process.env
  const chains = [
    {
      network:'Gnosis (xdai)'
      ,provider:'https://rpc.xdaichain.com'
      ,etherscan:'https://blockscout.com/xdai/mainnet/address/{{address}}'
      ,minEthers: '1'.padEnd(19, '0')
    },
    {
      network:'Rinkeby',
      provider:'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
      ,etherscan:'https://rinkeby.etherscan.io/address/{{address}}'
    },
    // {
    //   network:'Polygon Mainnet',
    //   provider:'https://polygon-rpc.com'
    //   ,etherscan:'https://polygonscan.com/address/{{address}}'
    // },
    // {
    //   network:'Polygon Mumbai',
    //   provider:'https://rpc-mumbai.maticvigil.com'
    //   ,etherscan:'https://mumbai.polygonscan.com/address/{{address}}'
    // },
  ]
  const accResults = []
  
  for (const chain of chains) {
    const address = chain.address ?? '0xE533BbAC5aA719f15ebfccf7050621a8A4Ff52b4';
    const result = await getEtherBalances(chain.provider, [address])
    let checkResult = this.checkBalanceSendEmail(result, address, chain);
    const msg = this.replacementVar(checkResult.message, checkResult)
    checkResult = {...checkResult, message: msg}
    accResults.push(checkResult)
  }

  for (const objResult of accResults) {
    if (objResult.isSendEmail === true && EMAIL_TO_DEFAULT && POSTMARK_SERVER_API_TOKEN && EMAIL_FROM_DEFAULT){
      // Send email here
      const postmarkClient = new ServerClient(POSTMARK_SERVER_API_TOKEN)
      postmarkClient.sendEmail({
        From:EMAIL_FROM_DEFAULT,
        To:EMAIL_TO_DEFAULT,
        HtmlBody:objResult.message,
        Subject:'Balance Notification'
      })
    }
  }

  res.send(accResults)

});

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
 functions.http('checkBalance',(req, res) => {
  getEtherBalances('https://rpc.xdaichain.com', [
    '0xE533BbAC5aA719f15ebfccf7050621a8A4Ff52b4'
  ]).then(result=>{
    BigInt.prototype.toJSON = function() { return this.toString()  }

    res.send(JSON.stringify(result['0xE533BbAC5aA719f15ebfccf7050621a8A4Ff52b4']));
  });
});


/**
 * Get the whole and decimal parts from a number.
 * Trims leading and trailing zeroes.
 *
 * @param {string} num the number
 * @returns {Array<string>} array with the [<whole>, <decimal>] parts of the number
 */
 exports.splitDecimalNumber = (num) => {
  const [whole = '', dec = ''] = num.split('.')
  return [
    whole.replace(/^0*/, ''), // trim leading zeroes
    dec.replace(/0*$/, ''), // trim trailing zeroes
  ]
}

exports.fromDecimals = (num, decimals, { truncate = true } = {}) =>{
  const [whole, dec] = this.splitDecimalNumber(num)
  if (!whole && !dec) {
    return '0'
  }

  const paddedWhole = whole.padStart(decimals + 1, '0')
  const decimalIndex = paddedWhole.length - decimals
  const wholeWithoutBase = paddedWhole.slice(0, decimalIndex)
  const decWithoutBase = paddedWhole.slice(decimalIndex)

  if (!truncate && dec) {
    // We need to keep all the zeroes in this case
    return `${wholeWithoutBase}.${decWithoutBase}${dec}`
  }

  // Trim any trailing zeroes from the new decimals
  const decWithoutBaseTrimmed = decWithoutBase.replace(/0*$/, '')
  if (decWithoutBaseTrimmed) {
    return `${wholeWithoutBase}.${decWithoutBaseTrimmed}`
  }

  return wholeWithoutBase
}

exports.checkBalanceSendEmail = (result, address, chain)=>{
  let {network, etherscan} = chain

  etherscan = replaceAllVar(etherscan,'address',address)

  const balance = result[address].toString();
  const minEthers = chain.minEthers ?? '1'.padEnd(19, '0');
  const minEthersFormatted = this.fromDecimals(minEthers, 18);
  const balanceFormatted = this.fromDecimals(balance, 18);
  let isSendEmail = false;
  let message;

  if (balanceFormatted > minEthersFormatted) {
    message = `All Good: Ethers above the threshold: ${minEthersFormatted} - current balance (${balanceFormatted}) to address: ${address}`;
  } else {
    message = fs.readFileSync('email-template/need-recharge.html', 'utf8');
    isSendEmail = true
  }
  return {isSendEmail, network, minEthers, balance, minEthersFormatted, balanceFormatted, message, etherscan, address};
}

exports.replacementVar = (message, replacements)=>{
  const subject = 'Balance Notification';
  let ret;
    if (message) {
      const replacement = {
        ...replacements,
        subject,
      };

      for (const key in replacement) {
        if (Object.hasOwnProperty.call(replacement, key)) {
          const value = replacement[key];
          message = replaceAllVar(message, key, value);
        }
      }
      ret = message
      }
      return ret;
    }
function replaceAllVar(message, key, value) {
  message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
  return message;
}

