import React, { useEffect, useState } from 'react';
import {
    GithubOutlined,
    GoogleOutlined,
    MailOutlined,
    ManOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { Image, message } from 'antd';
import styles from './Account.module.css';
import ContributionGraph from '../../components/ContributionGraph';
import { supabase } from '../../supabase/client';
import { useNavigate } from 'react-router-dom';
import { useLoginSheet } from '../../pages/login/LoginSheet';
import { UserProfileEditSheet } from '../../pages/profile/UserProfileEditSheet';
import { EditPostSheet } from '../../pages/post/EditPostSheet';
import { DeleteConfirmAlert } from '../../components/DeleteConfirmAlert';
import { deletePost } from '../../services/postService';
import { authService } from '../../services/auth';

interface Post {
    id: string;
    title: string;
    date: string;
}

interface ContributionDay {
    date: string;
    count: number;
    level: 'empty' | 'good' | 'excellent' | 'oh';
}

const getContributionLevel = (count: number): ContributionDay['level'] => {
    if (count === 0) return 'empty';
    if (count <= 3) return 'good';
    if (count <= 6) return 'excellent';
    return 'oh';
};

const generateContributionData = (): ContributionDay[] => {
    const data: ContributionDay[] = [];
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    // 生成一些活跃的时期
    const activeWeeks = new Set([
        12, 13, 14,  // 连续活跃期
        25, 26,      // 短期活跃
        38, 39, 40,  // 连续活跃期
        48           // 单周活跃
    ]);

    let weekCount = 0;
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
        weekCount = Math.floor((d.getTime() - oneYearAgo.getTime()) / (7 * 24 * 60 * 60 * 1000));

        let count;
        if (activeWeeks.has(weekCount)) {
            // 活跃周期内的贡献较多
            count = Math.floor(Math.random() * 8) + 2;
        } else if (Math.random() < 0.2) {
            // 随机的少量贡献
            count = Math.floor(Math.random() * 3) + 1;
        } else {
            // 大多数时间无贡献
            count = 0;
        }

        data.push({
            date: d.toISOString().split('T')[0],
            count,
            level: getContributionLevel(count)
        });
    }

    return data;
};

// Mock 帖子数据
const mockPosts = [
    {
        id: '1',
        userId: 'user123',
        title: '这是一个测试帖子标题',
        content: '这是帖子的详细内容，包含了很多有趣的信息...',
        image_urls: [
            '/test-image-1.jpg',
            '/test-image-2.jpg'
        ],
        created_at: '2024-03-20',
        updated_at: '2024-03-20'
    },
    {
        id: '2',
        userId: 'user123',
        title: '另一个测试帖子',
        content: '这是第二个帖子的内容...',
        image_urls: ['/test-image-3.jpg'],
        created_at: '2024-03-19',
        updated_at: '2024-03-19'
    }
];

type Gender = 'male' | 'female' | undefined;

interface UserInfo {
    avatar: string;
    nickname: string;
    coins: number;
    id: string;
    bio: string;
    gender: Gender;
    followers: number;
    followings: number;
    isVerified: boolean;
    contributions: number;
    researchArea?: string;
}

