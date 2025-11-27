# TypeScript Migration Guide

## Overview
This project is prepared for gradual TypeScript adoption. All existing `.js` files can coexist with new `.ts`/`.tsx` files.

## Getting Started

### Install TypeScript Dependencies
```bash
cd frontend
npm install --save-dev typescript @types/react @types/react-dom @types/node @types/jest
```

### Migration Strategy (Incremental)

1. **Start with utility modules** (lowest dependencies)
   - `src/config.js` → `src/config.ts`
   - `src/api/client.js` → `src/api/client.ts`

2. **Type contexts and hooks**
   - `src/contexts/AuthContext.js` → `src/contexts/AuthContext.tsx`

3. **Convert components** (prioritize leaf components first)
   - `src/components/Login.js` → `src/components/Login.tsx`
   - `src/components/Dashboard.js` → `src/components/Dashboard.tsx`

4. **Main entry points last**
   - `src/App.js` → `src/App.tsx`
   - `src/index.js` → `src/index.tsx`

### Example Conversion

**Before (`config.js`):**
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://evisionbet-api.onrender.com';
export default API_URL;
```

**After (`config.ts`):**
```typescript
const API_URL: string = process.env.REACT_APP_API_URL || 'https://evisionbet-api.onrender.com';
export default API_URL;
```

**Before (`AuthContext.js`):**
```javascript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**After (`AuthContext.tsx`):**
```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  username: string;
  loading: boolean;
  login: (user: string, token: string) => void;
  logout: () => void;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Type Definitions for API Responses

Create `src/types/api.ts`:
```typescript
export interface EVHit {
  game_start_perth: string;
  sport: string;
  ev: number;
  event: string;
  market: string;
  line?: string;
  side: string;
  stake: number;
  book: string;
  price: number;
  prob: number;
  fair: number;
}

export interface OddsSport {
  key: string;
  title: string;
  group: string;
  active: boolean;
}
```

### Running TypeScript Checks
```bash
# Type check without emitting files
npx tsc --noEmit

# Watch mode during development
npx tsc --noEmit --watch
```

### Benefits
- Catch errors at compile time
- Better IDE autocomplete
- Self-documenting API shapes
- Easier refactoring

### Notes
- `tsconfig.json` already configured for incremental adoption
- `allowJs: true` permits mixing JS and TS
- `checkJs: false` won't enforce types on `.js` files
- Convert files one at a time, test thoroughly
