import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Input, Button, Avatar, message } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { userSession } from '../../utils/UserSession';
import { authService } from '../../services/auth';

const TOP_BAR_HEIGHT = 88;

const ChatContainer = styled.div`
  position: fixed;
  top: ${TOP_BAR_HEIGHT}px;
  left: 340px;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - ${TOP_BAR_HEIGHT}px);
  width: calc(100vw - 340px);
  background-color: transparent;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 1;
`;

const BackButton = styled(Button)`
  margin-right: 16px;
  border: none;
  background: none;
  &:hover {
    background: none;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(106, 76, 147, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

const MessageBubble = styled.div<{ isMine: boolean }>`
  display: flex;
  flex-direction: ${props => props.isMine ? 'row-reverse' : 'row'};
  align-items: center;
  gap: 8px;
  max-width: 70%;
  margin-left: ${props => props.isMine ? 'auto' : '0'};
  margin-right: ${props => props.isMine ? '0' : 'auto'};
`;

const StyledAvatar = styled(Avatar)`
  width: 68px !important;
  height: 68px !important;
  flex-shrink: 0;
`;

const MessageContent = styled.div<{ isMine: boolean }>`
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 7px 8px 6.3px rgba(201, 201, 217, 0.25);
  word-break: break-word;
  min-height: 77px;
  display: flex;
  align-items: center;
`;

const ChatInput = styled.div`
  padding: 22px;
  background: white;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StyledInput = styled(Input)`
  border-radius: 20px;
  height: 53px;
  flex: 1;
  &:hover, &:focus {
    border-color: #6A4C93;
  }
  &:focus {
    box-shadow: none;
  }
  .ant-input {
    height: 53px;
    &::selection {
      background: rgba(106, 76, 147, 0.2);
    }
  }
`;

const StyledButton = styled(Button)`
  border-radius: 20px;
  height: 53px;
  padding: 0 24px;
  background: linear-gradient(96deg, #6A4C93 45.49%, #20172D 99.83%) !important;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25) !important;
  &:hover {
    background: linear-gradient(96deg, #6A4C93 45.49%, #20172D 99.83%) !important;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25) !important;
  }
`;

interface Message {
    id: number;
    content: string;
    created_at: string;
    is_mine: boolean;
    sender_uuid: string;
    receiver_uuid: string;
}

const ChatPage: React.FC = () => {
    const { peerUuid } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [peerInfo, setPeerInfo] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // 获取聊天对象信息
    useEffect(() => {
        const fetchPeerInfo = async () => {
            if (!peerUuid) return;
            try {
                const response = await authService.getUserInfo(peerUuid);
                setPeerInfo(response.data);
                // if (response.code === 0) {

                // } else {
                //     message.error('获取用户信息失败');
                //     navigate('/findPartner');
                // }
            } catch (error) {
                console.error('Failed to fetch peer info:', error);
                message.error('Failed to fetch peer info');
                // navigate('/findPartner');
            }
        };

        fetchPeerInfo();
    }, [peerUuid, navigate]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchRecentMessages = async () => {
        if (!peerUuid) return;
        try {
            const response = await authService.getRecentChat(peerUuid);
            if (response.code === 0) {
                setMessages(response.data);
                setTimeout(scrollToBottom, 100);
            }
        } catch (error) {
            message.error('Failed to load chat history');
        }
    };

    const fetchMoreMessages = async () => {
        if (loading || !hasMore || !peerUuid) return;
        setLoading(true);
        try {
            const response = await authService.getChatHistory({
                peer_uuid: peerUuid,
                page,
                page_size: 20
            });
            if (response.code === 0) {
                const newMessages = response.data.list;
                setMessages(prev => [...newMessages, ...prev]);
                setHasMore(newMessages.length === 20);
                setPage(prev => prev + 1);
            }
        } catch (error) {
            message.error('Failed to load more messages');
        } finally {
            setLoading(false);
        }
    };

    const pollNewMessages = async () => {
        if (!peerUuid) return;
        try {
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
            const since = lastMessage?.created_at || new Date().toISOString();
            const response = await authService.pollNewMessages(since);
            if (response.code === 0 && response.data && Array.isArray(response.data) && response.data.length > 0) {
                setMessages(prev => [...prev, ...response.data]);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Failed to poll new messages:', error);
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || !peerUuid) return;
        try {
            const response = await authService.sendMessage({
                content: inputValue,
                receiver_uuid: peerUuid
            });
            if (response.code === 0) {
                setInputValue('');
                // Add message to list immediately after sending
                const newMessage: Message = {
                    id: Date.now(),
                    content: inputValue,
                    created_at: new Date().toISOString(),
                    is_mine: true,
                    sender_uuid: userSession.getUserId(),
                    receiver_uuid: peerUuid
                };
                setMessages(prev => [...prev, newMessage]);
                scrollToBottom();
            }
        } catch (error) {
            message.error('Failed to send message');
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop } = e.currentTarget;
        if (scrollTop === 0) {
            fetchMoreMessages();
        }
    };


    useEffect(() => {
        fetchRecentMessages();
        const pollInterval = setInterval(pollNewMessages, 30000);
        return () => clearInterval(pollInterval);
    }, [peerUuid]);

    return (
        <ChatContainer>
            <ChatHeader>
                <BackButton icon={<ArrowLeftOutlined />} onClick={() => navigate('/findPartner')} />
                <Avatar src={peerInfo?.avatar_url} />
                <span style={{ marginLeft: 8 }}>{peerInfo?.username || 'Chat'}</span>
            </ChatHeader>

            <ChatMessages onScroll={handleScroll}>
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} isMine={msg.is_mine}>
                        <StyledAvatar src={msg.is_mine ? userSession.getUserAvatar() : peerInfo?.avatar_url} />
                        <MessageContent isMine={msg.is_mine}>
                            {msg.content}
                        </MessageContent>
                    </MessageBubble>
                ))}
                <div ref={messagesEndRef} />
            </ChatMessages>

            <ChatInput>
                <StyledInput
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onPressEnter={handleSend}
                    placeholder="Type a message..."
                />
                <StyledButton
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                >
                    Send
                </StyledButton>
            </ChatInput>
        </ChatContainer>
    );
};

export default ChatPage; 