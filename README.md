# ib-helper

Makes accessing the Inkbunny API just a little bit easier. Complete with TypeScript support!

## Installation

```bash
$ npm install ib-helper
# or
$ yarn add ib-helper
```

## Prerequisites

Make sure the account you are using has 'Enable API Access' enabled, or you won't be able to login!
(https://inkbunny.net/account.php#misc)

You can alternatively use the API as guest user (not recommended). Accessing the API in that way can be significantly slower compared to using a proper account!

## Usage

### Import

```js
// ES5
const ib = require('ib-helper');
const helper = new ib.Helper();

// ES6
import Helper from 'ib-helper';
const helper = new Helper();
```

### Getting Started

```js
const ib = require('ib-helper');
const helper = new ib.Helper();

(async () => {
  // Login with your Inkbunny credentials
  await helper.login('<username>', '<password>');

  // Search submissions by tag
  const result = await helper.searchTags(['the_lion_king', 'simba']);
  const submissions = result.submissions;

  /* Here be Dragons */

  // Logout to destroy the session
  await helper.logout();
})();
```

### Direct API access (not recommended)

```js
// ES5
const api = require('ib-helper').api;

// ES6
import { api } from 'ib-helper';
```

## TypeScript

Use with TypeScript is easy! Just import the library and start coding ^^

```ts
import Helper from 'ib-helper';
const helper = new Helper();
```

![ib-helper typescript autocomplete vscode](https://i.imgur.com/n4FHFTE.png)

## Examples

### Guest user

- log in as guest user
- set ratings to only show sfw content
- fetch first page of submissions
- get second page with the `nextPage()` function
- log the title of each submission

**JavaScript ([guest.js](./examples/guest.js))** |
TypeScript Version ([guest.ts](./examples/guest.ts))

```js
const ib = require('ib-helper');

// DISCLAIMER: Using the API as guest user can be significantly slower! Use proper credentials instead!

async function main() {
  // Instantiate helper class
  const helper = new ib.Helper();

  // Login (left blank for guest access)
  /* SESSION MANAGEMENT included! (even refreshing) */
  await helper.login();

  // Adjust ratings to only show sfw content
  await helper.rating({
    nudity: false,
    violence: false,
    sexualThemes: false,
    strongViolence: false,
  });

  const submissions = [];

  /* PREWRITTEN FUNCTIONS for common use cases! */
  const firstPage = await helper.searchTags(['the_lion_king', 'simba']);
  submissions.push(...firstPage.submissions);

  /* PAGINATION FUNCTIONS for easier page iteration! */
  const secondPage = await firstPage.nextPage();
  submissions.push(...secondPage.submissions);

  // Format results
  const titles = submissions.map((s) => s.title);

  // Output submission titles
  titles.forEach((title) => {
    console.log(title);
  });

  // Logout to make sure the session gets invalidated
  await helper.logout();
}
main();
```

## Documentation

The library only specifies what is requested by the user and doesn't set custom defaults.
Always check the defaults in the Inkbunny API Documentation!
(https://wiki.inkbunny.net/wiki/API)

### Helper Class

**Constructor**

Use the 'new' keyword to create a new instance of the helper class.

```ts
const helper = new ib.Helper();
```

**Login**

Login using your Inkbunny credentials. The helper class will keep track of your session, so you don't have to worry about invalid tokens.

**Make sure you enabled API Access in your Inkbunny account settings!**

```ts
/* REQUIRES */
Helper.login(
  // Your Inkbunny username
  username?: string,
  // Your Inkbunny password
  password?: string
)

/* RETURNS */
Promise<
  // IB Login Response (https://wiki.inkbunny.net/wiki/API#Response_2)
  LoginResponse &
  {
    // Converts the ratingsmask into a readable format
    rating: UserRating;
  }
>

/* UserRating Object */
UserRating {
  nudity: boolean;
  violence: boolean;
  sexualThemes: boolean;
  strongViolence: boolean;
}
```

**Logout**

Logout to destroy your current session.

```ts
/* REQUIRES */
Helper.logout();

/* RETURNS */
Promise<
  // IB Logout Response (https://wiki.inkbunny.net/wiki/API#Response_3)
  LogoutResponse
>
```

**Change User Rating**

Logout to destroy your current session.

```ts
/* REQUIRES */
Helper.rating(
  // The new user rating
  rating: Partial<UserRating>
)

/* RETURNS */
Promise<
  // IB Rating Response (https://wiki.inkbunny.net/wiki/API#Response_4)
  RatingResponse
>

/* UserRating Object */
UserRating {
  nudity: boolean;
  violence: boolean;
  sexualThemes: boolean;
  strongViolence: boolean;
}
```

**Search Submissions**

```ts
/* REQUIRES */
Helper.search();

/* RETURNS */
```

**Search Submissions By Tag**

```ts
/* REQUIRES */
Helper.searchTags(
  // Required tags
  tags: string[],

  // Only return submission ids
  idsOnly?: boolean,

  // Request a certain page
  page?: number,

  // Amount of submissions per page
  submissionsPerPage?: number
)

/* RETURNS */
Promise<
  // IB Search Response (https://wiki.inkbunny.net/wiki/API#Response_5)
  SearchResponse &
  {
    // Fetch the next page
    nextPage: () => Promise<SearchResponse>;

    // Fetch the previous page
    previousPage: () => Promise<SearchResponse>;
  }
>
```

### Our API

If the helper class doesn't provide the functionality you need, you can always access the API directly, without using the helper functions.
