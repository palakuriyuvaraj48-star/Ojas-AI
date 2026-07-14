import type { CameraPreferences } from "./types";

export class CameraService {
  private stream: MediaStream | null = null;

  async listDevices(): Promise<MediaDeviceInfo[]> {
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    return (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "videoinput");
  }

  async start(preferences: CameraPreferences): Promise<MediaStream> {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("UNSUPPORTED_BROWSER");
    this.stop();
    const video: MediaTrackConstraints = preferences.deviceId
      ? { deviceId: { exact: preferences.deviceId }, width: { ideal: preferences.width }, height: { ideal: preferences.height }, frameRate: { ideal: preferences.frameRate } }
      : { facingMode: { ideal: preferences.facingMode }, width: { ideal: preferences.width }, height: { ideal: preferences.height }, frameRate: { ideal: preferences.frameRate } };
    this.stream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
    return this.stream;
  }

  stop(): void { this.stream?.getTracks().forEach((track) => track.stop()); this.stream = null; }
  pause(): void { this.stream?.getVideoTracks().forEach((track) => { track.enabled = false; }); }
  resume(): void { this.stream?.getVideoTracks().forEach((track) => { track.enabled = true; }); }
}
