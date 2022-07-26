import { useLayoutEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
  Text,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";

import ValidateGoalData from "../Utils/validatGoalData";
import InputLabel from "../components/InputLabel";
import { CreateGoal } from "../Utils/requests/createGoal";
import { UpdateGoal } from "../Utils/requests/updateGoal";
import { DeleteGoal } from "../Utils/requests/deleteGoal";
import CustomButton from "../components/CustomButton";
import schedulePushNotification from "../NotificationsUtils/scheduleNotifications";

const AddNewGoal = ({ navigation, route }) => {
  const goalParams = route.params;
  const [loading, setLoading] = useState(false);
  const [inputValues, setInputValues] = useState({
    goalName: goalParams ? goalParams.goalName : "",
    goalDescription: goalParams ? goalParams.goalDescription : "",
    completionDate: goalParams ? goalParams.completionDate : "",
  });
  const [errors, setErrors] = useState({});

  useLayoutEffect(() => {
    navigation.setOptions({
      title: goalParams ? "Edit Goal" : "Add Goal",
      headerStyle: {
        backgroundColor: "#B43E43",
      },
      headerTintColor: "#fff",
      headerRight: () =>
        goalParams ? (
          <Pressable
            onPress={() => {
              Alert.alert("Delete Goal", "Do you want to delete this goal?", [
                { text: "Cancel" },
                { text: "Delete", onPress: () => deleteGoal() },
              ]);
            }}
            style={({ pressed }) => (pressed ? styles.pressed : "")}
          >
            <MaterialIcons name="delete-outline" size={25} color="#fff" />
          </Pressable>
        ) : null,
    });
  }, []);
  const deleteGoal = async () => {
    try {
      await DeleteGoal(goalParams.id);
      schedulePushNotification(
        `Goal Deleted!!`,
        `${goalParams.goalName} goal is deleted`,
        "Goals"
      );
      navigation.replace("Goals");
    } catch (error) {
      Alert.alert(
        "Unable to delete",
        "There is some problem with deleting the goal",
        [{ text: "Ok" }]
      );
    }
  };

  const onChangeTextHandler = (type, enteredVal) => {
    setInputValues((currentValues) => {
      return {
        ...currentValues,
        [type]: enteredVal,
      };
    });
  };
  const saveGoal = async (goalName, goalDescription, completionDate) => {
    setLoading(true);
    if (goalParams) {
      try {
        await UpdateGoal(
          goalParams.id,
          goalName,
          goalDescription,
          completionDate,
          true
        );
        schedulePushNotification(
          `Goal Editted!!`,
          `${goalName} goal is editted`,
          "AddNewGoal"
        );
        navigation.replace("Goals");
      } catch (error) {
        setLoading(false);
      }
    } else {
      try {
        const id = "id" + new Date().getTime();
        await CreateGoal(id, goalName, goalDescription, completionDate);
        schedulePushNotification(
          `Goal Creted!!`,
          `${goalName} goal is created`,
          "Goals"
        );
        navigation.replace("Goals");
      } catch (error) {
        setLoading(false);
      }
    }
  };

  const onPressHandler = () => {
    const error = ValidateGoalData(inputValues);

    setErrors(error);
    if (Object.keys(error).length === 0) {
      saveGoal(
        inputValues.goalName,
        inputValues.goalDescription,
        inputValues.completionDate
      );
    }
  };

  return (
    <View style={styles.addNewGoalContainer}>
      <InputLabel
        style={styles.inputLabel}
        label="Goal Name"
        inputConfigs={{
          placeholder: "Goal Name",
          maxLength: 30,
          onChangeText: (val) => {
            onChangeTextHandler("goalName", val);
          },
          value: inputValues.goalName,
        }}
        error={errors["goalName"]}
      />
      <InputLabel
        style={styles.inputLabel}
        label="Goal Description"
        inputConfigs={{
          placeholder: "Goal Description",
          multiline: true,
          onChangeText: (val) => {
            onChangeTextHandler("goalDescription", val);
          },
          value: inputValues.goalDescription,
        }}
        error={errors["goalDescription"]}
      />
      <InputLabel
        style={styles.inputLabel}
        label="Completion Date"
        inputConfigs={{
          maxLength: 10,
          placeholder: "YYYY-MM-DD",
          onChangeText: (val) => {
            onChangeTextHandler("completionDate", val);
          },
          value: inputValues.completionDate,
        }}
        error={errors["completionDate"]}
      />
      <View style={styles.buttonContainer}>
        {!loading ? (
          <CustomButton onPress={onPressHandler}>
            {goalParams ? "Edit" : "Save"}
          </CustomButton>
        ) : (
          <ActivityIndicator size="small" color="#fff" />
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  addNewGoalContainer: {
    flex: 1,
    position: "relative",

    alignItems: "center",
  },
  inputLabel: {
    width: "100%",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "#B43E43",
    width: 300,
    margin: "auto",
    height: 50,
    borderRadius: "100%",
    marginTop: 50,
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.4,
  },
});
export default AddNewGoal;
