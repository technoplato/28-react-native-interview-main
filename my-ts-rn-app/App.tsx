import { StatusBar } from "expo-status-bar";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Talk } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://localhost:3000";

const TALKS = "/talks";

const TALKS_ENDPOINT = BASE_URL + TALKS;

const talksApi = {
  async getTalks(): Promise<Array<Talk>> {
    return axios
      .get(TALKS_ENDPOINT)
      .then(function (response) {
        // handle success
        return response.data;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  },
};

const StorageKeys = {
  talks: "@TALKS",
  favoriteNames: "@favorites",
} as const;

function useAsyncStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: React.SetStateAction<T>) => Promise<void>] {
  const [state, _setState] = useState<T>(defaultValue);

  useEffect(() => {
    (async () => {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        _setState(JSON.parse(value));
      }
    })();
  }, [key]);

  const setState = async (value: React.SetStateAction<T>) => {
    if (typeof value === "function") {
      _setState((prevState) => {
        // @ts-ignore
        const newValue = value(prevState);
        AsyncStorage.setItem(key, JSON.stringify(newValue));
        return newValue;
      });
    } else {
      _setState(value);
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
  };

  return [state, setState];
}

const useTalks = () => {
  const [talks, setTalks] = useAsyncStorage<Array<Talk>>(StorageKeys.talks, []);
  const [favoriteTalkNames, setFavoriteTalkNames] = useAsyncStorage<
    Array<string>
  >(StorageKeys.favoriteNames, []);

  const isFavorite = (name: string): boolean =>
    favoriteTalkNames.includes(name);

  const toggleFavorite = async (talkName: string) => {
    const isFavoritedAlready = isFavorite(talkName);
    if (isFavoritedAlready) {
      await setFavoriteTalkNames((oldTalkNames) => {
    } else {
      await setFavoriteTalkNames((oldTalkNames) => [...oldTalkNames, talkName]);
    }
  };

  useEffect(() => {
    talksApi.getTalks().then((talks) => {
      setTalks(talks);
    });
  }, []);

  return { talks, toggleFavorite, isFavorite };
};

type TalkListItemProps = {
  talk: Talk;
  handleFavoriteToggle: () => void;
  isFavorite: boolean;
};

const formatIsoTime = (isoTime: string): string => {
  return new Date(isoTime).toLocaleTimeString();
};

const TalkListItem = ({
  talk,
  handleFavoriteToggle,
  isFavorite,
}: TalkListItemProps) => {
  return (
    <TouchableOpacity
      onPress={() => handleFavoriteToggle()}
      style={{ padding: 8, borderWidth: 1, borderColor: "blue" }}
    >
      <Text>{talk.title}</Text>
      <Text>{talk.subtitle}</Text>
      <Text>start: {formatIsoTime(talk.startTime)}</Text>
      <Text>end: {formatIsoTime(talk.endTime)}</Text>
      <Text>{talk.duration} minutes</Text>
      <Text>{isFavorite ? "Attending" : "Not Attending, Tap to Attend"}</Text>
    </TouchableOpacity>
  );
};

type TalkListProps = {
  talks: Array<Talk>;
  toggleFavorite: (name: string) => void;
  isFavorite: (name: string) => boolean;
};
const TalksList = ({ talks, toggleFavorite, isFavorite }: TalkListProps) => {
  const isEmpty = talks.length === 0;
  if (isEmpty) {
    return <Text>Hmm... seems quiet in here...</Text>;
  }
  return (
    <FlatList
      data={talks}
      renderItem={(listItemThing) => {
        const talk = listItemThing.item;
        return (
          <TalkListItem
            talk={talk}
            isFavorite={isFavorite(talk.title)}
            handleFavoriteToggle={() => {
              toggleFavorite(talk.title);
            }}
          />
        );
      }}
    />
  );
};

export default function App() {
  const { talks, toggleFavorite, isFavorite } = useTalks();
  return (
    <SafeAreaView style={styles.container}>
      <TalksList talks={talks} {...{ toggleFavorite, isFavorite }} />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
