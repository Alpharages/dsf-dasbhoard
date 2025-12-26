export interface SystemConfig {
    key: string;
    value: string;
    description?: string;
    is_secret: boolean;
    updated_at: string;
    updated_by?: string;
}

export type ConfigPanel =
    | 'cleanup'
    | 'self-healing'
    | 'dependency'
    | 'auto-merge'
    | 'cost'
    | 'audit'
    | 'health';
