import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { COLORS, MASCOT } from '../../constants/colors';
import { useTrainingStore } from '../../store/useTrainingStore';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingItem({ icon, title, subtitle, onPress, rightElement }: SettingItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (onPress && <Text style={styles.settingArrow}>›</Text>)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { userProgress } = useTrainingStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ 設定</Text>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.profileAvatar}>{MASCOT}</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>ハナトレユーザー</Text>
            <Text style={styles.profileLevel}>
              Lv.{userProgress.level} {userProgress.title}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アカウント</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="👤"
              title="プロフィール編集"
              subtitle="名前・アバター"
              onPress={() => {}}
            />
            <SettingItem
              icon="📊"
              title="学習データ"
              subtitle="統計・履歴"
              onPress={() => {}}
            />
            <SettingItem
              icon="🏆"
              title="実績"
              subtitle="獲得バッジ"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アプリ設定</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="🔔"
              title="通知"
              subtitle="リマインダー・お知らせ"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              }
            />
            <SettingItem
              icon="🔊"
              title="サウンド"
              subtitle="効果音・BGM"
              rightElement={
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              }
            />
            <SettingItem
              icon="⏱️"
              title="デフォルト制限時間"
              subtitle="30秒"
              onPress={() => {}}
            />
            <SettingItem
              icon="🌙"
              title="ダークモード"
              subtitle="システム設定に従う"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>その他</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="❓"
              title="ヘルプ・使い方"
              onPress={() => {}}
            />
            <SettingItem
              icon="📝"
              title="フィードバックを送る"
              onPress={() => {}}
            />
            <SettingItem
              icon="⭐"
              title="アプリを評価する"
              onPress={() => {}}
            />
            <SettingItem
              icon="📄"
              title="利用規約"
              onPress={() => {}}
            />
            <SettingItem
              icon="🔒"
              title="プライバシーポリシー"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>ハナトレ v1.0.0</Text>
          <Text style={styles.copyrightText}>Made with 🧡 for better communication</Text>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    fontSize: 48,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileLevel: {
    fontSize: 14,
    color: COLORS.textSub,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSub,
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.textSub,
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 24,
    color: COLORS.textLight,
  },
  versionInfo: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.textSub,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});
