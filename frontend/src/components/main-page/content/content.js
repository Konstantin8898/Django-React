import "./content.css";
import React, { useState, useEffect } from "react";
import { Card, List, Spin, Alert, Image, Tooltip, Button, Dropdown, Space, Modal, Input, Upload, Form, Typography, Menu, message } from "antd";
import { SortAscendingOutlined, SortDescendingOutlined, UploadOutlined, EllipsisOutlined, EditOutlined, DeleteOutlined, LikeOutlined, DislikeOutlined, WarningOutlined, SendOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import LikeIcon from "../../icons/LikeIcon";
import DislikeIcon from "../../icons/DislikeIcon";
import CommentIcon from "../../icons/CommentIcon";
import Toolbar from "./toolbar/toolbar";
import "./toolbar/toolbar.css";

const Content = ({ token, setUser }) => {
  const [posts, setPosts] = React.useState([]);
  const [modal, contextHolderModal] = Modal.useModal();
  const [messageApi, contextHolderMessage] = message.useMessage();
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isModalPostOpen, setIsModalPostOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [sortType, setSortType] = useState('created_desc');
  const sortedPosts = posts;
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const { Text } = Typography;

  const sortMenu = {
    items: [
      {
        key: '-created',
        label: <span><SortAscendingOutlined /> От новых к старым</span>,
        onClick: () => {
          setSortType('-created');
          fetchPosts('-created');
        },
      },
      {
        key: 'created',
        label: <span><SortDescendingOutlined /> От старых к новым</span>,
        onClick: () => {
          setSortType('created');
          fetchPosts('created');
        },
      },
      {
        key: 'liked',
        label: <span><LikeIcon style={{ fontSize: 17, marginRight: 7, verticalAlign: 'middle' }} /> По лайкам</span>,
        onClick: () => {
          setSortType('liked');
          fetchPosts('liked');
        },
      },
      {
        key: 'commented',
        label: <span><CommentIcon style={{ fontSize: 17, marginRight: 7, verticalAlign: 'middle' }} /> По комментариям</span>,
        onClick: () => {
          setSortType('commented');
          fetchPosts('commented');
        },
      }
    ],
  };

  const showDeleteConfirm = (postId) => {
    modal.confirm({
      icon: null,
      className: 'post-delete-confirm',
      title: <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 20 }}><WarningOutlined style={{ color: '#faad14', fontSize: 50, display: 'block' }}/>Удалить пост?</div>,
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      centered: true,
      style: { textAlign: 'center' },
      okButtonProps: { style: { display: 'inline-block', marginRight: 'auto' } },
      cancelButtonProps: { style: { display: 'inline-block', marginLeft: 'auto' } },
      onOk: () => handleDeletePost(postId),
    });
  };

  const handleMenuClick = (key, post) => {
    if (key === 'edit') {
      modalEditPost(post);
    } else if (key === 'delete') {
      showDeleteConfirm(post.id);
    }
  };

  const fetchPosts = async (orderingType = sortType) => {
    try {
      let orderingParam = orderingType;
      if (!['created', '-created', 'liked', 'commented'].includes(orderingParam)) {
        orderingParam = '-created';
      }
      const response = await fetch(`http://localhost:8000/posts?ordering=${orderingParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки постов: ' + response.statusText);
      }

      const data = await response.json();
      setPosts(data);
      setLoading(false);
    } catch (error) {
      messageApi.error(error.message || 'Неизвестная ошибка');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки пользователей: ' + response.statusText);
      }

      const data = await response.json();
      setUser(data.data); // глобальный сеттер
      setUserState(data.data); // локальный user для компонента
    } catch (error) {
      messageApi.error(error.message || 'Неизвестная ошибка');
    }
  };

  const handleCreatePost = async (post) => {
    try {
      const formData = new FormData();
      formData.append('title', post.title);
      formData.append('info', post.info || '');
      if (post.image && post.image instanceof File) {
        formData.append('image', post.image);
      }

      const response = await fetch('http://localhost:8000/post/create', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка создания поста: ' + response.statusText);
      }

      fetchPosts();
    } catch (error) {
      messageApi.error(error.message || 'Неизвестная ошибка'); 
    }
  };

  const handleUpdatePost = async (post) => {
    try {
      const formData = new FormData();
      formData.append('title', post.title);
      formData.append('info', post.info || '');
      if (post.image && post.image instanceof File) {
        formData.append('image', post.image);
      }

      const response = await fetch(`http://localhost:8000/post/${post.id}/edit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка обновления поста: ' + response.statusText);
      }

      fetchPosts();
    } catch (error) {
      messageApi.error(error.message || 'Неизвестная ошибка'); 
    }
  };  

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`http://localhost:8000/post/${postId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления поста: ' + response.statusText);
      }

      fetchPosts();
    } catch (error) {
      messageApi.error(error.message || 'Неизвестная ошибка');
    }
  };

  const handleReactionPost = async (postId, isLike, isDeleteReaction) => {
    try {
      const response = await fetch(`http://localhost:8000/post/${postId}/${isLike ? 'like': 'dislike'}${isDeleteReaction ? '/remove' : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`, 
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка обновления поста: ' + response.statusText);
      }

      const updatedPost = await response.json();
      setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    } catch (error) {
      messageApi.error(error.message || 'Неизвестная ошибка');
    }
  };

  const modalCreatePost = () => {
    setCurrentPost(null);
    setIsModalPostOpen(true);
  };

  const modalEditPost = (post) => {
    setCurrentPost(post);
    setIsModalPostOpen(true);
  };

  const closeModal = () => {
    setIsModalPostOpen(false);
    setCurrentPost(null);
  };

  const [form] = Form.useForm();

  useEffect(() => {
    if (isModalPostOpen) {
      if (currentPost) {
        form.setFieldsValue({
          title: currentPost.title,
          info: currentPost.info,
          image: currentPost.image ? [{ uid: '-1', name: 'image', status: 'done', url: currentPost.image }] : []
        });
      } else {
        form.setFieldsValue({
          title: '',
          info:  '',
          image: []
        });
      }
    }
  }, [isModalPostOpen, currentPost, form]);

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const postData = {
        ...values,
        image: values.image && values.image[0] ? values.image[0].originFileObj : (currentPost ? currentPost.image : null)
      };
      if (currentPost) {
        handleUpdatePost({ ...currentPost, ...postData });
      } else {
        handleCreatePost(postData);
      }
      closeModal();
    });
  };

  const handleModalCancel = () => {
    closeModal();
  };

  const handleLike = (post) => {
    if (!post.isliked) {
      handleReactionPost(post.id, true, false);
    } else {
      handleReactionPost(post.id, true, true);
    }
  };
  
  const handleDislike = (post) => {
    if (!post.isdisliked) {
      handleReactionPost(post.id, false, false);
    } else {
      handleReactionPost(post.id, false, true);
    }
  };

  const submitComment = async (post) => {
    const text = (commentInputs[post.id] || '').trim();
    if (!text) {
      messageApi.error('Комментарий не может быть пустым');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/post/${post.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        let errText = 'Ошибка при отправке комментария';
        try {
          const err = await response.json();
          errText = err.error || err.detail || errText;
        } catch (e) {}
        messageApi.error(errText);
        return;
      }

      const data = await response.json();
      // backend returns {'post': PostSerializer(post), 'comment': CommentSerializer(comment)}
      // update local posts state: increment comments count and append to comments_list
      setPosts(prev => prev.map(p => {
        if (p.id === post.id) {
          const existing = Array.isArray(p.comments_list) ? [...p.comments_list] : [];
          // append new comment and ensure sorted by created asc
          existing.push(data.comment);
          existing.sort((a, b) => new Date(a.created) - new Date(b.created));
          return { ...p, comments: (p.comments || 0) + 1, comments_list: existing };
        }
        return p;
      }));

      // clear input and expand comments to show newly added one
      setCommentInputs(prev => ({ ...prev, [post.id]: '' }));
      setExpandedComments(prev => ({ ...prev, [post.id]: true }));
    } catch (error) {
      messageApi.error(error.message || 'Неизвестная ошибка');
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchUsers();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {contextHolderModal}
      {contextHolderMessage}
      <Toolbar onReload={fetchPosts} onCreate={modalCreatePost} sortMenu={sortMenu} />
      {sortedPosts.length === 0 ? (
        <div type="secondary" style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>Нет постов для отображения.</div>
      ) : (
  <div className="posts-wrapper" style={{overflowY: 'auto', margin: '0 auto', width: '100%', flex: '1'}}>
          <List
            dataSource={sortedPosts}
            renderItem={post => {
              const isOwner = post.owner === (user && user.id);
              const menu = (
                <Menu
                  onClick={({ key }) => handleMenuClick(key, post)}
                  items={[{
                    key: 'edit',
                    icon: <EditOutlined />,
                    label: 'Изменить',
                  }, {
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    label: 'Удалить',
                    danger: true,
                  }]}
                />
              );
              return (
                <List.Item key={post.id} style={{ padding: 0, border: 'none' }}>
                  <Card className="post-card" bodyStyle={{ padding: 0 }}>
                    <div className="post-meta">
                      {isOwner && (
                        <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight" overlayClassName="dropdown-custom-menu">
                          <EllipsisOutlined style={{ fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }} />
                        </Dropdown>
                      )}
                    </div>
                    <div>
                      {post.image ? (
                        <Image src={post.image} alt={post.title} width={200} style={{ borderRadius: 10, margin: '16px auto 0', display: 'block', boxShadow: '0 2px 12px rgba(88,214,255,0.12)' }} />
                      ) : null}
                    </div>
                    <div className="post-title">{post.title}</div>
                    <div className="post-info">{post.info}</div>
                    <div class="post-footer">
                      <span className="post-date">{dayjs(post.created).format('DD.MM.YYYY HH:mm')}</span>
                      <div className="post-actions">
                        <Tooltip title="Комментарии">
                          <span className="unclickable">
                            <CommentIcon style={{ fontSize: 20, verticalAlign: 'middle' }} />
                            <span>{post.comments}</span>
                          </span>
                        </Tooltip>
                        <Tooltip title="Лайк">
                          <Button
                            type="text"
                            className="clickable"
                            icon={<LikeIcon style={{ color: post.isliked ? 'var(--accent)' : 'var(--muted)', fontSize: 20, verticalAlign: 'middle' }} />}
                            onClick={() => handleLike(post)}
                            
                          >
                            <span style={{ marginLeft: 4 }}>{post.likes}</span>
                          </Button>
                        </Tooltip>
                        <Tooltip title="Дизлайк">
                          <Button
                            type="text"
                            className="clickable"
                            icon={<DislikeIcon style={{ color: post.isdisliked ? '#ff4d4f' : 'var(--muted)', fontSize: 20, verticalAlign: 'middle' }} />}
                            onClick={() => handleDislike(post)}
                          >
                            <span style={{ marginLeft: 4 }}>{post.dislikes}</span>
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                    
                    
                    <div className="post-comments" style={{ padding: '12px 20px 20px' }}>
                      {Array.isArray(post.comments_list) && post.comments_list.length > 0 ? (() => {
                        const cl = post.comments_list; // backend returns comments ordered by created asc
                        const isExpanded = !!expandedComments[post.id];
                        return (
                          <div>
                            {!isExpanded ? (
                              <div className="comment" style={{ marginBottom: 8 }}>
                                <div className="comment-header">
                                  <div className="comment-author" style={{ fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>
                                    {(cl[0].author && (cl[0].author.first_name || cl[0].author.last_name)) ? `${cl[0].author.first_name} ${cl[0].author.last_name}`.trim() : (cl[0].author && cl[0].author.username) || cl[0].user}
                                  </div>
                                  <div className="comment-date" style={{ color: 'var(--muted)', fontSize: 12 }}>{dayjs(cl[0].created).format('DD.MM.YYYY HH:mm')}</div>
                                </div>
                                <div className="comment-text" style={{ whiteSpace: 'pre-wrap', marginBottom: 4 }}>{cl[0].text}</div>
                              </div>
                            ) : (
                              cl.map(c => (
                                <div key={c.id || c.created} className="comment" style={{ marginBottom: 8 }}>
                                  <div className="comment-header">
                                    <div className="comment-author" style={{ fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>
                                      {(c.author && (c.author.first_name || c.author.last_name)) ? `${c.author.first_name} ${c.author.last_name}`.trim() : (c.author && c.author.username) || c.user}
                                    </div>
                                    <div className="comment-date" style={{ color: 'var(--muted)', fontSize: 12 }}>{dayjs(c.created).format('DD.MM.YYYY HH:mm')}</div>
                                  </div>
                                  <div className="comment-text" style={{ whiteSpace: 'pre-wrap', marginBottom: 4 }}>{c.text}</div>
                                </div>
                              ))
                            )}

                            {post.comments_list.length > 1 && !isExpanded ? (
                              <div className="comments-toggle" style={{ color: 'var(--accent)', cursor: 'pointer', marginTop: 6 }} onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: true }))}>
                                Показать следующие комментарии
                              </div>
                            ) : null}
                          </div>
                        );
                      })() : (
                        <div style={{ color: 'var(--muted)' }}>Комментариев пока нет</div>
                      )}

                      <div className="comment-input-row" style={{ marginTop: 10 }}>
                        <Input
                          value={commentInputs[post.id] || ''}
                          onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Оставить комментарий"
                          maxLength={500}
                          onPressEnter={() => submitComment(post)}
                          suffix={<SendOutlined style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: 16 }} onClick={() => submitComment(post)} />}
                        />
                      </div>
                    </div>

                  </Card>
                </List.Item>
              );
            }}
          />
        </div>
      )}
    <Modal
      open={isModalPostOpen}
      onCancel={handleModalCancel}
      afterClose={() => form.resetFields()}
      footer={null}
      centered
      className="post-modal"
      destroyOnClose
    >
      <Form
        key={isModalPostOpen + (currentPost ? currentPost.id || 'edit' : 'new')}
        form={form}
        layout="vertical"
        initialValues={currentPost ? {
          title: currentPost.title,
          info: currentPost.info,
          image: currentPost.image ? [{ uid: '-1', name: 'image', status: 'done', url: currentPost.image }] : []
        } : {}}
      >
        <Form.Item name="image" label="Картинка" valuePropName="fileList" getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}>
          <Upload
            listType="picture"
            maxCount={1}
            beforeUpload={() => false}
            defaultFileList={currentPost && currentPost.image ? [{ uid: '-1', name: 'image', status: 'done', url: currentPost.image }] : []}
          >
            <Button icon={<UploadOutlined />}>Загрузить</Button>
          </Upload>
        </Form.Item>
        <Form.Item name="title" label="Заголовок" rules={[{ required: true, message: 'Введите заголовок' }, { max: 200, message: 'Максимум 200 символов' }]}> 
          <Input placeholder="Заголовок" maxLength={200} showCount />
        </Form.Item>
        <Form.Item name="info" label="Описание" rules={[{ max: 500, message: 'Максимум 500 символов' }]}> 
          <Input.TextArea placeholder="Описание" autoSize={{ minRows: 3 }} maxLength={500} showCount />
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
          <Button type="primary" onClick={handleModalOk}>
            {currentPost ? 'Сохранить' : 'Добавить'}
          </Button>
          <Button onClick={handleModalCancel}>
            Отменить
          </Button>
        </div>
      </Form>
    </Modal>

    </div>
  );
}

export default Content;