# Check Low Balance
Small Cloud Functions to notify about low balance on the configured walllet address.

## Email Template
That service notify using the email service.

The template used you can find it here:

[Need Recharge Email Template](./email-template/need-recharge.html)

## Deploy and run

The deployment it's made by Continuous Development (CD) direct on Google Cloud Services

## Run the tests

1. Install dependencies:

        yarn install

1. Set the following environment variables:

        export GCF_REGION=us-central1
        export FUNCTIONS_TOPIC=[YOUR_PUBSUB_TOPIC]
        export FUNCTIONS_DELETABLE_BUCKET=[YOUR_CLOUD_STORAGE_BUCKET]  # will be deleted by tests!

1. Run the tests:

        yarn test
