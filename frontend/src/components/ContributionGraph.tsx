import React, { useMemo, useRef, useEffect } from 'react';
import { Tooltip } from 'antd';
import styles from './ContributionGraph.module.css';

interface ContributionDay {
    date: string;
    count: number;
    level: 'empty' | 'good' | 'excellent' | 'oh';
}

interface ContributionGraphProps {
    data: ContributionDay[];
}

// 调整星期标签，每个位置对应一行，空字符串表示不显示标签
const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getLevelColor = (level: ContributionDay['level']): string => {
    switch (level) {
        case 'empty':
            return '#D9D9D9';
        case 'good':
            return '#BD8FFC';
        case 'excellent':
            return '#825BB7';
        case 'oh':
            return '#825BB7';
        default:
            return '#D9D9D9';
    }
};

const getContributionLevel = (count: number): ContributionDay['level'] => {
    if (count === 0) return 'empty';
    if (count <= 3) return 'good';
    if (count <= 6) return 'excellent';
    return 'oh';
};

const generateMockData = (): ContributionDay[] => {
    const data: ContributionDay[] = [];
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const count = Math.floor(Math.random() * 10);
        data.push({
            date: d.toISOString().split('T')[0],
            count,
            level: getContributionLevel(count),
        });
    }

    return data;
};

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const ContributionGraph: React.FC<ContributionGraphProps> = ({ data }) => {
    const { weeks, monthLabels } = useMemo(() => {
        const result: ContributionDay[][] = [];
        let currentWeek: ContributionDay[] = [];
        const monthsMap = new Map<string, number>(); // month-year -> week index

        // 确保数据按日期排序
        const sortedData = [...data].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        sortedData.forEach((day, index) => {
            const date = new Date(day.date);
            const monthYear = `${date.getMonth()}-${date.getFullYear()}`;
            const weekIndex = Math.floor(index / 7);

            // 只在每月的第一天记录月份位置
            if (date.getDate() <= 7 && !monthsMap.has(monthYear)) {
                monthsMap.set(monthYear, weekIndex);
            }

            currentWeek.push(day);
            if (currentWeek.length === 7 || index === sortedData.length - 1) {
                result.push([...currentWeek]);
                currentWeek = [];
            }
        });

        // 生成月份标签位置
        const labels = Array(result.length).fill('');
        monthsMap.forEach((weekIndex, monthYear) => {
            const month = parseInt(monthYear.split('-')[0]);
            labels[weekIndex] = MONTHS[month];
        });

        return {
            weeks: result,
            monthLabels: labels
        };
    }, [data]);

    // 滚动到最右端
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [data]);

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.graphContainer}>
                <div className={styles.weekLabels}>
                    {WEEKDAYS.map((day, index) => (
                        <div key={index} className={styles.weekLabel}>
                            {day}
                        </div>
                    ))}
                </div>
                <div className={styles.graphContent}>
                    <div className={styles.scrollContainer} ref={scrollRef}>
                        <div className={styles.scrollContent}>
                            <div className={styles.monthLabels}>
                                {monthLabels.map((month, index) => (
                                    <div key={`${month}-${index}`} className={styles.monthLabel}>
                                        {month}
                                    </div>
                                ))}
                            </div>
                            <div className={styles.graph}>
                                {weeks.map((week, weekIndex) => (
                                    <div key={weekIndex} className={styles.week}>
                                        {week.map((day) => (
                                            <Tooltip
                                                key={day.date}
                                                title={`${day.count} contributions on ${formatDate(day.date)}`}
                                            >
                                                <div
                                                    className={styles.day}
                                                    style={{ backgroundColor: getLevelColor(day.level) }}
                                                />
                                            </Tooltip>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.legend}>
                {['empty', 'good', 'excellent', 'oh'].map((level) => (
                    <div key={level} className={styles.legendItem}>
                        <div
                            className={styles.legendBox}
                            style={{ backgroundColor: getLevelColor(level as ContributionDay['level']) }}
                        />
                        <span className={styles.legendText}>{level}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContributionGraph; 