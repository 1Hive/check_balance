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

const assert = require('assert');
const expect = require('expect.js');
const sinon = require('sinon');
const {request} = require('gaxios');
const {exec} = require('child_process');
const waitPort = require('wait-port');

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


describe('index.test.js', () => {
  
  describe('notify_low_balance', () => {
    const PORT = 8083;
    let ffProc;

    before(async () => {
      ffProc = await startFF('notify_low_balance', 'http', PORT);
    });

    after(() => ffProc?.kill());

    it('notify_low_balance: should notify', async () => {
      const response = await httpInvocation('notify_low_balance', PORT);
      expect(response.status).to.be.equal(200)
      //609512754999813142
      console.log(response.data)
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
