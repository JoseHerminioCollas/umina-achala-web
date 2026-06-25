// src/utils/filterItems.ts
export interface Filters {
  type: string;
  cut: string;
  mounted: string;
}

export function filterItems(data: any[], filters: Filters) {
  return data.filter((i) => {
    if (
      filters.type &&
      !i.attributes.some(
        (a: any) => a.trait_type === "Stone Type" && a.value === filters.type,
      )
    )
      return false;

    if (filters.cut) {
      if (filters.cut === "No Cut") {
        // Match stones with no cut value
        const hasCut = i.attributes.some(
          (a: any) =>
            a.trait_type === "Stone Cut" && a.value && a.value.trim() !== "",
        );
        if (hasCut) return false;
      } else {
        // Match stones with the selected cut
        if (
          !i.attributes.some(
            (a: any) => a.trait_type === "Stone Cut" && a.value === filters.cut,
          )
        )
          return false;
      }
    }

    if (
      filters.mounted === "true" &&
      !i.attributes.some(
        (a: any) =>
          a.trait_type === "Mounted By" && a.value && a.value.trim() !== "",
      )
    )
      return false;

    if (
      filters.mounted === "false" &&
      i.attributes.some(
        (a: any) =>
          a.trait_type === "Mounted By" && a.value && a.value.trim() !== "",
      )
    )
      return false;

    return true;
  });
}
