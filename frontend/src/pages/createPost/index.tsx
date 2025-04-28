import React, { useState, useRef } from 'react';
import { Input, Upload, Button, message } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import type { RcFile, UploadFile } from 'antd/es/upload';
import { supabase } from '../../supabase/client';
import request from '../../utils/request';
import { useNavigate } from 'react-router-dom';
import type { AxiosResponse } from 'axios';
import { uploadImage } from '../../utils/uploadImage';

interface CreatePostResponse {
  post_id: number;
  author_uuid: string;
  title: string;
  content: string;
  image_urls: string[];
  create_date: string;
  star_number: number;
  view_number: number;
  comment_number: number;

}

interface ErrorResponse {
  code: number;
  message: string;
  data: string;
}

interface UploadedFile extends UploadFile {
  uploadedUrl?: string;
}

const { TextArea } = Input;
const { Dragger } = Upload;

const PageContainer = styled.div`
  padding: 24px;
  width: 845px;
  max-width: 845px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  color: #343C6A;
  font-family: Inter;
  font-size: 22px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  margin-bottom: 24px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 22px;
  border-radius: 10px;
  background: #FFF;
  width: 100%;
  max-width: 845px;
  padding: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 22px;
  width: 100%;
`;

const SectionTitle = styled.div`
  color: #000;
  font-family: Inter;
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const TitleInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledTitleInput = styled(Input)`
  width: 749px;
  height: 54px;
  border-radius: 10px;
  border: 1px solid #000;
`;

const EditIcon = styled(EditOutlined)`
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  width: 21px;
  height: 23px;
`;

const CharCount = styled.span`
  position: absolute;
  right: 10px;
  bottom: -25px;
  color: #666;
  font-size: 12px;
`;

interface ContainerProps {
  $isEmpty: boolean;
}

const UploadContainer = styled.div<ContainerProps>`
  width: 749px;
  height: 209px;
  border-radius: 10px;
  border: 1px solid #000;
  display: flex;
  justify-content: ${props => props.$isEmpty ? 'center' : 'flex-start'};
  align-items: center;
  gap: 16px;
  padding: 0 8px;
  background: #FFF;
