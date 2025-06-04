export default async function getSubscription() {
  try {
    const res = await fetch(
      "https://api.trakteer.id/v1/public/supports?limit=20&page=1&include=order_id,supporter_email",
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
      // console.log(json.result.data)
      return json.result.data || []; // Return an empty array if no data is found
    }

  } catch (error) {
    console.error("Error fetching subscription data saya:", error);
    return []; // Return an empty array in case of an error
  }
}
