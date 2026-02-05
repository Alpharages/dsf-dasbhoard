/**
 * Contexts Barrel Export
 */

// Auth Context
export {
  AuthProvider,
  useAuth,
  useHasRole,
  useRequireAuth,
} from './AuthContext';
export type { User } from './AuthContext';

// Theme Context
export {
  ThemeProvider,
  useTheme,
  useThemeValue,
  useIsDark,
} from './ThemeContext';
export type { Theme, ResolvedTheme } from './ThemeContext';