`;

const ImagePreview = styled.div`
  position: relative;
  width: calc((749px - 48px) / 3);
  height: 177px;
  border-radius: 10px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .upload-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
  }

  .delete-button {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    
    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
`;

const Placeholder = styled.div`
  width: calc((749px - 48px) / 3);
  height: 177px;
  visibility: hidden;
`;

interface AddButtonProps {
  $isEmpty: boolean;
  disabled?: boolean;
}

const AddButton = styled.div<AddButtonProps>`
  width: ${props => props.$isEmpty ? '50px' : 'calc((749px - 48px) / 3)'};
  height: ${props => props.$isEmpty ? '50px' : '177px'};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  border-radius: 10px;
  border: ${props => props.$isEmpty ? 'none' : '1px dashed #000'};
  opacity: ${props => props.disabled ? '0.5' : '1'};

  img {
    width: 50px;
    height: 50px;
  }

  &:hover {
    opacity: ${props => props.disabled ? '0.5' : '0.8'};
    border-color: ${props => props.$isEmpty ? 'transparent' : '#6A4C93'};
  }
`;

const UploadContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ContentInputContainer = styled.div`
  position: relative;
  width: 749px;
`;

const StyledTextArea = styled(TextArea)`
  width: 100%;
  height: 209px !important;
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

const ContentEditIcon = styled.div`
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 21px;
  height: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  img {
    width: 100%;
    height: 100%;
  }
`;

const PostButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 24px;
`;

const PostButton = styled(Button)`
  border-radius: 10px;
  background: linear-gradient(180deg, #6A4C93 37.02%, #875FBF 83.17%);
  box-shadow: 2px 2px 4px 0px rgba(135, 95, 191, 0.50), 0px 8px 6.8px 0px rgba(0, 0, 0, 0.25) inset;
  color: white;
  height: 40px;
  
  &:hover {
    background: linear-gradient(180deg, #875FBF 37.02%, #6A4C93 83.17%);
  }
`;

const MAX_TITLE_LENGTH = 100;
const MAX_IMAGES = 3;

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileList, setFileList] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TITLE_LENGTH) {
      setTitle(value);
    }
  };

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

    setIsUploading(true);

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          message.error('只能上传图片文件！');
          continue;
        }

        // 创建临时预览
        const tempFile: UploadedFile = {
          uid: Date.now().toString(),
          name: file.name,
          originFileObj: file as RcFile,
          status: 'uploading',
          url: URL.createObjectURL(file),
          lastModifiedDate: new Date(file.lastModified),
        };

        setFileList(prev => [...prev, tempFile]);

        // 上传图片
        const uploadedUrl = await uploadImage(file, {
          showSuccessMessage: false,
          onError: (error) => {
            message.error(`图片 ${file.name} 上传失败: ${error.message || '未知错误'}`);
          }
        });

        if (uploadedUrl) {
          // 更新文件状态为成功
          setFileList(prev => prev.map(item =>
            item.uid === tempFile.uid
              ? { ...item, status: 'done', uploadedUrl }
              : item
          ));
        } else {
          // 移除上传失败的文件
          setFileList(prev => prev.filter(item => item.uid !== tempFile.uid));
        }
      }
    } finally {
      setIsUploading(false);
      if (uploadRef.current) {
        uploadRef.current.value = '';
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      message.error('请输入标题');
      return;
    }

    if (!content.trim()) {
      message.error('请输入内容');
      return;
    }

    try {
      setIsSubmitting(true);

      // 收集已上传成功的图片URL
      const validUrls = fileList
        .filter(file => file.status === 'done' && file.uploadedUrl)
        .map(file => file.uploadedUrl as string);

      // 创建帖子
      const { data } = await request.post<CreatePostResponse | ErrorResponse>('/api/v1/posts/create', {
        title: title.trim(),
        content: content.trim(),
        image_urls: validUrls
      });
      console.log(data);

      message.success('帖子发布成功');
      navigate('/'); // 发布成功后跳转到首页
    } catch (error) {
      console.error('发布帖子错误:', error);
      message.error('发布失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (file: UploadedFile) => {
    try {
      // 如果文件已经上传成功，从 Supabase 删除
      if (file.status === 'done' && file.uploadedUrl) {
        const fileName = file.uploadedUrl.split('/').pop();
        if (fileName) {
          const { error } = await supabase.storage
            .from('posts-images')
            .remove([fileName]);

          if (error) {
            console.error('删除存储图片失败:', error);
            message.error('删除图片失败，请稍后重试');
            return;
          }
        }
      }

      // 从预览列表中移除
      setFileList(prev => prev.filter(item => item.uid !== file.uid));

      // 释放预览URL
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
    } catch (error) {
      console.error('删除图片错误:', error);
      message.error('删除图片失败，请稍后重试');
    }
  };

  const renderUploadItems = () => {
    if (fileList.length === 0) {
      return (
        <AddButton $isEmpty={true} onClick={handleAddClick} disabled={isUploading}>
          <img src="/post_add.svg" alt="add" />
        </AddButton>
      );
    }

    const items: React.ReactNode[] = [];

    // 渲染已上传的图片
    fileList.forEach((file) => {
      items.push(
        <ImagePreview key={file.uid}>
          <img src={file.url} alt="preview" />
          {file.status === 'uploading' && (
            <div className="upload-loading">上传中...</div>
          )}
          <button
            className="delete-button"
            onClick={() => handleRemove(file)}
            disabled={isUploading}
          >
            ×
          </button>
        </ImagePreview>
      );
    });

    // 如果图片数量小于最大值，添加加号按钮
    if (fileList.length < MAX_IMAGES) {
      items.push(
        <AddButton
          key="add-button"
          $isEmpty={false}
          onClick={handleAddClick}
          disabled={isUploading}
        >
          <img src="/post_add.svg" alt="add" />
        </AddButton>
      );
    }

    // 添加占位符
    while (items.length < MAX_IMAGES) {
      items.push(<Placeholder key={`placeholder-${items.length}`} />);
    }

    return items;
  };

  return (
    <PageContainer>
      <Title>Create Post</Title>
      <Content>
        <Section>
          <SectionTitle>Title</SectionTitle>
          <TitleInputContainer>
            <StyledTitleInput
              value={title}
              onChange={handleTitleChange}
              maxLength={MAX_TITLE_LENGTH}
            />
            <EditIcon />
            <CharCount>{title.length} / {MAX_TITLE_LENGTH}</CharCount>
          </TitleInputContainer>
        </Section>

        <Section>
          <SectionTitle>Cover Image</SectionTitle>
          <UploadContainer $isEmpty={fileList.length === 0}>
            {renderUploadItems()}
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
          <ContentInputContainer>
            <StyledTextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入帖子内容"
            />
            <ContentEditIcon>
              <img src="/post_edit.svg" alt="edit" />
            </ContentEditIcon>
          </ContentInputContainer>
        </Section>

        <PostButtonContainer>
          <PostButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? '发布中...' : '发布'}
          </PostButton>
        </PostButtonContainer>
      </Content>
    </PageContainer>
  );
};

export default CreatePost; 