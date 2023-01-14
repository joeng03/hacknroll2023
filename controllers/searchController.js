const getLocations = async (req, res, next) => {
  const result = await fetch(
    `https://www.grab.com/wp-json/api/farefeed/v1/poi-search?keyword=${req.query.searchString}&country_code=sg&reference=`,
    { mode: "cors", headers: { Origin: "www.grab.com" } }
  );
  const data = await result.json();
  const results = Object.values(data.result);

  res.status(200).json({
    message: "Successfully retrieved locations",
    results,
  });
};

const getGrabPrices = async (req, res, next) => {
  const location = JSON.stringify({
    pickUp: {
      latitude: Number(req.query.fromLat),
      longitude: Number(req.query.fromLong),
    },
    dropOff: {
      latitude: Number(req.query.toLat),
      longitude: Number(req.query.toLong),
    },
  });
  const result = await fetch(
    "https://www.grab.com/wp-json/api/farefeed/v1/estimate",
    {
      mode: "cors",
      method: "POST",
      headers: {
        Origin: "https://www.grab.com",
        "Content-Type": "application/json",
        "Content-Length": location.length,
      },
      body: location,
    }
  );
  const data = await result.json();

  res.status(200).json({
    message: "Successfully retrieved Grab prices",
    data,
  });
};

module.exports = { getLocations, getGrabPrices };
