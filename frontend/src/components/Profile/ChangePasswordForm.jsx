import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import PasswordInputField from "../InputFields/PasswordInputField";
import SubmitButton from "../SubmitButton";

const ChangePasswordForm = ({ onSubmit }) => {
  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required")
      .notOneOf(
        [Yup.ref("currentPassword")],
        "New password must be different from current password"
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Please confirm your password"),
  });

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      onSubmit(values);
      resetForm();
    },
  });

  return (
    <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg shadow dark:shadow-gray-800">
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">
        Change Password
      </h2>
      <form onSubmit={formik.handleSubmit}>
        <PasswordInputField
          label="Current Password"
          id="currentPassword"
          name="currentPassword"
          type="password"
          formik={formik}
        />

        <PasswordInputField
          label="New Password"
          id="newPassword"
          name="newPassword"
          type="password"
          formik={formik}
        />

        <PasswordInputField
          label="Confirm New Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          formik={formik}
          className="mb-6"
        />

        <SubmitButton
          isSubmitting={formik.isSubmitting}
          isValid={formik.isValid}
          submittingText="Changing..."
          defaultText="Change Password"
        />
      </form>
    </div>
  );
};

export default ChangePasswordForm;
