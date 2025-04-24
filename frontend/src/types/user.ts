export interface UserProfile {
    id: string;
    email: string;
    nickname?: string;
    github_username?: string;
    school_email?: string;
    tags?: string[];
    research_areas?: string[];
    avatar?: string;
}

export interface UserSession {
    userId: string;
    email: string;
    profile?: UserProfile;
} 