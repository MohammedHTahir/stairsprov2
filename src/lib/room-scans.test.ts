import { describe, expect, it } from "vitest";
import { roomScanPlacement, validateRoomScan } from "./room-scans";

describe("Whole-room scans", () => {
  it("preserves measured dimensions instead of fitting to staircase dimensions", () => {
    const result = roomScanPlacement([-2, -0.2, -3], [4, 3.1, 5]);
    expect(result.dimensions).toEqual([6, 3.3000000000000003, 8]);
    expect(result.position).toEqual([-1, 0.2, -1]);
  });
  it("does not treat a room photo as an accurate 3D scan", async () => {
    await expect(validateRoomScan(new File([], "room.jpg"))).rejects.toThrow("not a photo");
  });
  it("rejects a renamed image without GLB geometry", async () => {
    const file = { name: "room.glb", arrayBuffer: async () => new ArrayBuffer(24) } as File;
    await expect(validateRoomScan(file)).rejects.toThrow("not a valid GLB");
  });
});