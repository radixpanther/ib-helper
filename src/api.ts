import fetch from 'node-fetch';
import _debug from 'debug';
const debug = _debug('api');

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

interface BaseSubmission {
  submission_id: string;
  title: string;
  deleted: TrueFalse;
  public: TrueFalse;
  hidden: TrueFalse;
  scraps: TrueFalse;
  guest_block: TrueFalse;
  friends_only: TrueFalse;
  submission_type_id: number;
  type_name: string;
  mimetype: string;
  pagecount: number;
  latest_mimetype?: string;
  rating_id: 0 | 1 | 2;
  rating_name: string;
  digitalsales: TrueFalse;
  printsales: TrueFalse;

  username: string;
  user_id: string;

  create_datetime: string;
  create_datetime_usertime: string;
  last_file_update_datetime: string;
  last_file_update_datetime_usertime: string;

  file_name: string;
  latest_file_name?: string;

  latest_thumbnail_url_medium?: string;
  latest_thumbnail_url_large?: string;
  latest_thumbnail_url_huge?: string;
  latest_thumbnail_url_medium_noncustom?: string;
  latest_thumbnail_url_large_noncustom?: string;
  latest_thumbnail_url_huge_noncustom?: string;

  thumbnail_url_medium?: string;
  thumbnail_url_large?: string;
  thumbnail_url_huge?: string;
  thumbnail_url_medium_noncustom?: string;
  thumbnail_url_large_noncustom?: string;
  thumbnail_url_huge_noncustom?: string;

  file_url_full: string;
  file_url_screen: string;
  file_url_preview: string;

  thumb_medium_x?: string;
  thumb_large_x?: string;
  thumb_huge_x?: string;
  thumb_medium_y?: string;
  thumb_large_y?: string;
  thumb_huge_y?: string;

  thumb_medium_noncustom_x?: string;
  thumb_large_noncustom_x?: string;
  thumb_huge_noncustom_x?: string;
  thumb_medium_noncustom_y?: string;
  thumb_large_noncustom_y?: string;
  thumb_huge_noncustom_y?: string;

  latest_thumb_medium_x?: string;
  latest_thumb_large_x?: string;
  latest_thumb_huge_x?: string;
  latest_thumb_medium_y?: string;
  latest_thumb_large_y?: string;
  latest_thumb_huge_y?: string;

  latest_thumb_medium_noncustom_x?: string;
  latest_thumb_large_noncustom_x?: string;
  latest_thumb_huge_noncustom_x?: string;
  latest_thumb_medium_noncustom_y?: string;
  latest_thumb_large_noncustom_y?: string;
  latest_thumb_huge_noncustom_y?: string;
}

export interface Submission extends BaseSubmission {
  unread_datetime?: string;
  unread_datetime_usertime?: string;

  updated?: TrueFalse;
  stars?: number;
}

export interface DetailedSubmission extends BaseSubmission {
  keywords: Keyword[];
  files: File[];
  pools?: Pool[];
  prints?: Print[];

  favorites_count: string;
  comments_count: string;
  views: string;
  pools_count: number;
  description?: string;
  description_bbcode_parsed?: string;
  writing?: string;
  writing_bbcode_parsed?: string;
  ratings: Rating;
  favorite: TrueFalse;
  sales_description: string | null;
  forsale: TrueFalse;
  digital_price: string;

  user_icon_file_name: string | null;
  user_icon_url_small: string | null;
  user_icon_url_medium: string | null;
  user_icon_url_large: string | null;

  latest_file_url_full?: string;
  latest_file_url_screen?: string;
  latest_file_url_preview?: string;
}

export interface Print {
  print_size_id: number;
  name: string;
  price: number;
  price_owner_discount: number;
}

export interface Rating {
  content_tag_id: string;
  name: string;
  description: string;
  rating_id: string;
}

export interface Keyword {
  keyword_id: string;
  keyword_name: string;
  contributed: TrueFalse;
  submissions_count: string;
}

export interface File {
  file_id: string;
  file_name: string;

  thumbnail_url_medium?: string;
  thumbnail_url_large?: string;
  thumbnail_url_huge?: string;
  thumbnail_url_medium_noncustom?: string;
  thumbnail_url_large_noncustom?: string;
  thumbnail_url_huge_noncustom?: string;

