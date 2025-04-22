import { Avatar, Button, Card, Space, Tag, Tooltip } from 'antd';
import './styles.css';
import { useState } from 'react';
import { CommentPanel } from './CommentPanel';
import { fetchComments, addComment } from './mockData';
import { Post, Comment } from './types';

// interface Post {
//   id: string;
//   author: {
//     avatar: string;
//     name: string;
//     isFollowing: boolean;
//     tags: string[];
//   };
//   date: string;
//   title: string;
//   content: string;
//   images?: string[];
//   stats: {
//     views: number;
//     comments: number;
//     likes: number;
//     hotness: number;
//   };
// }

// 模拟数据
const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      name: '张三',
      isFollowing: true,
      tags: ['计算机科学', '人工智能']
    },
    date: '2024-03-20',
    title: '深度学习在计算机视觉中的应用',
    content: '近年来，深度学习在计算机视觉领域取得了突破性进展...',
    images: ['/mock_post.png'],
    stats: {
      views: 1234,
      comments: 56,
      likes: 789,
      hotness: 100
    }
  },
  // 可以添加更多模拟数据
];

const BannerCard = ({ image, title, tag }: { image: string; title: string; tag: string }) => (
  <div className="banner-card">
    <div
      className="banner-card-content"
      style={{ backgroundImage: `url(${image})` }}
    >
      <h2 className="banner-title">{title}</h2>
      <div className="banner-tag">{tag}</div>
    </div>
  </div>
);

// 自定义操作按钮组件
interface ActionButtonProps {
  icon: string;
  text?: string | number;
  tooltip: string;
  onClick?: () => void;
}

const ActionButton = ({ icon, text, tooltip, onClick }: ActionButtonProps) => (
  <Tooltip title={tooltip}>
    <Button className="action-button" onClick={onClick}>
      {/* 使用本地 SVG 图标 */}
      <img src={icon} alt={tooltip} className="action-icon" />
      {text && <span className="action-text">{text}</span>}
    </Button>
  </Tooltip>
);

// 可选：为关注按钮创建一个独立组件
const FollowButton = ({ isFollowing }: { isFollowing: boolean }) => (
  <Button
    // className={`action-button user-follow-button ${isFollowing ? 'following' : 'not-following'}`}
    className={'user-follow-button'}
  >
    {isFollowing ? "已关注" : "关注"}
  </Button>
);

const PostCard = ({ post }: { post: Post }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // 加载评论数据
  const loadComments = async () => {
    if (isLoadingComments) return;

    setIsLoadingComments(true);
    try {
      const newComments = await fetchComments(post.id, page);
      setComments(prev => [...prev, ...newComments]);
      setHasMore(newComments.length === 5);
      setPage(prev => prev + 1);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // 添加新评论
  const handleAddComment = async (content: string) => {
    const newComment = await addComment(post.id, content);
    setComments(prev => [newComment, ...prev]);
    // 更新帖子的评论数
    post.stats.comments += 1;
  };

  return (
    <Card className="post-card">
      <div className="post-header">
        <Space>
          <Avatar
            className="user-avatar"
            src={post.author.avatar}
            size={48}
          />
          <div className="user-info">
            <div className="user-info-container">
              <span className="user-name">{post.author.name}</span>
              {/* 使用新的FollowButton组件 */}
              <FollowButton isFollowing={post.author.isFollowing ?? false} />
            </div>
            <div className="user-tags">
              {post.author.tags.map((tag, _) => (
                <span className="user-tag">{tag}</span>
              ))}
            </div>
          </div>
        </Space>
        <span className="post-date">{post.date}</span>
      </div>

      <h3 className="post-title">{post.title}</h3>
      <p className="post-content">{post.content}</p>

      {post.images && post.images.length > 0 && (
        <div>
          {post.images.map((image, index) => (
            <img key={index} src={image} alt="" className="post-image" />
          ))}
        </div>
      )}

      {/* 使用自定义操作按钮组件替换原有工具栏 */}
      <div className="post-actions">
        <ActionButton
          icon="/icon_read.svg"
          text={post.stats.views}
          tooltip="浏览次数"
        />
        <ActionButton
          icon="/icon_comment.svg"
          text={post.stats.comments}
          tooltip="评论"
          onClick={() => {
            setShowComments(!showComments);
            if (!showComments && comments.length === 0) {
              loadComments();
            }
          }}
        />
        <ActionButton
          icon="/icon_check.svg"
          text={post.stats.likes}
          tooltip="赞同"
        />
        <ActionButton
          icon="/icon_hotness.svg"
          text={post.stats.hotness}
          tooltip="热度"
        />
      </div>

      {/* 评论面板 */}
      {showComments && (
        <CommentPanel
          postId={post.id}
          comments={comments}
          hasMore={hasMore}
          onAddComment={handleAddComment}
          onLoadMore={loadComments}
        />
      )}
    </Card>
  );
};

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="banner-container">
          <BannerCard
            image="/banner_sage.png"
            title="探索科研"
            tag="发现更多"
          />
          <BannerCard
            image="/banner_find.png"
            title="寻找同行"
            tag="开始交流"
          />
        </div>

        <div className="feed-container">
          {mockPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}