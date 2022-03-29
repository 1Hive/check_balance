require('dotenv').config()
const {spawn} = require('child_process');

var cmd = 'gcloud' 
let cmdCross = process.platform === "win32" ? `${cmd}.cmd`: cmd

const {EMAIL_FROM_DEFAULT,POSTMARK_SERVER_API_TOKEN,EMAIL_TO_DEFAULT} = process.env


if (!EMAIL_TO_DEFAULT || !POSTMARK_SERVER_API_TOKEN || !EMAIL_TO_DEFAULT){
  throw new Error('.env file with envs not found')
}
  
function spawnUpdateVars() {
  const ls = spawn(
      cmdCross, ['functions', 'deploy',`notify_low_balance`, 
    `--set-env-vars`, 
    `EMAIL_FROM_DEFAULT=${EMAIL_FROM_DEFAULT},POSTMARK_SERVER_API_TOKEN=${POSTMARK_SERVER_API_TOKEN},EMAIL_TO_DEFAULT=${EMAIL_TO_DEFAULT}`]
  )
  
  process.on('SIGINT', () => {
    console.log('SIGINT killing spawn child process')
    ls.kill()
    process.exit()
  });

  ls.stdout.on('data', function (data) {
    console.log('stdout: ' + data.toString());
  });
  
  ls.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
  });
  
  ls.on('exit', function (code) {
    console.log('child process exited with code ' + code.toString());
  });
}

const Confirm = require('prompt-confirm');
const prompt = new Confirm('Do you really want replace ENV Vars in Google Cloud?');


async function main(){
  await prompt.ask(async function(answer) {
    if (answer){
      await prompt.ask(function(answer) {
        if (answer){
          spawnUpdateVars()
        }
      });
    }
  });
}

main()

