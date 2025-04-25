export interface UserProfile {
    id: string;
    email: string;
    display_name?: string;
    github_username?: string;
    school_email?: string;
    tags?: string[];
    research_area?: string;
    avatar?: string;
}

export interface UserSession {
    userId: string;
    email: string;
    profile?: UserProfile;
} 