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

export interface HierarchyResponse {
    organizations: Organization[];
}
