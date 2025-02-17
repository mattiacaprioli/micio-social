import React, { useEffect, useState, useCallback } from "react";
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
import { getFollowingList } from "../../services/followsService";
import Avatar from "../../components/Avatar";
import { wp, hp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Header from "../../components/Header";

const Followings = () => {
  const { user } = useAuth();
  const [followings, setFollowings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFollowings = async () => {
    if (user?.id) {
      setRefreshing(true);
      const data = await getFollowingList(user.id);
      setFollowings(data);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFollowings();
  }, [user]);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.item}>
        <Avatar
          uri={item.following.image}
          size={hp(8)}
          rounded={theme.radius.xl}
        />
        <Text style={styles.name}>{item.following.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "white", paddingHorizontal: wp(4) }}
    >
      <ScreenWrapper bg="white">
        <Header title="Followings" />
        <FlatList
          data={followings}
          keyExtractor={(item) => item.following_id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchFollowings}
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

export default Followings;

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
