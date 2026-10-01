/* ==========================================================================
   Ted Salon — service menu
   --------------------------------------------------------------------------
   Prices marked with a number are taken from Ted Salon's own printed
   "Luxury Service Menu" book, shown in the salon's Instagram reel of
   Sept 2026 (instagram.com/reel/DdeCYPlzoBH). Facial names and durations
   come from the same book; their prices weren't legible in the video.

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
    note: "Patch test recommended before your first set of extensions.",
    items: [
      { name: "Lash extensions", desc: "Classic or volume sets.", price: null },
      { name: "Lash refill", desc: "Keep your set full.", price: null },
      { name: "Brow threading", desc: "Clean, defined shape.", price: null }
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
