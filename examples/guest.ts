// Import the module locally. You will need to import from 'ib-helper' instead!
import Helper from '../dist';

// DISCLAIMER: Using the API as guest user is significantly slower! Use proper credentials instead!

async function main() {
  // Instantiate helper class
  const helper = new Helper();

  // Login (left blank for guest access)
  await helper.login();

  // Adjust ratings to show mature content
  await helper.rating({
    nudity: true,
    violence: true,
    sexualThemes: true,
    strongViolence: true,
  });

  // ...

  // Logout to make sure the session gets invalidated
  await helper.logout();
}
main();
