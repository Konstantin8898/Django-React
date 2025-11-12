import '../auth.css';
import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Space } from 'antd';
import 'antd/dist/reset.css';

const LoginForm = ({ onLogin, onShowRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.key) {
          onLogin(data.key);
          setUsername('');
          setPassword('');
        } else {
          messageApi.error('Нет токена в ответе сервера');
        }
      } else {
        messageApi.error(data.error || 'Ошибка входа');
      }
    } catch (error) {
      messageApi.error(error.message || error.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Space>
        <Card title="Вход в систему" className="auth-card">
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
            <Form.Item shouldUpdate>
              {() => (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  disabled={
                    !form.isFieldsTouched(true) ||
                    !!form.getFieldsError().filter(({ errors }) => errors.length).length
                  }
                  className="auth-btn"
                >
                  Войти
                </Button>
              )}
            </Form.Item>
            <Form.Item>
              <Typography.Link className="auth-link" onClick={onShowRegister} block>
                Зарегистрироваться
              </Typography.Link>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </>
  );
};

export default LoginForm;