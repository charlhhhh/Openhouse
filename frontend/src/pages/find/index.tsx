import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { message, Modal, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

// 匹配状态枚举
enum MatchStatus {
  PREPARE = 'prepare',
  SUBMITTING = 'submitting',
  MATCHING = 'matching',
  COMPLETED = 'completed'
}

const TOP_BAR_HEIGHT = 88;

// 模拟用户数据类型
interface UserInfo {
  avatar: string;
  username: string;
  intro: string;
  tags: string[];
}

const mockCurrentUser: UserInfo = {
  avatar: '/avatar.png',
  username: '当前用户',
  intro: '这是一段个人介绍',
  tags: ['标签1', '标签2']
};

const mockMatchedUser: UserInfo = {
  avatar: '/matched-avatar.png',
  username: '匹配用户',
  intro: '匹配用户的个人介绍',
  tags: ['兴趣1', '兴趣2', '兴趣3']
};

const Container = styled.div`
  position: fixed;
  top: ${TOP_BAR_HEIGHT}px;
  left: 348px;
  right: 0;
  bottom: 0;
  height: calc(100vh - ${TOP_BAR_HEIGHT}px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 1;
`;

const BackgroundImage = styled.img`
  position: fixed;
  top: ${TOP_BAR_HEIGHT}px;
  left: 348px;
  right: 0;
  bottom: 0;
  width: calc(100vw - 348px);
  height: calc(100vh - ${TOP_BAR_HEIGHT}px);
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
`;

const Card = styled.div`
  width: 410px;
  height: 530px;
  background: url('/bg_match_card.png') center center/cover no-repeat;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 2;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 32px;
  gap: 16px;
  margin-bottom: 24px;
`;

const Avatar = styled.img`
  width: 104px;
  height: 104px;
  border-radius: 50%;
  background-color: #fff;
  object-fit: cover;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  margin: 0;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #20172D;
  text-shadow: 5px 4px 5px rgba(0, 0, 0, 0.25);
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`;

const Username = styled.p`
  margin: 4px 0 0;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #20172D;
  text-shadow: 5px 4px 5px rgba(0, 0, 0, 0.25);
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`;

const TagsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  align-content: flex-start;
`;

const Tag = styled.div`
  background: #6A4C93;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TagClose = styled.span`
  display: inline-block;
  margin-left: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #fff;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  transition: background 0.2s;
  &:hover {
    background: rgba(255,255,255,0.4);
  }
`;

const NewTagButton = styled.button`
  background: #f0f0f0;
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const SendCardButton = styled.button`
  margin-top: 48px;
  padding: 12px 32px;
  border: none;
  border-radius: 24px;
  background: linear-gradient(96deg, #6A4C93 45.49%, #20172D 99.83%);
  color: white;
  font-size: 16px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

const MessageButton = styled(SendCardButton)`
  margin-top: auto;
`;

interface PlayError extends Error {
  name: string;
}

// 添加全局样式，覆盖Antd Modal确认按钮
const ModalOkButtonStyle = createGlobalStyle`
  .custom-modal-ok-btn {
    border-radius: 10px !important;
    background: linear-gradient(96deg, #6A4C93 45.49%, #20172D 99.83%) !important;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25) !important;
    color: #fff !important;
    border: none !important;
  }
`;

// 匹配动画时长（毫秒）
const MATCH_SUBMIT_DURATION = 7000;

export default function FindPartner() {
  const [matchStatus, setMatchStatus] = useState<MatchStatus>(MatchStatus.PREPARE);
  const [tags, setTags] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tagError, setTagError] = useState('');
  const [userProfile, setUserProfile] = useState<UserInfo | null>(null);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const navigate = useNavigate();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 处理用户首次交互
  useEffect(() => {
    const handleUserInteraction = () => {
      setIsUserInteracted(true);
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
    ['click', 'touchstart', 'keydown'].forEach(event => {
      document.addEventListener(event, handleUserInteraction);
    });
    return () => {
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  const checkAuth = async () => {
    try {
      // 检查是否已登录
      if (!authService.isLoggedIn()) {
        navigate('/');
        return;
      }
      // 获取用户信息
      console.log('获取用户信息');
      const profile = await authService.getUserProfile();
      if (profile) {
        const matchStatus = profile.match_status
        if (matchStatus === "available") {
          setMatchStatus(MatchStatus.PREPARE);
          setUserProfile({
            avatar: profile.avatar_url,
            username: profile.username,
            intro: profile.intro_long,
            tags: profile.tags ?? [],
          });
          setTags(profile.tags ?? []);
        } else if (matchStatus === "matching") {
          setMatchStatus(MatchStatus.MATCHING);
        } else if (matchStatus === "matched") {
          try {
            const res = await authService.getTodayMatch();
            if (res.code === 0 && res.data && res.data.uuid) {
              setMatchedUser(res.data);
              setMatchStatus(MatchStatus.COMPLETED);
              if (pollingRef.current) clearInterval(pollingRef.current);
            }
          } catch (e) { }

        } else {
          message.info("Unkown status")
          setMatchStatus(MatchStatus.PREPARE);
        }
      } else {
        navigate('/');
        return;
      }
    } catch (error) {
      message.error('Fail to load user profile, please login again');
      // 清除token并跳转到首页
      authService.clearToken();
      navigate('/');
    }

  }

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // check user login
    checkAuth()
    return () => {
      document.body.style.overflow = original;
    };
  }, [navigate]);

  const handleAddTag = () => {
    setNewTag('');
    setTagError('');
    setTagModalOpen(true);
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 18) {
      setTagError('标签不能超过18个字符');
    } else {
      setTagError('');
    }
    setNewTag(value);
  };

  const handleTagModalOk = () => {
    if (!newTag.trim()) {
      setTagError('标签不能为空');
      return;
    }
    if (newTag.length > 18) {
      setTagError('标签不能超过18个字符');
      return;
    }
    setTags([...tags, newTag.trim()]);
    setTagModalOpen(false);
  };

  const handleTagModalCancel = () => {
    setTagModalOpen(false);
  };

  const handleSubmitMatch = async () => {
    try {
      await authService.updateUserProfile({ tags });
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setMatchStatus(MatchStatus.SUBMITTING);
      await authService.matchTrigger();
      // 7秒后进入MATCHING状态并开始轮询
      setTimeout(() => {
        setMatchStatus(MatchStatus.MATCHING);
        startPollingMatch();
      }, MATCH_SUBMIT_DURATION);
    } catch (error) {
      message.error('Fail to start matching');
    }
  };

  const startPollingMatch = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    const poll = async () => {
      try {
        const res = await authService.getTodayMatch();
        if (res.code === 0 && res.data && res.data.uuid) {
          setMatchedUser(res.data);
          setMatchStatus(MatchStatus.COMPLETED);
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch (e) { }
    };
    poll();
    pollingRef.current = setInterval(poll, 30000);
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    if (matchStatus === MatchStatus.COMPLETED && pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  }, [matchStatus]);

  const handleMessage = () => {
    // 实现发送消息的逻辑
    console.log('发送消息');
  };

  const playAudio = async () => {
    if (audioRef.current && audioRef.current.src && isUserInteracted) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('音频播放失败:', error);
      }
    }
  };

  useEffect(() => {
    let audioSrc = '';
    switch (matchStatus) {
      case MatchStatus.PREPARE:
        audioSrc = '/sound_match_prepare.MP3';
        break;
      case MatchStatus.SUBMITTING:
        audioSrc = '/match_submit.MP3';
        break;
      case MatchStatus.MATCHING:
        audioSrc = '/sound_matching.MP3';
        break;
      case MatchStatus.COMPLETED:
        audioSrc = '/sound_match_complete.MP3';
        break;
    }
    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      if (audioSrc) {
        audioRef.current.loop = true;
        playAudio();
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [matchStatus, isUserInteracted]);

  // 监听用户首次交互后，立即播放音效
  useEffect(() => {
    if (isUserInteracted && audioRef.current && audioRef.current.src) {
      playAudio();
    }
    // eslint-disable-next-line
  }, [isUserInteracted]);

  // 匹配状态对应的背景gif
  let bgGif = '';
  switch (matchStatus) {
    case MatchStatus.PREPARE:
      bgGif = '/match_hat_floating.gif';
      break;
    case MatchStatus.SUBMITTING:
      bgGif = '/match_submit.gif';
      break;
    case MatchStatus.MATCHING:
      bgGif = '/matching_horse.gif';
      break;
    case MatchStatus.COMPLETED:
      bgGif = '/match_hat_floating.gif';
      break;
    default:
      bgGif = '/match_hat_floating.gif';
  }

  // 监听SUBMITTING动画播放结束后切换为MATCHING
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (matchStatus === MatchStatus.SUBMITTING) {
      timer = setTimeout(() => {
        setMatchStatus(MatchStatus.MATCHING);
      }, MATCH_SUBMIT_DURATION);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [matchStatus]);

  const handleDeleteTag = (index: number) => {
    setTags(tags => tags.filter((_, i) => i !== index));
  };

  return (
    <Container>
      <ModalOkButtonStyle />
      <BackgroundImage src={bgGif} alt="background" />
      <audio ref={audioRef} />

      {(matchStatus === MatchStatus.PREPARE || matchStatus === MatchStatus.COMPLETED) && (
        <Card>
          {matchStatus === MatchStatus.PREPARE ? (
            <>
              <CardHeader>
                <Avatar src={(userProfile?.avatar) || mockCurrentUser.avatar} alt="avatar" />
                <UserInfo>
                  <Title>Magic Card</Title>
                  <Username>{userProfile?.username || mockCurrentUser.username}</Username>
                </UserInfo>
              </CardHeader>
              <TagsContainer>
                {tags.map((tag, index) => (
                  <Tag key={index}>
                    {tag}
                    <TagClose onClick={() => handleDeleteTag(index)}>×</TagClose>
                  </Tag>
                ))}
                {tags.length < 10 && (
                  <NewTagButton onClick={handleAddTag}>New+</NewTagButton>
                )}
              </TagsContainer>
              <MessageButton onClick={handleSubmitMatch}>Send Card</MessageButton>
            </>
          ) : (
            <>
              <CardHeader>
                <Avatar src={matchedUser?.avatar_url} alt="avatar" />
                <UserInfo>
                  <Title>{matchedUser?.username}</Title>
                  <Username>{matchedUser?.intro_short}</Username>
                </UserInfo>
              </CardHeader>
              <TagsContainer>
                {matchedUser?.tags.map((tag: string, index: number) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </TagsContainer>
              <MessageButton onClick={handleMessage}>Message</MessageButton>
            </>
          )}
        </Card>
      )}

      <Modal
        title="Add Tag"
        open={tagModalOpen}
        onOk={handleTagModalOk}
        onCancel={handleTagModalCancel}
        okText="Add"
        okButtonProps={{ className: 'custom-modal-ok-btn' }}
        footer={[
          <button
            key="ok"
            className="custom-modal-ok-btn ant-btn ant-btn-primary"
            onClick={handleTagModalOk}
            style={{ margin: '0 auto', display: 'block' }}
          >
            Add
          </button>
        ]}
      >
        <Input
          value={newTag}
          onChange={handleTagInputChange}
          maxLength={18}
          placeholder="Please input tag (not more than 18 characters)"
          onPressEnter={handleTagModalOk}
        />
        {tagError && <div style={{ color: 'red', marginTop: 8 }}>{tagError}</div>}
      </Modal>
    </Container>
  );
} 