export default function Account() {
    const navigate = useNavigate();
    const { setVisible } = useLoginSheet();
    const [loading, setLoading] = useState(true);
    const [editSheetVisible, setEditSheetVisible] = useState(false);
    const [editPostSheetVisible, setEditPostSheetVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [posts, setPosts] = useState(mockPosts);
    const [userInfo, setUserInfo] = useState<UserInfo>({
        avatar: '/default-avatar.png',
        nickname: 'User',
        coins: 0,
        id: '',
        bio: '',
        gender: undefined,
        followers: 0,
        followings: 0,
        isVerified: false,
        contributions: 0,
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // 检查是否已登录
            if (!authService.isLoggedIn()) {
                navigate('/');
                setVisible(true);
                return;
            }

            // 获取用户信息
            console.log('获取用户信息');
            const response = await authService.getUserProfile();

            if (response.code === 0 && response.data) {
                const profile = response.data;
                // 将后端返回的性别值转换为组件期望的类型
                const gender: Gender = profile.gender === 'male' || profile.gender === 'female'
                    ? profile.gender
                    : undefined;

                setUserInfo({
                    avatar: profile.avatar_url || '/default-avatar.png',
                    nickname: profile.username,
                    coins: profile.coin,
                    id: profile.uuid,
                    bio: profile.intro_short || profile.intro_long || '',
                    gender,
                    followers: 0,
                    followings: 0,
                    isVerified: profile.is_verified,
                    contributions: 0,
                    researchArea: profile.research_area
                });
            } else {
                message.error(response.message || '获取用户信息失败');
            }
        } catch (error) {
            message.error('获取用户信息失败，请重新登录');
            // 清除token并跳转到首页
            authService.clearToken();
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        setEditSheetVisible(true);
    };

    const handleEditClose = () => {
        setEditSheetVisible(false);
        // 重新加载用户信息
        checkAuth();
    };

    const handleEdit = (post: any) => {
        setSelectedPost(post);
        setEditPostSheetVisible(true);
    };

    const handleEditPostClose = () => {
        setEditPostSheetVisible(false);
        setSelectedPost(null);
    };

    const handleDelete = (postId: string) => {
        setPostToDelete(postId);
        setDeleteConfirmVisible(true);
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmVisible(false);
        setPostToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (!postToDelete) return;

        try {
            await deletePost(postToDelete);
            setPosts(posts.filter(post => post.id !== postToDelete));
            message.success('帖子已删除');
        } catch (error) {
            message.error('删除失败，请稍后重试');
        } finally {
            setDeleteConfirmVisible(false);
            setPostToDelete(null);
        }
    };

    if (loading) {
        return <div>加载中...</div>;
    }

    if (!userInfo) {
        return null;
    }

    const contributionData = generateContributionData();

    return (
        <div className={styles.container}>
            {/* Profile Section */}
            <div className={styles.compactSection}>
                <div className={styles.profileSection}>
                    <div className={styles.basicInfoContainer}>
                        <div className={styles.avatarContainer}>
                            <Image
                                src={userInfo.avatar}
                                preview={false}
                                className={styles.avatar}
                                width={97}
                                height={101}
                            />
                            {userInfo.isVerified && (
                                <div className={styles.verificationBadge}>
                                    <img
                                        src="/profile_verification.svg"
                                        alt="认证标志"
                                    />
                                </div>
                            )}
                        </div>

                        <div className={styles.userInfo}>
                            <div className={styles.userInfoRow}>
                                {userInfo.gender && <ManOutlined className={styles.icon} />}
                                <span className={styles.userName}>{userInfo.nickname}</span>
                                <EditOutlined className={styles.editIcon} onClick={handleEditClick} />
                                <GithubOutlined className={styles.icon} />
                                <GoogleOutlined className={styles.icon} />
                                <MailOutlined className={styles.icon} />
                            </div>
                            <div className={styles.userInfoRow}>
                                <span className={styles.userInfoText}>{userInfo.coins}</span>
                                <img src="/sage_coin.png" alt="金币" className={styles.coinIcon} />
                            </div>
                            <div className={styles.userInfoRow}>
                                <span className={styles.userInfoText}>ID: {userInfo.id}</span>
                            </div>
                            <div className={styles.userInfoRow}>
                                <span className={styles.userInfoText}>{userInfo.bio}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.followStats}>
                        <div>
                            <span className={styles.followCount}>{userInfo.followers}</span>
                            <span className={styles.followLabel}>Followers</span>
                        </div>
                        <div>
                            <span className={styles.followCount}>{userInfo.followings}</span>
                            <span className={styles.followLabel}>Following</span>
                        </div>
                    </div>
                </div>
            </div>

            <hr className={styles.divider} />

            {/* Contributions Section */}
            <div className={`${styles.section} ${styles.compact}`}>
                <div className={styles.contributionsSection}>
                    <h2>Contributions</h2>
                    <p>{userInfo.contributions} contributions in the last year</p>

                    <div className={styles.contributionGraph}>
                        <ContributionGraph data={contributionData} />
                    </div>
                </div>
            </div>

            {/* Activities Section */}
            <div className={styles.section}>
                <div className={styles.activitiesSection}>
                    <h2>Activities</h2>
                    {posts.length > 0 ? (
                        <>
                            <p>最近发帖时间: {posts[0].created_at}</p>
                            <div className={styles.postHistory}>
                                {posts.map((post) => (
                                    <div key={post.id} className={styles.postCard}>
                                        <div className={styles.postHeader}>
                                            <h3>{post.title}</h3>
                                            <div className={styles.postActions}>
                                                <button
                                                    onClick={() => handleEdit(post)}
                                                    className={styles.actionButton}
                                                >
                                                    <EditOutlined />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className={styles.actionButton}
                                                >
                                                    <DeleteOutlined />
                                                </button>
                                            </div>
                                        </div>
                                        <p className={styles.postContent}>{post.content}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p>Empty</p>
                    )}
                </div>
            </div>

            {/* Edit Profile Sheet */}
            <UserProfileEditSheet
                visible={editSheetVisible}
                onClose={handleEditClose}
                initialData={{
                    avatar_url: userInfo?.avatar,
                    display_name: userInfo?.nickname,
                    intro: userInfo?.bio,
                    gender: userInfo?.gender,
                    research_area: userInfo?.researchArea,
                }}
            />

            {/* Edit Post Sheet */}
            {selectedPost && (
                <EditPostSheet
                    visible={editPostSheetVisible}
                    onClose={handleEditPostClose}
                    post={selectedPost}
                />
            )}

            {/* Delete Confirm Alert */}
            <DeleteConfirmAlert
                visible={deleteConfirmVisible}
                onCancel={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
} 