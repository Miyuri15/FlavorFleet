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
import axios from "axios";

const { Option } = Select;
const { TextArea } = Input;

const AddRestaurant = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Handle file uploads first if needed
      // You would typically upload files to a service like AWS S3
      // and then get the URLs to save with the restaurant data

      const restaurantData = {
        ...values,
        address: {
          street: values.street,
          city: values.city,
          postalCode: values.postalCode,
        },
        openingHours: {
          monday: {
            open: values.mondayOpen.format("HH:mm"),
            close: values.mondayClose.format("HH:mm"),
          },
          // Add other days similarly
        },
      };

      await foodServiceApi.post("/restaurant", restaurantData);
      message.success("Restaurant added successfully!");
      navigate("/restaurant-dashboard");
    } catch (error) {
      message.error("Failed to add restaurant");
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="mondayOpen"
                label="Monday Open"
                rules={[{ required: true }]}
              >
                <TimePicker format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mondayClose"
                label="Monday Close"
                rules={[{ required: true }]}
              >
                <TimePicker format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>
          {/* Add other days similarly */}

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
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Restaurant
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Layout>
  );
};

export default AddRestaurant;
