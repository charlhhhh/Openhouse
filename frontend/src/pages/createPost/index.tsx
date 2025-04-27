import React, { useState, useRef } from 'react';
import { Input, Upload, Button, message } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import type { RcFile, UploadFile } from 'antd/es/upload';

const { TextArea } = Input;
const { Dragger } = Upload;

const PageContainer = styled.div`
  padding: 24px;
  width: 100%;
  max-width: 100%;
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
  width: 789px;
  height: 54px;
  border-radius: 10px;
  border: 1px solid #000;
  padding-right: 40px;
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
  width: 789px;
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
  width: calc((789px - 48px) / 3);
  height: 177px;
  border-radius: 10px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
  }
`;

const Placeholder = styled.div`
  width: calc((789px - 48px) / 3);
  height: 177px;
  visibility: hidden;
`;

interface AddButtonProps {
  $isEmpty: boolean;
}

const AddButton = styled.div<AddButtonProps>`
  width: ${props => props.$isEmpty ? '50px' : 'calc((789px - 48px) / 3)'};
  height: ${props => props.$isEmpty ? '50px' : '177px'};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 10px;
  border: ${props => props.$isEmpty ? 'none' : '1px dashed #000'};

  img {
    width: 50px;
    height: 50px;
  }

  &:hover {
    opacity: 0.8;
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
  width: 789px;
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
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TITLE_LENGTH) {
      setTitle(value);
    }
  };

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

  const handleSubmit = () => {
    // TODO: 实现发帖逻辑
    console.log({
      title,
      content,
      images: fileList
    });
  };

  const handleRemove = (file: UploadFile) => {
    setFileList(fileList.filter(item => item.uid !== file.uid));
  };

  const renderUploadItems = () => {
    if (fileList.length === 0) {
      return (
        <AddButton $isEmpty={true} onClick={handleAddClick}>
          <img src="/post_add.svg" alt="add" />
        </AddButton>
      );
    }

    const items: React.ReactNode[] = [];

    // 渲染已上传的图片
    fileList.forEach((file) => {
      items.push(
        <ImagePreview key={file.uid}>
          <img
            src={file.url || (file.originFileObj && URL.createObjectURL(file.originFileObj))}
            alt="preview"
          />
          <button className="delete-button" onClick={() => handleRemove(file)}>×</button>
        </ImagePreview>
      );
    });

    // 如果图片数量小于最大值，添加加号按钮到已上传图片后面
    if (fileList.length < MAX_IMAGES) {
      items.push(
        <AddButton key="add-button" $isEmpty={false} onClick={handleAddClick}>
          <img src="/post_add.svg" alt="add" />
        </AddButton>
      );
    }

    // 添加占位符到剩余位置
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
          <PostButton onClick={handleSubmit}>
            发布
          </PostButton>
        </PostButtonContainer>
      </Content>
    </PageContainer>
  );
};

export default CreatePost; 