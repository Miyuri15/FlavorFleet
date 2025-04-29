import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Select,
  TimePicker,
  Row,
  Col,
  Upload,
  Card,
  Typography,
  message,
  Switch,
  InputNumber,
  Divider,
  Skeleton,
} from "antd";
import {
  SaveOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { foodServiceApi } from "../../../apiClients";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import ROUTES from "../../routes";
import Layout from "../../components/Layout";
import { GoogleMap, Marker } from "@react-google-maps/api";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 6.9271, lng: 79.8612 });
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState("");
  const [currentBanner, setCurrentBanner] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  const cuisineTypes = [
    "Sri Lankan",
    "Indian",
    "Chinese",
    "Italian",
    "American",
    "Mexican",
    "Thai",
    "Japanese",
    "Mediterranean",
    "Other",
  ];

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await foodServiceApi.get(`/restaurant/${id}`);
        if (response.status === 200) {
          const data = response.data;
          setRestaurant(data);
          setCurrentLogo(data?.logo || "");
          setCurrentBanner(data?.banner || "");

          const openingHours = {};
          if (data?.openingHours && typeof data.openingHours === "object") {
            Object.keys(data.openingHours).forEach((day) => {
              openingHours[`${day}Open`] = data.openingHours[day]?.open
                ? dayjs(data.openingHours[day].open, "HH:mm")
                : null;
              openingHours[`${day}Close`] = data.openingHours[day]?.close
                ? dayjs(data.openingHours[day].close, "HH:mm")
                : null;
            });
          }

          form.setFieldsValue({
            ...data,
            ...openingHours,
            street: data?.address?.street,
            city: data?.address?.city,
            postalCode: data?.address?.postalCode,
          });

          if (
            data?.address?.coordinates?.lat &&
            data?.address?.coordinates?.lng
          ) {
            setMapCenter({
              lat: data.address.coordinates.lat,
              lng: data.address.coordinates.lng,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
        Swal.fire({
          icon: "error",
          title: "Failed to load restaurant",
          text:
            error.response?.data?.error ||
            error.message ||
            "Something went wrong",
        });
        navigate(ROUTES.RESTAURANT_DETAILS(id));
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, form, navigate]);

  const geocodeAddress = async (addressString) => {
    if (!window.google) {
      console.error("Google Maps JS not loaded");
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
      setSubmitting(true);

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
          open: values[`${day}Open`]?.format("HH:mm") || null,
          close: values[`${day}Close`]?.format("HH:mm") || null,
        };
      });

      const restaurantData = {
        name: values.name.trim(),
        description: values.description.trim(),
        cuisineType: values.cuisineType,
        contactNumber: values.contactNumber.trim(),
        email: values.email.trim(),
        address: {
          street: values.street.trim(),
          city: values.city.trim(),
          postalCode: values.postalCode.trim(),
          coordinates: mapCenter,
        },
        openingHours,
        deliveryRadius: values.deliveryRadius,
        isAvailable: values.isAvailable,
      };

      let response;
      if (logoFile || bannerFile) {
        const formData = new FormData();
        formData.append("data", JSON.stringify(restaurantData));
        if (logoFile) formData.append("logo", logoFile);
        if (bannerFile) formData.append("banner", bannerFile);

        response = await foodServiceApi.put(`/restaurant/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await foodServiceApi.put(
          `/restaurant/${id}`,
          restaurantData
        );
      }

      if (response.status === 200) {
        Swal.fire("Updated!", "Restaurant has been updated.", "success");
        navigate(ROUTES.RESTAURANT_DETAILS(id));
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to update restaurant",
        text:
          error.response?.data?.error ||
          error.message ||
          "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveImage = (type) => {
    if (type === "logo") {
      setLogoFile(null);
      setCurrentLogo("");
      form.setFieldsValue({ logo: null });
    } else {
      setBannerFile(null);
      setCurrentBanner("");
      form.setFieldsValue({ banner: null });
    }
  };

  const normFile = (e) => (Array.isArray(e) ? e : e && e.fileList);

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: "24px" }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </Layout>
    );
  }

  if (!restaurant) {
    return (
      <Layout>
        <div style={{ padding: "24px" }}>
          <Card>
            <Text>Restaurant not found</Text>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="edit-restaurant-container">
        <Card
          title={<Title level={2}>Edit Restaurant</Title>}
          loading={loading}
          className="pt-5"
        >
          <Form
            form={form}
            layout="vertical"
            onValuesChange={async (changedValues, allValues) => {
              if (
                changedValues.street ||
                changedValues.city ||
                changedValues.postalCode
              ) {
                const addressString = `${allValues.street || ""}, ${
                  allValues.city || ""
                }, ${allValues.postalCode || ""}`;
                try {
                  const coords = await geocodeAddress(addressString);
                  setMapCenter(coords);
                  message.success("Location updated from address");
                } catch (error) {
                  console.error(error);
                  message.warning("Couldn't geocode address");
                }
              }
            }}
            onFinish={onFinish}
            initialValues={{
              isAvailable: true,
              deliveryRadius: 5,
            }}
          >
            {/* Basic Details */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Restaurant Name"
                  rules={[{ required: true, message: "Please enter name" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="cuisineType"
                  label="Cuisine Type"
                  rules={[{ required: true, message: "Please select cuisine" }]}
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
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            {/* Address Section */}
            <Divider orientation="left">Address</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="street"
                  label="Street"
                  rules={[{ required: true, message: "Please enter street" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="city"
                  label="City"
                  rules={[{ required: true, message: "Please enter city" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="postalCode"
                  label="Postal Code"
                  rules={[
                    { required: true, message: "Please enter postal code" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            {/* Map Section */}
            <div style={{ marginTop: "24px" }}>
              <Title level={4}>Select Location</Title>
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

            {/* Contact Section */}
            <Divider orientation="left">Contact Information</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="contactNumber"
                  label="Phone Number"
                  rules={[
                    { required: true, message: "Please enter phone" },
                    {
                      pattern: /^[0-9]{10}$/,
                      message: "Phone number must be 10 digits",
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
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Please enter valid email" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Business Hours</Divider>
            {[
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ].map((day) => (
              <Row gutter={16} key={day} style={{ marginBottom: 16 }}>
                <Col span={4}>
                  <Text strong>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Text>
                </Col>
                <Col span={10}>
                  <Form.Item
                    name={`${day}Open`}
                    label="Open Time"
                    // rules={[
                    //   { required: true, message: "Please enter open time" },
                    // ]}
                  >
                    <TimePicker
                      defaultValue={dayjs("09:00", "HH:mm")}
                      format="HH:mm"
                      minuteStep={15}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item
                    name={`${day}Close`}
                    label="Close Time"
                    // rules={[
                    //   { required: true, message: "Please enter close time" },
                    // ]}
                  >
                    <TimePicker
                      defaultValue={dayjs("18:00", "HH:mm")}
                      format="HH:mm"
                      minuteStep={15}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ))}

            <Divider orientation="left">Settings</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="deliveryRadius"
                  label="Delivery Radius (km)"
                  rules={[{ required: true, message: "Please enter radius" }]}
                >
                  <InputNumber min={1} max={20} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="isAvailable"
                  label="Available for Orders"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Images</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Logo">
                  {currentLogo && !logoFile ? (
                    <div className="image-preview-container">
                      <img
                        src={currentLogo}
                        alt="Current logo"
                        className="image-preview"
                      />
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveImage("logo")}
                        className="remove-image-btn"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Form.Item
                      name="logo"
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                    >
                      <Upload
                        beforeUpload={(file) => {
                          setLogoUploading(true);
                          const isImage = file.type.startsWith("image/");
                          if (!isImage) {
                            message.error("You can only upload image files!");
                            setLogoUploading(false);
                            return false;
                          }
                          const isLt5M = file.size / 1024 / 1024 < 5;
                          if (!isLt5M) {
                            message.error("Image must be smaller than 5MB!");
                            setLogoUploading(false);
                            return false;
                          }
                          setLogoFile(file);
                          setLogoUploading(false);
                          return false;
                        }}
                        maxCount={1}
                        accept="image/*"
                        listType="picture"
                        loading={logoUploading}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          loading={logoUploading}
                        >
                          {logoUploading ? "Uploading..." : "Upload Logo"}
                        </Button>
                      </Upload>
                    </Form.Item>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Banner Image">
                  {currentBanner && !bannerFile ? (
                    <div className="image-preview-container">
                      <img
                        src={currentBanner}
                        alt="Current banner"
                        className="image-preview"
                      />
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveImage("banner")}
                        className="remove-image-btn"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Form.Item
                      name="banner"
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                    >
                      <Upload
                        beforeUpload={(file) => {
                          setBannerUploading(true);
                          const isImage = file.type.startsWith("image/");
                          if (!isImage) {
                            message.error("You can only upload image files!");
                            setBannerUploading(false);
                            return false;
                          }
                          const isLt5M = file.size / 1024 / 1024 < 5;
                          if (!isLt5M) {
                            message.error("Image must be smaller than 5MB!");
                            setBannerUploading(false);
                            return false;
                          }
                          setBannerFile(file);
                          setBannerUploading(false);
                          return false;
                        }}
                        maxCount={1}
                        accept="image/*"
                        listType="picture"
                        loading={bannerUploading}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          loading={bannerUploading}
                        >
                          {bannerUploading ? "Uploading..." : "Upload Banner"}
                        </Button>
                      </Upload>
                    </Form.Item>
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
                size="large"
                block
                style={{
                  backgroundColor: "#1890ff", // Explicit primary color
                  color: "white",
                  border: "none",
                  boxShadow: "0 2px 0 rgba(0, 0, 0, 0.045)",
                }}
              >
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default EditRestaurant;
