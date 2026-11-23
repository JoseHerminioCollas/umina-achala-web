// @google/model-viewer in tests (#119): the real module needs WebGL and
// registers a custom element; jsdom has neither, so the element stays a plain
// unknown element and the tests check its attributes.
export {};
