export interface Organization {
    id: string;
    name: string;
    spaces: Space[];
}

export interface Space {
    id: string;
    name: string;
    lists?: ListItem[];
}

export interface ListItem {
    id: string;
    name: string;
}

export interface ConnectedApp {
    id: string;
    provider: 'clickup' | 'jira' | 'asana';
    workspace_id: string;
    workspace_name: string;
    bot_user_id: string;
    bot_username: string;
    created_at: string;
}
