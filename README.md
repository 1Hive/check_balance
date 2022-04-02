# Notify Low Balance
Small Cloud Functions to notify about low balance on the configured walllet address.

![Email notification](./git_assets/email-example.png)

## Email Template
That service notify using the email service.

The template used you can find it here:

[Need Recharge Pug Template](./emails/recharge.pug)

[Need Recharge CSS ](./emails/styles.css)

It's use [email-templates](https://github.com/forwardemail/email-templates) that uses [pugjs](https://github.com/pugjs/pug) under the hood. 

Generating compatible email html to be send.

## Env Configurations

```
EMAIL_FROM_DEFAULT= #email address appears like sender
POSTMARK_SERVER_API_TOKEN= # token api to send emails
EMAIL_TO_DEFAULT= # email to send the notifications
```

## Deploy and run

The deployment it's made by Continuous Development (CD) direct on Google Cloud Services

## Run the tests

1. Install dependencies:

        yarn install

1. Run the tests:

        yarn test
