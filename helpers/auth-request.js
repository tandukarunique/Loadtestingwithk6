import http from "k6/http";
import { check } from "k6";

export class AuthRequestHelper {
  constructor(baseUrl, accessToken, organizationId = null) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
    this.organizationId = organizationId;
    this.headers = this.buildHeaders();
  }

  buildHeaders() {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (this.organizationId) {
      headers["x-org-id"] = this.organizationId;
    }

    return headers;
  }

  get(endpoint, params = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const ressponse = http.get(url, {
      headers: this.headers,
      params: params,
    });
    return response;
  }

  post(endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = http.post(url, JSON.stringify(data), {
      headers: this.headers,
    });
    return response;
  }

  put(endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = http.put(url, JSON.stringify(data), {
      headers: this.headers,
    });
    return response;
  }

  delete(endpoint) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = http.del(url, null, {
      headers: this.headers,
    });
    return response;
  }
}
