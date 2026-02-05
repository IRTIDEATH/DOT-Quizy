interface User {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	email: string;
	emailVerified: boolean;
	name: string;
	image?: string | null;
	role: string;
	premium?: boolean;
}

interface Session {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	expiresAt: Date;
	token: string;
	ipAddress?: string | null;
	userAgent?: string | null;
}

export type CurrentUser = {
	user: User;
	session: Session;
};

export type { User };
