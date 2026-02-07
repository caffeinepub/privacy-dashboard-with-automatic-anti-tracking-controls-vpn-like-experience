import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BlocklistUpdateResult {
    newBlocklist: Array<string>;
    message: string;
    success: boolean;
}
export interface UserProfile {
    name: string;
}
export interface PrivacySettings {
    blockList: Array<string>;
    autoStopTracking: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBlockEntry(domain: string): Promise<BlocklistUpdateResult>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPrivacySettings(): Promise<PrivacySettings>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeBlockEntry(domain: string): Promise<BlocklistUpdateResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAutoStopTracking(autoStop: boolean): Promise<void>;
}
