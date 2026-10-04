import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// react-router needs these, and jsdom does not provide them
if (typeof global.TextEncoder === "undefined") global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === "undefined") global.TextDecoder = TextDecoder;
