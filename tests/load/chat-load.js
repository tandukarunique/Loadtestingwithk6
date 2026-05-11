import { check, sleep } from "k6";
import { AuthRequestHelper } from "../../helpers/auth-request.js";

export const options = {
  scenarios: {
    constant_load: {
      executor: "constant-arrival-rate",
      rate: 5,
      timeUnit: "1s",
      duration: "30s",
      preAllocatedVUs: 2,
      maxVUs: 5,
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<1500"],
    http_req_failed: ["rate<0.02"],
  },
};

const baseUrl = __ENV.CHATBOQ_URL || "https://devapi.chatboq.com";
const accessToken = __ENV.ACCESS_TOKEN;
const organizationId = __ENV.ORGANIZATION_ID;
const conversationId = __ENV.CONVERSATION_ID || "c8324826-7086-4326-b27f-55ced9d1a835";

export default function () {
  const authRequest = new AuthRequestHelper(
    baseUrl,
    accessToken,
    organizationId,
  );

  const operation = Math.random();

  if (operation < 0.5) {
    const response = authRequest.get(
      `/api/v1/conversations/${conversationId}/messages?limit=50`,
    );
    check(response, {
      "get messages status 200": (r) => r.status === 200,
    });
  } else {
    const messageData = {
      content: `Load test message`,
    };
    const response = authRequest.post(
      `/api/v1/conversations/${conversationId}/messages`,
      messageData,
    );
    check(response, {
      "send message status 200/201": (r) => r.status === 200 || r.status === 201,
    });
  }

  sleep(Math.random() * 2);
}
