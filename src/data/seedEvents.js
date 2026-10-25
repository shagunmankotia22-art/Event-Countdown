// Initial seed data for Event Countdown.
// Loaded into localStorage the first time the app runs.

const oneDay = 24 * 60 * 60 * 1000
const now = Date.now()

// Deterministic placeholder photography per category (picsum.photos —
// free, no-attribution placeholder image service, seeded so the same
// category always gets the same image).
export const CATEGORY_META = {
  Concert: { color: 'primary', icon: 'music_note', image: 'https://picsum.photos/seed/concert-pulse/600/400' },
  Travel: { color: 'tertiary', icon: 'flight_takeoff', image: 'https://picsum.photos/seed/travel-pulse/600/400' },
  Celebration: { color: 'secondary', icon: 'cake', image: 'https://picsum.photos/seed/celebration-pulse/600/400' },
  Conference: { color: 'primary', icon: 'campaign', image: 'https://picsum.photos/seed/conference-pulse/600/400' },
  Holiday: { color: 'tertiary', icon: 'celebration', image: 'https://picsum.photos/seed/holiday-evently/600/400' }
}

export const seedEvents = [
  {
    id: 'evt-001',
    title: 'Neon Nights Live',
    category: 'Concert',
    location: 'Downtown Arena',
    date: new Date(now + 2 * oneDay).toISOString(),
    createdAt: new Date(now - 40 * oneDay).toISOString(),
    color: CATEGORY_META.Concert.color,
    icon: CATEGORY_META.Concert.icon,
    image: CATEGORY_META.Concert.image,
    archived: false,
    notes: 'Main event of the season — VIP passes confirmed.'
  },
  {
    id: 'evt-002',
    title: 'Maldives Getaway',
    category: 'Travel',
    location: 'Malé, Maldives',
    date: new Date(now + 15 * oneDay).toISOString(),
    createdAt: new Date(now - 20 * oneDay).toISOString(),
    color: CATEGORY_META.Travel.color,
    icon: CATEGORY_META.Travel.icon,
    image: CATEGORY_META.Travel.image,
    archived: false,
    notes: 'Flights booked, resort check-in at 2 PM.'
  },
  {
    id: 'evt-003',
    title: "Dad's 60th Jubilee",
    category: 'Celebration',
    location: 'Family Home',
    date: new Date(now + 4 * oneDay).toISOString(),
    createdAt: new Date(now - 10 * oneDay).toISOString(),
    color: CATEGORY_META.Celebration.color,
    icon: CATEGORY_META.Celebration.icon,
    image: CATEGORY_META.Celebration.image,
    archived: false,
    notes: 'Cake ordered, guests confirmed: 24.'
  },
  {
    id: 'evt-004',
    title: 'Tech Summit 2026',
    category: 'Conference',
    location: 'San Francisco',
    date: new Date(now + 7 * oneDay).toISOString(),
    createdAt: new Date(now - 30 * oneDay).toISOString(),
    color: CATEGORY_META.Conference.color,
    icon: CATEGORY_META.Conference.icon,
    image: CATEGORY_META.Conference.image,
    archived: false,
    notes: 'Badge pickup opens Day 1, 8 AM.'
  }
]
