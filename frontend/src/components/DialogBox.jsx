import React from "react";
import Swal from "sweetalert2";

export default function DialogBox({
  title,
  text,
  confirmText,
  onConfirm,
  afterConfirmText,
  triggerRef,
}) {
  const showDialog = () => {
    Swal.fire({
      title: title,
      text: text,
      icon: "warning",
      showCancelButton: true,
      customClass: {
        confirmButton: "my-confirm-button",
        cancelButton: "my-cancel-button",
      },
      buttonsStyling: false,
      confirmButtonText: confirmText,
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
        Swal.fire("Success", afterConfirmText, "success");
      }
    });
  };

  return (
    <button ref={triggerRef} onClick={showDialog} className="hidden">
      Open Dialog
    </button>
  );
}
