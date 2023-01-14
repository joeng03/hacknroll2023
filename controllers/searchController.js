const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

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

const getAllPrices = async (req, res, next) => {
  fromLat = Number(req.query.fromLat);
  fromLong = Number(req.query.fromLong);
  toLat = Number(req.query.toLat);
  toLong = Number(req.query.toLong);
  const location = JSON.stringify({
    pickUp: {
      latitude: fromLat,
      longitude: fromLong,
    },
    dropOff: {
      latitude: toLat,
      longitude: toLong,
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
  const grab = await result.json();
  // add a random number to the min fare
  const grabFare = grab.services.filter(
    (service) => service.serviceName === "JustGrab"
  )[0].fare;
  const gojek =
    (grabFare.maxFare - grabFare.minFare) * (2 * Math.random() - 1) +
    grabFare.minFare;
  const crowDistance = getDistanceFromLatLonInKm(
    fromLat,
    fromLong,
    toLat,
    toLong
  );
  const firstKmCost = 3.9 + Math.random() * 0.4;
  let meteredFare = firstKmCost;
  if (crowDistance > 10) {
    meteredFare =
      meteredFare + ((crowDistance - 1) / 0.35) * (0.25 + Math.random() * 0.02);
  } else if (crowDistance > 1) {
    meteredFare =
      meteredFare + ((crowDistance - 1) / 0.4) * (0.25 + Math.random() * 0.02);
  }
  const comfortRide = 2.8 + crowDistance * 0.5 + 0.15 * Math.random() * 30; // takes 30 minutes to travel to most places
  data = {
    grab,
    gojek,
    meteredFare: meteredFare * 2,
    zig: comfortRide > 6 ? comfortRide * 2 : 6,
  };
  res.status(200).json({
    message: "Successfully retrieved prices",
    data,
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
  data =
    req.query.company_name === "grab"
      ? {
          grab: result.json(),
        }
      : req.query.company_name === "gojek"
      ? {
          gojek: result.json(),
        }
      : {
          services: result.json(),
        };

  res.status(200).json({
    message: "Successfully retrieved prices",
    data,
  });
};

module.exports = { getLocations, getPrices };
