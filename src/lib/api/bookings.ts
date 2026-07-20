import { apiRequest } from "@/lib/api/client";
import type { Booking } from "@/types/api";

export interface BookingPayload {
  mentor_id: number;
  user_id: number;
  [key: string]: unknown;
}

export function createBooking(payload: BookingPayload) {
  return apiRequest<Booking>("/api/v1/bookings", { method: "POST", body: payload });
}

export function listBookings(params?: { user_id?: number; role?: string }) {
  const search = new URLSearchParams();
  if (params?.user_id !== undefined) search.set("user_id", String(params.user_id));
  if (params?.role) search.set("role", params.role);
  const qs = search.toString();
  return apiRequest<Booking[]>(`/api/v1/bookings${qs ? `?${qs}` : ""}`);
}

export function updateBooking(bookingId: number, payload: Partial<BookingPayload>) {
  return apiRequest<Booking>(`/api/v1/bookings/${bookingId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function submitBookingFeedback(bookingId: number, rating: number, comment: string) {
  return apiRequest<{ updated: boolean; booking: Booking }>(
    `/api/v1/bookings/${bookingId}/feedback`,
    { method: "POST", body: { rating, comment } }
  );
}
