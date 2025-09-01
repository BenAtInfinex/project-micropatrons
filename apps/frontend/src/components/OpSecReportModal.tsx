import { useState, FC } from "react";
import { useReportOpSecIssue } from "../hooks/queries";
import { UserSearch } from "./UserSearch";

interface OpSecReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSuccess?: () => void; // Keep for compatibility but not needed with TanStack Query
}

export const OpSecReportModal: React.FC<OpSecReportModalProps> = ({
  isOpen,
  onClose,
  onReportSuccess,
}) => {
  const [formData, setFormData] = useState({
    victim: "",
    attacker: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const reportMutation = useReportOpSecIssue();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.victim || !formData.attacker) {
      setValidationError("Both victim and attacker must be specified");
      return;
    }

    if (formData.victim === formData.attacker) {
      setValidationError("Victim and attacker cannot be the same person");
      return;
    }

    setValidationError(null);

    reportMutation.mutate(
      {
        victim: formData.victim,
        attacker: formData.attacker,
      },
      {
        onSuccess: () => {
          // Show success screen
          setShowSuccess(true);

          // Wait 2 seconds then start closing animation
          setTimeout(() => {
            setIsClosing(true);

            // Wait for animation then close
            setTimeout(() => {
              // Reset form and states
              setFormData({ victim: "", attacker: "" });
              setShowSuccess(false);
              setIsClosing(false);

              // Notify parent components if callback exists
              onReportSuccess?.();
              onClose();
            }, 200);
          }, 2000);
        },
        onError: () => {
          // Error is handled by the mutation's error state
        },
      },
    );
  };

  const handleClose = () => {
    if (!reportMutation.isPending && !showSuccess) {
      setFormData({ victim: "", attacker: "" });
      setValidationError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl transition-all duration-200 ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
      >
        {showSuccess ? (
          /* Success Screen */
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-positive/20 rounded-full mb-4 animate-pulse">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="title-xl-bold text-emphasis mb-3">
                Report Submitted!
              </h2>
              <p className="body-base-normal text-secondary mb-4">
                OpSec violation has been reported successfully.
              </p>
              <div className="bg-positive/10 border border-positive/20 rounded-xl p-4">
                <p className="body-sm-normal text-positive">
                  <strong>20,000 µPatrons</strong> have been transferred from{" "}
                  <strong>{formData.victim}</strong> to{" "}
                  <strong>{formData.attacker}</strong> as a penalty.
                </p>
              </div>
            </div>

            {/* Loading animation */}
            <div className="flex justify-center">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <h2 className="title-lg-bold text-emphasis">
                  Report OpSec Issue
                </h2>
              </div>
              <button
                onClick={handleClose}
                disabled={reportMutation.isPending}
                className="w-8 h-8 rounded-full bg-surfaceTwo hover:bg-fill transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <span className="text-lg text-secondary">×</span>
              </button>
            </div>

            {/* Description */}
            <div className="mb-6 p-4 bg-caution/10 border border-caution/20 rounded-xl">
              <p className="body-sm-normal text-caution">
                <strong>Warning:</strong> This action will transfer{" "}
                <strong>20,000 µPatrons</strong> from the victim to the attacker
                as a penalty for the OpSec violation.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <UserSearch
                label="Victim"
                placeholder="Search for victim..."
                currentValue={formData.victim}
                onUserSelect={(username) =>
                  setFormData({ ...formData, victim: username })
                }
              />

              <UserSearch
                label="Attacker"
                placeholder="Search for attacker..."
                currentValue={formData.attacker}
                onUserSelect={(username) =>
                  setFormData({ ...formData, attacker: username })
                }
              />

              {(validationError || reportMutation.error) && (
                <div className="bg-critical/10 border border-critical/20 text-critical rounded-xl px-4 py-3 body-sm-normal">
                  {validationError ||
                    (reportMutation.error instanceof Error
                      ? reportMutation.error.message
                      : "Failed to report OpSec issue")}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={reportMutation.isPending}
                  className="flex-1 px-6 py-3 bg-surfaceTwo text-secondary rounded-xl body-base-semibold hover:bg-fill transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    reportMutation.isPending ||
                    !formData.victim ||
                    !formData.attacker
                  }
                  className="flex-1 px-6 py-3 bg-critical text-white rounded-xl body-base-semibold hover:bg-critical-hover active:bg-critical-pressed disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {reportMutation.isPending ? "Reporting..." : "Report Issue"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
