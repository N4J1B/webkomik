export default async function getBalance() {
  try {
    const res = await fetch(
      "https://api.trakteer.id/v1/public/current-balance",
      {
        method: "GET",
        headers: {
          key: process.env.TRAKTEER_KEY,
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );
    if (res.ok) {
      const json = await res.json();
      return json.result || [];
    }
    // Return an empty array if no data is found
  } catch (error) {
    console.error("Error fetching subscription data balance:", error);
    return []; // Return an empty array in case of an error
  }
}
