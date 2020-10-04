import fetch from 'node-fetch';

/* TYPES */
export class APIError extends Error {
  constructor(public error_code: number, public error_message: string) {
    super();
    this.message = `[${this.error_code}] - ${this.error_message}`;
  }
}
type YesNo = 'yes' | 'no';
type TrueFalse = 't' | 'f';

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
  'tag[2]': YesNo;
  'tag[3]': YesNo;
  'tag[4]': YesNo;
  'tag[5]': YesNo;
}
export interface RatingResponse {
  sid: string;
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
};
export default api;

const request = async <Request, Response>(url: string, params: Request): Promise<Response> => {
  // Construct query string
  const keys = Object.keys(params) as Array<keyof typeof params>;
  const queryString = keys.map((key) => key + '=' + params[key]).join('&');

  // Send request
  const response = await fetch(`${url}?output_mode=json&${queryString}`, { method: 'POST' });
  const data = await response.json();

  // Throw custom error if request fails
  if (data.error_code) {
    throw new APIError(data.error_code, data.error_message);
  }

  return data;
};
