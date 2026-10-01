// src/data/UminaFacade.ts
import { Umina } from "../types/umina";
import uminas from "./uminas.json";

export class UminaFacade {
  private uminasData: Umina[];

  private constructor(uminasData: Umina[]) {
    this.uminasData = uminasData;
  }

  // Factory method: creates a facade from bundled JSON
  static fromJSON(): UminaFacade {
    return new UminaFacade(uminas as Umina[]);
  }

  getAll(): Umina[] {
    return this.uminasData;
  }

  getFeatured(count: number = 3): Umina[] {
    return this.uminasData.slice(0, count);
  }

  findById(id: string): Umina | undefined {
    return this.uminasData.find(r => r.properties.stone_id === id);
  }
}
