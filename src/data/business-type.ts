import {
  Utensils,
  ShoppingCart,
  Hammer,
  Scissors,
  Shirt,
  Truck,
  Bike,
  BookOpen,
  Settings,
  Wrench,
  Phone,
  Home,
  Briefcase,
  PiggyBank,
  Stethoscope,
  Leaf,
  Dumbbell,
  Users,
  MoreHorizontal,
  Computer,
} from "lucide-react";

export const GROUPED_BUSINESS_TYPES = [
  {
    group: "Retail & Sales",
    options: [
      {
        label: "General Retail",
        value: "GENERAL_RETAIL",
        description: "Local shop selling daily-use items like biscuits, bread, juice, etc.",
        icon: ShoppingCart,
      },
      {
        label: "Wholesale",
        value: "WHOLESALE",
        description: "Bulk sales to retailers or institutions.",
        icon: Truck,
      },
      {
        label: "Electronics & Phone Shops",
        value: "ELECTRONICS_AND_PHONE_SHOPS",
        description: "Sells phones, accessories, chargers, or electronics.",
        icon: Phone,
      },
      {
        label: "Market Vendor",
        value: "MARKET_VENDOR",
        description: "Sells products in a physical market — vegetables, fabrics, etc.",
        icon: Home,
      },
      {
        label: "Building Materials Shop",
        value: "BUILDING_MATERIALS_SHOP",
        description: "Cement, iron rods, tiles, paint, etc.",
        icon: Hammer,
      },
      {
        label: "Clothing & Footwear Vendor",
        value: "CLOTHING_AND_FOOTWEAR_VENDOR",
        description: "Sells ready-made clothes, shoes, handbags, and related fashion accessories.",
        icon: Shirt,
      },
      {
        label: "Cosmetics & Beauty Products",
        value: "COSMETICS_AND_BEAUTY_PRODUCTS",
        description: "Sells makeup, creams, lotions, perfumes, and related beauty items.",
        icon: Users,
      },
      {
        label: "Stationery & School Supplies",
        value: "STATIONERY_AND_SCHOOL_SUPPLIES",
        description: "Sells pens, books, rulers, bags, and materials for school children or offices.",
        icon: BookOpen,
      },
      {
        label: "Drink & Beverage Shop",
        value: "DRINK_AND_BEVERAGE_SHOP",
        description: "Retail or wholesale of soft drinks, beer, water, and juices.",
        icon: Utensils,
      },
      {
        label: "Mini Supermarket",
        value: "MINI_SUPERMARKET",
        description: "Sells groceries, canned food, drinks, home-use products in a store.",
        icon: ShoppingCart,
      },
    ],
  },
  {
    group: "Artisan & Production",
    options: [
      {
        label: "Food Processing",
        value: "FOOD_PROCESSING",
        description: "Turns raw foods into finished goods like fried chips or chinchin.",
        icon: Utensils,
      },
      {
        label: "Agro Processing",
        value: "AGRO_PROCESSING",
        description: "Processes farm products like maize, cassava, etc.",
        icon: Leaf,
      },
      {
        label: "Handmade Goods",
        value: "HANDMADE_GOODS",
        description: "Crafts local items like bags, soap, shoes, or decorations.",
        icon: Hammer,
      },
      {
        label: "Furniture & Woodwork",
        value: "FURNITURE_AND_WOODWORK",
        description: "Builds or repairs furniture and wooden goods.",
        icon: Wrench,
      },
      {
        label: "Tailoring & Fashion",
        value: "TAILORING_AND_FASHION",
        description: "Makes or repairs clothing and fashion wear.",
        icon: Shirt,
      },
      {
        label: "Metal Fabrication",
        value: "METAL_FABRICATION",
        description: "Makes gates, windows, structures using metalwork and welding.",
        icon: Hammer,
      },
      {
        label: "Shoe Making & Repair",
        value: "SHOE_MAKING_AND_REPAIR",
        description: "Produces or repairs leather or fabric shoes and sandals.",
        icon: Wrench,
      },
    ],
  },
  {
    group: "Personal Services",
    options: [
      {
        label: "Barbershop",
        value: "BARBERSHOP",
        description: "Haircuts and grooming for men.",
        icon: Scissors,
      },
      {
        label: "Hair & Beauty Salon",
        value: "HAIR_AND_BEAUTY_SALON",
        description: "Braiding, styling, nails, makeup services.",
        icon: Users,
      },
      {
        label: "Laundry & Dry Cleaning",
        value: "LAUNDRY_AND_DRYCLEANING",
        description: "Washing and ironing clothes.",
        icon: Settings,
      },
      {
        label: "Cooking & Catering",
        value: "COOKING_AND_CATERING",
        description: "Prepares meals for daily sales or events.",
        icon: Utensils,
      },
      {
        label: "House Cleaning",
        value: "HOUSE_CLEANING",
        description: "Provides residential or office cleaning services.",
        icon: Home,
      },
      {
        label: "Event Planning & Decoration",
        value: "EVENT_PLANNING",
        description: "Organizes events, decor, chairs/tents rental, etc.",
        icon: Briefcase,
      },
    ],
  },
  {
    group: "Transport & Logistics",
    options: [
      {
        label: "Bike Transport (Okada)",
        value: "BIKE_TRANSPORT",
        description: "Motorbike transportation service.",
        icon: Bike,
      },
      {
        label: "Taxi Service",
        value: "TAXI_SERVICE",
        description: "Carries passengers using a taxi or car.",
        icon: Truck,
      },
      {
        label: "Cargo & Delivery",
        value: "CARGO_AND_DELIVERY",
        description: "Delivers packages, food, or goods locally.",
        icon: Truck,
      },
      {
        label: "Interurban Transport",
        value: "INTERURBAN_TRANSPORT",
        description: "Carries passengers or goods between cities (e.g. using buses or Hilux).",
        icon: Truck,
      },
    ],
  },
  {
    group: "Knowledge & Professional Services",
    options: [
      {
        label: "Tutoring Services",
        value: "TUTORING_SERVICES",
        description: "Academic support for pupils and students.",
        icon: BookOpen,
      },
      {
        label: "Vocational Training",
        value: "VOCATIONAL_TRAINING",
        description: "Teaches practical skills like tailoring, computing, etc.",
        icon: Briefcase,
      },
      {
        label: "Freelance IT",
        value: "FREELANCE_IT",
        description: "Web, mobile dev, design, or digital freelancing.",
        icon: Computer,
      },
      {
        label: "Consulting",
        value: "CONSULTING",
        description: "Business, legal, tech, or health consulting services.",
        icon: Briefcase,
      },
    ],
  },
  {
    group: "Finance & Health",
    options: [
      {
        label: "Financial Services",
        value: "FINANCIAL_SERVICES",
        description: "POS, mobile money, microfinance, or savings groups.",
        icon: PiggyBank,
      },
      {
        label: "Pharmacy",
        value: "PHARMACY",
        description: "Licensed health products and medication.",
        icon: Stethoscope,
      },
      {
        label: "Traditional Medicine",
        value: "TRADITIONAL_MEDICINE",
        description: "Natural or herbal health remedies.",
        icon: Leaf,
      },
      {
        label: "Health Services",
        value: "HEALTH_SERVICES",
        description: "Nurses, home care, or minor medical services offered privately.",
        icon: Stethoscope,
      },
    ],
  },
  {
    group: "Fitness & Wellness",
    options: [
      {
        label: "Gym & Wellness",
        value: "GYM_AND_WELLNESS",
        description: "Fitness training, yoga, massage, wellness coaching.",
        icon: Dumbbell,
      },
    ],
  },
  {
    group: "Leisure & Entertainment",
    options: [
      {
        label: "Video Game Center",
        value: "VIDEO_GAME_CENTER",
        description: "Offers PlayStation, Xbox, or PC gaming by the hour.",
        icon: Computer,
      },
      {
        label: "Cinema & Video Clubs",
        value: "CINEMA_AND_VIDEO_CLUB",
        description: "Shows movies or series for groups in local communities.",
        icon: BookOpen,
      },
      {
        label: "Bar & Lounge",
        value: "BAR_AND_LOUNGE",
        description: "Sells drinks and provides social entertainment space.",
        icon: Utensils,
      },
    ],
  },
  {
    group: "Other",
    options: [
      {
        label: "Other",
        value: "OTHER",
        description: "Not listed above.",
        icon: MoreHorizontal,
      },
    ],
  },
];
