import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Effect {
    name: string;
    parameters: string;
    category: string;
}
export interface Project {
    effects: Array<Effect>;
    name: string;
    videoBlob: ExternalBlob;
    lastModified: Time;
    creationTime: Time;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProject(name: string, videoBlob: ExternalBlob): Promise<void>;
    deleteProject(name: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProject(user: Principal, name: string): Promise<Project>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listProjects(): Promise<Array<Project>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProject(name: string, effects: Array<Effect>): Promise<void>;
}
