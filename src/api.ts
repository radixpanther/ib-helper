import fetch from 'node-fetch';

/* TYPES */
export class APIError extends Error {
  constructor(public error_code: number, public error_message: string) {
    super();
    this.message = `[${this.error_code}] - ${this.error_message}`;
  }
}
export type YesNo = 'yes' | 'no';
export type TrueFalse = 't' | 'f';
export type OrAnd = 'or' | 'and';
export type SubmissionType =
  | 'Picture/Pinup'
  | 'Sketch'
  | 'Picture Series'
  | 'Comic'
  | 'Portfolio'
  | 'Shockwave/Flash - Animation'
  | 'Shockwave/Flash - Interactive'
  | 'Video - Feature Length'
  | 'Video - Animation/3D/CGI'
  | 'Music - Album'
  | 'Writing - Document'
  | 'Character Sheet'
  | 'Photography';
export type OrderType =
  | 'create_datetime'
  | 'last_file_update_datetime'
  | 'unread_datetime'
  | 'unread_datetime_reverse'
  | 'views'
  | 'total_print_sales'
  | 'total_digital_sales'
  | 'total_sales'
  | 'username'
  | 'fav_datetime'
  | 'fav_stars'
  | 'pool_order';

export interface Submission {
  submission_id: string;
  title: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
export interface LoginResponse {
  sid: string;
  user_id: string;
  ratingsmask: string;
}

export interface LogoutRequest {
  sid: string;
}
export interface LogoutResponse {
  sid: string;
  logout: 'success';
}

export interface RatingRequest {
  sid: string;
  'tag[2]'?: YesNo;
  'tag[3]'?: YesNo;
  'tag[4]'?: YesNo;
  'tag[5]'?: YesNo;
}
export interface RatingResponse {
  sid: string;
}

export interface SearchRIDRequest {
  sid: string;
  rid?: string;
  submission_ids_only?: YesNo;
  submissions_per_page?: number;
  page?: number;
  keywords_list?: YesNo;
  no_submissions?: YesNo;
  get_rid?: YesNo;
}
export interface SearchRequest extends SearchRIDRequest {
  field_join_type?: OrAnd;
  text?: string;
  string_join_type?: OrAnd;
  keywords?: YesNo;
  title?: YesNo;
  description?: YesNo;
  md5?: YesNo;
  keyword_id?: string;
  username?: string;
  user_id?: string;
  favs_user_id?: string;
  unread_submissions?: YesNo;
  type?: string;
  sales?: 'forsale' | 'digital' | 'print';
  pool_id?: string;
  orderby?: OrderType;
  dayslimit?: number;
  random?: YesNo;
  scraps?: YesNo;
  count_limit?: number;
}
export interface SearchResponse {
  sid: string;
  user_location: string;
  results_count_all: number;
  results_count_thispage: number;
  pages_count: number;
  page: number;
  rid?: string;
  rid_ttl?: string;
  search_params: { param_name: string; param_value: any }[];
  submissions: Submission[];
}

/**
 * Access the Inkbunny API directly
 * @docs https://wiki.inkbunny.net/wiki/API
 */
export const api = {
  login: (params: LoginRequest) => request<LoginRequest, LoginResponse>('https://inkbunny.net/api_login.php', params),
  logout: (params: LogoutRequest) =>
    request<LogoutRequest, LogoutResponse>('https://inkbunny.net/api_logout.php', params),
  rating: (params: RatingRequest) =>
    request<RatingRequest, RatingResponse>('https://inkbunny.net/api_userrating.php', params),
  search: (params: SearchRequest) =>
    request<SearchRequest, SearchResponse>('https://inkbunny.net/api_search.php', params),
  searchRid: (params: SearchRIDRequest) =>
    request<SearchRIDRequest, SearchResponse>('https://inkbunny.net/api_search.php', params),
};
export default api;

const request = async <Request, Response>(url: string, params: Request): Promise<Response> => {
  // Filter parameters
  let keys = Object.keys(params) as Array<keyof typeof params>;
  keys.forEach((k) => {
    if (params[k] === undefined) {
      delete params[k];
    }
  });

  // Construct query string
  keys = Object.keys(params) as Array<keyof typeof params>;
  const queryString = keys.map((key) => key + '=' + params[key]).join('&');

  // Send request
  const response = await fetch(`${url}?output_mode=json&${queryString}`, { method: 'POST' });
  console.log(`${url}?output_mode=json&${queryString}`);
  const data = await response.json();

  // Throw custom error if request fails
  if (data.error_code) {
    throw new APIError(data.error_code, data.error_message);
  }

  return data;
};
