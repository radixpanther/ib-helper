import api, { APIError, LoginResponse, SearchRequest, SearchResponse, SearchRIDRequest } from './api';
import _debug from 'debug';
const debug = _debug('helper');

export class Helper {
  private username: string;
  private password: string;
  sid: string | undefined;

  private guestRating: Partial<UserRating> | undefined;

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
   * Login using your Inkbunny credentials.
   * Please make sure that your account has the 'Enable API Access' option checked!
   *
   * Username and password can be omitted to use the api as guest user (not recommended).
   * @param [username] Your Inkbunny username
   * @param [password] Your Inkbunny password
   */
  async login(username = 'guest', password = '') {
    // Warn in guest mode
    if (username === 'guest') {
      console.warn('Using the API as guest user can be significantly slower! Use proper credentials instead!');
    } else {
      this.username = username;
      this.password = password;
    }

    // Send login request
    const response = await api.login({ username: this.username, password: this.password });
    this.sid = response.sid;

    // Parse rating
    const data: LoginResponse & { rating: UserRating } = {
      ...response,
      rating: parseUserRating(response.ratingsmask),
    };

    return data;
  }

  /**
   * Sign out to invalidate the current session.
   */
  async logout() {
    const request = () => {
      return api.logout({
        sid: this.sid || '',
      });
    };
    const data = requestWithRetry(request, {
      2: this.handleSID,
    });

    // Invalidate session
    this.sid = undefined;
    this.username = '';
    this.password = '';
    this.guestRating = undefined;

    return data;
  }

  /**
   * Update the user content rating (guest login only).
   * @param rating The new user rating
   */
  async rating(rating: Partial<UserRating>) {
    const request = () => {
      return api.rating({
        sid: this.sid || '',
        'tag[2]': rating.nudity ? 'yes' : 'no',
        'tag[3]': rating.violence ? 'yes' : 'no',
        'tag[4]': rating.sexualThemes ? 'yes' : 'no',
        'tag[5]': rating.strongViolence ? 'yes' : 'no',
      });
    };
    const data = await requestWithRetry(request, {
      2: this.handleSID,
    });
    this.guestRating = rating;
    return data;
  }

  /**
   * Search submissions based on various factors. All properties from the API are accessible.
   * @param params Request Parameters
   */
  async search(params: Omit<SearchRequest, 'sid'>) {
    const request = () => {
      return api.search({
        sid: this.sid || '',
        ...params,
      });
    };
    const response = await requestWithRetry(request, {
      2: this.handleSID,
    });

    // Inject pagination functions
    const pageHelpers = this.pagination(
      {
        sid: this.sid || '',
        ...params,
      },
      response
    );

    const data: SearchResponse & typeof pageHelpers = {
      ...response,
      ...pageHelpers,
    };
    return data;
  }

  private async searchRID(request: SearchRequest, params: Omit<SearchRIDRequest, 'sid'>) {
    const r = () => {
      return api.searchRid({
        sid: this.sid || '',
        ...params,
      });
    };
    const response = await requestWithRetry(r, {
      2: this.handleSID,
    });

    // Inject pagination functions
    const pageHelpers = this.pagination(
      {
        ...request,
        sid: this.sid || '',
      },
      response
    );

    const data: SearchResponse & PageHelpers = {
      ...response,
      ...pageHelpers,
    };
    return data;
  }

  /**
   * Search submissions that contain certain tags.
   * @param tags Required tags
   * @param idsOnly Only return submission ids
   * @param page Request a certain page
   * @param submissionsPerPage Amount of submissions per page
   */
  async searchTags(tags: string[], idsOnly = false, page = 1, submissionsPerPage = 30) {
    const params: Partial<SearchRequest> = {
      submission_ids_only: idsOnly ? 'yes' : 'no',
      submissions_per_page: submissionsPerPage,
      page,
      get_rid: 'yes',
      string_join_type: 'and',
      text: tags.map((t) => t.replace(' ', '_')).join(','),
      keywords: 'yes',
    };

    const request = () => {
      return api.search({
        sid: this.sid || '',
        ...params,
      });
    };
    const response = await requestWithRetry(request, {
      2: this.handleSID,
    });

    // Inject pagination functions
    const pageHelpers = this.pagination(
      {
        sid: this.sid || '',
        ...params,
      },
      response
    );

    const data: SearchResponse & PageHelpers = {
      ...response,
      ...pageHelpers,
    };
    return data;
  }

