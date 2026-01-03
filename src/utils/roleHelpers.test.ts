/**
 * Role Helpers Tests
 * Unit tests for role utility functions
 */

import { describe, it, expect } from 'vitest';
import { ROLE, hasRole, hasAnyRole, canAccess } from './roleHelpers';

describe('roleHelpers', () => {
    describe('ROLE constants', () => {
        it('should export all role constants', () => {
            expect(ROLE.ADMIN).toBe('ADMIN');
            expect(ROLE.MANAGER).toBe('MANAGER');
            expect(ROLE.TL).toBe('TL');
            expect(ROLE.PM).toBe('PM');
            expect(ROLE.QA).toBe('QA');
            expect(ROLE.VIEWER).toBe('VIEWER');
        });
    });

    describe('hasRole', () => {
        it('should return true for exact role match', () => {
            expect(hasRole('ADMIN', 'ADMIN')).toBe(true);
            expect(hasRole('MANAGER', 'MANAGER')).toBe(true);
            expect(hasRole('TL', 'TL')).toBe(true);
            expect(hasRole('PM', 'PM')).toBe(true);
            expect(hasRole('QA', 'QA')).toBe(true);
            expect(hasRole('VIEWER', 'VIEWER')).toBe(true);
        });

        it('should return false for non-matching roles', () => {
            expect(hasRole('ADMIN', 'MANAGER')).toBe(false);
            expect(hasRole('VIEWER', 'PM')).toBe(false);
            expect(hasRole('TL', 'ADMIN')).toBe(false);
        });
    });

    describe('hasAnyRole', () => {
        it('should return true if user has any of the required roles', () => {
            expect(hasAnyRole('ADMIN', ['ADMIN', 'MANAGER'])).toBe(true);
            expect(hasAnyRole('MANAGER', ['ADMIN', 'MANAGER'])).toBe(true);
            expect(hasAnyRole('TL', ['TL', 'PM', 'QA'])).toBe(true);
        });

        it('should return false if user has none of the required roles', () => {
            expect(hasAnyRole('VIEWER', ['ADMIN', 'MANAGER', 'TL'])).toBe(false);
            expect(hasAnyRole('PM', ['ADMIN', 'MANAGER'])).toBe(false);
            expect(hasAnyRole('QA', ['TL', 'PM'])).toBe(false);
        });

        it('should handle empty array', () => {
            expect(hasAnyRole('ADMIN', [])).toBe(false);
        });
    });

    describe('canAccess - role hierarchy', () => {
        describe('ADMIN access', () => {
            it('ADMIN can access all roles', () => {
                expect(canAccess('ADMIN', 'ADMIN')).toBe(true);
                expect(canAccess('ADMIN', 'MANAGER')).toBe(true);
                expect(canAccess('ADMIN', 'TL')).toBe(true);
                expect(canAccess('ADMIN', 'PM')).toBe(true);
                expect(canAccess('ADMIN', 'QA')).toBe(true);
                expect(canAccess('ADMIN', 'VIEWER')).toBe(true);
            });
        });

        describe('MANAGER access', () => {
            it('MANAGER can access TL, PM, QA, VIEWER', () => {
                expect(canAccess('MANAGER', 'MANAGER')).toBe(true);
                expect(canAccess('MANAGER', 'TL')).toBe(true);
                expect(canAccess('MANAGER', 'PM')).toBe(true);
                expect(canAccess('MANAGER', 'QA')).toBe(true);
                expect(canAccess('MANAGER', 'VIEWER')).toBe(true);
            });

            it('MANAGER cannot access ADMIN', () => {
                expect(canAccess('MANAGER', 'ADMIN')).toBe(false);
            });
        });

        describe('TL access', () => {
            it('TL can access PM, QA, VIEWER', () => {
                expect(canAccess('TL', 'TL')).toBe(true);
                expect(canAccess('TL', 'PM')).toBe(true);
                expect(canAccess('TL', 'QA')).toBe(true);
                expect(canAccess('TL', 'VIEWER')).toBe(true);
            });

            it('TL cannot access ADMIN, MANAGER', () => {
                expect(canAccess('TL', 'ADMIN')).toBe(false);
                expect(canAccess('TL', 'MANAGER')).toBe(false);
            });
        });

        describe('PM access', () => {
            it('PM can access QA, VIEWER', () => {
                expect(canAccess('PM', 'PM')).toBe(true);
                expect(canAccess('PM', 'QA')).toBe(true);
                expect(canAccess('PM', 'VIEWER')).toBe(true);
            });

            it('PM cannot access ADMIN, MANAGER, TL', () => {
                expect(canAccess('PM', 'ADMIN')).toBe(false);
                expect(canAccess('PM', 'MANAGER')).toBe(false);
                expect(canAccess('PM', 'TL')).toBe(false);
            });
        });

        describe('QA access', () => {
            it('QA can access VIEWER only', () => {
                expect(canAccess('QA', 'QA')).toBe(true);
                expect(canAccess('QA', 'VIEWER')).toBe(true);
            });

            it('QA cannot access higher roles', () => {
                expect(canAccess('QA', 'ADMIN')).toBe(false);
                expect(canAccess('QA', 'MANAGER')).toBe(false);
                expect(canAccess('QA', 'TL')).toBe(false);
                expect(canAccess('QA', 'PM')).toBe(false);
            });
        });

        describe('VIEWER access', () => {
            it('VIEWER can only access VIEWER', () => {
                expect(canAccess('VIEWER', 'VIEWER')).toBe(true);
            });

            it('VIEWER cannot access any other roles', () => {
                expect(canAccess('VIEWER', 'ADMIN')).toBe(false);
                expect(canAccess('VIEWER', 'MANAGER')).toBe(false);
                expect(canAccess('VIEWER', 'TL')).toBe(false);
                expect(canAccess('VIEWER', 'PM')).toBe(false);
                expect(canAccess('VIEWER', 'QA')).toBe(false);
            });
        });

        describe('Unknown roles', () => {
            it('should return false for unknown user role', () => {
                expect(canAccess('UNKNOWN', 'ADMIN')).toBe(false);
                expect(canAccess('UNKNOWN', 'VIEWER')).toBe(false);
            });

            it('should allow ADMIN to access unknown roles (undefined levels default to 0)', () => {
                // All defined roles (level >= 1) >= unknown role (level 0 default) = true
                // This is expected behavior - any defined role can access undefined roles
                expect(canAccess('ADMIN', 'UNKNOWN')).toBe(true);
                expect(canAccess('MANAGER', 'UNKNOWN')).toBe(true);
                expect(canAccess('VIEWER', 'UNKNOWN')).toBe(true); // Even VIEWER (level 1) >= unknown (level 0)
            });
        });
    });
});
