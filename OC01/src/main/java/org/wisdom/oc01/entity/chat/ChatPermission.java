// src/main/java/org/wisdom/oc01/entity/chat/ChatPermission.java
package org.wisdom.oc01.entity.chat;

public enum ChatPermission {
    // Conversation
    CREATE_PRIVATE_CHAT("Tạo private chat"),
    CREATE_GROUP_CHAT("Tạo group chat"),
    CREATE_COURSE_CHAT("Tạo course chat"),
    VIEW_CONVERSATION("Xem conversation"),
    UPDATE_CONVERSATION("Cập nhật conversation"),
    DELETE_CONVERSATION("Xóa conversation"),

    // Participant
    VIEW_PARTICIPANTS("Xem danh sách participants"),
    ADD_PARTICIPANT("Thêm participant"),
    REMOVE_PARTICIPANT("Xóa participant"),
    GRANT_ADMIN("Gán quyền ADMIN"),
    GRANT_MODERATOR("Gán quyền MODERATOR"),
    REVOKE_ADMIN("Thu hồi quyền ADMIN"),
    REVOKE_MODERATOR("Thu hồi quyền MODERATOR"),
    TRANSFER_OWNERSHIP("Chuyển quyền OWNER"),
    LEAVE_CONVERSATION("Rời conversation"),

    // Moderation
    MUTE_MEMBER("Mute thành viên"),
    UNMUTE_MEMBER("Unmute thành viên"),
    BAN_MEMBER("Ban thành viên"),
    UNBAN_MEMBER("Unban thành viên"),

    // Message
    SEND_MESSAGE("Gửi tin nhắn"),
    VIEW_MESSAGE("Xem tin nhắn"),
    EDIT_OWN_MESSAGE("Sửa tin nhắn của mình"),
    EDIT_ANY_MESSAGE("Sửa tin nhắn của người khác"),
    DELETE_OWN_MESSAGE("Xóa tin nhắn của mình"),
    DELETE_ANY_MESSAGE("Xóa tin nhắn của người khác"),
    PIN_MESSAGE("Ghim tin nhắn"),
    SEND_SYSTEM_MESSAGE("Gửi tin nhắn hệ thống");

    private final String description;

    ChatPermission(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}