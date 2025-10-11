import React from "react";
import MenuModal from "./MenuModal";
import {useNavigation} from "@react-navigation/native";

const AddMenuModal = ({visible, onClose}) => {
  const navigation = useNavigation();

  const redirectToSessions = () => {
    onClose();
    navigation.navigate("Séances");
  };

  const handleAddActivity = () => {
    onClose();
    navigation.navigate("ActivityListScreen");
  };


  const items = [
    {name: "Séances", icon: "barbell", onClick: redirectToSessions},
    {name: "Activités", icon: "walk", onClick: handleAddActivity},
    // { name: "Programmes", icon: "ellipsis-horizontal", onClick: handleOther },
  ];

  return <MenuModal visible={visible} items={items} onClose={onClose}/>;
};

export default AddMenuModal;
