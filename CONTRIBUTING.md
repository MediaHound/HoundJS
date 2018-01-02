## Development

1. Clone the repo into a local folder
2. cd into project folder
3. run `yarn install`
4. run `yarn dev`

## Testing

You will need to specify environment variables for testing. Copy the `.env.example` file and name it `.env`. Fill in your client id, secret, and API origin like `https://api.mediahound.com/`.

Run `yarn test`

## Publishing

To publish an update to the houndjs library:

1. run `yarn version`
2. run `yarn build`
3. run `yarn publish`
4. run `git push && git push --tags`
