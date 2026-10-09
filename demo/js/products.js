/* ==========================================================================
   Products on Ted Salon's shelves — all Schwarzkopf Professional, read off
   the packaging in the salon's own photos (Oct 2026). No prices are
   published, so cards say "Ask in salon" and the button reserves the item
   on WhatsApp. Add `price: 1234` to any product to show a price.
   ========================================================================== */
window.TED_RANGES = [
  { id: "all",       label: "All products" },
  { id: "bonacure",  label: "BC Bonacure",   blurb: "Clean-performance shampoos with the Care-Boost Complex — new in salon.", img: "cat-bonacure" },
  { id: "osis",      label: "OSiS+ & Styling", blurb: "Curl creams, texture and shine sprays for the finish you left the salon with.", img: "cat-styling" },
  { id: "oils",      label: "Oil Ultime",    blurb: "Finishing oils matched to your hair type — argan, barbary fig or rose.", img: "cat-oils" },
  { id: "spa",       label: "Spa Essence",   blurb: "Marine collagen and kelp care — the take-home side of our Spa Essence ritual.", img: "cat-spa" },
  { id: "fibre",     label: "Fibre Clinix",  blurb: "Bond-repair care with Bondfinity technology.", img: "cat-styling" }
];

window.TED_PRODUCTS = [
  { id: "bc-repair",   range: "bonacure", name: "Repair Rescue Shampoo",     line: "BC Bonacure", note: "With arginine · Care-Boost Complex",   img: "p-bc-repair",   hover: "cat-bonacure", tag: "New in" },
  { id: "bc-moisture", range: "bonacure", name: "Moisture Kick Shampoo",     line: "BC Bonacure", note: "With aloe vera · for dry hair",         img: "p-bc-moisture", hover: "cat-bonacure", tag: "New in" },
  { id: "bc-frizz",    range: "bonacure", name: "Frizz Away Shampoo",        line: "BC Bonacure", note: "With babassu oil · for frizzy hair",    img: "p-bc-frizz",    hover: "cat-bonacure", tag: "New in" },
  { id: "bc-color",    range: "bonacure", name: "Color Freeze Shampoo",      line: "BC Bonacure", note: "pH 4.5 · for coloured hair",            img: "p-bc-color",    hover: "cat-bonacure", tag: "New in" },
  { id: "bc-root",     range: "bonacure", name: "Root Activating Shampoo",   line: "BC Bonacure", note: "With guaraná & biotin",                 img: "p-bc-root",     hover: "cat-bonacure", tag: "New in" },
  { id: "bc-dandruff", range: "bonacure", name: "Anti-Dandruff Shampoo",     line: "BC Bonacure", note: "With superberries & AHA",               img: "p-bc-dandruff", hover: "cat-bonacure", tag: "New in" },
  { id: "oil-argan",   range: "oils",     name: "Argan Finishing Oil",       line: "Oil Ultime",  note: "For medium to coarse hair · 100 ml",    img: "p-oil-argan",   hover: "cat-oils" },
  { id: "oil-fig",     range: "oils",     name: "Barbary Fig Finishing Oil", line: "Oil Ultime",  note: "For dry and brittle hair · 100 ml",     img: "p-oil-fig",     hover: "cat-oils" },
  { id: "oil-rose",    range: "oils",     name: "Rose Finishing Oil",        line: "Oil Ultime",  note: "For fine hair · 100 ml",                img: "p-oil-rose",    hover: "cat-oils" },
  { id: "spa-cond",    range: "spa",      name: "Nourishing Conditioner",    line: "Spa Essence", note: "Marine collagen & kelp · for damaged hair", img: "p-spa-conditioner", hover: "cat-spa" },
  { id: "spa-shampoo", range: "spa",      name: "Smoothening Shampoo",       line: "Spa Essence", note: "Marine collagen & kelp · for frizzy hair",  img: "p-spa-shampoo",     hover: "cat-spa" },
  { id: "spa-mask",    range: "spa",      name: "Smoothening Mask",          line: "Spa Essence", note: "Deep-care mask for smoother lengths",       img: "p-spa-mask",        hover: "cat-spa" },
  { id: "osis-bounty", range: "osis",     name: "Bounty Balm",               line: "OSiS+",       note: "Rich curl cream · curls & waves · 150 ml", img: "p-bounty-balm",   hover: "cat-styling" },
  { id: "osis-texture",range: "osis",     name: "Texture Craft",             line: "OSiS+",       note: "Dry texture spray · on dry hair",          img: "p-texture-craft", hover: "cat-styling" },
  { id: "osis-sparkler",range: "osis",    name: "Sparkler",                  line: "OSiS+",       note: "Smooth & shine spray",                     img: "p-sparkler",      hover: "cat-styling" },
  { id: "session",     range: "osis",     name: "Session Label",             line: "Schwarzkopf Professional", note: "From the Session Label styling line", img: "p-session-label", hover: "cat-styling" },
  { id: "fibre-seal",  range: "fibre",    name: "Fibre Clinix Seal",         line: "Fibre Clinix", note: "Fibre sealer · Bondfinity technology · 150 ml", img: "p-fibre-clinix", hover: "cat-styling" }
];
