// Copyright 2017 Google LLC
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

const path = require('path');
const assert = require('assert');
const expect = require('expect.js');
const sinon = require('sinon');
const {request} = require('gaxios');
const {exec} = require('child_process');
const waitPort = require('wait-port');
const Email = require('email-templates');

// const program = require('..');
const {fromDecimals} = require('../index');

const startFF = async (target, signature, port) => {
  const ff = exec(
    `npx functions-framework --target=${target} --signature-type=${signature} --port=${port}`
  ).ki;
  await waitPort({host: 'localhost', port});
  return ff;
};

const httpInvocation = (fnUrl, port, data) => {
  const baseUrl = `http://localhost:${port}`;
  if (data) {
    // POST request
    return request({
      url: `${baseUrl}/${fnUrl}`,
      method: 'POST',
      data,
    });
  } else {
    // GET request
    return request({
      url: `${baseUrl}/${fnUrl}`,
    });
  }
};

const proxyquire = require('proxyquire');

var index = proxyquire('../', { './logging': {
  log:console.log,
  error:console.error,
} });

describe('index.test.js', () => {
 
  describe('splitEmails function', () => {
    it('it should return empty array', async () => {
      const arrEmails = index.splitEmails("")
      expect(arrEmails).to.be.eql([])
    });
    it('it should return array 2 length', async () => {
      const arrEmails = index.splitEmails("some@email.com|anything@email.com")
      expect(arrEmails).to.be.eql(['some@email.com','anything@email.com'])
      expect(arrEmails.length).to.be.eql(2)
    });

    it('it should return array 1 length removing comma', async () => {
      const arrEmails = index.splitEmails("some@email.com|")
      expect(arrEmails).to.be.eql(['some@email.com'])
      expect(arrEmails.length).to.be.eql(1)
    });

    it('it should return array 1 length', async () => {
      const arrEmails = index.splitEmails("some@email.com")
      expect(arrEmails).to.be.eql(['some@email.com'])
      expect(arrEmails.length).to.be.eql(1)
    });

  });

  xdescribe('Calling function directly notify_low_balance', () => {
    it('notify_low_balance: should notify', async () => {

      await index.notify_low_balance({},{
        send:(msg)=>{
          expect(msg).to.be.ok()
        }
      })
    });
  });

  xdescribe('notify_low_balance via HTTP', () => {
    const PORT = 8083;
    let ffProc;

    before(async () => {
      ffProc = await startFF('notify_low_balance', 'http', PORT);
    });

    after(() => ffProc?.kill());

    it('notify_low_balance: should notify', async () => {

      const response = await httpInvocation('notify_low_balance', PORT);
      expect(response.status).to.be.equal(200)
      // expect(response.data).to.be.equal('Sent')
      // expect('Sent').to.be.equal('Sent')
    });
  });

  xdescribe('others logics functions', () => {
    it('email-templates render', async () => {

      const accResults = [
        {
          isSendEmail: true,
          network: 'Gnosis (xdai)',
          minEthers: '1000000000000000000',
          balance: '459065754999813142',
          minEthersFormatted: '1',
          balanceFormatted: '0.459065754999813142',
          etherscan: 'https://blockscout.com/xdai/mainnet/address/0xE533BbAC5aA719f15ebfccf7050621a8A4Ff52b4',
          address: '0xE533BbAC5aA719f15ebfccf7050621a8A4Ff52b4'
        },
        {
          isSendEmail: true,
          network: 'Rinkeby',
          minEthers: '1000000000000000000',
          balance: '57933009357035317',
          minEthersFormatted: '1',
          balanceFormatted: '0.057933009357035317',
          etherscan: 'https://rinkeby.etherscan.io/address/0xE533BbAC5aA719f15ebfccf7050621a8A4Ff52b4',
          address: '0xE533BbAC5aA719f15ebfccf7050621a8A4Ff52b4'
        }
      ]

      const email = new Email({
        juice:true,
        juiceResources: {
          preserveImportant: true,
          webResources: {
            //
            // this is the relative directory to your CSS/image assets
            // and its default path is `build/`:
            //
            // e.g. if you have the following in the `<head`> of your template:
            // `<link rel="stylesheet" href="style.css" data-inline="data-inline">`
            // then this assumes that the file `build/style.css` exists
            //
            // relativeTo: path.join(__dirname, '..', 'emails')
            relativeTo: path.resolve('emails')
            //
            // but you might want to change it to something like:
            // relativeTo: path.join(__dirname, '..', 'assets')
            // (so that you can re-use CSS/images that are used in your web-app)
            //
          }
        }});
      let message= 'message empty'
      try {
        message = await email
          .render('recharge', {
            notifyAddresses: accResults
          })
      } catch (error) {
        console.error(error)
        throw error
      }

      console.log(message)
      // expect(response.data).to.be.equal('Sent')
      expect('Sent').to.be.equal('Sent')
    });
  });

  // describe('checkBalance', () => {
  //   const PORT = 8084;
  //   let ffProc;

  //   before(async () => {
  //     ffProc = await startFF('checkBalance', 'http', PORT);
  //   });

  //   after(() => {
  //       ffProc?.kill()
  //   });

  //   it('checkBalance: should test balances', async () => {
  //     const response = await httpInvocation('checkBalance', PORT);
  //     assert.strictEqual(response.status, 200);
  //     //609512754999813142
  //     const minEthers = '1'.padEnd(19,'0')
  //     console.log(minEthers)
  //     console.log(response.data)
  //     const minEthersFormatted = fromDecimals(minEthers, 18);
  //     const balanceFormatted = fromDecimals(response.data, 18);
  //     console.log(balanceFormatted)
  //     console.log(minEthersFormatted)
  //     // console.log(fromDecimals('403998897618979369367',18))
  //     //403998897618979369368
  //     if (balanceFormatted > minEthersFormatted){
  //       console.log(`All Good: Ethers above the threshold: ${minEthersFormatted}`)
  //     }else{
  //       const address = '0xE533BbAC5aA719f15ebfccf7050621a8A4Ff52b4'
  //       const message = `Need recharge!: Ethers below the threshold: ${minEthersFormatted} - current balance (${balanceFormatted}) to address: ${address}`
  //       console.log(message)
  //     }
  //     expect(balanceFormatted).to.be.above(minEthersFormatted)
  //   });
  // });

});
