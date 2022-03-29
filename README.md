# Check Low Balance
Small Cloud Functions to notify about low balance on the configured walllet address.

## Deploy and run

```
yarn install
```

## Run the tests

1. Install dependencies:

        yarn install

1. Set the following environment variables:

        export GCF_REGION=us-central1
        export FUNCTIONS_TOPIC=[YOUR_PUBSUB_TOPIC]
        export FUNCTIONS_DELETABLE_BUCKET=[YOUR_CLOUD_STORAGE_BUCKET]  # will be deleted by tests!

1. Run the tests:

        yarn test