  file_url_full: string;
  file_url_screen: string;
  file_url_preview: string;
  mimetype: string;
  submission_id: string;
  user_id: string;
  submission_file_order: string;

  full_size_x: string | null;
  screen_size_x: string | null;
  preview_size_x: string | null;
  full_size_y: string | null;
  screen_size_y: string | null;
  preview_size_y: string | null;

  thumb_huge_x?: string;
  thumb_large_x?: string;
  thumb_medium_x?: string;
  thumb_huge_y?: string;
  thumb_large_y?: string;
  thumb_medium_y?: string;

  thumb_huge_noncustom_x?: string;
  thumb_large_noncustom_x?: string;
  thumb_medium_noncustom_x?: string;
  thumb_huge_noncustom_y?: string;
  thumb_large_noncustom_y?: string;
  thumb_medium_noncustom_y?: string;

  initial_file_md5: string;
  full_file_md5: string;
  large_file_md5: string;
  small_file_md5: string;
  thumbnail_md5: string;

  deleted: TrueFalse;
  create_datetime: string;
  delcreate_datetime_usertimeeted: string;
}

export interface Pool {
  pool_id: string;
  name: string;
  description: string;
  count: string;
  submission_left_submission_id?: string;
  submission_right_submission_id?: string;
  submission_left_file_name?: string;
  submission_right_file_name?: string;
  submission_left_thumbnail_url_medium?: string;
  submission_left_thumbnail_url_large?: string;
  submission_left_thumbnail_url_huge?: string;
  submission_right_thumbnail_url_medium?: string;
  submission_right_thumbnail_url_large?: string;
  submission_right_thumbnail_url_huge?: string;
  submission_left_thumbnail_url_medium_noncustom?: string;
  submission_left_thumbnail_url_large_noncustom?: string;
  submission_left_thumbnail_url_huge_noncustom?: string;
  submission_left_thumb_medium_x?: string;
  submission_left_thumb_large_x?: string;
  submission_left_thumb_huge_x?: string;
  submission_left_thumb_medium_y?: string;
  submission_left_thumb_large_y?: string;
  submission_left_thumb_huge_y?: string;
  submission_right_thumb_medium_x?: string;
  submission_right_thumb_large_x?: string;
  submission_right_thumb_huge_x?: string;
  submission_right_thumb_medium_y?: string;
  submission_right_thumb_large_y?: string;
  submission_right_thumb_huge_y?: string;
  submission_left_thumb_medium_noncustom_x?: string;
  submission_left_thumb_large_noncustom_x?: string;
  submission_left_thumb_huge_noncustom_x?: string;
  submission_left_thumb_medium_noncustom_y?: string;
  submission_left_thumb_large_noncustom_y?: string;
  submission_left_thumb_huge_noncustom_y?: string;
  submission_right_thumb_medium_noncustom_x?: string;
  submission_right_thumb_large_noncustom_x?: string;
  submission_right_thumb_huge_noncustom_x?: string;
  submission_right_thumb_medium_noncustom_y?: string;
  submission_right_thumb_large_noncustom_y?: string;
  submission_right_thumb_huge_noncustom_y?: string;
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

export interface DetailsRequest {
  sid: string;
  submission_ids: string;
  sort_keywords_by?: 'alphabetical' | 'submissions_count';
  show_description?: YesNo;
  show_description_bbcode_parsed?: YesNo;
  show_writing?: YesNo;
  show_writing_bbcode_parsed?: YesNo;
  show_pools?: YesNo;
}
export interface DetailsResponse {
  sid: string;
  results_count: number;
  user_location: string;
  submissions: DetailedSubmission[];
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
  details: (params: DetailsRequest) =>
    request<DetailsRequest, DetailsResponse>('https://inkbunny.net/api_submissions.php', params),
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
  let data;
  try {
    debug(`[FETCH] ${url}?output_mode=json&${queryString}`);
    const response = await fetch(`${url}?output_mode=json&${queryString}`, { method: 'POST' });
    data = (await response.json()) as any;
  } catch (error) {
    throw new APIError(-1, (error as Error).message);
  }

  // Throw custom error if request fails
  if (data.error_code) {
    throw new APIError(data.error_code, data.error_message);
  }

  return data;
};
