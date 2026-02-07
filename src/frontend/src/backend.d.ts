import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CustomDomainConfig {
    status: CustomDomainStatus;
    desiredDomain: string;
    instructions: string;
    canonicalUrl: string;
    dnsSetupHelp: string;
    requirements: string;
}
export interface CustomDomainConfigUpdate {
    status: CustomDomainStatus;
    instructions: string;
    canonicalUrl: string;
    requirements: string;
}
export interface BlocklistUpdateResult {
    newBlocklist: Array<string>;
    message: string;
    success: boolean;
}
export type CustomDomainStatus = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "error";
    error: string;
} | {
    __kind__: "configured";
    configured: null;
};
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
    getCustomDomainConfig(): Promise<CustomDomainConfig | null>;
    getPrivacySettings(): Promise<PrivacySettings>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    proposeCustomDomain(domain: string): Promise<void>;
    removeBlockEntry(domain: string): Promise<BlocklistUpdateResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAutoStopTracking(autoStop: boolean): Promise<void>;
    updateCustomDomainConfig(update: CustomDomainConfigUpdate): Promise<void>;
}
