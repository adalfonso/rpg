/**
 * Eventful interfaces are characterized by their register method, a hook into
 * the their underlying instance which allows an event bus to easily register
 * all of their events.
 *
 * @interface {Eventful} Eventful
 */
export default interface Eventful {
  register(): object | object[];
}
