// Fallback for the @similar slot on hard navigation to an unmatched sub-route.
// There are no deeper routes under the product page, so rendering null is safe.
export default function Default() {
  return null;
}
