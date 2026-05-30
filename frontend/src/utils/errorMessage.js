const getApiErrorMessage = (error, fallback) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === "ERR_NETWORK") {
    return "Network error. Check that VITE_API_URL on Vercel points to your Render backend URL and that CLIENT_URL on Render matches your Vercel frontend URL.";
  }

  return fallback;
};

export default getApiErrorMessage;
