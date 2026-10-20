/**
 * Delivery settings. The live store has no rates configured, so these stay null until PURE sets them.
 * With null rates the bag and checkout say the fee is confirmed before dispatch (the shipping policy's own wording),
 * instead of the old "Delivery: Not yet configured".
 *
 *   flatFee            – centavos, e.g. 8000 for ₱80
 *   freeDeliveryFrom   – centavos, e.g. 99900 for ₱999. Turns on the "₱X away from free delivery" bar in the bag.
 */
export const delivery: { flatFee: number | null; freeDeliveryFrom: number | null } = {
  flatFee: null,
  freeDeliveryFrom: null,
};

export function deliveryFor(subtotal: number) {
  if (delivery.freeDeliveryFrom != null && subtotal >= delivery.freeDeliveryFrom) return 0;
  return delivery.flatFee;
}
