# gatsby-source-medusa

<div id="getting-started"></div>

## Getting started&nbsp;&nbsp;🚀

This takes you through the minimal steps to see your Medusa data in your Gatsby site's GraphiQL explorer.

<div id="install"></div>

### Install&nbsp;&nbsp;🛠️

Install this plugin to your Gatsby site.

```shell
npm install gatsby-source-medusa
```
or

```shell
yarn add gatsby-source-medusa
```

<div id="configure"></div>

### Configure&nbsp;&nbsp;⚙️

Add the plugin to your `gatsby-config.js`:

```js:title=gatsby-config.js
require("dotenv").config()

module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-medusa",
      options: {
        baseUrl: process.env.MEDUSA_BASE_URL,
        fields: ["products", "regions"],
      },
    },
    ...,
  ],
}
```

<div id="supported-fields"></div>

## Supported field types&nbsp;&nbsp;🧱

The source plugin currently only supports the fields: products and regions.
