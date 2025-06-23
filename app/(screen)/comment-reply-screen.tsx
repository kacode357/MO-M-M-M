import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { createReply, getAllReviewsAndReplies } from '@/services/reviews.services';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// === TAO CẬP NHẬT INTERFACE THEO DATA THẬT ===
interface Reply {
  replyId: string;
  reviewId: string | null;
  parentReplyId: string | null;
  userId: string;
  userName: string;
  image: string | null;
  comment: string;
  createdAt: string;
  replies: Reply[];
}

interface ReviewWithReplies {
  reviewId: string;
  userId: string;
  userName: string;
  taste: number;
  price: number;
  sanitary: number;
  texture: number;
  convenience: number;
  image: string;
  comment: string;
  date: string;
  recommendCount: number;
  replies: Reply[];
}

// === TAO TẠO COMPONENT CON ĐỂ HIỂN THỊ REPLY ===
// Component này có thể tự gọi lại chính nó để hiển thị các reply lồng nhau
const ReplyItem = ({ reply, onReplyPress, level = 0 }: { reply: Reply; onReplyPress: (reviewId: string, parentReplyId: string) => void; level?: number }) => (
    <View style={{ marginLeft: level * 20, marginTop: 10 }}>
        <View style={styles.userInfo}>
            <Ionicons name="person-circle" size={24} color={Colors.light.primaryText} style={styles.avatarIcon} />
            <View style={styles.userText}>
                <ThemedText style={styles.userName}>{reply.userName}</ThemedText>
                <ThemedText style={styles.comment}>{reply.comment}</ThemedText>
            </View>
        </View>
        <View style={styles.replyActions}>
            <ThemedText style={styles.date}>{formatDate(reply.createdAt)}</ThemedText>
            <TouchableOpacity onPress={() => onReplyPress(reply.reviewId!, reply.replyId)}>
                <ThemedText style={styles.replyLink}>Trả lời</ThemedText>
            </TouchableOpacity>
        </View>

        {/* Đệ quy: Render các reply con */}
        {reply.replies?.map(childReply => (
            <ReplyItem key={childReply.replyId} reply={childReply} onReplyPress={onReplyPress} level={level + 1} />
        ))}
    </View>
);

// Helper để format ngày tháng (không đổi)
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }).format(date);
};


export default function CommentReplyScreen() {
    const [reviews, setReviews] = useState<ReviewWithReplies[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // State cho modal
    const [isModalVisible, setModalVisible] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ reviewId: string; parentReplyId: string | null } | null>(null);
    
    // Lấy userId khi vào màn
    useEffect(() => {
        const fetchUser = async () => {
            const userId = await AsyncStorage.getItem('user_id');
            setCurrentUserId(userId);
        };
        fetchUser();
    }, []);

    // Lấy data reviews và replies
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllReviewsAndReplies();
            if (response.status === 200 && Array.isArray(response.data)) {
                setReviews(response.data);
            } else {
                setError('Không thể tải danh sách bình luận.');
            }
        } catch (err: any) {
            setError('Đã xảy ra lỗi khi tải dữ liệu.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openReplyModal = (reviewId: string, parentReplyId: string | null = null) => {
        setReplyingTo({ reviewId, parentReplyId });
        setModalVisible(true);
    };

    const handleSendReply = async () => {
        if (!replyContent.trim() || !replyingTo || !currentUserId) return;
        
        setSubmitting(true);
        try {
            await createReply({
                reviewId: replyingTo.reviewId,
                parentReplyId: replyingTo.parentReplyId,
                comment: replyContent,
                userId: currentUserId,
            });
            // Sau khi gửi thành công, tải lại toàn bộ data để cập nhật
            await fetchData();
            setModalVisible(false);
            setReplyContent('');
        } catch (e) {
            alert('Gửi phản hồi thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    const renderReviewItem = ({ item }: { item: ReviewWithReplies }) => (
        <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <View style={styles.userInfo}>
                    <Ionicons name="person-circle" size={24} color={Colors.light.primaryText} style={styles.avatarIcon} />
                    <View style={styles.userText}>
                        <ThemedText style={styles.userName}>{item.userName}</ThemedText>
                        <ThemedText style={styles.comment}>{item.comment || 'Không có bình luận'}</ThemedText>
                    </View>
                </View>
                <ThemedText style={styles.date}>{formatDate(item.date)}</ThemedText>
            </View>
            
            <View style={styles.ratingsContainer}>
                {/* SỬA LỖI KEY: Thêm item.reviewId để key là duy nhất */}
                <View style={styles.ratingRow}><ThemedText style={styles.ratingLabel}>Hương vị:</ThemedText><View style={styles.starsContainer}>{[...Array(5)].map((_, i) => (<Ionicons key={`taste-${item.reviewId}-${i}`} name={i < item.taste ? 'star' : 'star-outline'} size={16} color={Colors.light.primaryText}/>))}</View></View>
                <View style={styles.ratingRow}><ThemedText style={styles.ratingLabel}>Giá cả:</ThemedText><View style={styles.starsContainer}>{[...Array(5)].map((_, i) => (<Ionicons key={`price-${item.reviewId}-${i}`} name={i < item.price ? 'star' : 'star-outline'} size={16} color={Colors.light.primaryText}/>))}</View></View>
                <View style={styles.ratingRow}><ThemedText style={styles.ratingLabel}>Vệ sinh:</ThemedText><View style={styles.starsContainer}>{[...Array(5)].map((_, i) => (<Ionicons key={`sanitary-${item.reviewId}-${i}`} name={i < item.sanitary ? 'star' : 'star-outline'} size={16} color={Colors.light.primaryText}/>))}</View></View>
                <View style={styles.ratingRow}><ThemedText style={styles.ratingLabel}>Kết cấu:</ThemedText><View style={styles.starsContainer}>{[...Array(5)].map((_, i) => (<Ionicons key={`texture-${item.reviewId}-${i}`} name={i < item.texture ? 'star' : 'star-outline'} size={16} color={Colors.light.primaryText}/>))}</View></View>
                <View style={styles.ratingRow}><ThemedText style={styles.ratingLabel}>Tiện lợi:</ThemedText><View style={styles.starsContainer}>{[...Array(5)].map((_, i) => (<Ionicons key={`convenience-${item.reviewId}-${i}`} name={i < item.convenience ? 'star' : 'star-outline'} size={16} color={Colors.light.primaryText}/>))}</View></View>
            </View>

            {item.image && item.image !== 'string' && (
                <Image source={{ uri: item.image }} style={styles.reviewImage} />
            )}

            <View style={styles.mainReplyContainer}>
                {/* Hiển thị tất cả các reply gốc */}
                {item.replies?.map(reply => (
                    <ReplyItem key={reply.replyId} reply={reply} onReplyPress={(reviewId, parentReplyId) => openReplyModal(reviewId, parentReplyId)} />
                ))}
            </View>

            <View style={styles.actionsContainer}>
                <View style={styles.recommendDisplay}>
                    <Ionicons name='thumbs-up' size={16} color={Colors.light.icon}/>
                    <ThemedText style={styles.recommendText}>{item.recommendCount} lượt khuyên dùng</ThemedText>
                </View>
                <TouchableOpacity style={styles.replyButton} onPress={() => openReplyModal(item.reviewId)}>
                    <Ionicons name="chatbox-ellipses-outline" size={16} color={Colors.light.whiteText} />
                    <Text style={styles.replyButtonText}>Trả lời</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={router.back}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.whiteText} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Quản lý bình luận</ThemedText>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.light.primaryText} style={{ marginTop: 20 }}/>
            ) : error ? (
                <ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : (
                <FlatList
                    data={reviews}
                    renderItem={renderReviewItem}
                    keyExtractor={item => item.reviewId} // Sửa key extractor
                    contentContainerStyle={styles.listContainer}
                    onRefresh={fetchData}
                    refreshing={loading}
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <ThemedText style={styles.modalTitle}>Viết phản hồi</ThemedText>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nhập phản hồi của bạn..."
                            multiline
                            value={replyContent}
                            onChangeText={setReplyContent}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                                <Text>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.sendButton]} onPress={handleSendReply} disabled={isSubmitting}>
                                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendButtonText}>Gửi</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ThemedView>
    );
}


