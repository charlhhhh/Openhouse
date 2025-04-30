export interface UserProfile {
    id: string;
    username: string;
    email: string;
    avatar_url: string;
    intro_short?: string;
    display_name?: string;
    github_username?: string;
    school_email?: string;
    tags?: string[];
    research_area?: string;
    avatar?: string;
}

export interface UserSession {
    token: string;
} 