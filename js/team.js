/* ==========================================================================
   Ted Salon team (names and roles from the salon, Oct 2026).
   Photos: assets/img/team/IMG_xxxx.jpg (portraits taken in the salon).
   `services` = menu-data.js category ids (or extra ids below) shown first
   when booking with that person. `book: false` = not bookable.
   `quote` = real Google review that names them (shortened with …).
   ========================================================================== */
window.TED_TEAM = [
  { id: "sapna",     name: "Sapna",     role: "Senior Aesthetician",          dept: "skin",  photo: "IMG_0869",
    services: ["facials", "handsfeet"],
    quote: { text: "Sapna was excellent in doing her job! … so attentive and gentle with us.", by: "Karma K., Google review" } },
  { id: "lobsang",   name: "Lobsang",   role: "Junior Stylist",               dept: "hair",  photo: "IMG_0871",
    services: ["hair"] },
  { id: "niam",      name: "Niam",      role: "Lash Artist",                  dept: "nails", photo: "IMG_0872",
    services: ["lashes"] },
  { id: "arti",      name: "Arti",      role: "Senior Aesthetician",          dept: "skin",  photo: "IMG_0873",
    services: ["facials", "treatments"],
    quote: { text: "I also had a hair spa with Arti, and the head massage was easily the highlight of the visit.", by: "Kunga L., Google review" } },
  { id: "neha",      name: "Neha",      role: "Senior Aesthetician",          dept: "skin",  photo: "IMG_0875",
    services: ["facials", "handsfeet"] },
  { id: "deepanshu", name: "Deepanshu", role: "Senior Stylist · Colourist",   dept: "hair",  photo: "IMG_0878",
    services: ["colour", "hair", "treatments"] },
  { id: "ali",       name: "Ali",       role: "Senior Barber",                dept: "hair",  photo: "IMG_0880",
    services: ["hair"] },
  { id: "shonaya",   name: "Shonaya",   role: "Salon Manager · PMU Artist",   dept: "front", photo: "IMG_0883",
    services: ["pmu"] },
  { id: "kunal",     name: "Kunal",     role: "Therapist",                    dept: "therapy", photo: "IMG_0886",
    services: ["therapy", "treatments"] },
  { id: "amir",      name: "Amir",      role: "Unisex Hair Stylist",          dept: "hair",  photo: "IMG_0887",
    services: ["hair", "treatments"] },
  { id: "chompel",   name: "Chompel",   role: "Senior Stylist · Colourist",   dept: "hair",  photo: "IMG_0889",
    services: ["colour", "hair", "treatments"] },
  { id: "rohit",     name: "Rohit",     role: "Nail Artist",                  dept: "nails", photo: "IMG_0892",
    services: ["nails", "handsfeet"] },
  { id: "kashish",   name: "Kashish",   role: "Nail Artist",                  dept: "nails", photo: "IMG_0905",
    services: ["nails", "handsfeet"],
    quote: { text: "I'm in love with my nails made by Ms. Kashish 💅 The finish is so elegant and natural…", by: "Nedol A., Google review" } },
  { id: "joti",      name: "Joti",      role: "Salon Assistant",              dept: "front", photo: "IMG_0876", book: false },
  { id: "dhiraj",    name: "Dhiraj",    role: "Salon Assistant",              dept: "front", photo: "IMG_0885", book: false }
];

window.TED_DEPTS = [
  { id: "all",     label: "Everyone" },
  { id: "hair",    label: "Hair" },
  { id: "skin",    label: "Skin" },
  { id: "nails",   label: "Nails & Lashes" },
  { id: "therapy", label: "Therapy" },
  { id: "front",   label: "Front of house" }
];

/* Booking-only services that aren't on the printed menu */
window.TED_EXTRA_SERVICES = {
  pmu: { label: "Permanent make-up (PMU)", items: ["PMU consultation"] },
  therapy: { label: "Therapy", items: ["Head Massage", "Schwarzkopf Spa Essence"] }
};
