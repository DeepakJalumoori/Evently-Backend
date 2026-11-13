import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { BookingItem } from "@/types/booking.types";
import { useCancelBookingMutation } from "@/features/bookings/hooks/useBookings";
import { getApiErrorMessage } from "@/services/api-client";
import { formatPrice } from "@/utils/formatters";
import { formatEventDate } from "@/utils/date-helpers";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CancelBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingItem | null;
  onCancelled?: () => void;
}

export function CancelBookingDialog({
  isOpen,
  onClose,
  booking,
  onCancelled,
}: CancelBookingDialogProps) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const cancelMutation = useCancelBookingMutation();

  React.useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!booking) return null;

  const eventTitle = booking.event?.title || "Reserved Event";
  const eventDate = booking.event?.dateTime ? formatEventDate(booking.event.dateTime) : "Scheduled Date";
  const eventId = booking.event?._id;

  const handleConfirmCancel = () => {
    setErrorMessage(null);

    cancelMutation.mutate(
      { bookingId: booking._id, eventId },
      {
        onSuccess: () => {
          toast.success("Booking cancelled and seats restored to inventory.");
          onClose();
          onCancelled?.();
        },
        onError: (err) => {
          const msg = getApiErrorMessage(err);
          setErrorMessage(msg);
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={cancelMutation.isPending ? () => {} : onClose}
      title="Cancel Reservation?"
      description="Please confirm you wish to cancel this ticket reservation."
    >
      <div className="space-y-5 py-2">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong className="font-semibold block mb-0.5">
              Seat Release Notice
            </strong>
            Cancelling this booking will immediately release your <strong>{booking.seats} {booking.seats === 1 ? "seat" : "seats"}</strong> back to the available inventory. This transaction cannot be undone.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border space-y-2.5 text-xs">
          <div className="flex justify-between text-charcoal-700">
            <span className="text-charcoal-500">Event</span>
            <strong className="text-charcoal-900 text-right max-w-[220px] truncate">
              {eventTitle}
            </strong>
          </div>
          <div className="flex justify-between text-charcoal-700">
            <span className="text-charcoal-500">Scheduled Date</span>
            <span className="font-medium text-charcoal-800">{eventDate}</span>
          </div>
          <div className="flex justify-between text-charcoal-700">
            <span className="text-charcoal-500">Seats Reserved</span>
            <span className="font-bold text-charcoal-900">{booking.seats}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-surface-border text-sm">
            <span className="font-semibold text-charcoal-900">Total Amount</span>
            <span className="font-bold text-charcoal-900">{formatPrice(booking.totalAmount)}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">
              {errorMessage}
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full sm:w-auto"
            disabled={cancelMutation.isPending}
            onClick={onClose}
          >
            Keep Reservation
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            className="w-full sm:w-auto"
            disabled={cancelMutation.isPending}
            isLoading={cancelMutation.isPending}
            onClick={handleConfirmCancel}
          >
            {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
