// src/config/locations.js

export const MAIN_CAMPUS = {
  id: 'gidan_kwano',
  name: 'Gidan Kwano Campus',
  short: 'Gidan Kwano',
};

/**
 * FUTSPrint partner print shops at Gidan Kwano.
 * Students pick one. They pay on FUTSPrint, then collect
 * from the chosen shop with their pickup code.
 */
export const PARTNER_SHOPS = [
  {
    id: 'billions_print',
    name: 'Billions Print',
    market: 'Ultramodern Market',
    area: 'Ultramodern Market, Gidan Kwano',
    description: 'Fast turnaround, high-volume printing and photocopy.',
  },
  {
    id: 'kizito_ventures',
    name: 'Kizito Ventures',
    market: 'Post Office',
    area: 'Post Office Area, Gidan Kwano',
    description:
      'Convenient for students near Post Office, staying off campus, coming for lectures.',
  },
];

export function getShopById(id) {
  return PARTNER_SHOPS.find((s) => s.id === id) || null;
}

/**
 * The three ways a student can hand off a physical document.
 * Order in the UI follows this array.
 */
export const PHYSICAL_ROUTES = [
  {
    id: 'course_rep',
    name: 'Give to my Course Rep',
    tagline: 'Best for large documents',
    description:
      'Submit through your department Course Rep. You pick the day they receive the work and the day they return it. A tracking ID is created so you can follow every step.',
    icon: 'users',
  },
  {
    id: 'courier',
    name: 'Courier picks up from me',
    tagline: 'Most convenient',
    description:
      'A FUTSPrint worker comes to your hostel or chosen spot, picks up the document, processes it, and returns it to you. You do nothing but wait.',
    icon: 'truck',
  },
  {
    id: 'dropoff',
    name: 'I\u2019ll drop off at a partner shop',
    tagline: 'Fastest in person',
    description:
      'Pay on FUTSPrint, get a drop-off code, walk into a partner shop, and skip the queue. Staff attend to you immediately.',
    icon: 'store',
  },
];

export function getRouteById(id) {
  return PHYSICAL_ROUTES.find((r) => r.id === id) || null;
}