  /**
   * Access the full details about specified submissions.
   * @param ids Submissions ids to fetch
   * @param includeDescription Include the description
   * @param includePools Inlcude associated pools
   * @param includeWriting Inlcude writing (stories)
   */
  async details(ids: string | string[], includeDescription = false, includePools = false, includeWriting = false) {
    const request = () => {
      let idsString;
      if (Array.isArray(ids)) {
        idsString = ids.join(',');
      } else {
        idsString = ids;
      }
      return api.details({
        sid: this.sid || '',
        submission_ids: idsString,
        show_description: includeDescription ? 'yes' : 'no',
        show_description_bbcode_parsed: includeDescription ? 'yes' : 'no',
        show_pools: includePools ? 'yes' : 'no',
        show_writing: includeWriting ? 'yes' : 'no',
        show_writing_bbcode_parsed: includeWriting ? 'yes' : 'no',
        sort_keywords_by: 'alphabetical',
      });
    };
    return requestWithRetry(request, {
      2: this.handleSID,
    });
  }

  // SID Error Handler - Refreshes the current session.
  private handleSID = async () => {
    const response = await api.login({ username: this.username, password: this.password });
    this.sid = response.sid;

    // Readjust ratings if using guest
    if (this.username === 'guest' && this.guestRating) {
      await this.rating(this.guestRating);
    }
  };

  // RID Error Handler - Executes the orignial search instead.
  private handleRID = (originalRequest: () => Promise<SearchResponse>) => {
    return async () => {
      return originalRequest;
    };
  };

  private pagination(request: SearchRequest, response: SearchResponse) {
    const params: Partial<SearchRIDRequest> = {
      get_rid: 'yes',
      rid: response.rid,
      keywords_list: request.keywords_list,
      no_submissions: request.no_submissions,
      submission_ids_only: request.submission_ids_only,
      submissions_per_page: request.submissions_per_page,
    };

    const pageHelpers: PageHelpers = {
      /** Returns the next page of submissions. */
      nextPage: () => {
        const r = () => {
          if (params.rid === undefined) {
            throw new APIError(3, "Invalid Results ID sent as variable 'rid'. It contains invalid characters.");
          }
          return this.searchRID(request, {
            ...params,
            page: response.page ? response.page + 1 : undefined,
          });
        };
        const alt = () => {
          return this.search({
            ...request,
            page: response.page ? response.page + 1 : undefined,
          });
        };
        return <Promise<SearchResponse & PageHelpers>>requestWithRetry(r, {
          2: this.handleSID,
          3: this.handleRID(alt),
          4: this.handleRID(alt),
        });
      },
      /** Returns the previous page of submissions. */
      previousPage: () => {
        const r = () => {
          if (params.rid === undefined) {
            throw new APIError(3, "Invalid Results ID sent as variable 'rid'. It contains invalid characters.");
          }
          return this.searchRID(request, {
            ...params,
            page: response.page ? response.page - 1 : undefined,
          });
        };
        const alt = () => {
          return this.search({
            ...request,
            page: response.page ? response.page - 1 : undefined,
          });
        };
        return <Promise<SearchResponse & PageHelpers>>requestWithRetry(r, {
          2: this.handleSID,
          3: this.handleRID(alt),
          4: this.handleRID(alt),
        });
      },
    };
    return pageHelpers;
  }
}
export default Helper;

const requestWithRetry = async <T>(
  request: () => Promise<T>,
  handlers: { [key: number]: () => Promise<(() => Promise<T>) | void> },
  lastError?: number
): Promise<T> => {
  try {
    return await request();
  } catch (e: any) {
    // Typecast error
    let error;
    if ('error_code' in e && 'error_message' in e) {
      error = e as APIError;
    } else {
      throw e;
    }
    debug(`[${error.error_code}] - ${error.error_message}`);

    // Throw error if retry failed
    if (lastError === error.error_code) {
      throw e;
    }

    // Execute handler
    const handler = handlers[error.error_code];
    if (handler === undefined) {
      throw e;
    }
    const override = await handler();
    if (override === undefined) {
      return requestWithRetry(request, handlers, error.error_code);
    } else {
      return requestWithRetry(override, handlers, error.error_code);
    }
  }
};

export interface PageHelpers {
  nextPage: () => Promise<SearchResponse & PageHelpers>;
  previousPage: () => Promise<SearchResponse & PageHelpers>;
}

export interface UserRating {
  nudity: boolean;
  violence: boolean;
  sexualThemes: boolean;
  strongViolence: boolean;
}

function parseUserRating(mask: string) {
  mask = mask.padEnd(5, '0');
  const rating: UserRating = {
    nudity: mask[1] === '1',
    violence: mask[2] === '1',
    sexualThemes: mask[3] === '1',
    strongViolence: mask[4] === '1',
  };
  return rating;
}
