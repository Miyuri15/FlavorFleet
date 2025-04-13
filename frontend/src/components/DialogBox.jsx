import Swal from "sweetalert2";

export default function DialogBox({
  title,
  text,
  confirmText,
  onConfirm,
  afterConfirmText,
}) {
  const showDialog = () => {
    Swal.fire({
      title: title,
      text: text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: confirmText,
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
        Swal.fire("Success", afterConfirmText, "success");
      }
    });
  };

  return <button onClick={showDialog} className="hidden"></button>;
}
