const BASE_URL = "/api";

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) errorMsg = errorJson.error;
    } catch {
      // ignore
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export const api = {
  // Apps
  searchApps: (q) => request(`/apps/search?q=${encodeURIComponent(q)}`),
  getAppInfo: (appId, lang = "en", country = "in") =>
    request(`/apps/${encodeURIComponent(appId)}?lang=${lang}&country=${country}`),
  getAppAnalyses: (appId) => request(`/apps/${encodeURIComponent(appId)}/analyses`),

  // Analyses
  startAnalysis: (payload) =>
    request("/analyses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getAnalysisReport: (id) => request(`/analyses/${id}`),
  cancelAnalysis: (id) =>
    request(`/analyses/${id}/cancel`, {
      method: "POST",
    }),

  // Reviews Explorer
  getReviews: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, val);
      }
    });
    return request(`/reviews?${searchParams.toString()}`);
  },

  // LLM Status
  getLlmModels: () => request("/llm/models"),

  // Schedules
  getSchedules: (appId) => request(`/apps/${encodeURIComponent(appId)}/schedule`),
  createSchedule: (appId, data) =>
    request(`/apps/${encodeURIComponent(appId)}/schedule`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteSchedule: (appId, scheduleId) =>
    request(`/apps/${encodeURIComponent(appId)}/schedule/${scheduleId}`, {
      method: "DELETE",
    }),
};
