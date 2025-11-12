import React, { useState } from "react";
import { Form, Input, Button, Card, Space, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';

const RegistrationForm = ({onRegister, onBack}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });
      if (response.ok) {
        onRegister();
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
      } else {
        const errorData = await response.json();
        messageApi.error('Ошибка регистрации: ' + (errorData.error || JSON.stringify(errorData)));
      }
    } catch (e) {
      messageApi.error('Ошибка регистрации: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Space>
        <Card title="Регистрация" className="auth-card">
          <Form
            layout="vertical"
            onFinish={handleSubmit}
            form={form}
            className="auth-form"
          >
            <Form.Item label="Логин" name="username" rules={[{ required: true, message: 'Введите логин!' }]}> 
              <Input value={username} onChange={e => setUsername(e.target.value)} />
            </Form.Item>
            <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль!' }]}> 
              <Input.Password value={password} onChange={e => setPassword(e.target.value)} />
            </Form.Item>
            <Form.Item
              label="Подтвердите пароль"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: 'Повторите пароль!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Пароли не совпадают!'));
                  },
                }),
              ]}
            >
              <Input.Password value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </Form.Item>
            <Form.Item label="Имя" name="firstName" rules={[{ required: true, message: 'Введите имя!' }]}> 
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
            </Form.Item>
            <Form.Item label="Фамилия" name="lastName" rules={[{ required: true, message: 'Введите фамилию!' }]}> 
              <Input value={lastName} onChange={e => setLastName(e.target.value)} />
            </Form.Item>
            <Form.Item shouldUpdate>
              {() => (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="auth-btn"
                  disabled={
                    !form.isFieldsTouched(true) ||
                    !!form.getFieldsError().filter(({ errors }) => errors.length).length
                  }
                >
                  Зарегистрироваться
                </Button>
              )}
            </Form.Item>
            <Form.Item>
              <Button type="default" icon={<ArrowLeftOutlined />} onClick={onBack} block className="auth-btn">
                Назад
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </>
  );
};

export default RegistrationForm;