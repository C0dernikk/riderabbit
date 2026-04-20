// 🔥 Generate Master Data (Cars + Locations)

export const generateMasterData = (count = 1000) => {
  const data = [];

  /* =========================
     LOCATION DATA
  ========================= */

  const districts = [
    "Delhi", "Mumbai", "Bangalore", "Hyderabad",
    "Chennai", "Kolkata", "Pune", "Jaipur"
  ];

  const locationTypes = [
    "Airport",
    "Railway Station",
    "Bus Stand",
    "City Center",
    "Tech Park",
    "Mall Area"
  ];

  districts.forEach((district) => {
    locationTypes.forEach((loc) => {
      data.push({
        type: "location",
        district,
        location: `${district} ${loc}`,
      });
    });
  });

  /* =========================
     CAR DATA
  ========================= */

  const brands = [
    "maruti", "hyundai", "tata", "mahindra",
    "toyota", "honda", "skoda", "volkswagen",
    "kia", "mg", "nissan"
  ];

  const modelsByBrand = {
    maruti: ["Swift", "Baleno", "Dzire", "Brezza"],
    hyundai: ["i20", "Creta", "Venue", "Verna"],
    tata: ["Nexon", "Punch", "Altroz"],
    mahindra: ["XUV300", "XUV700", "Scorpio"],
    toyota: ["Innova", "Fortuner", "Glanza"],
    honda: ["City", "Amaze"],
    skoda: ["Kushaq", "Slavia"],
    volkswagen: ["Polo", "Taigun"],
    kia: ["Seltos", "Sonet"],
    mg: ["Hector", "Astor"],
    nissan: ["Magnite", "Kicks"],
  };

  const variants = ["manual", "automatic"];

  // 🔥 Generate car entries
  for (let i = 0; i < count; i++) {
    const brand =
      brands[Math.floor(Math.random() * brands.length)];

    const modelList = modelsByBrand[brand];

    const model =
      modelList[Math.floor(Math.random() * modelList.length)];

    const variant =
      variants[Math.floor(Math.random() * variants.length)];

    data.push({
      type: "car",
      brand,
      model,
      variant,
    });
  }

  return data;
};

