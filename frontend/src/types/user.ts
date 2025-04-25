export interface UserProfile {
    id: string;
    email: string;
    display_name?: string;
    github_username?: string;
    school_email?: string;
    tags?: string[];
<<<<<<< HEAD
    research_area?: string;
=======
    research_area?: string[];
>>>>>>> 209d7ac ([feat] add sage card.)
    avatar?: string;
}

export interface UserSession {
    userId: string;
    email: string;
    profile?: UserProfile;
} 