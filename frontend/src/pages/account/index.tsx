import React from 'react';
import {
    GithubOutlined,
    GoogleOutlined,
    MailOutlined,
    ManOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { Image } from 'antd';
import styles from './Account.module.css';
import ContributionGraph from '../../components/ContributionGraph';

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

export default function Account() {
    // 模拟数据
    const userInfo = {
        avatar: '/avatar.jpg',
        nickname: '用户昵称',
        coins: 24,
        id: 'ID12345',
        bio: '这是一段个人介绍文字',
        followers: 123,
        followings: 45,
        isVerified: true,
        contributions: 8,
    };

    const posts: Post[] = [
        {
            id: '1',
            title: 'content dsdadasdasdsadbalbabla',
            date: '2024-03-20',
        },
    ];

    const contributionData = generateContributionData();

    const handleEdit = (postId: string) => {
        console.log('编辑帖子:', postId);
    };

    const handleDelete = (postId: string) => {
        console.log('删除帖子:', postId);
    };

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
                                <ManOutlined className={styles.icon} />
                                <span className={styles.userName}>{userInfo.nickname}</span>
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
                            <p>最近发帖时间: {posts[0].date}</p>
                            <div className={styles.postHistory}>
                                {posts.map((post) => (
                                    <div key={post.id} className={styles.postCard}>
                                        <div className={styles.postHeader}>
                                            <h3>Post History</h3>
                                            <div className={styles.postActions}>
                                                <button
                                                    onClick={() => handleEdit(post.id)}
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
                                        <p>{post.title}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p>Empty</p>
                    )}
                </div>
            </div>
        </div>
    );
} 