// Tao cập nhật một ít style và thêm style cho modal
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, marginTop: 40, backgroundColor: Colors.light.whiteText },
    backButton: { backgroundColor: 'rgba(0, 0, 0, 0.26)', borderRadius: 35, padding: 8 },
    headerTitle: { fontFamily: Fonts.Baloo2.ExtraBold, fontSize: 24, color: Colors.light.primaryText, marginLeft: 20 },
    listContainer: { padding: 20 },
    reviewItem: { padding: 15, borderRadius: 8, backgroundColor: Colors.light.background, marginBottom: 15, borderWidth: 1, borderColor: '#e0e0e0' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    userInfo: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
    avatarIcon: { marginRight: 8 },
    userText: { flex: 1 },
    userName: { fontFamily: Fonts.Comfortaa.Bold, fontSize: 16, color: Colors.light.text, marginBottom: 5 },
    comment: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 14, color: Colors.light.text },
    date: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 12, color: Colors.light.icon, marginLeft: 10 },
    ratingsContainer: { marginBottom: 10 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    ratingLabel: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 14, color: Colors.light.text, width: 80 },
    starsContainer: { flexDirection: 'row' },
    reviewImage: { width: '100%', height: 150, borderRadius: 8, marginVertical: 10 },
    errorText: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 16, color: Colors.light.error, textAlign: 'center', marginTop: 20 },
    actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
    recommendDisplay: { flexDirection: 'row', alignItems: 'center' },
    recommendText: { fontFamily: Fonts.Comfortaa.Regular, fontSize: 14, color: Colors.light.icon, marginLeft: 5 },
    replyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.primaryText, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
    replyButtonText: { color: Colors.light.whiteText, fontFamily: Fonts.Comfortaa.Bold, marginLeft: 5 },
    mainReplyContainer: { borderTopWidth: 1, borderTopColor: '#eee', marginTop: 10, paddingTop: 5 },
    replyActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    replyLink: { color: Colors.light.tint, fontFamily: Fonts.Comfortaa.Bold, fontSize: 13 },
    // Styles cho Modal
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { width: '90%', margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { fontSize: 20, fontFamily: Fonts.Baloo2.Bold, marginBottom: 15 },
    modalInput: { width: '100%', minHeight: 100, borderColor: '#ddd', borderWidth: 1, borderRadius: 10, padding: 10, textAlignVertical: 'top', marginBottom: 20 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    modalButton: { borderRadius: 10, padding: 10, elevation: 2, flex: 1, marginHorizontal: 5, alignItems: 'center' },
    sendButton: { backgroundColor: Colors.light.primaryText },
    sendButtonText: { color: 'white', fontFamily: Fonts.Comfortaa.Bold }
});