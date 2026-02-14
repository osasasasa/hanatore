import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { Mascot } from '../../components/Mascot';
import { useTrainingStore } from '../../store/useTrainingStore';

type LeagueTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface LeagueUser {
  id: string;
  name: string;
  initial: string;
  avatarColor: string;
  xp: number;
  rank: number;
  isCurrentUser?: boolean;
}

const LEAGUE_INFO: Record<LeagueTier, { name: string; color: string }> = {
  bronze: { name: 'ブロンズ', color: '#CD7F32' },
  silver: { name: 'シルバー', color: '#C0C0C0' },
  gold: { name: 'ゴールド', color: '#FFD700' },
  platinum: { name: 'プラチナ', color: '#E5E4E2' },
  diamond: { name: 'ダイヤモンド', color: '#B9F2FF' },
};

const SAMPLE_USERS: LeagueUser[] = [
  { id: '1', name: 'たけし', initial: 'た', avatarColor: '#5B8DEF', xp: 520, rank: 1 },
  { id: '2', name: 'さくら', initial: 'さ', avatarColor: '#FF6B8A', xp: 480, rank: 2 },
  { id: '3', name: 'けんた', initial: 'け', avatarColor: '#4ECDC4', xp: 450, rank: 3 },
  { id: '4', name: 'あなた', initial: '', avatarColor: COLORS.primary, xp: 0, rank: 4, isCurrentUser: true },
  { id: '5', name: 'みき', initial: 'み', avatarColor: '#A78BFA', xp: 320, rank: 5 },
  { id: '6', name: 'ゆうと', initial: 'ゆ', avatarColor: '#34D399', xp: 280, rank: 6 },
  { id: '7', name: 'あおい', initial: 'あ', avatarColor: '#F59E0B', xp: 250, rank: 7 },
  { id: '8', name: 'はると', initial: 'は', avatarColor: '#6366F1', xp: 200, rank: 8 },
  { id: '9', name: 'ゆい', initial: 'ゆ', avatarColor: '#EC4899', xp: 150, rank: 9 },
  { id: '10', name: 'そうた', initial: 'そ', avatarColor: '#14B8A6', xp: 100, rank: 10 },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank > 3) {
    return <Text style={styles.rankNumber}>{rank}</Text>;
  }
  const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  return (
    <View style={[styles.rankBadge, { backgroundColor: colors[rank - 1] }]}>
      <Text style={styles.rankBadgeText}>{rank}</Text>
    </View>
  );
}

function UserAvatar({ user }: { user: LeagueUser }) {
  if (user.isCurrentUser) {
    return <Mascot size={32} style={styles.rankAvatar} />;
  }
  return (
    <View style={[styles.avatarCircle, { backgroundColor: user.avatarColor }]}>
      <Text style={styles.avatarInitial}>{user.initial}</Text>
    </View>
  );
}

export default function LeagueScreen() {
  const { userProgress } = useTrainingStore();
  const currentTier: LeagueTier = 'bronze';
  const league = LEAGUE_INFO[currentTier];

  const getTotalXp = () => {
    let total = userProgress.currentXp;
    for (let i = 1; i < userProgress.level; i++) {
      total += 100 + (i - 1) * 20;
    }
    return total;
  };

  const users = SAMPLE_USERS.map((user) =>
    user.isCurrentUser ? { ...user, xp: getTotalXp() } : user
  ).sort((a, b) => b.xp - a.xp).map((user, index) => ({ ...user, rank: index + 1 }));

  const currentUserRank = users.find((u) => u.isCurrentUser)?.rank || 0;
  const daysLeft = 5;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>リーグ</Text>
        </View>

        <View style={[styles.leagueCard, { borderColor: league.color }]}>
          <Ionicons name="medal" size={48} color={league.color} style={styles.leagueIcon} />
          <Text style={styles.leagueName}>{league.name}リーグ</Text>
          <Text style={styles.leagueInfo}>残り {daysLeft} 日 | 上位3名が昇格</Text>
        </View>

        <View style={styles.yourRankCard}>
          <Text style={styles.yourRankLabel}>あなたの順位</Text>
          <View style={styles.yourRankRow}>
            <Text style={styles.yourRankNumber}>{currentUserRank}</Text>
            <Text style={styles.yourRankSuffix}>位</Text>
            <Text style={styles.yourRankXp}>{getTotalXp()} XP</Text>
          </View>
          {currentUserRank <= 3 ? (
            <View style={styles.promotionRow}>
              <Ionicons name="sparkles" size={16} color={COLORS.white} />
              <Text style={styles.promotionText}>昇格圏内です！</Text>
            </View>
          ) : (
            <Text style={styles.promotionHint}>
              あと {users[2]?.xp - getTotalXp() + 1} XP で昇格圏内
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>ランキング</Text>

        {users.map((user) => (
          <View
            key={user.id}
            style={[styles.rankCard, user.isCurrentUser && styles.rankCardHighlight]}
          >
            <View style={styles.rankLeft}>
              <View style={styles.rankNumberContainer}>
                <RankBadge rank={user.rank} />
              </View>
              <UserAvatar user={user} />
              <Text style={[styles.rankName, user.isCurrentUser && styles.rankNameHighlight]}>
                {user.name}
              </Text>
            </View>
            <Text style={styles.rankXp}>{user.xp} XP</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>毎週日曜日にリーグがリセットされます</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  leagueCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leagueIcon: {
    marginBottom: 8,
  },
  leagueName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  leagueInfo: {
    fontSize: 14,
    color: COLORS.textSub,
  },
  yourRankCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  yourRankLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 8,
  },
  yourRankRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  yourRankNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  yourRankSuffix: {
    fontSize: 20,
    color: COLORS.white,
    marginLeft: 4,
  },
  yourRankXp: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
    marginLeft: 16,
  },
  promotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promotionText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
  promotionHint: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  rankCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rankCardHighlight: {
    backgroundColor: '#FFF5EB',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankNumberContainer: {
    width: 32,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  rankAvatar: {
    marginHorizontal: 12,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  rankName: {
    fontSize: 16,
    color: COLORS.text,
  },
  rankNameHighlight: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  rankXp: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSub,
  },
});
