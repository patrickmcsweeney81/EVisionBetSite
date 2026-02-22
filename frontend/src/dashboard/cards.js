// Central catalog for Dashboard cards.
// Edit titles/descriptions here first; later we’ll attach CSV/API sources per card.

export const DASHBOARD_CARDS = [
  {
    id: 'ev-finder',
    title: '📈 Expected Value Finder',
    description: 'View positive expected value betting opportunities',
    route: '/ev',
    buttonText: 'Open EV Finder',
    dataSources: [
      { type: 'api', name: '/api/ev/hits' },
      { type: 'api', name: '/api/ev/summary' },
    ],
  },
  {
    id: 'patty-picks',
    title: '🎯 Patty Picks',
    description: '2 EV bets added daily with bet tracker for 2 weeks of results',
    route: '/patty-picks',
    buttonText: 'Open Patty Picks',
    dataSources: [{ type: 'api', name: '/api/pats-picks' }],
  },
  {
    id: 'ev-toolbox',
    title: '🧰 EV Toolbox',
    description: 'Dutching, Odds Hunting, and other value betting tools',
    route: '/ev-toolbox',
    buttonText: 'Open EV Toolbox',
    dataSources: [],
  },
  {
    id: 'all-odds-table',
    title: '📊 All Odds Table',
    description: 'Professional odds comparison table',
    route: '/odds-table',
    buttonText: 'Open Odds Table',
    dataSources: [{ type: 'csv', name: 'all_odds.csv' }],
  },
  {
    id: 'raw-odds-table',
    title: '📋 Raw Odds Table',
    description: 'Pure raw odds data with filtering (no EV calculations)',
    route: '/raw-odds',
    buttonText: 'Open Raw Odds',
    dataSources: [{ type: 'csv', name: 'raw_odds_pure.csv' }],
  },
  {
    id: 'todo',
    title: '💡 Ideas & TODO',
    description: 'Project ideas and development roadmap',
    route: '/todo',
    buttonText: 'Open TODO',
    dataSources: [],
  },
  {
    id: 'diagnostics',
    title: '🩺 Diagnostics',
    description: 'Check API connectivity and health status',
    route: '/diagnostics',
    buttonText: 'Open Diagnostics',
    dataSources: [{ type: 'api', name: '/health' }],
  },
  {
    id: 'settings',
    title: '⚙️ Settings',
    description: 'Manage your account and preferences',
    route: null,
    buttonText: 'Coming Soon',
    disabled: true,
    dataSources: [],
  },
];
