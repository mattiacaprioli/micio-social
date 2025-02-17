import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  View,
} from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import { getFollowersList } from "../../services/followsService";
import Avatar from "../../components/Avatar";
import { wp, hp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Header from "../../components/Header";

const Followers = () => {
  const { user: currentUser } = useAuth();
  const { userId } = useLocalSearchParams();
  const targetUserId = userId || currentUser?.id;
  const [followers, setFollowers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFollowers = async () => {
    if (targetUserId) {
      setRefreshing(true);
      const data = await getFollowersList(targetUserId);
      setFollowers(data);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
  }, [targetUserId]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item}>
      <Avatar
        uri={item.follower.image}
        size={hp(8)}
        rounded={theme.radius.xl}
      />
      <Text style={styles.name}>{item.follower.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: "white", paddingHorizontal: wp(4) }}
    >
      <ScreenWrapper bg="white">
        <Header title="Followers" />
        <FlatList
          data={followers}
          keyExtractor={(item) => item.follower_id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchFollowers}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text>No followers found</Text>
            </View>
          }
        />
      </ScreenWrapper>
    </View>
  );
};

export default Followers;

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  name: {
    marginLeft: wp(4),
    fontSize: hp(2.2),
    color: theme.colors.textDark,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(20),
  },
});
