/* ==========================================================================
   Ted Salon — service menu
   --------------------------------------------------------------------------
   Prices marked with a number are taken from Ted Salon's own printed
   "Luxury Service Menu" book, shown in the salon's Instagram reel of
   Sept 2026 (instagram.com/reel/DdeCYPlzoBH). Facial names and durations
   come from the same book; their prices weren't legible in the video.

   PMU, BB Glow, microneedling and lash prices come from the salon's
   "Permanent Makeup & Lash Services" menu (TED PMU MENU.pdf, Oct 2026).
   `onwards: true` shows "from". `group` adds a sub-heading inside a category.

   `price: null`  → the page shows an "Enquire" button that opens the
   booking form with that service selected. When the salon shares the rest
   of its price list, just replace null with the number (e.g. price: 1500).
   ========================================================================== */

window.TED_MENU = [
  {
    id: "hair",
    label: "Hair",
    note: "Essential hair care and personalised styling.",
    items: [
      { name: "Hair Cut", desc: "A personalised cut designed around your face shape, hair texture and desired finish, with professional styling.", price: 1200 },
      { name: "Hair Wash", desc: "A professional cleanse to remove build-up and prepare hair and scalp for styling or treatment.", price: 700 },
      { name: "Head Massage", desc: "A relaxing scalp massage to ease everyday tension and leave the scalp refreshed.", price: 800, tag: "Loved in reviews" },
      { name: "Blow-dry & styling", desc: "Bouncy blowouts, curls and sleek finishes.", price: null },
      { name: "Kids' haircut", desc: "Patient, quick cuts for little ones.", price: null },
      { name: "Hair donation cut", desc: "Measured, tied and cut so your hair can go to cancer patients.", price: null }
    ]
  },
  {
    id: "treatments",
    label: "Hair Treatments",
    note: "Professional rituals for softness, strength, repair and shine.",
    items: [
      { name: "Schwarzkopf Spa Essence", desc: "A personalised hair and scalp treatment with nourishing care and a relaxing massage.", price: 2000, tag: "Signature" },
      { name: "Fibreplex", desc: "Bond-building treatment that protects and strengthens hair during and after colour and chemical services.", price: 3000, onwards: true },
      { name: "Fibre Clinix", desc: "A treatment chosen for your hair's condition, texture and density.", price: null },
      { name: "Keratin & smoothening", desc: "Frizz control and lasting shine.", price: null },
      { name: "Men's perm", desc: "Soft, defined curls and texture.", price: null }
    ]
  },
  {
    id: "colour",
    label: "Colour",
    note: "Colour prices start from a base and vary with length, density and product. A consultation is recommended first.",
    items: [
      { name: "Root touch-up", desc: "Seamless regrowth coverage.", price: null },
      { name: "Global colour", desc: "One rich shade, roots to ends.", price: null },
      { name: "Highlights & balayage", desc: "Hand-placed brightness and soft grow-out.", price: null },
      { name: "Fashion shades", desc: "Cherry red, copper, ash and more.", price: null },
      { name: "Toner / gloss", desc: "Refresh tone and shine between colours.", price: null }
    ]
  },
  {
    id: "facials",
    label: "Facials",
    note: "From the Ted Salon facial menu — performed in a private treatment room.",
    items: [
      { name: "Signature Glow Facial", duration: "45 min", desc: "The salon's signature glow ritual.", price: null },
      { name: "Korean Glass Glow Facial", duration: "1 hr 10 min", desc: "Layered hydration for a dewy, glass-skin finish.", price: null },
      { name: "Hydrafacial", duration: "Machine treatment", desc: "Cleanse, extract and hydrate in one session.", price: null },
      { name: "Hydra Boost Facial", duration: "45 min", desc: "A moisture boost for dull, thirsty skin.", price: null },
      { name: "Vitamin C Brightening Facial", duration: "45 min", desc: "Brightening care for uneven tone.", price: null },
      { name: "Anti-Ageing Facial", duration: "45 min", desc: "Firming, smoothing care.", price: null },
      { name: "Acne Control Facial", duration: "45 min", desc: "Calming, clarifying care for breakout-prone skin.", price: null },
      { name: "Express Clean-Up", duration: "30 min", desc: "A quick, deep cleanse.", price: null }
    ]
  },
  {
    id: "nails",
    label: "Nails",
    note: "Nail art is charged separately, by design, detail and complexity.",
    items: [
      { name: "Gel polish", desc: "Chip-resistant shine.", price: null, tag: "Loved in reviews" },
      { name: "Gel extensions", desc: "Almond, coffin or square — your length.", price: null },
      { name: "Nail art", desc: "Hand-painted, chrome, French and 3D designs.", price: null },
      { name: "Refill & removal", desc: "Gentle upkeep and soak-off.", price: null }
    ]
  },
  {
    id: "handsfeet",
    label: "Hands & Feet",
    note: "Pedicures happen in massage chairs with foot-spa basins.",
    items: [
      { name: "Manicure", desc: "Shape, cuticle care and polish.", price: null },
      { name: "Pedicure", desc: "Soak, scrub, shape and polish.", price: null },
      { name: "Detox pedicure", desc: "A deep-cleansing soak, scrub and massage for tired feet.", price: null, tag: "Loved in reviews" }
    ]
  },
  {
    id: "lashes",
    label: "Lashes & Brows",
    note: "Lashes customised to your eyes for a soft, natural or defined finish. Patch test recommended before your first set of extensions.",
    items: [
      { group: "Eyelash extensions", name: "Classic lash extensions", price: 2500, onwards: true },
      { group: "Eyelash extensions", name: "Hybrid lash extensions", price: 3000, onwards: true },
      { group: "Refills", name: "Classic refill", price: 1500, onwards: true },
      { group: "Refills", name: "Hybrid refill", price: 1700, onwards: true },
      { group: "Lash lift & brows", name: "Lash Lift", price: 1500 },
      { group: "Lash lift & brows", name: "Lash Lift + Tint", price: 2500 },
      { group: "Lash lift & brows", name: "Brow Lamination", price: 1500 },
      { group: "Lash lift & brows", name: "Brow Tint", price: 1000 },
      { group: "Lash lift & brows", name: "Brow Lamination + Brow Tint", price: 2500 },
      { group: "Lash lift & brows", name: "Brow threading", desc: "Clean, defined shape.", price: null }
    ]
  },
  {
    id: "pmu",
    label: "Permanent Make-up (PMU)",
    note: "Customised permanent make-up for brows and lips, designed around your face shape, features and the look you want.",
    items: [
      { group: "Brows", name: "Microblading", price: 10000, onwards: true },
      { group: "Brows", name: "Nano Brows", price: 13000, onwards: true },
      { group: "Brows", name: "Ombre / Powder Brows", price: 12000, onwards: true },
      { group: "Brows", name: "Combination Brows", price: 16000, onwards: true },
      { group: "Lips", name: "Lip Blush", desc: "A soft, fresh tint.", price: 10000, onwards: true },
      { group: "Lips", name: "Lip Neutralisation", desc: "Balances uneven or darker lip tones.", price: 15000, onwards: true },
      { group: "Lips", name: "Lip Blush + Neutralisation", price: 18000, onwards: true },
      { group: "Touch-up", name: "6–8 Week Touch-up", price: 6000, onwards: true },
      { group: "Touch-up", name: "Annual Colour Refresh", price: 10000, onwards: true },
      { group: "Touch-up", name: "Touch-up for Previous Work", price: 5000, onwards: true },
      { group: "Correction", name: "Old PMU Colour Correction", price: 7000, onwards: true },
      { group: "Correction", name: "Old PMU Colour-up", price: 9000, onwards: true }
    ]
  },
  {
    id: "skin",
    label: "BB Glow & Microneedling",
    note: "BB Glow is a skin-enhancing treatment for a smoother, more even and radiant-looking complexion — an effortless “your skin, but better” finish.",
    items: [
      { group: "Skin BB Glow", name: "BB Glow Facial", price: 8000, onwards: true },
      { group: "Skin BB Glow", name: "BB Glow + Hydrating Booster", price: 13000, onwards: true },
      { group: "Skin BB Glow", name: "3-Session BB Glow Package", price: 20000, onwards: true },
      { group: "Skin BB Glow", name: "3-Session BB Glow + Hydrating Booster Package", price: 34000, onwards: true },
      { group: "Microneedling", name: "Microneedling with Hydrating Serum", price: 7000, onwards: true },
      { group: "Microneedling", name: "Advanced Microneedling", price: 9000, onwards: true },
      { group: "Microneedling", name: "3-Session Microneedling Package", price: 17000, onwards: true }
    ]
  }
];

/* From the "Your visit to Ted" page of the menu book */
window.TED_POLICIES = [
  { title: "Consultation", text: "For colour and chemical services, book a consultation first — your stylist checks hair history, condition, length and the result you want." },
  { title: "Colour & chemical", text: "Prices marked “onwards” are starting prices and vary with hair length, density and product used." },
  { title: "Nail art", text: "Charged separately, by design, detail and complexity." },
  { title: "Appointments", text: "Recommended — especially for colour, chemical treatments and longer services." }
];
