// Import the module locally. You will need to import from 'ib-helper' instead!
import Helper, { Submission } from '../src';

// DISCLAIMER: Using the API as guest user can be significantly slower! Use proper credentials instead!

async function main() {
  // Instantiate helper class
  const helper = new Helper();

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

  const submissions: Submission[] = [];

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
