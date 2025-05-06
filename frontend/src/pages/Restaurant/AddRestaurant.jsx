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
  Image,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import { foodServiceApi } from "../../../apiClients";
import dayjs from "dayjs";
import { GoogleMap, Marker } from "@react-google-maps/api";

const { Option } = Select;
const { TextArea } = Input;

const cuisineTypes = [
  "Italian",
  "Chinese",
  "Indian",
  "Mexican",
  "Japanese",
  "Thai",
  "American",
  "Mediterranean",
  "French",
  "Vietnamese",
  "Korean",
  "Other",
];

const DayTimePicker = ({ day }) => (
  <Row gutter={16}>
    <Col span={12}>
      <Form.Item
        name={`${day}Open`}
        label={`${capitalizeFirstLetter(day)} Open`}
      >
        <TimePicker defaultValue={dayjs("09:00", "HH:mm")} format="HH:mm" />
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item
        name={`${day}Close`}
        label={`${capitalizeFirstLetter(day)} Close`}
      >
        <TimePicker defaultValue={dayjs("18:00", "HH:mm")} format="HH:mm" />
      </Form.Item>
    </Col>
  </Row>
);

const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

const AddRestaurant = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 6.9271, lng: 79.8612 });

  const geocodeAddress = async (addressString) => {
    if (!window.google) {
      console.error("Google Maps not loaded");
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: addressString }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          reject(new Error("Geocoding failed: " + status));
        }
      });
    });
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token"); // Moved this line up before using token

      const openingHours = {};
      [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ].forEach((day) => {
        openingHours[day] = {
          open: values[`${day}Open`]
            ? values[`${day}Open`].format("HH:mm")
            : null,
          close: values[`${day}Close`]
            ? values[`${day}Close`].format("HH:mm")
            : null,
        };
      });

      const formData = new FormData();
      formData.append("name", values.name.trim());
      formData.append("description", values.description.trim());
      formData.append("cuisineType", values.cuisineType);
      formData.append("contactNumber", values.contactNumber.trim());
      formData.append("email", values.email.trim());
      formData.append("address[street]", values.street.trim());
      formData.append("address[city]", values.city.trim());
      formData.append("address[postalCode]", values.postalCode.trim());
      formData.append("coordinates[lat]", mapCenter.lat);
      formData.append("coordinates[lng]", mapCenter.lng);

      // Append opening hours
      Object.entries(openingHours).forEach(([day, hours]) => {
        formData.append(`openingHours[${day}][open]`, hours.open || "");
        formData.append(`openingHours[${day}][close]`, hours.close || "");
      });

      // Append files if they exist
      if (values.logo && values.logo[0]) {
        formData.append("logo", values.logo[0].originFileObj);
      }
      if (values.banner && values.banner[0]) {
        formData.append("banner", values.banner[0].originFileObj);
      }

      // Add owner ID from token
      if (token) {
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.id) {
          formData.append("owner", decodedToken.id);
        }
      }

      const response = await foodServiceApi.post("/restaurant", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

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
      let errorMessage = "Something went wrong";
      if (error.response) {
        errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      Swal.fire({
        icon: "error",
        title: "Failed to add restaurant",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = ({ fileList }) => {
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(fileList[0].originFileObj);
    } else {
      setLogoPreview(null);
    }
  };

  const handleBannerChange = ({ fileList }) => {
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => setBannerPreview(e.target.result);
      reader.readAsDataURL(fileList[0].originFileObj);
    } else {
      setBannerPreview(null);
    }
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
          onValuesChange={async (changed, allValues) => {
            if (changed.street || changed.city || changed.postalCode) {
              const addressString = `${allValues.street || ""}, ${
                allValues.city || ""
              }, ${allValues.postalCode || ""}`;
              try {
                const coords = await geocodeAddress(addressString);
                setMapCenter(coords);
                message.success("Location updated from address");
              } catch (error) {
                console.error(error);
              }
            }
          }}
          onFinishFailed={({ errorFields }) => {
            form.scrollToField(errorFields[0].name);
            message.error("Please fill all required fields correctly");
          }}
        >
          {/* Basic Details */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Restaurant Name"
                rules={[
                  { required: true, message: "Please input restaurant name!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cuisineType"
                label="Cuisine Type"
                rules={[
                  { required: true, message: "Please select cuisine type!" },
                ]}
              >
                <Select placeholder="Select cuisine type">
                  {cuisineTypes.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please input description!" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <h3>Address</h3>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="street"
                label="Street"
                rules={[
                  { required: true, message: "Please input street address!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: "Please input city!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="postalCode"
                label="Postal Code"
                rules={[
                  { required: true, message: "Please input postal code!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginTop: "24px" }}>
            <h3>Select Location</h3>
            <GoogleMap
              mapContainerStyle={{
                width: "100%",
                height: "400px",
                borderRadius: "8px",
              }}
              center={mapCenter}
              zoom={15}
              onClick={(e) => {
                const clickedLat = e.latLng.lat();
                const clickedLng = e.latLng.lng();
                setMapCenter({ lat: clickedLat, lng: clickedLng });
                message.success("Location updated from Map Click!");
              }}
            >
              {mapCenter && <Marker position={mapCenter} />}
            </GoogleMap>
          </div>

          <h3>Contact Information</h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contactNumber"
                label="Phone Number"
                rules={[
                  { required: true, message: "Please input phone number!" },
                  {
                    pattern: /^\+?[0-9]{10,15}$/,
                    message: "Please enter a valid phone number!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please input email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
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
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e && e.fileList;
                }}
                rules={[{ required: true, message: "Please upload logo!" }]}
              >
                <Upload
                  listType="picture-card"
                  beforeUpload={() => false}
                  maxCount={1}
                  onChange={handleLogoChange}
                >
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="logo"
                      style={{ width: "100%" }}
                      preview={false}
                    />
                  ) : (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload Logo</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="banner"
                label="Banner"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e && e.fileList;
                }}
                rules={[{ required: true, message: "Please upload banner!" }]}
              >
                <Upload
                  listType="picture-card"
                  beforeUpload={() => false}
                  maxCount={1}
                  onChange={handleBannerChange}
                >
                  {bannerPreview ? (
                    <Image
                      src={bannerPreview}
                      alt="banner"
                      style={{ width: "100%" }}
                      preview={false}
                    />
                  ) : (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload Banner</div>
                    </div>
                  )}
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
