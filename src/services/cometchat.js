// In services/cometchat.js or services/api.js
import { CometChat } from "@cometchat-pro/chat";
import { COMETCHAT_CONFIG } from "../utils/config";

export const createCometChatUser = async (uid, name) => {
  const user = new CometChat.User(uid);
  user.setName(name);
  
  try {
    const createdUser = await CometChat.createUser(user, COMETCHAT_CONFIG.AUTH_KEY);
    console.log("User created in CometChat:", createdUser);
    return createdUser;
  } catch (error) {
    console.error("Error creating user in CometChat:", error);
    throw error;
  }
};