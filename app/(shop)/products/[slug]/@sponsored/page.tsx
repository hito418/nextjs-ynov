import { SponsoredProducts } from "@/modules/sponsored/components/sponsored-products";

// @sponsored slot — fetches and renders the GraphQL sponsored products. No
// params needed. The uncached fetch makes it a dynamic hole that streams
// independently from @similar and the main product content.
export default function SponsoredSlot() {
  return <SponsoredProducts limit={4} />;
}
