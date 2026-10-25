// Tiny OFFLINE fallback, used ONLY when the live API has no data for a country.
// It contains fixed-date national holidays set by law, nothing else. It is NOT a complete
// holiday calendar: festival dates that change every year (Diwali, Holi, Eid, Good Friday, ...) are
// deliberately left out because they cannot be listed reliably without an official source.
export const FIXED_NATIONAL_HOLIDAYS = {
  IN: {
    name: 'India',
    items: [
      { month: 1, day: 26, name: 'Republic Day' },
      { month: 8, day: 15, name: 'Independence Day' },
      { month: 10, day: 2, name: 'Gandhi Jayanti' }
    ]
  }
}
