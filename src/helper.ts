import api, { APIError, LoginResponse } from './api';

export default class Helper {
  username: string;
  password: string;
  sid: string | undefined;

  /**
   * Inkbunny API Helper class
   *
   * Adds a few quality of life features for use with the api.
   * @docs Based on https://wiki.inkbunny.net/wiki/API
   */
  constructor() {
    this.username = 'guest';
    this.password = '';
  }

  /**
   * Sign in with your Inkbunny credentials.
   * Please make sure that your account has the 'Enable API Access' option checked!
   *
   * Username and password can be omitted to use the api as guest user (not recommended).
   * @param [username] Your Inkbunny username
   * @param [password] Your Inkbunny password
   */
  async login(username = 'guest', password = '') {
    // Warn in guest mode
    if (this.username === 'guest') {
      console.warn('Using the API as guest user is significantly slower! Use proper credentials instead!');
    } else {
      this.username = username;
      this.password = password;
    }

    // Send login request
    const response = await api.login({ username: this.username, password: this.password });
    this.sid = response.sid;

    // Parse rating
    const data: LoginResponse & { rating: Rating } = {
      ...response,
      rating: parseRating(response.ratingsmask),
    };

    return data;
  }

  /**
   * Sign out to invalidate the current session.
   */
  logout() {
    if (this.sid === undefined) {
      throw new APIError(2, "Invalid Session ID sent as variable 'sid'.");
    }
    return api.logout({ sid: this.sid });
  }

  /**
   * Update the user content rating (guest login only).
   * @param rating Allowed ratings
   */
  rating(rating: Partial<Rating>) {
    if (this.sid === undefined) {
      throw new APIError(2, "Invalid Session ID sent as variable 'sid'.");
    }
    return api.rating({
      sid: this.sid,
      'tag[2]': rating.nudity ? 'yes' : 'no',
      'tag[3]': rating.violence ? 'yes' : 'no',
      'tag[4]': rating.sexualThemes ? 'yes' : 'no',
      'tag[5]': rating.strongViolence ? 'yes' : 'no',
    });
  }
}

export interface Rating {
  nudity: boolean;
  violence: boolean;
  sexualThemes: boolean;
  strongViolence: boolean;
}

function parseRating(mask: string) {
  mask = mask.padEnd(5, '0');
  const rating: Rating = {
    nudity: mask[1] === '1',
    violence: mask[2] === '1',
    sexualThemes: mask[3] === '1',
    strongViolence: mask[4] === '1',
  };
  return rating;
}
