# Contentful Reference Matrix Field App

This [Contentful App](https://www.contentful.com/developers/docs/extensibility/app-framework/) adds a custom UI that represents a list of references with some associated plain text – such as a list of recipe ingredients with the respective amounts.

![](./assets/contentful-ingredients-field-demo.gif)

Inspired by [this video](https://www.youtube.com/watch?v=OtmV3TPTbRs) and bootstrapped with [Create Contentful App](https://github.com/contentful/create-contentful-app).

## Functionality overview

* Can be used on JSON Object fields
* Adds a table-like UI with an entry selection modal
* Produces data in the form of an array of JSON objects
* Each object represents a tuple of
    * a relation to another entry
    * some arbitrary text
* The following things can be configured:
    * JSON keys
    * Allowed content types for referenced entries
    * Label for the text field

## Example Data structure

The data produced by the reference matrix field type looks something like this:

```json
[
    {
        "amount": "2 tbsp",
        "id": "4skkkYCvbdHVhRfI5hdW7o"
    },
    {
        "amount": "3 tsp",
        "id": "2xFnDNGBloZzp59kddJBI6"
    },
    {
        "amount": "200g",
        "id": "2uqKK4iWHxhlRrGn24OLvy"
    }
]
```

In this example, `id` represents a relation to an entry.

`amount` is an unformatted string holding additional information about the reference.

Note that both JSON keys can be configured, as well as the allowed content types for referenced entries.

## Setup in Contentful



## Development

In the project directory, you can run:

#### `npm start`

Creates or updates your app definition in contentful, and runs the app in development mode.
Open your app to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

#### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

## More about Contentful Apps

[Read more](https://www.contentful.com/developers/docs/extensibility/app-framework/create-contentful-app/) and check out the video on how to use the CLI.

Create Contentful App uses [Create React App](https://create-react-app.dev/). You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started) and how to further customize your app.
