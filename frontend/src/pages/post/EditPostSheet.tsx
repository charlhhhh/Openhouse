import React, { useState, useRef, useEffect } from 'react';
import { Modal, Input, Button, message, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined, LoadingOutlined, DeleteOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import type { UploadFile } from 'antd/es/upload';
import { postService } from '../../services/post';
import { supabase } from '../../supabase/client';
import { DeleteConfirmAlert } from '../../components/DeleteConfirmAlert';

const { TextArea } = Input;

const ModalContent = styled.div`
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.div`
  color: #000;
  font-family: Inter;
  font-size: 16px;
  font-weight: 400;
`;

const TitleInput = styled(Input)`
  width: 100%;
  height: 54px;
  border-radius: 10px;
  border: 1px solid #000;
  
  &:hover, &:focus {
    border-color: #6A4C93;
    box-shadow: none;
  }
`;

const UploadContainer = styled.div`
  width: 100%;
  height: 120px;
  border-radius: 10px;
  border: 1px solid #000;
  display: flex;
  gap: 8px;
  padding: 8px;
  overflow-x: auto;
`;

const ImagePreview = styled.div`
  position: relative;
  min-width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .delete-button {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 1;
    
    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }
  }
`;

const AddButton = styled.div`
  min-width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 8px;
  border: 1px dashed #000;

  &:hover {
    border-color: #6A4C93;
  }
`;

const ContentTextArea = styled(TextArea)`
  width: 100%;
  height: 120px !important;
  border-radius: 10px;
  border: 1px solid #000;
  resize: none;
  padding: 16px;
  font-size: 14px;
  
  &:hover, &:focus {
    border-color: #6A4C93;
    box-shadow: none;
  }
`;

const SaveButton = styled(Button)`
  &&.ant-btn {
    width: 25%;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(180deg, #6A4C93 37.02%, #875FBF 83.17%);
    color: white;
    margin: 0 auto;
    display: block;
    border: none;
    
    &:hover {
      background: linear-gradient(180deg, #875FBF 37.02%, #6A4C93 83.17%);
      color: white;
      border: none;
    }

    &:focus {
      background: linear-gradient(180deg, #6A4C93 37.02%, #875FBF 83.17%);
      color: white;
      border: none;
      outline: none;
      box-shadow: none;
    }

    &:active {
      background: linear-gradient(180deg, #6A4C93 37.02%, #875FBF 83.17%);
      color: white;
      border: none;
      outline: none;
      box-shadow: none;
    }

    &.ant-btn-loading {
      background: linear-gradient(180deg, #6A4C93 37.02%, #875FBF 83.17%);
      color: white;
      opacity: 0.8;
    }

    span {
      color: white;
    }
  }
`;

const DeleteButton = styled(Button)`
  &&.ant-btn {
    position: absolute;
    right: 0;
    background: none;
    border: none;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: none;
    
    .anticon {
      color: #FF4D4F;
      font-size: 20px;
    }

    &:hover {
      background: rgba(255, 77, 79, 0.1);
    }

    &:focus, &:active {
      background: none;
      border: none;
      outline: none;
      box-shadow: none;
    }

    &::after {
      display: none;
    }
  }
`;

interface Post {
  post_id: number;
  title: string;
  content: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

interface EditPostSheetProps {
  visible: boolean;
  onClose: () => void;
  post: Post;
  onDelete?: () => void;
}

const MAX_IMAGES = 3;

export const EditPostSheet: React.FC<EditPostSheetProps> = ({
  visible,
  onClose,
  post,
  onDelete
}) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [fileList, setFileList] = useState<(UploadFile & { loading?: boolean })[]>([]);
  const [uploading, setUploading] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  // 初始化帖子数据
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setFileList(
        post.image_urls.map((url, index) => ({
          uid: `-${index}`,
          name: `image-${index}`,
          status: 'done',
          url: url,
        }))
      );
    }
  }, [post]);

  const handleAddClick = () => {
    uploadRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (fileList.length + files.length > MAX_IMAGES) {
      message.warning(`最多只能上传${MAX_IMAGES}张图片`);
      return;
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      message.error('只能上传图片文件！');
      return;
    }

    setUploading(true);

    // 为每个新文件创建一个临时的加载状态项
    const tempFiles = imageFiles.map((file, index) => ({
      uid: `temp-${Date.now()}-${index}`,
      name: file.name,
      loading: true,
      status: 'uploading' as const,
    }));

    setFileList([...fileList, ...tempFiles]);

    try {
      const uploadedUrls = await Promise.all(
        imageFiles.map(async (file, index) => {
          const extension = file.name.split('.').pop() || '';
          const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;

          const { data, error } = await supabase.storage
            .from('posts-images')
            .upload(safeFileName, file);

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('posts-images')
            .getPublicUrl(safeFileName);

          return {
            uid: safeFileName,
            name: file.name,
            status: 'done' as const,
            url: publicUrl,
            loading: false,
          };
        })
      );

      // 用实际上传完成的文件替换临时文件
      setFileList(prev => {
        const nonTempFiles = prev.filter(file => !file.uid.startsWith('temp-'));
        return [...nonTempFiles, ...uploadedUrls];
      });
    } catch (error) {
      message.error('图片上传失败');
      console.error('Upload error:', error);
      // 移除临时文件
      setFileList(prev => prev.filter(file => !file.uid.startsWith('temp-')));
    } finally {
      setUploading(false);
      if (uploadRef.current) {
        uploadRef.current.value = '';
      }
    }
  };

  const handleRemove = (file: UploadFile) => {
    setFileList(fileList.filter(item => item.uid !== file.uid));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      message.warning('请输入标题');
      return;
    }

    if (!content.trim()) {
      message.warning('请输入内容');
      return;
    }

    try {
      const imageUrls = fileList.map(file => file.url || '').filter(Boolean);

      await postService.updatePost({
        post_id: post.post_id,
        title: title.trim(),
        content: content.trim(),
        image_urls: imageUrls,
      });

      message.success('保存成功');
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      message.error('保存失败');
    }
  };


  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        width={474}
        styles={{
          content: {
            padding: 0,
            overflow: 'auto',
          }
        }}
        closeIcon={null}
      >
        <ModalContent>
          <HeaderContainer>
            <BackButton onClick={onClose}>
              <ArrowLeftOutlined />
            </BackButton>
          </HeaderContainer>

          <Section>
            <SectionTitle>Title</SectionTitle>
            <TitleInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="请输入标题"
            />
          </Section>

          <Section>
            <SectionTitle>Image</SectionTitle>
            <UploadContainer>
              {fileList.map((file) => (
                <ImagePreview key={file.uid}>
                  {file.loading ? (
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: '#6A4C93' }} spin />} />
                  ) : (
                    <>
                      <img src={file.url} alt="preview" />
                      <button className="delete-button" onClick={() => handleRemove(file)}>×</button>
                    </>
                  )}
                </ImagePreview>
              ))}
              {fileList.length < MAX_IMAGES && (
                <AddButton onClick={handleAddClick}>
                  <img src="/post_add.svg" alt="add" width="24" height="24" />
                </AddButton>
              )}
              <input
                ref={uploadRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </UploadContainer>
          </Section>

          <Section>
            <SectionTitle>Content</SectionTitle>
            <ContentTextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入帖子内容"
            />
          </Section>

          <SaveButton onClick={handleSave} loading={uploading}>
            Post
          </SaveButton>
        </ModalContent>
      </Modal>

    </>
  );
}; 