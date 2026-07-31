// Initial seed data for Event Countdown.
// Loaded into localStorage the first time the app runs.

const oneDay = 24 * 60 * 60 * 1000

export const seedEvents = [
  {
    id: 'evt-001',
    title: 'Neon Nights Live',
    category: 'Concert',
    location: 'Downtown Arena',
    date: new Date(Date.now() + 2 * oneDay).toISOString(),
    color: 'primary',
    icon: 'music_note',
    notes: 'Main event of the season — VIP passes confirmed.'
  },
  {
    id: 'evt-002',
    title: 'Maldives Getaway',
    category: 'Travel',
    location: 'Malé, Maldives',
    date: new Date(Date.now() + 15 * oneDay).toISOString(),
    color: 'tertiary',
    icon: 'flight_takeoff',
    notes: 'Flights booked, resort check-in at 2 PM.'
  },
  {
    id: 'evt-003',
    title: "Dad's 60th Jubilee",
    category: 'Celebration',
    location: 'Family Home',
    date: new Date(Date.now() + 4 * oneDay).toISOString(),
    color: 'secondary',
    icon: 'cake',
    notes: 'Cake ordered, guests confirmed: 24.'
  },
  {
    id: 'evt-004',
    title: 'Tech Summit 2026',
    category: 'Conference',
    location: 'San Francisco',
    date: new Date(Date.now() + 7 * oneDay).toISOString(),
    color: 'primary',
    icon: 'campaign',
    notes: 'Badge pickup opens Day 1, 8 AM.'
  }
]
