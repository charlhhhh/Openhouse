import React, { useState, useRef } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import type { UploadFile } from 'antd/es/upload';

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
  width: 25%;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(180deg, #6A4C93 37.02%, #875FBF 83.17%);
  color: white;
  margin: 0 auto;
  display: block;
  
  &:hover {
    background: linear-gradient(180deg, #875FBF 37.02%, #6A4C93 83.17%);
  }
`;

interface Post {
  id: string;
  userId: string;
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
}

const MAX_IMAGES = 3;

export const EditPostSheet: React.FC<EditPostSheetProps> = ({
  visible,
  onClose,
  post
}) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [fileList, setFileList] = useState<UploadFile[]>(
    post.image_urls.map((url, index) => ({
      uid: `-${index}`,
      name: `image-${index}`,
      status: 'done',
      url: url,
    }))
  );
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleAddClick = () => {
    uploadRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (fileList.length + files.length > MAX_IMAGES) {
      message.warning(`最多只能上传${MAX_IMAGES}张图片`);
      return;
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      message.error('只能上传图片文件！');
    }

    const newFileList = [
      ...fileList,
      ...imageFiles.map(file => ({
        uid: Date.now().toString(),
        name: file.name,
        originFileObj: file,
        status: 'done',
        url: URL.createObjectURL(file),
      } as UploadFile))
    ].slice(0, MAX_IMAGES);

    setFileList(newFileList);
    if (uploadRef.current) {
      uploadRef.current.value = '';
    }
  };

  const handleRemove = (file: UploadFile) => {
    setFileList(fileList.filter(item => item.uid !== file.uid));
  };

  const handleSave = async () => {
    try {
      // TODO: 实现保存逻辑
      message.success('保存成功');
      onClose();
    } catch (error) {
      message.error('保存失败');
    }
  };

  return (
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
          <SectionTitle>标题</SectionTitle>
          <TitleInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </Section>

        <Section>
          <SectionTitle>图片</SectionTitle>
          <UploadContainer>
            {fileList.map((file) => (
              <ImagePreview key={file.uid}>
                <img
                  src={file.url || (file.originFileObj && URL.createObjectURL(file.originFileObj))}
                  alt="preview"
                />
                <button className="delete-button" onClick={() => handleRemove(file)}>×</button>
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
          <SectionTitle>内容</SectionTitle>
          <ContentTextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="请输入帖子内容"
          />
        </Section>

        <SaveButton onClick={handleSave}>
          保存
        </SaveButton>
      </ModalContent>
    </Modal>
  );
}; 