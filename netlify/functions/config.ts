export const handler = async () => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
  const body = `window.__GOOGLE_CLIENT_ID__ = '${googleClientId.replace(/'/g, "\\'")}';`;
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
    body,
  };
};


