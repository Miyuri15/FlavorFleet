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
import { foodServiceApi } from "../../../apiClients";
import dayjs from "dayjs";
import { GoogleMap, Marker } from "@react-google-maps/api";

const { Option } = Select;
const { TextArea } = Input;

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
// Helper function to capitalize the first letter
const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const AddRestaurant = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
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
          coordinates: mapCenter, // Using mapCenter
        },
        openingHours,
      };

      // If you need to upload files, use FormData
      // const formData = new FormData();
      // formData.append("data", JSON.stringify(restaurantData));
      // if (logoFile) formData.append("logo", logoFile);
      // if (bannerFile) formData.append("banner", bannerFile);

      const response = await foodServiceApi.post("/restaurant", restaurantData);

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

  const normFile = (e) => (Array.isArray(e) ? e : e && e.fileList);

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
