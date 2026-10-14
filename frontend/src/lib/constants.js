export const CATEGORIES = ["Adventure", "Nature", "Culture", "Food", "Wellness", "Art", "Beach", "Heritage", "Hidden Gem", "Stay"];
export const LISTING_TYPES = ["STAY", "EXPERIENCE", "PLACE", "ACTIVITY", "EVENT"];
export const INTERESTS = ["hiking", "photography", "food", "yoga", "camping", "culture", "heritage", "beach", "nature", "wellness", "art", "adventure"];

export const MOODS = [
  { name: "Escape", tag: "escape", image: "/images/stays/stay-treehouse.jpg", text: "Leave the noise behind" },
  { name: "Adventure", tag: "adventure", image: "/images/experiences/experience-hiking.jpg", text: "Trails, rivers and ridges" },
  { name: "Slow Travel", tag: "slow-travel", image: "/images/destinations/destination-kerala-backwaters.jpg", text: "Fewer places, more time" },
  { name: "Wellness", tag: "wellness", image: "/images/experiences/experience-yoga.jpg", text: "Stretch, breathe, reset" },
  { name: "Culture", tag: "culture", image: "/images/destinations/destination-hampi.jpg", text: "Stories carved in stone" },
  { name: "Food", tag: "food", image: "/images/experiences/experience-food-tour.jpg", text: "Eat where locals eat" },
  { name: "Nature", tag: "nature", image: "/images/hidden-gems/hidden-forest-trail.jpg", text: "Forests, lakes and quiet" },
  { name: "Weekend", tag: "weekend", image: "/images/stays/stay-camp-tent.jpg", text: "Two days, fully used" },
];

export const DESTINATIONS = [
  { name: "Goa", image: "/images/destinations/destination-beach.jpg", text: "Quiet beaches and slow sunsets" },
  { name: "Kerala", image: "/images/destinations/destination-kerala-backwaters.jpg", text: "Backwaters, tea hills and forests" },
  { name: "Rajasthan", image: "/images/experiences/experience-pottery.jpg", text: "Craft, desert and old cities" },
  { name: "Odisha", image: "/images/destinations/destination-jagannath.jpg", text: "Temples, coast and living heritage" },
  { name: "Himachal Pradesh", image: "/images/hero/hero-main.jpg", text: "Pine valleys and high passes" },
  { name: "Meghalaya", image: "/images/hidden-gems/hidden-forest-waterfall.jpg", text: "Waterfalls and root bridges" },
  { name: "Sikkim", image: "/images/destinations/destination-snow-peak.jpg", text: "Himalayan trails and monasteries" },
  { name: "Varanasi", image: "/images/experiences/experience-photography.jpg", text: "Ghats, lanes and first light" },
];

export const PRESETS = {
  experiences: { title: "Experiences", eyebrow: "Do something memorable", text: "Local workshops, treks, food walks and moments you will talk about later.", types: ["EXPERIENCE", "ACTIVITY", "EVENT"], image: "/images/experiences/experience-hiking.jpg" },
  stays: { title: "Stays", eyebrow: "Sleep somewhere different", text: "Cabins, treehouses, houseboats and camps hosted by people who live there.", types: ["STAY"], image: "/images/stays/stay-treehouse.jpg" },
  places: { title: "Places", eyebrow: "Worth the detour", text: "Temples, viewpoints, beaches and hidden corners with a story to tell.", types: ["PLACE"], image: "/images/hidden-gems/hidden-waterfall.jpg" },
};
