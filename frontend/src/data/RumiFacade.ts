// src/data/RumiFacade.ts
import { Rumi } from "../types/rumi";
import rumis from "./rumis.json";

export class RumiFacade {
  private rumisData: Rumi[];

  private constructor(rumisData: Rumi[]) {
    this.rumisData = rumisData;
  }

  // Factory method: creates a facade from bundled JSON
  static fromJSON(): RumiFacade {
    return new RumiFacade(rumis as Rumi[]);
  }

  // Later you could add: static async fromAPI()

  getAll(): Rumi[] {
    return this.rumisData;
  }

  getFeatured(count: number = 3): Rumi[] {
    return this.rumisData.slice(0, count);
  }

  findById(id: string): Rumi | undefined {
    return this.rumisData.find(r => r.properties.stone_id === id);
  }
}
