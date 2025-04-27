import React, { useState } from "react";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  message,
  Select,
  TimePicker,
  Row,
  Col,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import { foodServiceApi } from "../../../apiClients"; // Added API client import
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const DayTimePicker = ({ day }) => (
  <Row gutter={16}>
    <Col span={12}>
      <Form.Item
        name={`${day}Open`}
        label={`${capitalizeFirstLetter(day)} Open`}
        // rules={[{ required: true }]}
      >
        <TimePicker defaultValue={dayjs("09:00", "HH:mm")} format="HH:mm" />
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item
        name={`${day}Close`}
        label={`${capitalizeFirstLetter(day)} Close`}
        // rules={[{ required: true }]}
      >
        <TimePicker defaultValue={dayjs("18:00", "HH:mm")} format="HH:mm" />
      </Form.Item>
    </Col>
  </Row>
);

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const AddRestaurant = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const restaurantData = {
        name: values.name.trim(),
        description: values.description.trim(),
        cuisineType: values.cuisineType.trim(),
        contactNumber: values.contactNumber.trim(),
        email: values.email.trim(),
        address: {
          street: values.street.trim(),
          city: values.city.trim(),
          postalCode: values.postalCode.trim(),
        },
        openingHours: {
          monday: {
            open: values.mondayOpen ? values.mondayOpen.format("HH:mm") : null,
            close: values.mondayClose
              ? values.mondayClose.format("HH:mm")
              : null,
          },
          tuesday: {
            open: values.tuesdayOpen
              ? values.tuesdayOpen.format("HH:mm")
              : null,
            close: values.tuesdayClose
              ? values.tuesdayClose.format("HH:mm")
              : null,
          },
          wednesday: {
            open: values.wednesdayOpen
              ? values.wednesdayOpen.format("HH:mm")
              : null,
            close: values.wednesdayClose
              ? values.wednesdayClose.format("HH:mm")
              : null,
          },
          thursday: {
            open: values.thursdayOpen
              ? values.thursdayOpen.format("HH:mm")
              : null,
            close: values.thursdayClose
              ? values.thursdayClose.format("HH:mm")
              : null,
          },
          friday: {
            open: values.fridayOpen ? values.fridayOpen.format("HH:mm") : null,
            close: values.fridayClose
              ? values.fridayClose.format("HH:mm")
              : null,
          },
          saturday: {
            open: values.saturdayOpen
              ? values.saturdayOpen.format("HH:mm")
              : null,
            close: values.saturdayClose
              ? values.saturdayClose.format("HH:mm")
              : null,
          },
          sunday: {
            open: values.sundayOpen ? values.sundayOpen.format("HH:mm") : null,
            close: values.sundayClose
              ? values.sundayClose.format("HH:mm")
              : null,
          },
        },
      };

      // If you need to upload files, use FormData
      // const formData = new FormData();
      // formData.append("data", JSON.stringify(restaurantData));
      // if (logoFile) formData.append("logo", logoFile);
      // if (bannerFile) formData.append("banner", bannerFile);

      // Send the request
      const response = await foodServiceApi.post(
        "/restaurant",
        restaurantData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Restaurant Added!",
        text: "Your restaurant was successfully added.",
        timer: 2000,
        showConfirmButton: false,
      });
      form.resetFields();
      navigate("/restaurant-dashboard");
    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to add restaurant",
        text:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <Layout>
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Add New Restaurant</h1>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          onFinishFailed={({ errorFields }) => {
            // This will show which fields failed validation
            form.scrollToField(errorFields[0].name);
            message.error("Please fill in all required fields correctly");
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Restaurant Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cuisineType"
                label="Cuisine Type"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <h3>Address</h3>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="street"
                label="Street"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="City" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="postalCode"
                label="Postal Code"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <h3>Contact Information</h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contactNumber"
                label="Phone Number"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <h3>Opening Hours</h3>
          {[
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ].map((day) => (
            <DayTimePicker key={day} day={day} />
          ))}

          <h3>Images</h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="logo"
                label="Logo"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  beforeUpload={(file) => {
                    setLogoFile(file);
                    return false;
                  }}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Upload Logo</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="banner"
                label="Banner"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  beforeUpload={(file) => {
                    setBannerFile(file);
                    return false;
                  }}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Upload Banner</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: "100%", marginTop: "16px", color: "#fff" }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Restaurant
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Layout>
  );
};

export default AddRestaurant;
