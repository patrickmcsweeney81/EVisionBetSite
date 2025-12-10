import { getBookmakerLogo, createFallbackLogo, getBookmakerDisplayName } from './bookmakerLogos';

describe('bookmakerLogos', () => {
  describe('getBookmakerLogo', () => {
    it('should return a data URL for a bookmaker', () => {
      const logo = getBookmakerLogo('sportsbet');
      expect(logo).toMatch(/^data:image\/svg\+xml/);
    });

    it('should return a fallback logo when no bookmaker name provided', () => {
      const logo = getBookmakerLogo('');
      expect(logo).toMatch(/^data:image\/svg\+xml/);
    });

    it('should handle custom size', () => {
      const logo = getBookmakerLogo('pinnacle', { size: 64 });
      expect(logo).toMatch(/^data:image\/svg\+xml/);
      // SVG should contain width and height attributes with the custom size
      const decoded = atob(logo.split(',')[1]);
      expect(decoded).toContain('width="64"');
      expect(decoded).toContain('height="64"');
    });

    it('should generate different logos for different bookmakers', () => {
      const logo1 = getBookmakerLogo('sportsbet');
      const logo2 = getBookmakerLogo('pinnacle');
      expect(logo1).not.toEqual(logo2);
    });
  });

  describe('createFallbackLogo', () => {
    it('should create a valid SVG data URL', () => {
      const logo = createFallbackLogo('Test Bookmaker', 48);
      expect(logo).toMatch(/^data:image\/svg\+xml/);
    });

    it('should extract initials correctly', () => {
      const logo = createFallbackLogo('Sports Bet', 48);
      const decoded = atob(logo.split(',')[1]);
      expect(decoded).toContain('SB');
    });

    it('should handle underscore-separated names', () => {
      const logo = createFallbackLogo('betfair_au', 48);
      const decoded = atob(logo.split(',')[1]);
      expect(decoded).toContain('BA');
    });

    it('should default to BK when no name provided', () => {
      const logo = createFallbackLogo('', 48);
      const decoded = atob(logo.split(',')[1]);
      expect(decoded).toContain('BK');
    });
  });

  describe('getBookmakerDisplayName', () => {
    it('should remove region suffix', () => {
      expect(getBookmakerDisplayName('betfair_au')).toBe('betfair');
    });

    it('should replace underscores with spaces (after removing region suffix)', () => {
      expect(getBookmakerDisplayName('betfair_extra_au')).toBe('betfair extra');
    });

    it('should handle simple names', () => {
      expect(getBookmakerDisplayName('pinnacle')).toBe('pinnacle');
    });

    it('should return empty string for null/undefined', () => {
      expect(getBookmakerDisplayName(null)).toBe('');
      expect(getBookmakerDisplayName(undefined)).toBe('');
    });
  });
});
