const keywordMap: Record<string, string> = {
  chips: "FOOD_PROCESSING",
  salon: "HAIR_AND_BEAUTY_SALON",
  barber: "BARBERSHOP",
  tailor: "TAILORING_AND_FASHION",
  fashion: "TAILORING_AND_FASHION",
  grocery: "GENERAL_RETAIL",
  store: "GENERAL_RETAIL",
  laundry: "LAUNDRY_AND_DRYCLEANING",
  delivery: "CARGO_AND_DELIVERY",
  taxi: "TAXI_SERVICE",
  gym: "GYM_AND_WELLNESS",
  "mobile money": "FINANCIAL_SERVICES",
  pharmacy: "PHARMACY",
  electronics: "ELECTRONICS_AND_PHONE_SHOPS",
  construction: "BUILDING_MATERIALS_SHOP",
  fruit: "MARKET_VENDOR",
  market: "MARKET_VENDOR",
  okada: "BIKE_TRANSPORT",
  phone: "ELECTRONICS_AND_PHONE_SHOPS",
  juice: "GENERAL_RETAIL",
  consult: "CONSULTING",
  tutoring: "TUTORING_SERVICES",
  training: "VOCATIONAL_TRAINING",
};

export const suggestBusinessType = (name: string): string | undefined => {
  const lower = name.toLowerCase();
  const matched = Object.entries(keywordMap).find(([keyword]) =>
    lower.includes(keyword)
  );

  return matched?.[1]; // returns the business type value
};
